package com.example.aem.vercel.workflow.service.impl;

import com.example.aem.vercel.workflow.model.AIActionModel;
import com.example.aem.vercel.workflow.model.AIActionExecutionModel;
import com.example.aem.vercel.workflow.service.AIActionService;
import com.example.aem.vercel.workflow.service.AIService; // Import AIService
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.ConfigurationPolicy;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.metatype.annotations.Designate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.apache.sling.api.resource.ResourceResolverFactory;
import org.apache.sling.api.resource.ResourceResolver;

import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.jcr.Value; // Import Value
import javax.jcr.query.Query;
import javax.jcr.query.QueryManager;
import javax.jcr.query.QueryResult;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Implementation of AI Action Service for AEM.
 * Provides AI-powered content generation and manipulation capabilities.
 */
@Component(
    service = AIActionService.class,
    immediate = true,
    configurationPolicy = ConfigurationPolicy.REQUIRE
)
public class AIActionServiceImpl implements AIActionService {

    private static final Logger LOG = LoggerFactory.getLogger(AIActionServiceImpl.class);

    private static final String ACTIONS_BASE_PATH = "/var/ai-actions";
    private static final String EXECUTIONS_BASE_PATH = "/var/ai-executions";

    private final ExecutorService executorService = Executors.newFixedThreadPool(10);
    private final Map<String, CompletableFuture<AIActionExecutionModel>> runningExecutions = new ConcurrentHashMap<>();

    @Reference
    private AIService aiService;

    @Reference
    private ResourceResolverFactory resourceResolverFactory;

    private Session session;
    private ResourceResolver resourceResolver;

    @Activate
    protected void activate(Map<String, Object> properties) {
        LOG.info("AI Action Service activated");
        try {
            Map<String, Object> param = new HashMap<>();
            param.put(ResourceResolverFactory.SUBSERVICE, "ai-actions-service");
            resourceResolver = resourceResolverFactory.getServiceResourceResolver(param);
            session = resourceResolver.adaptTo(Session.class);
            initializeStorage();
        } catch (org.apache.sling.api.resource.LoginException e) {
            LOG.error("Failed to get service resource resolver", e);
        }
    }
    private void initializeStorage() {
        try {
            // Ensure base paths exist
            ensureNodeExists(ACTIONS_BASE_PATH, "sling:Folder");
            ensureNodeExists(EXECUTIONS_BASE_PATH, "sling:Folder");
            LOG.info("AI Action storage initialized");
        } catch (RepositoryException e) {
            LOG.error("Failed to initialize AI Action storage", e);
        }
    }

    @Override
    public AIActionModel createAction(AIActionModel action) throws Exception {
        LOG.info("Creating AI action: {}", action.getName());
        
        if (!validateAction(action)) {
            throw new IllegalArgumentException("Invalid action configuration");
        }

        try {
            String actionPath = ACTIONS_BASE_PATH + "/" + action.getId();
            Node actionNode = ensureNodeExists(actionPath, "nt:unstructured");
            
            // Set action properties
            setActionProperties(actionNode, action);
            session.save();
            LOG.info("AI action created: {}", action.getId());
            return getAction(action.getId());
            
        } catch (RepositoryException e) {
            LOG.error("Failed to create AI action: {}", action.getId(), e);
            throw new Exception("Failed to create AI action", e);
        }
    }

    @Override
    public AIActionModel getAction(String actionId) throws Exception {
        try {
            String actionPath = ACTIONS_BASE_PATH + "/" + actionId;
            Node actionNode = session.getNode(actionPath);
            return createActionFromNode(actionNode);
            
        } catch (RepositoryException e) {
            LOG.error("Failed to get AI action: {}", actionId, e);
            throw new Exception("AI action not found: " + actionId, e);
        }
    }

