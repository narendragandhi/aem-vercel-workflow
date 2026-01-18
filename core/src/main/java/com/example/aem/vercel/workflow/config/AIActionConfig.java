package com.example.aem.vercel.workflow.config;

import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.AttributeType;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;

/**
 * OSGi configuration for AI Actions service.
 * Provides comprehensive configuration options for AI providers, models, and behavior.
 */
@ObjectClassDefinition(
    name = "AEM AI Actions Configuration",
    description = "Configuration for AI Actions service including providers, models, and system settings"
)
public @interface AIActionConfig {

    @AttributeDefinition(
        name = "Enabled",
        description = "Enable or disable AI Actions service",
        type = AttributeType.BOOLEAN
    )
    boolean enabled() default true;

    @AttributeDefinition(
        name = "Default AI Provider",
        description = "Default AI provider to use for actions",
        type = AttributeType.STRING
    )
    String defaultProvider() default "openai";

    @AttributeDefinition(
        name = "Default Model",
        description = "Default model to use for content generation",
        type = AttributeType.STRING
    )
    String defaultModel() default "gpt-3.5-turbo";

    @AttributeDefinition(
        name = "Max Execution Time",
        description = "Maximum execution time for AI actions in seconds",
        type = AttributeType.INTEGER
    )
    int maxExecutionTime() default 300;

    @AttributeDefinition(
        name = "Max Concurrent Executions",
        description = "Maximum number of concurrent AI action executions",
        type = AttributeType.INTEGER
    )
    int maxConcurrentExecutions() default 10;

    @AttributeDefinition(
        name = "Actions Storage Path",
        description = "JCR path for storing AI action definitions",
        type = AttributeType.STRING
    )
    String actionsStoragePath() default "/var/ai-actions";

    @AttributeDefinition(
        name = "Executions Storage Path",
        description = "JCR path for storing AI action executions",
        type = AttributeType.STRING
    )
    String executionsStoragePath() default "/var/ai-executions";

    @AttributeDefinition(
        name = "Cache Enabled",
        description = "Enable caching of AI action results",
        type = AttributeType.BOOLEAN
    )
    boolean cacheEnabled() default true;

    @AttributeDefinition(
        name = "Cache Size",
        description = "Maximum number of cached results",
        type = AttributeType.INTEGER
    )
    int cacheSize() default 1000;

    @AttributeDefinition(
        name = "Cache TTL",
        description = "Cache time-to-live in minutes",
        type = AttributeType.INTEGER
    )
    int cacheTtl() default 60;

    @AttributeDefinition(
        name = "OpenAI API Key",
        description = "OpenAI API key for content generation",
        type = AttributeType.STRING
    )
    String openaiApiKey() default "";

    @AttributeDefinition(
        name = "OpenAI Base URL",
        description = "OpenAI API base URL (for custom endpoints)",
        type = AttributeType.STRING
    )
    String openaiBaseUrl() default "https://api.openai.com/v1";

    @AttributeDefinition(
        name = "Anthropic API Key",
        description = "Anthropic API key for Claude models",
        type = AttributeType.STRING
    )
    String anthropicApiKey() default "";

    @AttributeDefinition(
        name = "Anthropic Base URL",
        description = "Anthropic API base URL",
        type = AttributeType.STRING
    )
    String anthropicBaseUrl() default "https://api.anthropic.com";

    @AttributeDefinition(
        name = "Google AI API Key",
        description = "Google AI API key for Gemini models",
        type = AttributeType.STRING
    )
    String googleAiApiKey() default "";

    @AttributeDefinition(
        name = "Google AI Base URL",
        description = "Google AI API base URL",
        type = AttributeType.STRING
    )
    String googleAiBaseUrl() default "https://generativelanguage.googleapis.com";

    @AttributeDefinition(
        name = "Ollama Base URL",
        description = "Ollama API base URL for local models",
        type = AttributeType.STRING
    )
    String ollamaBaseUrl() default "http://localhost:11434";

    @AttributeDefinition(
        name = "Custom Provider URL",
        description = "Custom AI provider endpoint URL",
        type = AttributeType.STRING
    )
    String customProviderUrl() default "";

    @AttributeDefinition(
        name = "Custom Provider API Key",
        description = "API key for custom provider",
        type = AttributeType.STRING
    )
    String customProviderApiKey() default "";

    @AttributeDefinition(
        name = "Request Timeout",
        description = "Request timeout in milliseconds",
        type = AttributeType.INTEGER
    )
    int requestTimeout() default 30000;

    @AttributeDefinition(
        name = "Retry Attempts",
        description = "Number of retry attempts for failed requests",
        type = AttributeType.INTEGER
    )
    int retryAttempts() default 3;

    @AttributeDefinition(
        name = "Retry Delay",
        description = "Delay between retries in milliseconds",
        type = AttributeType.INTEGER
    )
    int retryDelay() default 1000;

    @AttributeDefinition(
        name = "Enable Usage Tracking",
        description = "Track AI usage statistics",
        type = AttributeType.BOOLEAN
    )
    boolean enableUsageTracking() default true;

    @AttributeDefinition(
        name = "Enable Cost Tracking",
        description = "Track AI costs and budgets",
        type = AttributeType.BOOLEAN
    )
    boolean enableCostTracking() default true;

    @AttributeDefinition(
        name = "Daily Budget Limit",
        description = "Daily budget limit in USD",
        type = AttributeType.DOUBLE
    )
    double dailyBudgetLimit() default 100.0;

    @AttributeDefinition(
        name = "Monthly Budget Limit",
        description = "Monthly budget limit in USD",
        type = AttributeType.DOUBLE
    )
    double monthlyBudgetLimit() default 1000.0;

