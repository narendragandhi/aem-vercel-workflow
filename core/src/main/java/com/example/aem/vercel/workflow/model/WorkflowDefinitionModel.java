package com.example.aem.vercel.workflow.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

import javax.annotation.PostConstruct;
import java.util.List;
import java.util.Map;

/**
 * Sling Model representing a workflow definition in AEMFlow.
 *
 * <p>This model encapsulates all the data necessary to define a workflow,
 * including its steps, edges (transitions), and runtime variables. It can
 * be adapted from a JCR Resource or instantiated directly via JSON.</p>
 *
 * <h2>Usage</h2>
 * <pre>{@code
 * // Adapt from resource
 * WorkflowDefinitionModel workflow = resource.adaptTo(WorkflowDefinitionModel.class);
 *
 * // Create programmatically
 * WorkflowDefinitionModel workflow = new WorkflowDefinitionModel("wf-001", "Content Approval");
 * workflow.addStep(new WorkflowStepModel("step1", "Review Content"));
 * }</pre>
 *
 * <h2>Persistence</h2>
 * <p>Workflow definitions are stored in JCR under
 * {@code /content/aemflow/workflows/{id}}. The model supports both
 * reading from and writing to the repository.</p>
 *
 * @author AEMFlow Team
 * @version 2.0.0
 * @since 1.0.0
 * @see WorkflowStepModel
 * @see WorkflowEdgeModel
 */
@Model(
    adaptables = Resource.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Getter
@Setter
@NoArgsConstructor
public class WorkflowDefinitionModel {

    /**
     * Unique identifier for this workflow definition.
     * Generated automatically if not provided.
     */
    @ValueMapValue
    private String id;

    /**
     * Human-readable name of the workflow.
     * Displayed in the workflow builder UI and AEM console.
     */
    @ValueMapValue
    private String name;

    /**
     * Detailed description of the workflow's purpose.
     * Used in documentation generation and tooltips.
     */
    @ValueMapValue
    private String description;

    /**
     * Ordered list of workflow steps.
     * Steps define the individual actions in the workflow.
     */
    private List<WorkflowStepModel> steps;

    /**
     * List of edges connecting workflow steps.
     * Edges define the flow and transitions between steps.
     */
    private List<WorkflowEdgeModel> edges;

    /**
     * Runtime variables available during workflow execution.
     * Can be set by steps and read by subsequent steps.
     */
    private Map<String, Object> variables;

    /**
     * User ID of the workflow creator.
     */
    private String createdBy;

    /**
     * Unix timestamp when the workflow was created.
     */
    private long createdAt;

    /**
     * Unix timestamp of the last modification.
     * Updated automatically when steps, edges, or variables change.
     */
    private long updatedAt;

    /**
     * Initializes default values after Sling Model adaptation.
     * Ensures variables map is never null.
     */
    @PostConstruct
    protected void init() {
        if (variables == null) {
            variables = new java.util.HashMap<>();
        }
    }

    /**
     * Creates a new workflow definition with the given ID and name.
     *
     * <p>This constructor is used for JSON deserialization and
     * programmatic creation of workflow definitions.</p>
     *
     * @param id   Unique identifier for the workflow
     * @param name Human-readable name
     */
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

    // =====================================
    // Step Management Methods
    // =====================================

    /**
     * Adds a step to the workflow.
     *
     * @param step The step to add
     * @throws NullPointerException if step is null
     */
    public void addStep(WorkflowStepModel step) {
        this.steps.add(step);
        this.updatedAt = System.currentTimeMillis();
    }

    /**
     * Removes a step and all associated edges from the workflow.
     *
     * <p>This method also removes any edges that reference the
     * removed step as either source or target.</p>
     *
     * @param stepId ID of the step to remove
     */
    public void removeStep(String stepId) {
        this.steps.removeIf(step -> step.getId().equals(stepId));
        this.edges.removeIf(edge ->
            edge.getSource().equals(stepId) || edge.getTarget().equals(stepId));
        this.updatedAt = System.currentTimeMillis();
    }

    /**
     * Retrieves a step by its ID.
     *
     * @param stepId The step ID to search for
     * @return The matching step, or null if not found
     */
    public WorkflowStepModel getStep(String stepId) {
        return this.steps.stream()
            .filter(step -> step.getId().equals(stepId))
            .findFirst()
            .orElse(null);
    }

    // =====================================
    // Edge Management Methods
    // =====================================

    /**
     * Adds an edge (transition) to the workflow.
     *
     * @param edge The edge to add
     * @throws NullPointerException if edge is null
     */
    public void addEdge(WorkflowEdgeModel edge) {
        this.edges.add(edge);
        this.updatedAt = System.currentTimeMillis();
    }

    /**
     * Removes an edge from the workflow.
     *
     * @param edgeId ID of the edge to remove
     */
    public void removeEdge(String edgeId) {
        this.edges.removeIf(edge -> edge.getId().equals(edgeId));
        this.updatedAt = System.currentTimeMillis();
    }

    /**
     * Retrieves an edge by its ID.
     *
     * @param edgeId The edge ID to search for
     * @return The matching edge, or null if not found
     */
    public WorkflowEdgeModel getEdge(String edgeId) {
        return this.edges.stream()
            .filter(edge -> edge.getId().equals(edgeId))
            .findFirst()
            .orElse(null);
    }

    // =====================================
    // Variable Management Methods
    // =====================================

    /**
     * Sets a runtime variable value.
     *
     * <p>Variables are available during workflow execution and can
     * be used to pass data between steps.</p>
     *
     * @param key   Variable name
     * @param value Variable value (must be serializable)
     */
    public void setVariable(String key, Object value) {
        this.variables.put(key, value);
        this.updatedAt = System.currentTimeMillis();
    }

    /**
     * Retrieves a runtime variable value.
     *
     * @param key Variable name
     * @return The variable value, or null if not set
     */
    public Object getVariable(String key) {
        return this.variables.get(key);
    }

    /**
     * Updates the modification timestamp without changing any data.
     *
     * <p>Useful for marking the workflow as "touched" for cache
     * invalidation or audit purposes.</p>
     */
    public void touch() {
        this.updatedAt = System.currentTimeMillis();
    }
}