package com.example.aem.vercel.workflow.model;

import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

/**
 * Unit tests for WorkflowStepModel.
 *
 * <p>Tests cover the step model functionality including:
 * <ul>
 *   <li>Constructor initialization</li>
 *   <li>Port management (inputs/outputs)</li>
 *   <li>Data management</li>
 *   <li>Position handling</li>
 * </ul>
 *
 * @author AEMFlow Team
 * @version 2.0.0
 */
public class WorkflowStepModelTest {

    private WorkflowStepModel step;

    /**
     * Sets up a fresh step model before each test.
     */
    @Before
    public void setUp() {
        step = new WorkflowStepModel("step-1", "aemStep", 100, 200);
    }

    // =====================================
    // Constructor Tests
    // =====================================

    /**
     * Tests that the constructor sets all fields correctly.
     */
    @Test
    public void testConstructorSetsAllFields() {
        assertEquals("step-1", step.getId());
        assertEquals("aemStep", step.getType());
        assertEquals(100, step.getPositionX());
        assertEquals(200, step.getPositionY());
    }

    /**
     * Tests that the constructor initializes empty collections.
     */
    @Test
    public void testConstructorInitializesCollections() {
        assertNotNull(step.getData());
        assertNotNull(step.getInputs());
        assertNotNull(step.getOutputs());
        assertTrue(step.getData().isEmpty());
        assertTrue(step.getInputs().isEmpty());
        assertTrue(step.getOutputs().isEmpty());
    }

    /**
     * Tests creating a step with different types.
     */
    @Test
    public void testDifferentStepTypes() {
        WorkflowStepModel branchStep = new WorkflowStepModel("branch-1", "branch", 0, 0);
        WorkflowStepModel processStep = new WorkflowStepModel("process-1", "processStep", 0, 0);
        WorkflowStepModel startStep = new WorkflowStepModel("start-1", "startEnd", 0, 0);

        assertEquals("branch", branchStep.getType());
        assertEquals("processStep", processStep.getType());
        assertEquals("startEnd", startStep.getType());
    }

    // =====================================
    // Input Port Tests
    // =====================================

    /**
     * Tests adding an input port.
     */
    @Test
    public void testAddInput() {
        WorkflowPortModel input = createTestPort("input-1", "input");
        step.addInput(input);

        assertEquals(1, step.getInputs().size());
        assertEquals("input-1", step.getInputs().get(0).getId());
    }

    /**
     * Tests adding multiple input ports.
     */
    @Test
    public void testAddMultipleInputs() {
        step.addInput(createTestPort("input-1", "input"));
        step.addInput(createTestPort("input-2", "input"));
        step.addInput(createTestPort("input-3", "input"));

        assertEquals(3, step.getInputs().size());
    }

    // =====================================
    // Output Port Tests
    // =====================================

    /**
     * Tests adding an output port.
     */
    @Test
    public void testAddOutput() {
        WorkflowPortModel output = createTestPort("output-1", "output");
        step.addOutput(output);

        assertEquals(1, step.getOutputs().size());
        assertEquals("output-1", step.getOutputs().get(0).getId());
    }

    /**
     * Tests adding multiple output ports.
     */
    @Test
    public void testAddMultipleOutputs() {
        step.addOutput(createTestPort("output-1", "output"));
        step.addOutput(createTestPort("output-2", "output"));

        assertEquals(2, step.getOutputs().size());
    }

    /**
     * Tests a step with both inputs and outputs.
     */
    @Test
    public void testStepWithBothInputsAndOutputs() {
        step.addInput(createTestPort("input-1", "input"));
        step.addOutput(createTestPort("output-1", "output"));
        step.addOutput(createTestPort("output-yes", "output"));
        step.addOutput(createTestPort("output-no", "output"));

        assertEquals(1, step.getInputs().size());
        assertEquals(3, step.getOutputs().size());
    }

    // =====================================
    // Data Management Tests
    // =====================================

    /**
     * Tests adding and retrieving data.
     */
    @Test
    public void testAddAndGetData() {
        step.addData("participant", "content-authors");

        assertEquals("content-authors", step.getData("participant"));
    }

