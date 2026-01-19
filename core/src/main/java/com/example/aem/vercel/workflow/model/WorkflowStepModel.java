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
public class WorkflowStepModel {

    @ValueMapValue
    private String id;

    @ValueMapValue
    private String type;

    @ValueMapValue
    private String title;

    @ValueMapValue
    private String description;

    @ValueMapValue(name = "positionX")
    private int positionX;

    @ValueMapValue(name = "positionY")
    private int positionY;

    private Map<String, Object> data;
    private List<WorkflowPortModel> inputs;
    private List<WorkflowPortModel> outputs;

    @PostConstruct
    protected void init() {
        if (data == null) {
            data = new HashMap<>();
        }
        if (inputs == null) {
            inputs = new ArrayList<>();
        }
        if (outputs == null) {
            outputs = new ArrayList<>();
        }
    }

    @JsonCreator
    public WorkflowStepModel(
            @JsonProperty("id") String id,
            @JsonProperty("type") String type,
            @JsonProperty("positionX") int positionX,
            @JsonProperty("positionY") int positionY) {
        this.id = id;
        this.type = type;
        this.positionX = positionX;
        this.positionY = positionY;
        this.data = new HashMap<>();
        this.inputs = new ArrayList<>();
        this.outputs = new ArrayList<>();
    }

    public void addInput(WorkflowPortModel input) {
        this.inputs.add(input);
    }

    public void addOutput(WorkflowPortModel output) {
        this.outputs.add(output);
    }

    public void addData(String key, Object value) {
        this.data.put(key, value);
    }

    public Object getData(String key) {
        return this.data.get(key);
    }
}