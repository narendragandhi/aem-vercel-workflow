package com.example.aem.vercel.workflow.service;

import com.example.aem.vercel.workflow.model.AIActionModel;
import com.example.aem.vercel.workflow.model.AIActionExecutionModel;

import java.util.List;
import java.util.Map;

/**
 * Service interface for managing AI Actions in AEM.
 * Provides CRUD operations and execution capabilities similar to Contentful's AI framework.
 */
public interface AIActionService {

    /**
     * Create a new AI action
     */
    AIActionModel createAction(AIActionModel action) throws Exception;

    /**
     * Get AI action by ID
     */
    AIActionModel getAction(String actionId) throws Exception;

    /**
     * Update existing AI action
     */
    AIActionModel updateAction(String actionId, AIActionModel action) throws Exception;

    /**
     * Delete AI action
     */
    void deleteAction(String actionId) throws Exception;

    /**
     * List all AI actions
     */
    List<AIActionModel> listActions() throws Exception;

    /**
     * List AI actions by category
     */
    List<AIActionModel> listActionsByCategory(String category) throws Exception;

    /**
     * List AI actions by content type
     */
    List<AIActionModel> listActionsByContentType(String contentType) throws Exception;

    /**
     * List enabled AI actions
     */
    List<AIActionModel> listEnabledActions() throws Exception;

    /**
     * Search AI actions by text
     */
    List<AIActionModel> searchActions(String query) throws Exception;

    /**
     * Execute an AI action
     */
    AIActionExecutionModel executeAction(String actionId, Map<String, Object> input, String initiatedBy) throws Exception;

    /**
     * Execute AI action on a specific resource
     */
    AIActionExecutionModel executeActionOnResource(String actionId, String resourcePath, 
                                                   Map<String, Object> input, String initiatedBy) throws Exception;

    /**
     * Get execution by ID
     */
    AIActionExecutionModel getExecution(String executionId) throws Exception;

    /**
     * List executions for an action
     */
    List<AIActionExecutionModel> listExecutions(String actionId) throws Exception;

    /**
     * List executions for a resource
     */
    List<AIActionExecutionModel> listExecutionsForResource(String resourcePath) throws Exception;

    /**
     * List executions by user
     */
    List<AIActionExecutionModel> listExecutionsByUser(String userId) throws Exception;

    /**
     * Cancel running execution
     */
    boolean cancelExecution(String executionId) throws Exception;

    /**
     * Delete execution
     */
    void deleteExecution(String executionId) throws Exception;

    /**
     * Validate action configuration
     */
    boolean validateAction(AIActionModel action);

    /**
     * Test action with sample input
     */
    AIActionExecutionModel testAction(String actionId, Map<String, Object> input) throws Exception;

    /**
     * Clone an existing action
     */
    AIActionModel cloneAction(String actionId, String newName) throws Exception;

    /**
     * Import actions from configuration
     */
    List<AIActionModel> importActions(Map<String, Object> configuration) throws Exception;

    /**
     * Export actions to configuration
     */
    Map<String, Object> exportActions(String[] actionIds) throws Exception;

    /**
     * Get action usage statistics
     */
    Map<String, Object> getActionStatistics(String actionId) throws Exception;

    /**
     * Get system-wide AI usage statistics
     */
    Map<String, Object> getSystemStatistics() throws Exception;
}