    /**
     * Tests adding multiple data entries.
     */
    @Test
    public void testAddMultipleDataEntries() {
        step.addData("participant", "content-authors");
        step.addData("timeout", 48);
        step.addData("required", true);

        assertEquals("content-authors", step.getData("participant"));
        assertEquals(48, step.getData("timeout"));
        assertEquals(true, step.getData("required"));
    }

    /**
     * Tests overwriting existing data.
     */
    @Test
    public void testOverwriteData() {
        step.addData("key", "oldValue");
        step.addData("key", "newValue");

        assertEquals("newValue", step.getData("key"));
    }

    /**
     * Tests getting non-existent data returns null.
     */
    @Test
    public void testGetNonExistentDataReturnsNull() {
        assertNull(step.getData("nonExistent"));
    }

    /**
     * Tests adding complex data types.
     */
    @Test
    public void testAddComplexData() {
        step.addData("config", new String[]{"option1", "option2"});

        Object config = step.getData("config");
        assertTrue(config instanceof String[]);
        assertEquals(2, ((String[]) config).length);
    }

    // =====================================
    // Position Tests
    // =====================================

    /**
     * Tests setting position.
     */
    @Test
    public void testSetPosition() {
        step.setPositionX(300);
        step.setPositionY(400);

        assertEquals(300, step.getPositionX());
        assertEquals(400, step.getPositionY());
    }

    /**
     * Tests negative positions are allowed.
     */
    @Test
    public void testNegativePositions() {
        step.setPositionX(-100);
        step.setPositionY(-50);

        assertEquals(-100, step.getPositionX());
        assertEquals(-50, step.getPositionY());
    }

    // =====================================
    // Title and Description Tests
    // =====================================

    /**
     * Tests setting title.
     */
    @Test
    public void testSetTitle() {
        step.setTitle("Review Content");
        assertEquals("Review Content", step.getTitle());
    }

    /**
     * Tests setting description.
     */
    @Test
    public void testSetDescription() {
        step.setDescription("This step reviews content for approval");
        assertEquals("This step reviews content for approval", step.getDescription());
    }

    // =====================================
    // Step Type-Specific Tests
    // =====================================

    /**
     * Tests creating a branch step with yes/no outputs.
     */
    @Test
    public void testBranchStepWithDecisionOutputs() {
        WorkflowStepModel branchStep = new WorkflowStepModel("decision-1", "branch", 0, 0);
        branchStep.setTitle("Approved?");

        WorkflowPortModel yesPort = createTestPort("yes", "output");
        yesPort.setName("Yes");
        branchStep.addOutput(yesPort);

        WorkflowPortModel noPort = createTestPort("no", "output");
        noPort.setName("No");
        branchStep.addOutput(noPort);

        assertEquals(2, branchStep.getOutputs().size());
        assertEquals("Yes", branchStep.getOutputs().get(0).getName());
        assertEquals("No", branchStep.getOutputs().get(1).getName());
    }

    /**
     * Tests creating a participant step with timeout.
     */
    @Test
    public void testParticipantStepWithTimeout() {
        WorkflowStepModel participantStep = new WorkflowStepModel("review-1", "aemStep", 100, 100);
        participantStep.setTitle("Manager Approval");
        participantStep.addData("participant", "managers");
        participantStep.addData("timeout", 72);
        participantStep.addData("timeoutAction", "reject");

        assertEquals("managers", participantStep.getData("participant"));
        assertEquals(72, participantStep.getData("timeout"));
        assertEquals("reject", participantStep.getData("timeoutAction"));
    }

    /**
     * Tests creating a process step with handler.
     */
    @Test
    public void testProcessStepWithHandler() {
        WorkflowStepModel processStep = new WorkflowStepModel("process-1", "processStep", 0, 0);
        processStep.setTitle("Send Notification");
        processStep.addData("handler", "com.example.NotificationProcess");
        processStep.addData("autoAdvance", true);

        assertEquals("com.example.NotificationProcess", processStep.getData("handler"));
        assertEquals(true, processStep.getData("autoAdvance"));
    }

    // =====================================
    // Helper Methods
    // =====================================

    /**
     * Creates a test port with the given ID and type.
     */
    private WorkflowPortModel createTestPort(String id, String type) {
        WorkflowPortModel port = new WorkflowPortModel();
        port.setId(id);
        port.setType(type);
        return port;
    }
}
