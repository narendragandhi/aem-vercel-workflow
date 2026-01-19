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
import java.util.Map;

@Model(
    adaptables = Resource.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Data
@NoArgsConstructor
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

    public void addData(String key, Object value) {
        this.data.put(key, value);
    }

    public Object getData(String key) {
        return this.data.get(key);
    }
}