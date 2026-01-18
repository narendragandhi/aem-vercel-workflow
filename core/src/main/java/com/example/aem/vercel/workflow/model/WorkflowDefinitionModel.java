package com.example.aem.vercel.workflow.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

import javax.annotation.PostConstruct;
import java.util.List;
import java.util.Map;

@Model(
    adaptables = Resource.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class WorkflowDefinitionModel {

    @ValueMapValue
    private String id;

    @ValueMapValue
    private String name;

    @ValueMapValue
    private String description;

    private List<WorkflowStepModel> steps;
    private List<WorkflowEdgeModel> edges;
    private Map<String, Object> variables;
    private String createdBy;
    private long createdAt;
    private long updatedAt;

    @PostConstruct
    protected void init() {
        if (variables == null) {
            variables = new java.util.HashMap<>();
        }
    }

    @JsonCreator
    public WorkflowDefinitionModel(
            @JsonProperty("id") String id,
            @JsonProperty("name") String name) {
        this.id = id;
        this.name = name;
        this.steps = new java.util.ArrayList<>();
        this.edges = new java.util.ArrayList<>();
        this.variables = new java.util.HashMap<>();
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = System.currentTimeMillis();
    }

    // Default constructor for Sling Models
    public WorkflowDefinitionModel() {
        this.steps = new java.util.ArrayList<>();
        this.edges = new java.util.ArrayList<>();
        this.variables = new java.util.HashMap<>();
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = System.currentTimeMillis();
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<WorkflowStepModel> getSteps() {
        return steps;
    }

    public void setSteps(List<WorkflowStepModel> steps) {
        this.steps = steps;
    }

    public List<WorkflowEdgeModel> getEdges() {
        return edges;
    }

    public void setEdges(List<WorkflowEdgeModel> edges) {
        this.edges = edges;
    }

    public Map<String, Object> getVariables() {
        return variables;
    }

    public void setVariables(Map<String, Object> variables) {
        this.variables = variables;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }

    public long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(long updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Utility methods
    public void addStep(WorkflowStepModel step) {
        this.steps.add(step);
        this.updatedAt = System.currentTimeMillis();
    }

    public void removeStep(String stepId) {
        this.steps.removeIf(step -> step.getId().equals(stepId));
        this.edges.removeIf(edge -> 
            edge.getSource().equals(stepId) || edge.getTarget().equals(stepId));
        this.updatedAt = System.currentTimeMillis();
    }

    public void addEdge(WorkflowEdgeModel edge) {
        this.edges.add(edge);
        this.updatedAt = System.currentTimeMillis();
    }

    public void removeEdge(String edgeId) {
        this.edges.removeIf(edge -> edge.getId().equals(edgeId));
        this.updatedAt = System.currentTimeMillis();
    }

    public WorkflowStepModel getStep(String stepId) {
        return this.steps.stream()
            .filter(step -> step.getId().equals(stepId))
            .findFirst()
            .orElse(null);
    }

    public WorkflowEdgeModel getEdge(String edgeId) {
        return this.edges.stream()
            .filter(edge -> edge.getId().equals(edgeId))
            .findFirst()
            .orElse(null);
    }

    public void setVariable(String key, Object value) {
        this.variables.put(key, value);
        this.updatedAt = System.currentTimeMillis();
    }

    public Object getVariable(String key) {
        return this.variables.get(key);
    }

    public void touch() {
        this.updatedAt = System.currentTimeMillis();
    }
}