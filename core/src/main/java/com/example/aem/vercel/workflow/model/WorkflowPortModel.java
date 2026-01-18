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
public class WorkflowPortModel {

    @ValueMapValue
    private String id;

    @ValueMapValue
    private String name;

    @ValueMapValue
    private String type;

    @ValueMapValue(name = "dataType")
    private String dataType;

    @ValueMapValue
    private boolean required;

    @JsonCreator
    public WorkflowPortModel(
            @JsonProperty("id") String id,
            @JsonProperty("name") String name,
            @JsonProperty("type") String type,
            @JsonProperty("dataType") String dataType) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.dataType = dataType;
        this.required = false;
    }

    // Default constructor for Sling Models
    public WorkflowPortModel() {
        this.required = false;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public boolean isRequired() {
        return required;
    }

    public void setRequired(boolean required) {
        this.required = required;
    }

    // Utility methods
    public boolean isInput() {
        return "input".equals(type);
    }

    public boolean isOutput() {
        return "output".equals(type);
    }
}