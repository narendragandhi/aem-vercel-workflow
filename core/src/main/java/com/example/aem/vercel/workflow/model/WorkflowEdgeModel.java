package com.example.aem.vercel.workflow.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

import javax.annotation.PostConstruct;
import java.util.Map;

@Model(
    adaptables = Resource.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class WorkflowEdgeModel {

    @ValueMapValue
    private String id;

    @ValueMapValue
    private String source;

    @ValueMapValue
    private String target;

    @ValueMapValue(name = "sourceHandle")
    private String sourceHandle;

    @ValueMapValue(name = "targetHandle")
    private String targetHandle;

    @ValueMapValue
    private String type;

    private Map<String, Object> data;

    @PostConstruct
    protected void init() {
        if (data == null) {
            data = new java.util.HashMap<>();
        }
    }

    @JsonCreator
    public WorkflowEdgeModel(
            @JsonProperty("id") String id,
            @JsonProperty("source") String source,
            @JsonProperty("target") String target) {
        this.id = id;
        this.source = source;
        this.target = target;
        this.data = new java.util.HashMap<>();
    }

    // Default constructor for Sling Models
    public WorkflowEdgeModel() {
        this.data = new java.util.HashMap<>();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public String getSourceHandle() {
        return sourceHandle;
    }

    public void setSourceHandle(String sourceHandle) {
        this.sourceHandle = sourceHandle;
    }

    public String getTargetHandle() {
        return targetHandle;
    }

    public void setTargetHandle(String targetHandle) {
        this.targetHandle = targetHandle;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }

    public void addData(String key, Object value) {
        this.data.put(key, value);
    }

    public Object getData(String key) {
        return this.data.get(key);
    }
}