package com.example.aem.vercel.workflow.service;

import com.example.aem.vercel.workflow.model.WorkflowDefinitionModel;
import com.example.aem.vercel.workflow.model.WorkflowExecutionModel;
import org.osgi.annotation.versioning.ProviderType;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for managing workflow definitions.
 * Provides CRUD operations for workflow definitions and validation.
 */
@ProviderType
public interface WorkflowDefinitionService {

    /**
     * Create a new workflow definition.
     *
     * @param workflow the workflow definition to create
     * @return the created workflow definition
     * @throws IllegalArgumentException if workflow is invalid
     */
    WorkflowDefinitionModel createWorkflow(WorkflowDefinitionModel workflow);

    /**
     * Update an existing workflow definition.
     *
     * @param id the workflow ID
     * @param workflow the updated workflow definition
     * @return the updated workflow definition
     * @throws IllegalArgumentException if workflow is not found or invalid
     */
    WorkflowDefinitionModel updateWorkflow(String id, WorkflowDefinitionModel workflow);

    /**
     * Get a workflow definition by ID.
     *
     * @param id the workflow ID
     * @return the workflow definition if found
     */
    Optional<WorkflowDefinitionModel> getWorkflow(String id);

    /**
     * Get all workflow definitions.
     *
     * @return list of all workflow definitions
     */
    List<WorkflowDefinitionModel> getAllWorkflows();

    /**
     * Delete a workflow definition.
     *
     * @param id the workflow ID
     * @return true if workflow was deleted, false if not found
     */
    boolean deleteWorkflow(String id);

    /**
     * Validate a workflow definition.
     *
     * @param workflow the workflow to validate
     * @return validation result with errors/warnings
     */
    WorkflowValidationResult validateWorkflow(WorkflowDefinitionModel workflow);

    /**
     * Duplicate an existing workflow.
     *
     * @param id the workflow ID to duplicate
     * @param newName the name for the duplicated workflow
     * @return the new workflow definition
     */
    WorkflowDefinitionModel duplicateWorkflow(String id, String newName);

    /**
     * Search workflows by name or description.
     *
     * @param query the search query
     * @return list of matching workflows
     */
    List<WorkflowDefinitionModel> searchWorkflows(String query);

    /**
     * Get workflows created by a specific user.
     *
     * @param createdBy the user ID
     * @return list of workflows created by the user
     */
    List<WorkflowDefinitionModel> getWorkflowsByCreator(String createdBy);

    /**
     * Check if a workflow name is available.
     *
     * @param name the workflow name
     * @return true if name is available, false if already in use
     */
    boolean isWorkflowNameAvailable(String name);

    /**
     * Get workflow execution history.
     *
     * @param workflowId the workflow ID
     * @return list of past executions
     */
    List<WorkflowExecutionModel> getWorkflowExecutionHistory(String workflowId);

    /**
     * Result class for workflow validation.
     */
    class WorkflowValidationResult {
        private final boolean valid;
        private final List<String> errors;
        private final List<String> warnings;

        public WorkflowValidationResult(boolean valid, List<String> errors, List<String> warnings) {
            this.valid = valid;
            this.errors = errors;
            this.warnings = warnings;
        }

        public boolean isValid() {
            return valid;
        }

        public List<String> getErrors() {
            return errors;
        }

        public List<String> getWarnings() {
            return warnings;
        }

        public static WorkflowValidationResult valid() {
            return new WorkflowValidationResult(true, List.of(), List.of());
        }

        public static WorkflowValidationResult invalid(List<String> errors, List<String> warnings) {
            return new WorkflowValidationResult(false, errors, warnings);
        }
    }
}