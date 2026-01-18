package com.example.aem.vercel.workflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Default;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

import javax.annotation.PostConstruct;
import java.util.Date;
import java.util.Map;

/**
 * AI Action execution model for tracking AI action runs and results.
 * Provides audit trail similar to Contentful's AI execution logs.
 */
@Model(
    adaptables = Resource.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AIActionExecutionModel {

    @ValueMapValue
    @Default(values = "")
    private String id;

    @ValueMapValue
    @Default(values = "")
    private String actionId;

    @ValueMapValue
    @Default(values = "")
    private String actionName;

    @ValueMapValue
    @Default(values = "")
    private String actionType;

    @ValueMapValue
    private Status status;

    @ValueMapValue
    private Date startedAt;

    @ValueMapValue
    private Date completedAt;

    @ValueMapValue
    @Default(values = "0")
    private long duration; // Changed to long

    @ValueMapValue
    @Default(values = "")
    private String initiatedBy;

    @ValueMapValue
    @Default(values = "")
    private String resourcePath;

    @ValueMapValue
    private Map<String, Object> input;

    @ValueMapValue
    private Map<String, Object> output;

    @ValueMapValue
    private Map<String, Object> metadata;

    @ValueMapValue
    private Map<String, Object> configuration;

    @ValueMapValue
    @Default(values = "")
    private String aiProvider;

    @ValueMapValue
    @Default(values = "")
    private String model;

    @ValueMapValue
    private Map<String, Object> usage;

    @ValueMapValue
    @Default(values = "")
    private String errorMessage;

    @ValueMapValue
    private String[] tags;

    // Runtime properties
    private boolean isCompleted;
    private boolean hasError;
    private long actualDuration;

    @PostConstruct
    protected void init() {
        calculateDuration();
        determineStatus();
    }

    /**
     * Execution statuses
     */
    public enum Status {
        PENDING("pending"),
        RUNNING("running"),
        COMPLETED("completed"),
        FAILED("failed"),
        CANCELLED("cancelled"),
        TIMEOUT("timeout");

        private final String value;

        Status(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        @Override
        public String toString() {
            return this.getValue();
        }
    }

    /**
     * Common tags for classification
     */
    public interface Tags {
        String CONTENT_GENERATION = "content-generation";
        String TRANSLATION = "translation";
        String OPTIMIZATION = "optimization";
        String BATCH_PROCESS = "batch";
        String INTERACTIVE = "interactive";
        String SCHEDULED = "scheduled";
        String MANUAL = "manual";
        String AUTOMATED = "automated";
    }

    private void calculateDuration() {
        this.isCompleted = completedAt != null;
        this.hasError = Status.FAILED.equals(status) || Status.TIMEOUT.equals(status);

        if (startedAt != null && completedAt != null) {
            this.actualDuration = completedAt.getTime() - startedAt.getTime();
        }
    }

    private void determineStatus() {
        if (status == null) {
            if (completedAt != null) {
                status = hasError ? Status.FAILED : Status.COMPLETED;
            } else if (startedAt != null) {
                status = Status.RUNNING;
            } else {
                status = Status.PENDING;
            }
        }
    }

    /**
     * Check if execution completed successfully
     */
    public boolean isSuccessful() {
        return Status.COMPLETED.equals(status) && !hasError;
    }

    /**
     * Get execution duration in human readable format
     */
    public String getFormattedDuration() {
        if (actualDuration == 0) {
            return String.valueOf(duration);
        }

        long ms = actualDuration;
        if (ms < 1000) {
            return ms + "ms";
        } else if (ms < 60000) {
            return (ms / 1000) + "s";
        } else {
            return (ms / 60000) + "m " + ((ms % 60000) / 1000) + "s";
        }
    }

    /**
     * Get token usage if available
     */
    public TokenUsage getTokenUsage() {
        if (usage == null) {
            return new TokenUsage();
        }

        return new TokenUsage(
            ((Number) usage.getOrDefault("promptTokens", 0)).intValue(),
            ((Number) usage.getOrDefault("completionTokens", 0)).intValue(),
            ((Number) usage.getOrDefault("totalTokens", 0)).intValue()
        );
    }

    /**
     * Token usage inner class
     */
    public static class TokenUsage {
        private final int promptTokens;
        private final int completionTokens;
        private final int totalTokens;

        public TokenUsage() {
            this(0, 0, 0);
        }

        public TokenUsage(int promptTokens, int completionTokens, int totalTokens) {
            this.promptTokens = promptTokens;
            this.completionTokens = completionTokens;
            this.totalTokens = totalTokens;
        }

        public int getPromptTokens() { return promptTokens; }
        public int getCompletionTokens() { return completionTokens; }
        public int getTotalTokens() { return totalTokens; }
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getActionId() { return actionId; }
    public void setActionId(String actionId) { this.actionId = actionId; }

    public String getActionName() { return actionName; }
    public void setActionName(String actionName) { this.actionName = actionName; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Date getStartedAt() { return startedAt; }
    public void setStartedAt(Date startedAt) { this.startedAt = startedAt; }

    public Date getCompletedAt() { return completedAt; }
    public void setCompletedAt(Date completedAt) { this.completedAt = completedAt; }

    public long getDuration() { return duration; }
    public void setDuration(long duration) { this.duration = duration; }

    public String getInitiatedBy() { return initiatedBy; }
    public void setInitiatedBy(String initiatedBy) { this.initiatedBy = initiatedBy; }

    public String getResourcePath() { return resourcePath; }
    public void setResourcePath(String resourcePath) { this.resourcePath = resourcePath; }

    public Map<String, Object> getInput() { return input; }
    public void setInput(Map<String, Object> input) { this.input = input; }

    public Map<String, Object> getOutput() { return output; }
    public void setOutput(Map<String, Object> output) { this.output = output; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

    public Map<String, Object> getConfiguration() { return configuration; }
    public void setConfiguration(Map<String, Object> configuration) { this.configuration = configuration; }

    public String getAiProvider() { return aiProvider; }
    public void setAiProvider(String aiProvider) { this.aiProvider = aiProvider; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Map<String, Object> getUsage() { return usage; }
    public void setUsage(Map<String, Object> usage) { this.usage = usage; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public String[] getTags() { return tags; }
    public void setTags(String[] tags) { this.tags = tags; }

    public boolean isCompleted() { return isCompleted; }
    public boolean hasError() { return hasError; }
    public long getActualDuration() { return actualDuration; }
}