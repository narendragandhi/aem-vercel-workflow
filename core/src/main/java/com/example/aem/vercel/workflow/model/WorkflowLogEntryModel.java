package com.example.aem.vercel.workflow.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(
    adaptables = Resource.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Data
@NoArgsConstructor
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