package com.example.aem.vercel.workflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;
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
 * Provides audit trail similar to Contentful's AI Actions framework.
 */
@Model(
    adaptables = Resource.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@NoArgsConstructor
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
            }
            else {
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
}