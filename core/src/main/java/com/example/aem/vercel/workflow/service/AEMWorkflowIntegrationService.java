package com.example.aem.vercel.workflow.service;

import com.example.aem.vercel.workflow.model.WorkflowDefinitionModel;
import org.osgi.annotation.versioning.ProviderType;
import java.util.List;

/**
 * Service interface for AEM workflow integration.
 * Provides bridge between Vercel workflow and native AEM workflows.
 */
@ProviderType
public interface AEMWorkflowIntegrationService {

    /**
     * Convert Vercel workflow to AEM workflow model.
     *
     * @param vercelWorkflow the Vercel workflow definition
     * @return the corresponding AEM workflow model (placeholder for now)
     */
    String convertToAEMWorkflow(WorkflowDefinitionModel vercelWorkflow);

    /**
     * Start AEM workflow from Vercel workflow definition.
     *
     * @param vercelWorkflow the Vercel workflow to start
     * @return the workflow instance ID
     */
    String startAEMWorkflow(WorkflowDefinitionModel vercelWorkflow);

    /**
     * Get status of AEM workflow instance.
     *
     * @param workflowInstanceId the workflow instance ID
     * @return the workflow status
     */
    String getAEMWorkflowStatus(String workflowInstanceId);

    /**
     * Terminate AEM workflow instance.
     *
     * @param workflowInstanceId the workflow instance ID
     * @return true if terminated successfully
     */
    boolean terminateAEMWorkflow(String workflowInstanceId);

    /**
     * Validate Vercel workflow for AEM compatibility.
     *
     * @param vercelWorkflow the Vercel workflow to validate
     * @return validation result with compatibility information
     */
    AEMCompatibilityValidationResult validateForAEMCompatibility(WorkflowDefinitionModel vercelWorkflow);

    /**
     * Result of AEM compatibility validation.
     */
    class AEMCompatibilityValidationResult {
        private boolean isValid;
        private List<String> errors;
        private List<String> warnings;
        private List<String> recommendations;

        public AEMCompatibilityValidationResult(boolean isValid, List<String> errors, 
                                          List<String> warnings, List<String> recommendations) {
            this.isValid = isValid;
            this.errors = errors;
            this.warnings = warnings;
            this.recommendations = recommendations;
        }

        public boolean isValid() { return isValid; }
        public List<String> getErrors() { return errors; }
        public List<String> getWarnings() { return warnings; }
        public List<String> getRecommendations() { return recommendations; }
    }
}