    @Override
    public AIActionModel updateAction(String actionId, AIActionModel action) throws Exception {
        LOG.info("Updating AI action: {}", actionId);
        
        try {
            String actionPath = ACTIONS_BASE_PATH + "/" + actionId;
            Node actionNode = session.getNode(actionPath);
            
            // Update properties
            setActionProperties(actionNode, action);
            session.save();
            
            LOG.info("AI action updated: {}", actionId);
            return getAction(actionId);
            
        } catch (RepositoryException e) {
            LOG.error("Failed to update AI action: {}", actionId, e);
            throw new Exception("Failed to update AI action", e);
        }
    }

    @Override
    public void deleteAction(String actionId) throws Exception {
        LOG.info("Deleting AI action: {}", actionId);
        
        try {
            String actionPath = ACTIONS_BASE_PATH + "/" + actionId;
            Node actionNode = session.getNode(actionPath);
            actionNode.remove();
            session.save();
            
            LOG.info("AI action deleted: {}", actionId);
            
        } catch (RepositoryException e) {
            LOG.error("Failed to delete AI action: {}", actionId, e);
            throw new Exception("Failed to delete AI action", e);
        }
    }

    @Override
    public List<AIActionModel> listActions() throws Exception {
        return listActionsByType(null, null);
    }

    @Override
    public List<AIActionModel> listActionsByCategory(String category) throws Exception {
        return listActionsByType("category", category);
    }

    @Override
    public List<AIActionModel> listActionsByContentType(String contentType) throws Exception {
        List<AIActionModel> allActions = listActions();
        List<AIActionModel> filteredActions = new ArrayList<>();
        
        for (AIActionModel action : allActions) {
            if (action.supportsContentType(contentType)) {
                filteredActions.add(action);
            }
        }
        
        return filteredActions;
    }

    @Override
    public List<AIActionModel> listEnabledActions() throws Exception {
        return listActionsByType("enabled", "true");
    }

    @Override
    public List<AIActionModel> searchActions(String query) throws Exception {
        try {
            String xpath = String.format(
                "//element(*, nt:unstructured)[jcr:contains(@name, '%s') or jcr:contains(@description, '%s')] order by @jcr:created",
                query, query
            );
            
            QueryManager queryManager = session.getWorkspace().getQueryManager();
            Query jcrQuery = queryManager.createQuery(xpath, Query.XPATH);
            QueryResult result = jcrQuery.execute();
            
            List<AIActionModel> actions = new ArrayList<>();
            NodeIterator nodes = result.getNodes();
            
            while (nodes.hasNext()) {
                Node node = nodes.nextNode();
                if (node.getPath().startsWith(ACTIONS_BASE_PATH)) {
                    actions.add(createActionFromNode(node));
                }
            }
            
            return actions;
            
        } catch (RepositoryException e) {
            LOG.error("Failed to search AI actions: {}", query, e);
            throw new Exception("Failed to search actions", e);
        }
    }

    @Override
    public AIActionExecutionModel executeAction(String actionId, Map<String, Object> input, String initiatedBy) throws Exception {
        AIActionModel action = getAction(actionId);
        if (!action.isEnabled()) {
            throw new Exception("AI action is disabled: " + actionId);
        }

        String executionId = UUID.randomUUID().toString();
        AIActionExecutionModel execution = createExecution(executionId, action, input, initiatedBy);
        
        // Start async execution
        CompletableFuture<AIActionExecutionModel> future = CompletableFuture.supplyAsync(() -> {
            try {
                return executeAsync(execution, action, input);
            } catch (Exception e) {
                LOG.error("AI action execution failed: {}", executionId, e);
                execution.setErrorMessage(e.getMessage());
                execution.setStatus(AIActionExecutionModel.Status.FAILED);
                try {
                    saveExecution(execution);
                } catch (Exception ex) {
                    LOG.error("Failed to save execution after error", ex);
                }
                return execution;
            }
        }, executorService);

        runningExecutions.put(executionId, future);
        
        return execution;
    }

