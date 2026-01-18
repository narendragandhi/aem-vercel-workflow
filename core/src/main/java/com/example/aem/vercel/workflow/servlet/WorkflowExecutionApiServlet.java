package com.example.aem.vercel.workflow.servlet;

import com.example.aem.vercel.workflow.model.WorkflowExecutionModel;
import com.example.aem.vercel.workflow.service.WorkflowExecutionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.Servlet;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST API servlet for workflow execution operations.
 * Provides endpoints for executing and managing workflow runs.
 */
@Component(
    service = { Servlet.class },
    property = {
        "sling.servlet.paths=/api/workflows/executions",
        "sling.servlet.methods=GET,POST,PUT,DELETE",
        "sling.servlet.extensions=json"
    }
)
public class WorkflowExecutionApiServlet extends SlingAllMethodsServlet {

    private static final Logger LOG = LoggerFactory.getLogger(WorkflowExecutionApiServlet.class);
    
    private final ObjectMapper objectMapper;

    @Reference
    private WorkflowExecutionService workflowExecutionService;

    public WorkflowExecutionApiServlet() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    @Override
    protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response) throws IOException {
        try {
            String pathInfo = request.getPathInfo();
            String executionId = extractExecutionId(pathInfo);

            if (executionId != null) {
                // Get specific execution
                Optional<WorkflowExecutionModel> execution = workflowExecutionService.getExecution(executionId);
                if (execution.isPresent()) {
                    writeJsonResponse(response, execution.get(), HttpServletResponse.SC_OK);
                } else {
                    writeErrorResponse(response, "Execution not found: " + executionId, HttpServletResponse.SC_NOT_FOUND);
                }
            } else {
                // List executions
                String workflowId = request.getParameter("workflowId");
                String userId = request.getParameter("userId");
                String status = request.getParameter("status");
                
                List<WorkflowExecutionModel> executions;
                
                if (workflowId != null && !workflowId.trim().isEmpty()) {
                    executions = workflowExecutionService.getExecutionsByWorkflow(workflowId);
                } else if ("running".equals(status)) {
                    executions = workflowExecutionService.getRunningExecutions();
                } else {
                    executions = workflowExecutionService.getRecentExecutions(50);
                }
                
                Map<String, Object> result = Map.of(
                    "executions", executions,
                    "count", executions.size()
                );
                writeJsonResponse(response, result, HttpServletResponse.SC_OK);
            }
        } catch (Exception e) {
            LOG.error("Error handling GET request", e);
            writeErrorResponse(response, "Internal server error", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response) throws IOException {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> requestData = objectMapper.readValue(request.getReader(), Map.class);
            
            String workflowId = (String) requestData.get("workflowId");
            String userId = (String) requestData.get("userId");
            @SuppressWarnings("unchecked")
            Map<String, Object> variables = (Map<String, Object>) requestData.get("variables");
            
            if (workflowId == null || workflowId.trim().isEmpty()) {
                writeErrorResponse(response, "workflowId is required", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }
            
            WorkflowExecutionModel execution = workflowExecutionService.startExecution(workflowId, userId, variables);
            writeJsonResponse(response, execution, HttpServletResponse.SC_CREATED);
            
        } catch (IllegalArgumentException e) {
            LOG.warn("Invalid execution request", e);
            writeErrorResponse(response, e.getMessage(), HttpServletResponse.SC_BAD_REQUEST);
        } catch (Exception e) {
            LOG.error("Error handling POST request", e);
            writeErrorResponse(response, "Internal server error", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doPut(SlingHttpServletRequest request, SlingHttpServletResponse response) throws IOException {
        try {
            String pathInfo = request.getPathInfo();
            String executionId = extractExecutionId(pathInfo);
            
            if (executionId == null) {
                writeErrorResponse(response, "Execution ID is required", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> requestData = objectMapper.readValue(request.getReader(), Map.class);
            String action = (String) requestData.get("action");
            
            boolean success = false;
            
            switch (action) {
                case "pause":
                    success = workflowExecutionService.pauseExecution(executionId);
                    break;
                case "resume":
                    success = workflowExecutionService.resumeExecution(executionId);
                    break;
                case "cancel":
                    String reason = (String) requestData.get("reason");
                    success = workflowExecutionService.cancelExecution(executionId, reason);
                    break;
                case "updateVariable":
                    String key = (String) requestData.get("key");
                    Object value = requestData.get("value");
                    success = workflowExecutionService.updateExecutionVariable(executionId, key, value);
                    break;
                default:
                    writeErrorResponse(response, "Invalid action: " + action, HttpServletResponse.SC_BAD_REQUEST);
                    return;
            }
            
            if (success) {
                writeJsonResponse(response, Map.of("success", true, "action", action), HttpServletResponse.SC_OK);
            } else {
                writeErrorResponse(response, "Action failed: " + action, HttpServletResponse.SC_BAD_REQUEST);
            }
            
        } catch (Exception e) {
            LOG.error("Error handling PUT request", e);
            writeErrorResponse(response, "Internal server error", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doDelete(SlingHttpServletRequest request, SlingHttpServletResponse response) throws IOException {
        try {
            String pathInfo = request.getPathInfo();
            String executionId = extractExecutionId(pathInfo);
            
            if (executionId == null) {
                writeErrorResponse(response, "Execution ID is required", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            // For executions, DELETE cancels the execution
            String reason = request.getParameter("reason");
            if (reason == null) {
                reason = "Deleted via API";
            }
            
            boolean cancelled = workflowExecutionService.cancelExecution(executionId, reason);
            if (cancelled) {
                writeJsonResponse(response, Map.of("message", "Execution cancelled successfully"), HttpServletResponse.SC_OK);
            } else {
                writeErrorResponse(response, "Execution not found or not running: " + executionId, HttpServletResponse.SC_NOT_FOUND);
            }
            
        } catch (Exception e) {
            LOG.error("Error handling DELETE request", e);
            writeErrorResponse(response, "Internal server error", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doOptions(SlingHttpServletRequest request, SlingHttpServletResponse response) throws IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setStatus(HttpServletResponse.SC_OK);
    }

    private String extractExecutionId(String pathInfo) {
        if (pathInfo == null || pathInfo.equals("/api/workflows/executions")) {
            return null;
        }
        return pathInfo.substring(pathInfo.lastIndexOf('/') + 1);
    }

    private void writeJsonResponse(SlingHttpServletResponse response, Object data, int statusCode) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(statusCode);
        response.setHeader("Access-Control-Allow-Origin", "*");
        objectMapper.writeValue(response.getWriter(), data);
    }

    private void writeErrorResponse(SlingHttpServletResponse response, String message, int statusCode) throws IOException {
        Map<String, Object> error = Map.of(
            "error", true,
            "message", message,
            "status", statusCode
        );
        writeJsonResponse(response, error, statusCode);
    }
}