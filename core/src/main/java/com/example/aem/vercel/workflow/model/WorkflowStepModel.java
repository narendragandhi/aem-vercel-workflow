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

/**
 * Sling Model representing a single step in an AEMFlow workflow.
 *
 * <p>A workflow step is an individual unit of work within a workflow.
 * Steps can be of various types, each with different behavior:</p>
 *
 * <ul>
 *   <li><strong>startEnd</strong> - Workflow entry or exit point</li>
 *   <li><strong>aemStep</strong> - Human participant task with timeout</li>
 *   <li><strong>processStep</strong> - Automated process execution</li>
 *   <li><strong>branch</strong> - Decision point (XOR gateway)</li>
 *   <li><strong>emailNotification</strong> - Send email notification</li>
 *   <li><strong>damUpdate</strong> - DAM asset processing</li>
 *   <li><strong>damMetadata</strong> - Write metadata to assets</li>
 *   <li><strong>damTranscode</strong> - Media transcoding</li>
 *   <li><strong>formsProcess</strong> - Adaptive form handling</li>
 *   <li><strong>pageActivation</strong> - Publish/unpublish pages</li>
 *   <li><strong>participantChooser</strong> - Dynamic participant selection</li>
 *   <li><strong>graniteRouting</strong> - Dynamic routing</li>
 *   <li><strong>callWorkflow</strong> - Invoke another workflow</li>
 * </ul>
 *
 * <h2>Visual Properties</h2>
 * <p>Each step has position coordinates (positionX, positionY) used for
 * rendering in the visual workflow builder.</p>
 *
 * @author AEMFlow Team
 * @version 2.0.0
 * @since 1.0.0
 * @see WorkflowDefinitionModel
 * @see WorkflowPortModel
 */
@Model(
    adaptables = Resource.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Data
@NoArgsConstructor
public class WorkflowStepModel {

    /** Unique identifier for this step within the workflow. */
    @ValueMapValue
    private String id;

    /** Step type determining behavior and available configuration. */
    @ValueMapValue
    private String type;

    /** Human-readable title displayed in the workflow builder. */
    @ValueMapValue
    private String title;

    /** Detailed description of the step's purpose. */
    @ValueMapValue
    private String description;

    /** X-coordinate position in the visual editor (pixels). */
    @ValueMapValue(name = "positionX")
    private int positionX;

    /** Y-coordinate position in the visual editor (pixels). */
    @ValueMapValue(name = "positionY")
    private int positionY;

    /**
     * Type-specific configuration data.
     * Contents vary by step type (e.g., participant, timeout, handler).
     */
    private Map<String, Object> data;

    /** Input connection ports for incoming edges. */
    private List<WorkflowPortModel> inputs;

    /** Output connection ports for outgoing edges. */
    private List<WorkflowPortModel> outputs;

    /**
     * Initializes default collections after Sling Model adaptation.
     */
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

    /**
     * Creates a new workflow step with position and type.
     *
     * @param id        Unique step identifier
     * @param type      Step type (e.g., "aemStep", "processStep")
     * @param positionX X-coordinate in the visual editor
     * @param positionY Y-coordinate in the visual editor
     */
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

    /**
     * Adds an input port to this step.
     *
     * @param input The input port to add
     */
    public void addInput(WorkflowPortModel input) {
        this.inputs.add(input);
    }

    /**
     * Adds an output port to this step.
     *
     * @param output The output port to add
     */
    public void addOutput(WorkflowPortModel output) {
        this.outputs.add(output);
    }

    /**
     * Adds or updates a configuration data entry.
     *
     * @param key   Configuration key
     * @param value Configuration value
     */
    public void addData(String key, Object value) {
        this.data.put(key, value);
    }

    /**
     * Retrieves a configuration data entry.
     *
     * @param key Configuration key
     * @return The value, or null if not set
     */
    public Object getData(String key) {
        return this.data.get(key);
    }
}