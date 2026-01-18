package com.example.aem.vercel.workflow.servlet;

import com.example.aem.vercel.workflow.model.AIActionModel;
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
 * REST API servlet for AI Actions management.
 * Provides endpoints for CRUD operations on AI actions similar to Contentful's API.
 */
@Component(
    service = Servlet.class,
    property = {
        "sling.servlet.methods=GET,POST,PUT,DELETE",
        "sling.servlet.paths=/api/ai-actions",
        "sling.servlet.selectors=actions",
        "sling.servlet.extensions=json"
    }
)
public class AIActionApiServlet extends SlingAllMethodsServlet {

    private static final Logger LOG = LoggerFactory.getLogger(AIActionApiServlet.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Reference
    private AIActionService aiActionService;

    @Override
    protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response) throws IOException {
        try {
            String path = request.getPathInfo();
            String[] selectors = request.getRequestPathInfo().getSelectors();

            if (selectors.length > 0 && "search".equals(selectors[0])) {
                handleSearch(request, response);
            } else if (path != null && path.contains("/")) {
                String actionId = path.substring(path.lastIndexOf("/") + 1);
                handleGetAction(actionId, response);
            } else {
                handleListActions(request, response);
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
                String actionId = path.substring(path.lastIndexOf("/") + 1);
                
                if (path.contains("/execute")) {
                    handleExecuteAction(actionId, request, response);
                } else if (path.contains("/test")) {
                    handleTestAction(actionId, request, response);
                } else if (path.contains("/clone")) {
                    handleCloneAction(actionId, request, response);
                } else {
                    sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                                      "Invalid POST operation");
                }
            } else {
                handleCreateAction(request, response);
            }

        } catch (Exception e) {
            LOG.error("Error in POST request", e);
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                              "Internal server error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(SlingHttpServletRequest request, SlingHttpServletResponse response) throws IOException {
        try {
            String path = request.getPathInfo();
            if (path == null || !path.contains("/")) {
                sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                                  "Action ID is required for PUT operations");
                return;
            }

            String actionId = path.substring(path.lastIndexOf("/") + 1);
            handleUpdateAction(actionId, request, response);

        } catch (Exception e) {
            LOG.error("Error in PUT request", e);
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
                                  "Action ID is required for DELETE operations");
                return;
            }

            String actionId = path.substring(path.lastIndexOf("/") + 1);
            handleDeleteAction(actionId, response);

        } catch (Exception e) {
            LOG.error("Error in DELETE request", e);
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                              "Internal server error: " + e.getMessage());
        }
    }

    private void handleListActions(SlingHttpServletRequest request, SlingHttpServletResponse response) throws Exception {
        String category = request.getParameter("category");
        String contentType = request.getParameter("contentType");
        String enabled = request.getParameter("enabled");

        List<AIActionModel> actions;
        
        if (category != null && !category.isEmpty()) {
            actions = aiActionService.listActionsByCategory(category);
        } else if (contentType != null && !contentType.isEmpty()) {
            actions = aiActionService.listActionsByContentType(contentType);
        } else if ("true".equals(enabled)) {
            actions = aiActionService.listEnabledActions();
        } else {
            actions = aiActionService.listActions();
        }

        Map<String, Object> result = Map.of(
            "actions", actions,
            "total", actions.size(),
            "success", true
        );

        sendJsonResponse(response, HttpServletResponse.SC_OK, result);
    }

    private void handleGetAction(String actionId, SlingHttpServletResponse response) throws Exception {
        AIActionModel action = aiActionService.getAction(actionId);
        
        Map<String, Object> result = Map.of(
            "action", action,
            "success", true
        );

        sendJsonResponse(response, HttpServletResponse.SC_OK, result);
    }

    private void handleCreateAction(SlingHttpServletRequest request, SlingHttpServletResponse response) throws Exception {
        AIActionModel action = objectMapper.readValue(request.getReader(), AIActionModel.class);
        
        if (action.getId() == null || action.getId().isEmpty()) {
            action.setId(java.util.UUID.randomUUID().toString());
        }

        AIActionModel createdAction = aiActionService.createAction(action);
        
        Map<String, Object> result = Map.of(
            "action", createdAction,
            "success", true,
            "message", "AI action created successfully"
        );

        sendJsonResponse(response, HttpServletResponse.SC_CREATED, result);
    }

    private void handleUpdateAction(String actionId, SlingHttpServletRequest request, SlingHttpServletResponse response) throws Exception {
        AIActionModel action = objectMapper.readValue(request.getReader(), AIActionModel.class);
        action.setId(actionId);

        AIActionModel updatedAction = aiActionService.updateAction(actionId, action);
        
        Map<String, Object> result = Map.of(
            "action", updatedAction,
            "success", true,
            "message", "AI action updated successfully"
        );

        sendJsonResponse(response, HttpServletResponse.SC_OK, result);
    }

    private void handleDeleteAction(String actionId, SlingHttpServletResponse response) throws Exception {
        aiActionService.deleteAction(actionId);
        
        Map<String, Object> result = Map.of(
            "success", true,
            "message", "AI action deleted successfully"
        );

        sendJsonResponse(response, HttpServletResponse.SC_OK, result);
    }

    private void handleExecuteAction(String actionId, SlingHttpServletRequest request, SlingHttpServletResponse response) throws Exception {
        @SuppressWarnings("unchecked")
        Map<String, Object> input = objectMapper.readValue(request.getReader(), Map.class);
        
        String resourcePath = (String) input.get("resourcePath");
        String initiatedBy = request.getResourceResolver().getUserID();
        
        com.example.aem.vercel.workflow.model.AIActionExecutionModel execution;
        
        if (resourcePath != null && !resourcePath.isEmpty()) {
            execution = aiActionService.executeActionOnResource(actionId, resourcePath, input, initiatedBy);
        } else {
            execution = aiActionService.executeAction(actionId, input, initiatedBy);
        }
        
        Map<String, Object> result = Map.of(
            "execution", execution,
            "success", true,
            "message", "AI action execution started"
        );

        sendJsonResponse(response, HttpServletResponse.SC_ACCEPTED, result);
    }

    private void handleTestAction(String actionId, SlingHttpServletRequest request, SlingHttpServletResponse response) throws Exception {
        @SuppressWarnings("unchecked")
        Map<String, Object> input = objectMapper.readValue(request.getReader(), Map.class);
        
        com.example.aem.vercel.workflow.model.AIActionExecutionModel execution = 
            aiActionService.testAction(actionId, input);
        
        Map<String, Object> result = Map.of(
            "execution", execution,
            "success", true,
            "message", "AI action test completed"
        );

        sendJsonResponse(response, HttpServletResponse.SC_OK, result);
    }

    private void handleCloneAction(String actionId, SlingHttpServletRequest request, SlingHttpServletResponse response) throws Exception {
        @SuppressWarnings("unchecked")
        Map<String, String> input = objectMapper.readValue(request.getReader(), Map.class);
        String newName = input.get("name");
        
        if (newName == null || newName.isEmpty()) {
            sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                              "New name is required for cloning");
            return;
        }

        AIActionModel clonedAction = aiActionService.cloneAction(actionId, newName);
        
        Map<String, Object> result = Map.of(
            "action", clonedAction,
            "success", true,
            "message", "AI action cloned successfully"
        );

        sendJsonResponse(response, HttpServletResponse.SC_CREATED, result);
    }

    private void handleSearch(SlingHttpServletRequest request, SlingHttpServletResponse response) throws Exception {
        String query = request.getParameter("q");
        if (query == null || query.trim().isEmpty()) {
            sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                              "Search query is required");
            return;
        }

        List<AIActionModel> actions = aiActionService.searchActions(query.trim());
        
        Map<String, Object> result = Map.of(
            "actions", actions,
            "total", actions.size(),
            "query", query,
            "success", true
        );

        sendJsonResponse(response, HttpServletResponse.SC_OK, result);
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