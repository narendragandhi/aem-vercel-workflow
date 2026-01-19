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

    // Utility methods
    public boolean isInput() {
        return "input".equals(type);
    }

    public boolean isOutput() {
        return "output".equals(type);
    }
}