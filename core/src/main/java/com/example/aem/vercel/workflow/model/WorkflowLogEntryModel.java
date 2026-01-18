package com.example.aem.vercel.workflow.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(
    adaptables = Resource.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class WorkflowLogEntryModel {

    @ValueMapValue
    private long timestamp;

    @ValueMapValue
    private String level;

    @ValueMapValue
    private String message;

    @ValueMapValue(name = "stepId")
    private String stepId;

    @ValueMapValue
    private String data;

    @JsonCreator
    public WorkflowLogEntryModel(
            @JsonProperty("timestamp") long timestamp,
            @JsonProperty("level") String level,
            @JsonProperty("message") String message) {
        this.timestamp = timestamp;
        this.level = level;
        this.message = message;
    }

    // Default constructor for Sling Models
    public WorkflowLogEntryModel() {
        this.timestamp = System.currentTimeMillis();
    }

    // Getters and Setters
    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStepId() {
        return stepId;
    }

    public void setStepId(String stepId) {
        this.stepId = stepId;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    // Utility methods
    public boolean isInfo() {
        return "INFO".equals(level);
    }

    public boolean isWarning() {
        return "WARN".equals(level);
    }

    public boolean isError() {
        return "ERROR".equals(level);
    }

    public boolean isDebug() {
        return "DEBUG".equals(level);
    }
}