    @Override
    public AIActionExecutionModel executeActionOnResource(String actionId, String resourcePath, 
                                                          Map<String, Object> input, String initiatedBy) throws Exception {
        // Add resource context to input
        Map<String, Object> enhancedInput = new HashMap<>(input);
        enhancedInput.put("resourcePath", resourcePath);
        enhancedInput.put("resourceType", getResourceType(resourcePath));
        
        AIActionExecutionModel execution = executeAction(actionId, enhancedInput, initiatedBy);
        execution.setResourcePath(resourcePath);
        saveExecution(execution);
        
        return execution;
    }

    @Override
    public AIActionExecutionModel getExecution(String executionId) throws Exception {
        try {
            String executionPath = EXECUTIONS_BASE_PATH + "/" + executionId;
            Node executionNode = session.getNode(executionPath);
            return createExecutionFromNode(executionNode);
            
        } catch (RepositoryException e) {
            LOG.error("Failed to get AI execution: {}", executionId, e);
            throw new Exception("AI execution not found: " + executionId, e);
        }
    }

    @Override
    public List<AIActionExecutionModel> listExecutions(String actionId) throws Exception {
        return listExecutionsByType("actionId", actionId);
    }

    @Override
    public List<AIActionExecutionModel> listExecutionsForResource(String resourcePath) throws Exception {
        return listExecutionsByType("resourcePath", resourcePath);
    }

    @Override
    public List<AIActionExecutionModel> listExecutionsByUser(String userId) throws Exception {
        return listExecutionsByType("initiatedBy", userId);
    }

    @Override
    public boolean cancelExecution(String executionId) throws Exception {
        CompletableFuture<AIActionExecutionModel> future = runningExecutions.get(executionId);
        if (future != null && !future.isDone()) {
            future.cancel(true);
            runningExecutions.remove(executionId);
            
            AIActionExecutionModel execution = getExecution(executionId);
            execution.setStatus(AIActionExecutionModel.Status.CANCELLED);
            saveExecution(execution);
            
            LOG.info("AI execution cancelled: {}", executionId);
            return true;
        }
        return false;
    }

    @Override
    public void deleteExecution(String executionId) throws Exception {
        try {
            String executionPath = EXECUTIONS_BASE_PATH + "/" + executionId;
            Node executionNode = session.getNode(executionPath);
            executionNode.remove();
            session.save();
            
            runningExecutions.remove(executionId);
            LOG.info("AI execution deleted: {}", executionId);
            
        } catch (RepositoryException e) {
            LOG.error("Failed to delete AI execution: {}", executionId, e);
            throw new Exception("Failed to delete execution", e);
        }
    }

    @Override
    public boolean validateAction(AIActionModel action) {
        return action.isValid();
    }

    @Override
    public AIActionExecutionModel testAction(String actionId, Map<String, Object> input) throws Exception {
        AIActionModel action = getAction(actionId);
        AIActionExecutionModel testExecution = createExecution("test-" + UUID.randomUUID(), action, input, "test");
        
        // Run test execution synchronously
        return executeAsync(testExecution, action, input);
    }

    @Override
    public AIActionModel cloneAction(String actionId, String newName) throws Exception {
        AIActionModel original = getAction(actionId);
        AIActionModel clone = new AIActionModel();
        
        // Copy all properties except ID
        clone.setId(UUID.randomUUID().toString());
        clone.setName(newName);
        clone.setDescription(original.getDescription() + " (Cloned)");
        clone.setActionType(original.getActionType());
        clone.setCategory(original.getCategory());
        clone.setTargetType(original.getTargetType());
        clone.setAiProvider(original.getAiProvider());
        clone.setModel(original.getModel());
        clone.setConfiguration(original.getConfiguration());
        clone.setPromptTemplate(original.getPromptTemplate());
        clone.setOutputSchema(original.getOutputSchema());
        clone.setVersion("1");
        clone.setStatus("draft");
        clone.setEnabled(original.getEnabled());
        clone.setTags(original.getTags());
        clone.setContentTypes(original.getContentTypes());
        
        return createAction(clone);
    }

