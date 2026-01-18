package com.example.aem.vercel.workflow.servlet;

import com.example.aem.vercel.workflow.model.AIActionExecutionModel;
import com.example.aem.vercel.workflow.service.AIActionService;
import com.fasterxml.jackson.databind.ObjectMapper;
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

/**
 * REST API servlet for AI Action executions management.
 * Provides endpoints for tracking, managing, and analyzing AI action executions.
 */
@Component(
    service = Servlet.class,
    property = {
        "sling.servlet.methods=GET,POST,PUT,DELETE",
        "sling.servlet.paths=/api/ai-executions",
        "sling.servlet.selectors=executions",
        "sling.servlet.extensions=json"
    }
)
public class AIActionExecutionApiServlet extends SlingAllMethodsServlet {

    private static final Logger LOG = LoggerFactory.getLogger(AIActionExecutionApiServlet.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Reference
    private AIActionService aiActionService;

    @Override
    protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response) throws IOException {
        try {
            String path = request.getPathInfo();
            String[] selectors = request.getRequestPathInfo().getSelectors();

            if (selectors.length > 0 && "stats".equals(selectors[0])) {
                handleStatistics(request, response);
            } else if (path != null && path.contains("/")) {
                String executionId = path.substring(path.lastIndexOf("/") + 1);
                
                if (path.contains("/cancel")) {
                    handleCancelExecution(executionId, response);
                } else {
                    handleGetExecution(executionId, response);
                }
            } else {
                handleListExecutions(request, response);
            }

        } catch (Exception e) {
            LOG.error("Error in GET request", e);
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                              "Internal server error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response) throws IOException {
        try {
            String path = request.getPathInfo();
            
            if (path != null && path.contains("/")) {
                String executionId = path.substring(path.lastIndexOf("/") + 1);
                
                if (path.contains("/retry")) {
                    handleRetryExecution(executionId, request, response);
                } else {
                    sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                                      "Invalid POST operation");
                }
            } else {
                sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                                  "Execution ID is required for POST operations");
            }

        } catch (Exception e) {
            LOG.error("Error in POST request", e);
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                              "Internal server error: " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(SlingHttpServletRequest request, SlingHttpServletResponse response) throws IOException {
        try {
            String path = request.getPathInfo();
            if (path == null || !path.contains("/")) {
                sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                                  "Execution ID is required for DELETE operations");
                return;
            }

            String executionId = path.substring(path.lastIndexOf("/") + 1);
            handleDeleteExecution(executionId, response);

        } catch (Exception e) {
            LOG.error("Error in DELETE request", e);
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                              "Internal server error: " + e.getMessage());
        }
    }

    private void handleListExecutions(SlingHttpServletRequest request, SlingHttpServletResponse response) throws Exception {
        String actionId = request.getParameter("actionId");
        String resourcePath = request.getParameter("resourcePath");
        String userId = request.getParameter("userId");
        String status = request.getParameter("status");
        Integer limit = parseInteger(request.getParameter("limit"), 50);
        Integer offset = parseInteger(request.getParameter("offset"), 0);

        List<AIActionExecutionModel> executions;
        
        if (actionId != null && !actionId.isEmpty()) {
            executions = aiActionService.listExecutions(actionId);
        } else if (resourcePath != null && !resourcePath.isEmpty()) {
            executions = aiActionService.listExecutionsForResource(resourcePath);
        } else if (userId != null && !userId.isEmpty()) {
            executions = aiActionService.listExecutionsByUser(userId);
        } else {
            // In a real implementation, we'd need a method to list all executions with pagination
            executions = List.of(); // Placeholder
        }

        // Filter by status if provided
        if (status != null && !status.isEmpty()) {
            executions = executions.stream()
                .filter(exec -> status.equals(exec.getStatus()))
                .collect(java.util.stream.Collectors.toList());
        }

        // Apply pagination
        int total = executions.size();
        int endIndex = Math.min(offset + limit, total);
        List<AIActionExecutionModel> paginatedExecutions = executions.subList(offset, endIndex);

        Map<String, Object> result = Map.of(
            "executions", paginatedExecutions,
            "total", total,
            "limit", limit,
            "offset", offset,
            "success", true
        );

        sendJsonResponse(response, HttpServletResponse.SC_OK, result);
    }

    private void handleGetExecution(String executionId, SlingHttpServletResponse response) throws Exception {
        AIActionExecutionModel execution = aiActionService.getExecution(executionId);
        
        Map<String, Object> result = Map.of(
            "execution", execution,
            "success", true
        );

        sendJsonResponse(response, HttpServletResponse.SC_OK, result);
    }

    private void handleCancelExecution(String executionId, SlingHttpServletResponse response) throws Exception {
        boolean cancelled = aiActionService.cancelExecution(executionId);
        
        Map<String, Object> result = Map.of(
            "success", cancelled,
            "message", cancelled ? "Execution cancelled successfully" : "Execution could not be cancelled"
        );

        sendJsonResponse(response, HttpServletResponse.SC_OK, result);
    }

    private void handleRetryExecution(String executionId, SlingHttpServletRequest request, SlingHttpServletResponse response) throws Exception {
        AIActionExecutionModel originalExecution = aiActionService.getExecution(executionId);
        
        if (originalExecution == null) {
            sendErrorResponse(response, HttpServletResponse.SC_NOT_FOUND, 
                              "Execution not found");
            return;
        }

        // Retry the execution with the same input
        AIActionExecutionModel retryExecution = aiActionService.executeAction(
            originalExecution.getActionId(), 
            originalExecution.getInput(), 
            request.getResourceResolver().getUserID()
        );
        
        Map<String, Object> result = Map.of(
            "execution", retryExecution,
            "originalExecution", originalExecution,
            "success", true,
            "message", "Execution retry started"
        );

        sendJsonResponse(response, HttpServletResponse.SC_ACCEPTED, result);
    }

    private void handleDeleteExecution(String executionId, SlingHttpServletResponse response) throws Exception {
        aiActionService.deleteExecution(executionId);
        
        Map<String, Object> result = Map.of(
            "success", true,
            "message", "Execution deleted successfully"
        );

        sendJsonResponse(response, HttpServletResponse.SC_OK, result);
    }

    private void handleStatistics(SlingHttpServletRequest request, SlingHttpServletResponse response) throws Exception {
        String actionId = request.getParameter("actionId");
        boolean systemStats = "true".equals(request.getParameter("system"));

        Map<String, Object> statistics;
        
        if (systemStats) {
            statistics = aiActionService.getSystemStatistics();
        } else if (actionId != null && !actionId.isEmpty()) {
            statistics = aiActionService.getActionStatistics(actionId);
        } else {
            sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                              "Either actionId or system=true parameter is required");
            return;
        }

        Map<String, Object> result = Map.of(
            "statistics", statistics,
            "success", true
        );

        sendJsonResponse(response, HttpServletResponse.SC_OK, result);
    }

    private Integer parseInteger(String value, Integer defaultValue) {
        if (value == null || value.trim().isEmpty()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private void sendJsonResponse(SlingHttpServletResponse response, int status, Object data) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(status);
        
        // Add CORS headers
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        objectMapper.writeValue(response.getWriter(), data);
    }

    private void sendErrorResponse(SlingHttpServletResponse response, int status, String message) throws IOException {
        Map<String, Object> error = Map.of(
            "success", false,
            "error", message,
            "status", status
        );
        
        sendJsonResponse(response, status, error);
    }

    @Override
    protected void doOptions(SlingHttpServletRequest request, SlingHttpServletResponse response) throws IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setStatus(HttpServletResponse.SC_OK);
    }
}