    @AttributeDefinition(
        name = "Enable Content Moderation",
        description = "Enable content moderation and safety checks",
        type = AttributeType.BOOLEAN
    )
    boolean enableContentModeration() default true;

    @AttributeDefinition(
        name = "Allowed User Groups",
        description = "User groups allowed to use AI actions",
        type = AttributeType.STRING
    )
    String[] allowedUserGroups() default {"administrators", "content-authors", "ai-users"};

    @AttributeDefinition(
        name = "Blocked User Groups",
        description = "User groups blocked from using AI actions",
        type = AttributeType.STRING
    )
    String[] blockedUserGroups() default {};

    @AttributeDefinition(
        name = "Enable Audit Logging",
        description = "Log all AI action executions for audit",
        type = AttributeType.BOOLEAN
    )
    boolean enableAuditLogging() default true;

    @AttributeDefinition(
        name = "Audit Log Path",
        description = "JCR path for audit logs",
        type = AttributeType.STRING
    )
    String auditLogPath() default "/var/audit/ai-actions";

    @AttributeDefinition(
        name = "Retention Period",
        description = "Retention period for execution logs in days",
        type = AttributeType.INTEGER
    )
    int retentionPeriod() default 90;

    @AttributeDefinition(
        name = "Enable Brand Guidelines",
        description = "Enforce brand guidelines in AI-generated content",
        type = AttributeType.BOOLEAN
    )
    boolean enableBrandGuidelines() default true;

    @AttributeDefinition(
        name = "Brand Guidelines Path",
        description = "JCR path containing brand guidelines configuration",
        type = AttributeType.STRING
    )
    String brandGuidelinesPath() default "/content/brand-guidelines";

    @AttributeDefinition(
        name = "Default Temperature",
        description = "Default creativity/temperature for AI generation",
        type = AttributeType.DOUBLE
    )
    double defaultTemperature() default 0.7;

    @AttributeDefinition(
        name = "Default Max Tokens",
        description = "Default maximum tokens for AI responses",
        type = AttributeType.INTEGER
    )
    int defaultMaxTokens() default 1000;

    @AttributeDefinition(
        name = "Default Top P",
        description = "Default top_p for AI generation",
        type = AttributeType.DOUBLE
    )
    double defaultTopP() default 1.0;

    @AttributeDefinition(
        name = "Default Frequency Penalty",
        description = "Default frequency penalty for AI generation",
        type = AttributeType.DOUBLE
    )
    double defaultFrequencyPenalty() default 0.0;

    @AttributeDefinition(
        name = "Default Presence Penalty",
        description = "Default presence penalty for AI generation",
        type = AttributeType.DOUBLE
    )
    double defaultPresencePenalty() default 0.0;

    @AttributeDefinition(
        name = "Enable Preview Mode",
        description = "Enable preview mode for testing AI actions",
        type = AttributeType.BOOLEAN
    )
    boolean enablePreviewMode() default true;

    @AttributeDefinition(
        name = "Enable Batch Processing",
        description = "Enable batch processing of AI actions",
        type = AttributeType.BOOLEAN
    )
    boolean enableBatchProcessing() default true;

    @AttributeDefinition(
        name = "Max Batch Size",
        description = "Maximum batch size for processing",
        type = AttributeType.INTEGER
    )
    int maxBatchSize() default 50;

    @AttributeDefinition(
        name = "Enable Webhook Notifications",
        description = "Send webhook notifications for AI action events",
        type = AttributeType.BOOLEAN
    )
    boolean enableWebhookNotifications() default false;

    @AttributeDefinition(
        name = "Webhook URL",
        description = "Webhook URL for notifications",
        type = AttributeType.STRING
    )
    String webhookUrl() default "";

    @AttributeDefinition(
        name = "Webhook Events",
        description = "Events to trigger webhooks for",
        type = AttributeType.STRING
    )
    String[] webhookEvents() default {"action.created", "action.executed", "action.failed", "action.completed"};

    @AttributeDefinition(
        name = "Enable Custom Prompts",
        description = "Allow users to define custom prompts",
        type = AttributeType.BOOLEAN
    )
    boolean enableCustomPrompts() default true;

    @AttributeDefinition(
        name = "Enable Action Templates",
        description = "Enable action templates for quick setup",
        type = AttributeType.BOOLEAN
    )
    boolean enableActionTemplates() default true;

    @AttributeDefinition(
        name = "Action Templates Path",
        description = "JCR path for action templates",
        type = AttributeType.STRING
    )
    String actionTemplatesPath() default "/var/ai-action-templates";

    @AttributeDefinition(
        name = "Enable API Rate Limiting",
        description = "Enable API rate limiting",
        type = AttributeType.BOOLEAN
    )
    boolean enableApiRateLimiting() default true;

    @AttributeDefinition(
        name = "API Rate Limit",
        description = "Maximum requests per minute",
        type = AttributeType.INTEGER
    )
    int apiRateLimit() default 60;

    @AttributeDefinition(
        name = "Enable Context Injection",
        description = "Inject context from AEM into AI prompts",
        type = AttributeType.BOOLEAN
    )
    boolean enableContextInjection() default true;

    @AttributeDefinition(
        name = "Context Sources",
        description = "Context sources to inject into prompts",
        type = AttributeType.STRING
    )
    String[] contextSources() default {"page-properties", "component-data", "user-profile", "brand-guidelines"};

    @AttributeDefinition(
        name = "Enable Result Caching",
        description = "Cache AI results for similar inputs",
        type = AttributeType.BOOLEAN
    )
    boolean enableResultCaching() default true;

    @AttributeDefinition(
        name = "Result Cache Similarity Threshold",
        description = "Similarity threshold for result caching",
        type = AttributeType.DOUBLE
    )
    double resultCacheSimilarityThreshold() default 0.8;
}