    @Override
    public List<AIActionModel> importActions(Map<String, Object> configuration) throws Exception {
        LOG.info("Importing AI actions from configuration");
        List<AIActionModel> importedActions = new ArrayList<>();

        try {
            // Get actions array from configuration
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> actionsData = (List<Map<String, Object>>) configuration.get("actions");

            if (actionsData == null || actionsData.isEmpty()) {
                LOG.warn("No actions found in import configuration");
                return importedActions;
            }

            // Import options
            boolean overwriteExisting = Boolean.TRUE.equals(configuration.get("overwriteExisting"));
            boolean preserveIds = Boolean.TRUE.equals(configuration.get("preserveIds"));

            for (Map<String, Object> actionData : actionsData) {
                try {
                    AIActionModel action = new AIActionModel();

                    // Set ID - either preserve original or generate new
                    String originalId = (String) actionData.get("id");
                    if (preserveIds && originalId != null) {
                        action.setId(originalId);
                    } else {
                        action.setId(UUID.randomUUID().toString());
                    }

                    // Set required fields
                    action.setName((String) actionData.get("name"));
                    action.setDescription((String) actionData.getOrDefault("description", ""));
                    action.setActionType((String) actionData.getOrDefault("actionType", "generate"));
                    action.setCategory((String) actionData.getOrDefault("category", "general"));
                    action.setTargetType((String) actionData.getOrDefault("targetType", "content"));
                    action.setAiProvider((String) actionData.getOrDefault("aiProvider", "openai"));
                    action.setModel((String) actionData.getOrDefault("model", "gpt-4"));
                    action.setVersion((String) actionData.getOrDefault("version", "1"));
                    action.setStatus((String) actionData.getOrDefault("status", "active"));
                    action.setEnabled((String) actionData.getOrDefault("enabled", "true"));

                    // Set optional array fields
                    @SuppressWarnings("unchecked")
                    List<String> tagsList = (List<String>) actionData.get("tags");
                    if (tagsList != null) {
                        action.setTags(tagsList.toArray(new String[0]));
                    }

                    @SuppressWarnings("unchecked")
                    List<String> contentTypesList = (List<String>) actionData.get("contentTypes");
                    if (contentTypesList != null) {
                        action.setContentTypes(contentTypesList.toArray(new String[0]));
                    }

                    // Set complex fields
                    @SuppressWarnings("unchecked")
                    Map<String, Object> configMap = (Map<String, Object>) actionData.get("configuration");
                    if (configMap != null) {
                        action.setConfiguration(configMap);
                    }

                    action.setPromptTemplate((String) actionData.get("promptTemplate"));

                    @SuppressWarnings("unchecked")
                    Map<String, Object> outputSchema = (Map<String, Object>) actionData.get("outputSchema");
                    if (outputSchema != null) {
                        action.setOutputSchema(outputSchema);
                    }

                    // Check if action exists
                    boolean exists = false;
                    try {
                        getAction(action.getId());
                        exists = true;
                    } catch (Exception e) {
                        // Action doesn't exist - this is fine
                    }

                    if (exists && !overwriteExisting) {
                        LOG.info("Skipping existing action: {} (overwrite disabled)", action.getId());
                        continue;
                    }

                    if (exists) {
                        updateAction(action.getId(), action);
                        LOG.info("Updated existing action: {}", action.getId());
                    } else {
                        createAction(action);
                        LOG.info("Created new action: {}", action.getId());
                    }

                    importedActions.add(action);

                } catch (Exception e) {
                    LOG.error("Failed to import action: {}", actionData.get("name"), e);
                    // Continue with other actions
                }
            }

            LOG.info("Successfully imported {} actions", importedActions.size());
            return importedActions;

        } catch (Exception e) {
            LOG.error("Failed to import actions", e);
            throw new Exception("Failed to import actions: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, Object> exportActions(String[] actionIds) throws Exception {
        LOG.info("Exporting {} AI actions", actionIds != null ? actionIds.length : "all");
        Map<String, Object> exportData = new HashMap<>();

        try {
            List<AIActionModel> actionsToExport;

            if (actionIds == null || actionIds.length == 0) {
                // Export all actions
                actionsToExport = listActions();
            } else {
                // Export specific actions
                actionsToExport = new ArrayList<>();
                for (String actionId : actionIds) {
                    try {
                        AIActionModel action = getAction(actionId);
                        actionsToExport.add(action);
                    } catch (Exception e) {
                        LOG.warn("Action not found for export: {}", actionId);
                    }
                }
            }

            // Convert actions to exportable format
            List<Map<String, Object>> actionsData = new ArrayList<>();
            for (AIActionModel action : actionsToExport) {
                Map<String, Object> actionData = new HashMap<>();
                actionData.put("id", action.getId());
                actionData.put("name", action.getName());
                actionData.put("description", action.getDescription());
                actionData.put("actionType", action.getActionType());
                actionData.put("category", action.getCategory());
                actionData.put("targetType", action.getTargetType());
                actionData.put("aiProvider", action.getAiProvider());
                actionData.put("model", action.getModel());
                actionData.put("version", action.getVersion());
                actionData.put("status", action.getStatus());
                actionData.put("enabled", action.getEnabled());
                actionData.put("tags", action.getTags() != null ? Arrays.asList(action.getTags()) : Collections.emptyList());
                actionData.put("contentTypes", action.getContentTypes() != null ? Arrays.asList(action.getContentTypes()) : Collections.emptyList());
                actionData.put("configuration", action.getConfiguration());
                actionData.put("promptTemplate", action.getPromptTemplate());
                actionData.put("outputSchema", action.getOutputSchema());
                actionsData.add(actionData);
            }

            // Build export structure
            exportData.put("version", "1.0");
            exportData.put("exportedAt", new Date().toString());
            exportData.put("count", actionsToExport.size());
            exportData.put("actions", actionsData);

            LOG.info("Successfully exported {} actions", actionsToExport.size());
            return exportData;

        } catch (Exception e) {
            LOG.error("Failed to export actions", e);
            throw new Exception("Failed to export actions: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, Object> getActionStatistics(String actionId) throws Exception {
        List<AIActionExecutionModel> executions = listExecutions(actionId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalExecutions", executions.size());
        stats.put("successfulExecutions", executions.stream().mapToInt(e -> e.isSuccessful() ? 1 : 0).sum());
        stats.put("failedExecutions", executions.stream().mapToInt(e -> e.isHasError() ? 1 : 0).sum());
        stats.put("averageDuration", executions.stream().mapToLong(AIActionExecutionModel::getActualDuration).average().orElse(0));
        
        return stats;
    }

    @Override
    public Map<String, Object> getSystemStatistics() throws Exception {
        List<AIActionModel> allActions = listActions();
        List<AIActionExecutionModel> allExecutions = getAllExecutions();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalActions", allActions.size());
        stats.put("enabledActions", allActions.stream().mapToInt(a -> a.isEnabled() ? 1 : 0).sum());
        stats.put("totalExecutions", allExecutions.size());
        stats.put("runningExecutions", runningExecutions.size());
        
        return stats;
    }

    // Private helper methods
    private Node ensureNodeExists(String path, String nodeType) throws RepositoryException {
        if (session.nodeExists(path)) {
            return session.getNode(path);
        }
        String[] parts = path.substring(1).split("/");
        Node currentNode = session.getRootNode();
        for (String part : parts) {
            if (!currentNode.hasNode(part)) {
                currentNode = currentNode.addNode(part, nodeType);
            } else {
                currentNode = currentNode.getNode(part);
            }
        }
        session.save();
        return currentNode;
    }

    private void setActionProperties(Node node, AIActionModel action) throws RepositoryException {
        node.setProperty("id", action.getId());
        node.setProperty("name", action.getName());
        node.setProperty("description", action.getDescription());
        node.setProperty("actionType", action.getActionType());
        node.setProperty("category", action.getCategory());
        node.setProperty("targetType", action.getTargetType());
        node.setProperty("aiProvider", action.getAiProvider());
        node.setProperty("model", action.getModel());
        node.setProperty("version", action.getVersion());
        node.setProperty("status", action.getStatus());
        node.setProperty("enabled", action.getEnabled());
        // Handle String[] properties
        if (action.getTags() != null && action.getTags().length > 0) {
            node.setProperty("tags", action.getTags());
        } else {
            node.setProperty("tags", new String[0]); // Ensure property exists as empty array if null
        }
        if (action.getContentTypes() != null && action.getContentTypes().length > 0) {
            node.setProperty("contentTypes", action.getContentTypes());
        } else {
            node.setProperty("contentTypes", new String[0]); // Ensure property exists as empty array if null
        }
    }

    private AIActionModel createActionFromNode(Node node) throws RepositoryException {
        AIActionModel action = new AIActionModel();
        action.setId(node.getProperty("id").getString());
        action.setName(node.getProperty("name").getString());
        action.setDescription(node.getProperty("description").getString());
        action.setActionType(node.getProperty("actionType").getString());
        action.setCategory(node.getProperty("category").getString());
        action.setTargetType(node.getProperty("targetType").getString());
        action.setAiProvider(node.getProperty("aiProvider").getString());
        action.setModel(node.getProperty("model").getString());
        action.setVersion(node.getProperty("version").getString());
        action.setStatus(node.getProperty("status").getString());
        action.setEnabled(node.getProperty("enabled").getString());
        // Handle String[] properties
        if (node.hasProperty("tags")) {
            Value[] tagsValues = node.getProperty("tags").getValues();
            String[] tags = new String[tagsValues.length];
            for (int i = 0; i < tagsValues.length; i++) {
                tags[i] = tagsValues[i].getString();
            }
            action.setTags(tags);
        } else {
            action.setTags(new String[0]);
        }
        
        if (node.hasProperty("contentTypes")) {
            Value[] contentTypesValues = node.getProperty("contentTypes").getValues();
            String[] contentTypes = new String[contentTypesValues.length];
            for (int i = 0; i < contentTypesValues.length; i++) {
                contentTypes[i] = contentTypesValues[i].getString();
            }
            action.setContentTypes(contentTypes);
        } else {
            action.setContentTypes(new String[0]);
        }
        
        return action;
    }

    private AIActionExecutionModel createExecution(String executionId, AIActionModel action, 
                                                  Map<String, Object> input, String initiatedBy) throws Exception {
        AIActionExecutionModel execution = new AIActionExecutionModel();
        execution.setId(executionId);
        execution.setActionId(action.getId());
        execution.setActionName(action.getName());
        execution.setActionType(action.getActionType());
        execution.setStatus(AIActionExecutionModel.Status.PENDING);
        execution.setStartedAt(new Date());
        execution.setInitiatedBy(initiatedBy);
        execution.setInput(input);
        execution.setAiProvider(action.getAiProvider());
        execution.setModel(action.getModel());
        
        saveExecution(execution);
        return execution;
    }

    private AIActionExecutionModel executeAsync(AIActionExecutionModel execution, AIActionModel action, 
                                               Map<String, Object> input) throws Exception {
        execution.setStatus(AIActionExecutionModel.Status.RUNNING);
        saveExecution(execution);
        
        try {
            // Generate prompt
            String prompt = action.getPromptForInput(input);
            
            // Execute AI request
            Map<String, Object> aiResult = aiService.generateContent(
                prompt, 
                action.getAiProvider(), 
                action.getModel()
            );
            
            execution.setOutput((Map<String, Object>) aiResult.get("content"));
            execution.setUsage((Map<String, Object>) aiResult.get("usage"));
            execution.setStatus(AIActionExecutionModel.Status.COMPLETED);
            
        } catch (Exception e) {
            execution.setErrorMessage(e.getMessage());
            execution.setStatus(AIActionExecutionModel.Status.FAILED);
            throw e;
        } finally {
            execution.setCompletedAt(new Date());
            saveExecution(execution);
            runningExecutions.remove(execution.getId());
        }
        
        return execution;
    }

    private void saveExecution(AIActionExecutionModel execution) throws Exception {
        try {
            Node executionNode = ensureNodeExists(EXECUTIONS_BASE_PATH + "/" + execution.getId(), "nt:unstructured");
            
            executionNode.setProperty("id", execution.getId());
            executionNode.setProperty("actionId", execution.getActionId());
            executionNode.setProperty("actionName", execution.getActionName());
            executionNode.setProperty("actionType", execution.getActionType());
            executionNode.setProperty("status", execution.getStatus().toString()); // Convert Enum to String
            
            // Convert Date to Calendar for JCR property
            Calendar startedAtCalendar = Calendar.getInstance();
            if (execution.getStartedAt() != null) {
                startedAtCalendar.setTime(execution.getStartedAt());
                executionNode.setProperty("startedAt", startedAtCalendar);
            }

            Calendar completedAtCalendar = Calendar.getInstance();
            if (execution.getCompletedAt() != null) {
                completedAtCalendar.setTime(execution.getCompletedAt());
                executionNode.setProperty("completedAt", completedAtCalendar);
            }
            
            // Handle duration
            executionNode.setProperty("duration", execution.getDuration());

            executionNode.setProperty("initiatedBy", execution.getInitiatedBy());
            if (execution.getResourcePath() != null) {
                executionNode.setProperty("resourcePath", execution.getResourcePath());
            }
            executionNode.setProperty("aiProvider", execution.getAiProvider());
            executionNode.setProperty("model", execution.getModel());
            if (execution.getErrorMessage() != null) {
                executionNode.setProperty("errorMessage", execution.getErrorMessage());
            }
            
            // Handle String[] for tags
            if (execution.getTags() != null && execution.getTags().length > 0) {
                executionNode.setProperty("tags", execution.getTags());
            } else {
                executionNode.setProperty("tags", new String[0]);
            }
            
            session.save();
            
        } catch (Exception e) { // Changed to generic Exception for now
            LOG.error("Failed to save execution: {}", execution.getId(), e);
            throw new Exception("Failed to save execution", e);
        }
    }

    private AIActionExecutionModel createExecutionFromNode(Node node) throws RepositoryException {
        AIActionExecutionModel execution = new AIActionExecutionModel();
        execution.setId(node.getProperty("id").getString());
        execution.setActionId(node.getProperty("actionId").getString());
        execution.setActionName(node.getProperty("actionName").getString());
        execution.setActionType(node.getProperty("actionType").getString());
        execution.setStatus(AIActionExecutionModel.Status.valueOf(node.getProperty("status").getString())); // Convert String to Enum
        
        // Convert Calendar to Date for startedAt
        if (node.hasProperty("startedAt")) {
            execution.setStartedAt(node.getProperty("startedAt").getDate().getTime());
        }
        if (node.hasProperty("completedAt")) {
            execution.setCompletedAt(node.getProperty("completedAt").getDate().getTime());
        }
        
        // Duration property might be a String in JCR, convert to long or keep as String
        if (node.hasProperty("duration")) {
            execution.setDuration(node.getProperty("duration").getLong()); // Assuming stored as String
        }
        
        execution.setInitiatedBy(node.getProperty("initiatedBy").getString());
        if (node.hasProperty("resourcePath")) {
            execution.setResourcePath(node.getProperty("resourcePath").getString());
        }
        execution.setAiProvider(node.getProperty("aiProvider").getString());
        execution.setModel(node.getProperty("model").getString());
        if (node.hasProperty("errorMessage")) {
            execution.setErrorMessage(node.getProperty("errorMessage").getString());
        }
        
        // Handle String[] for tags
        if (node.hasProperty("tags")) {
            Value[] tagsValues = node.getProperty("tags").getValues();
            String[] tags = new String[tagsValues.length];
            for (int i = 0; i < tagsValues.length; i++) {
                tags[i] = tagsValues[i].getString();
            }
            execution.setTags(tags);
        } else {
            execution.setTags(new String[0]);
        }
        
        return execution;
    }

    private List<AIActionModel> listActionsByType(String propertyName, String value) throws Exception {
        try {
            String xpath;
            if (propertyName == null) {
                xpath = "//element(*, nt:unstructured)[@jcr:path like '" + ACTIONS_BASE_PATH + "/%'] order by @jcr:created";
            } else {
                xpath = String.format(
                    "//element(*, nt:unstructured)[@%s = '%s' and @jcr:path like '" + ACTIONS_BASE_PATH + "/%'] order by @jcr:created",
                    propertyName, value
                );
            }
            
            QueryManager queryManager = session.getWorkspace().getQueryManager();
            Query jcrQuery = queryManager.createQuery(xpath, Query.XPATH);
            QueryResult result = jcrQuery.execute();
            
            List<AIActionModel> actions = new ArrayList<>();
            NodeIterator nodes = result.getNodes();
            
            while (nodes.hasNext()) {
                Node node = nodes.nextNode();
                actions.add(createActionFromNode(node));
            }
            
            return actions;
            
        } catch (RepositoryException e) {
            LOG.error("Failed to list AI actions by type: {}={}", propertyName, value, e);
            throw new Exception("Failed to list actions", e);
        }
    }

    private List<AIActionExecutionModel> listExecutionsByType(String propertyName, String value) throws Exception {
        try {
            String xpath = String.format(
                "//element(*, nt:unstructured)[@%s = '%s' and @jcr:path like '" + EXECUTIONS_BASE_PATH + "/%'] order by @jcr:created desc",
                propertyName, value
            );
            
            QueryManager queryManager = session.getWorkspace().getQueryManager();
            Query jcrQuery = queryManager.createQuery(xpath, Query.XPATH);
            QueryResult result = jcrQuery.execute();
            
            List<AIActionExecutionModel> executions = new ArrayList<>();
            NodeIterator nodes = result.getNodes();
            
            while (nodes.hasNext()) {
                Node node = nodes.nextNode();
                executions.add(createExecutionFromNode(node));
            }
            
            return executions;
            
        } catch (RepositoryException e) {
            LOG.error("Failed to list executions by type: {}={}", propertyName, value, e);
            throw new Exception("Failed to list executions", e);
        }
    }

    private List<AIActionExecutionModel> getAllExecutions() throws Exception {
        try {
            String xpath = "//element(*, nt:unstructured)[@jcr:path like '" + EXECUTIONS_BASE_PATH + "/%'] order by @jcr:created desc";
            
            QueryManager queryManager = session.getWorkspace().getQueryManager();
            Query jcrQuery = queryManager.createQuery(xpath, Query.XPATH);
            QueryResult result = jcrQuery.execute();
            
            List<AIActionExecutionModel> executions = new ArrayList<>();
            NodeIterator nodes = result.getNodes();
            
            while (nodes.hasNext()) {
                Node node = nodes.nextNode();
                executions.add(createExecutionFromNode(node));
            }
            
            return executions;
            
        } catch (RepositoryException e) {
            LOG.error("Failed to get all executions", e);
            throw new Exception("Failed to get executions", e);
        }
    }

    private String getResourceType(String resourcePath) throws Exception {
        try {
            Node resourceNode = session.getNode(resourcePath);
            return resourceNode.getProperty("sling:resourceType").getString();
        } catch (Exception e) {
            return "unknown";
        }
    }
}