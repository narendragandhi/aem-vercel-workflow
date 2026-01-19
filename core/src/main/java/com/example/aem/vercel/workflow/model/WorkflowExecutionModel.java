package com.example.aem.vercel.workflow.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Model(
    adaptables = Resource.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Data
@NoArgsConstructor
public class WorkflowExecutionModel {

    @ValueMapValue
    private String id;

    @ValueMapValue(name = "workflowId")
    private String workflowId;

    @ValueMapValue
    private String status;

    @ValueMapValue(name = "startTime")
    private long startTime;

    @ValueMapValue(name = "endTime")
    private long endTime;

    @ValueMapValue(name = "currentStep")
    private String currentStep;

    private List<WorkflowLogEntryModel> logs;
    private Map<String, Object> variables;

    @PostConstruct
    protected void init() {
        if (logs == null) {
            logs = new ArrayList<>();
        }
        if (variables == null) {
            variables = new HashMap<>();
        }
    }

    @JsonCreator
    public WorkflowExecutionModel(
            @JsonProperty("id") String id,
            @JsonProperty("workflowId") String workflowId) {
        this.id = id;
        this.workflowId = workflowId;
        this.status = "running";
        this.startTime = System.currentTimeMillis();
        this.logs = new ArrayList<>();
        this.variables = new HashMap<>();
    }

    // Utility methods
    public void addLog(WorkflowLogEntryModel log) {
        this.logs.add(log);
    }

    public void addLog(String level, String message) {
        this.addLog(level, message, null);
    }

    public void addLog(String level, String message, String stepId) {
        WorkflowLogEntryModel log = new WorkflowLogEntryModel();
        log.setTimestamp(System.currentTimeMillis());
        log.setLevel(level);
        log.setMessage(message);
        log.setStepId(stepId);
        this.logs.add(log);
    }

    public void setVariable(String key, Object value) {
        this.variables.put(key, value);
    }

    public Object getVariable(String key) {
        return this.variables.get(key);
    }

    public boolean isRunning() {
        return "running".equals(status);
    }

    public boolean isCompleted() {
        return "completed".equals(status);
    }

    public boolean isFailed() {
        return "failed".equals(status);
    }

    public boolean isPaused() {
        return "paused".equals(status);
    }

    public void complete() {
        this.status = "completed";
        this.endTime = System.currentTimeMillis();
        this.currentStep = null;
    }

    public void fail(String errorMessage) {
        this.status = "failed";
        this.endTime = System.currentTimeMillis();
        this.addLog("ERROR", errorMessage);
    }

    public void pause() {
        this.status = "paused";
    }

    public void resume() {
        this.status = "running";
    }



    public long getDuration() {
        if (endTime > 0) {
            return endTime - startTime;
        }
        return System.currentTimeMillis() - startTime;
    }
}