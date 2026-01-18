package com.example.aem.vercel.workflow.config;

import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;

/**
 * OSGi configuration for AEM Vercel Workflow services.
 */
@ObjectClassDefinition(
    name = "AEM Vercel Workflow Configuration",
    description = "Configuration settings for AEM Vercel Workflow Builder services"
)
public @interface WorkflowConfig {

    @AttributeDefinition(
        name = "Enable Workflow Cache",
        description = "Enable caching of workflow definitions for improved performance"
    )
    boolean enableCache() default true;

    @AttributeDefinition(
        name = "Max Cache Size",
        description = "Maximum number of workflows to keep in cache"
    )
    int maxCacheSize() default 1000;

    @AttributeDefinition(
        name = "Max Active Executions",
        description = "Maximum number of concurrent workflow executions"
    )
    int maxActiveExecutions() default 50;

    @AttributeDefinition(
        name = "Execution Timeout (minutes)",
        description = "Default timeout for workflow executions in minutes"
    )
    long executionTimeoutMinutes() default 60;

    @AttributeDefinition(
        name = "Enable Persistence",
        description = "Enable persistent storage of workflow executions"
    )
    boolean enablePersistence() default true;

    @AttributeDefinition(
        name = "Workflows Storage Path",
        description = "JCR path for storing workflow definitions"
    )
    String workflowsStoragePath() default "/var/workflows/definitions";

    @AttributeDefinition(
        name = "Executions Storage Path",
        description = "JCR path for storing workflow executions"
    )
    String executionsStoragePath() default "/var/workflows/executions";

    @AttributeDefinition(
        name = "Enable AEM Integration",
        description = "Enable integration with native AEM workflows"
    )
    boolean enableAEMIntegration() default true;

    @AttributeDefinition(
        name = "Default AEM Workflow Model",
        description = "Default AEM workflow model for integration"
    )
    String defaultAEMWorkflowModel() default "/var/workflow/models/dam/update_asset";

    @AttributeDefinition(
        name = "Enable Debug Logging",
        description = "Enable debug logging for workflow operations"
    )
    boolean enableDebugLogging() default false;

    @AttributeDefinition(
        name = "Cleanup Old Executions (days)",
        description = "Automatically cleanup executions older than specified days"
    )
    int cleanupOldExecutionsDays() default 30;

    @AttributeDefinition(
        name = "Enable CORS",
        description = "Enable Cross-Origin Resource Sharing for API endpoints"
    )
    boolean enableCors() default true;

    @AttributeDefinition(
        name = "Allowed Origins",
        description = "Comma-separated list of allowed CORS origins"
    )
    String allowedOrigins() default "*";

    @AttributeDefinition(
        name = "Enable Statistics",
        description = "Enable collection of workflow execution statistics"
    )
    boolean enableStatistics() default true;
}