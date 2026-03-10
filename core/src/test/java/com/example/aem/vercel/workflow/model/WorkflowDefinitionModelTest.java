package com.example.aem.vercel.workflow.model;

import org.junit.Before;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.*;

/**
 * Unit tests for WorkflowDefinitionModel.
 *
 * <p>Tests cover the core functionality of workflow definitions including:
 * <ul>
 *   <li>Step management (add, remove, get)</li>
 *   <li>Edge management (add, remove, get)</li>
 *   <li>Variable management</li>
 *   <li>Timestamp tracking</li>
 * </ul>
 *
 * @author AEMFlow Team
 * @version 2.0.0
 */
public class WorkflowDefinitionModelTest {

    private WorkflowDefinitionModel workflow;

    /**
     * Sets up a fresh workflow definition before each test.
     */
    @Before
    public void setUp() {
        workflow = new WorkflowDefinitionModel("test-workflow", "Test Workflow");
    }

    // =====================================
    // Constructor Tests
    // =====================================

    /**
     * Tests that the JSON constructor initializes all fields correctly.
     */
    @Test
    public void testConstructorSetsIdAndName() {
        assertEquals("test-workflow", workflow.getId());
        assertEquals("Test Workflow", workflow.getName());
    }

    /**
     * Tests that the constructor initializes empty collections.
     */
    @Test
    public void testConstructorInitializesCollections() {
        assertNotNull(workflow.getSteps());
        assertNotNull(workflow.getEdges());
        assertNotNull(workflow.getVariables());
        assertTrue(workflow.getSteps().isEmpty());
        assertTrue(workflow.getEdges().isEmpty());
        assertTrue(workflow.getVariables().isEmpty());
    }

    /**
     * Tests that timestamps are set on creation.
     */
    @Test
    public void testConstructorSetsTimestamps() {
        assertTrue(workflow.getCreatedAt() > 0);
        assertTrue(workflow.getUpdatedAt() > 0);
        assertEquals(workflow.getCreatedAt(), workflow.getUpdatedAt());
    }

    // =====================================
    // Step Management Tests
    // =====================================

    /**
     * Tests adding a step to the workflow.
     */
    @Test
    public void testAddStep() {
        WorkflowStepModel step = createTestStep("step-1");
        long beforeUpdate = workflow.getUpdatedAt();

        // Small delay to ensure timestamp changes
        try { Thread.sleep(10); } catch (InterruptedException e) {}

        workflow.addStep(step);

        assertEquals(1, workflow.getSteps().size());
        assertEquals("step-1", workflow.getSteps().get(0).getId());
        assertTrue(workflow.getUpdatedAt() > beforeUpdate);
    }

    /**
     * Tests adding multiple steps.
     */
    @Test
    public void testAddMultipleSteps() {
        workflow.addStep(createTestStep("step-1"));
        workflow.addStep(createTestStep("step-2"));
        workflow.addStep(createTestStep("step-3"));

        assertEquals(3, workflow.getSteps().size());
    }

    /**
     * Tests removing a step by ID.
     */
    @Test
    public void testRemoveStep() {
        workflow.addStep(createTestStep("step-1"));
        workflow.addStep(createTestStep("step-2"));

        workflow.removeStep("step-1");

        assertEquals(1, workflow.getSteps().size());
        assertEquals("step-2", workflow.getSteps().get(0).getId());
    }

    /**
     * Tests that removing a step also removes associated edges.
     */
    @Test
    public void testRemoveStepRemovesEdges() {
        workflow.addStep(createTestStep("step-1"));
        workflow.addStep(createTestStep("step-2"));

        WorkflowEdgeModel edge = createTestEdge("e1", "step-1", "step-2");
        workflow.addEdge(edge);

        workflow.removeStep("step-1");

        assertTrue(workflow.getEdges().isEmpty());
    }

    /**
     * Tests getting a step by ID.
     */
    @Test
    public void testGetStep() {
        WorkflowStepModel step = createTestStep("step-1");
        step.setTitle("Test Step");
        workflow.addStep(step);

        WorkflowStepModel retrieved = workflow.getStep("step-1");

        assertNotNull(retrieved);
        assertEquals("step-1", retrieved.getId());
        assertEquals("Test Step", retrieved.getTitle());
    }

    /**
     * Tests getting a non-existent step returns null.
     */
    @Test
    public void testGetStepReturnsNullForNonExistent() {
        WorkflowStepModel retrieved = workflow.getStep("non-existent");
        assertNull(retrieved);
    }

    // =====================================
    // Edge Management Tests
    // =====================================

    /**
     * Tests adding an edge to the workflow.
     */
    @Test
    public void testAddEdge() {
        WorkflowEdgeModel edge = createTestEdge("e1", "step-1", "step-2");
        long beforeUpdate = workflow.getUpdatedAt();

        try { Thread.sleep(10); } catch (InterruptedException e) {}

        workflow.addEdge(edge);

        assertEquals(1, workflow.getEdges().size());
        assertEquals("e1", workflow.getEdges().get(0).getId());
        assertTrue(workflow.getUpdatedAt() > beforeUpdate);
    }

    /**
     * Tests removing an edge by ID.
     */
    @Test
    public void testRemoveEdge() {
        workflow.addEdge(createTestEdge("e1", "step-1", "step-2"));
        workflow.addEdge(createTestEdge("e2", "step-2", "step-3"));

        workflow.removeEdge("e1");

        assertEquals(1, workflow.getEdges().size());
        assertEquals("e2", workflow.getEdges().get(0).getId());
    }

    /**
     * Tests getting an edge by ID.
     */
    @Test
    public void testGetEdge() {
        WorkflowEdgeModel edge = createTestEdge("e1", "step-1", "step-2");
        workflow.addEdge(edge);

        WorkflowEdgeModel retrieved = workflow.getEdge("e1");

        assertNotNull(retrieved);
        assertEquals("step-1", retrieved.getSource());
        assertEquals("step-2", retrieved.getTarget());
    }

    /**
     * Tests getting a non-existent edge returns null.
     */
    @Test
    public void testGetEdgeReturnsNullForNonExistent() {
        WorkflowEdgeModel retrieved = workflow.getEdge("non-existent");
        assertNull(retrieved);
    }

    // =====================================
    // Variable Management Tests
    // =====================================

    /**
     * Tests setting and getting a variable.
     */
    @Test
    public void testSetAndGetVariable() {
        workflow.setVariable("testKey", "testValue");

        assertEquals("testValue", workflow.getVariable("testKey"));
    }

    /**
     * Tests setting multiple variables.
     */
    @Test
    public void testSetMultipleVariables() {
        workflow.setVariable("string", "value");
        workflow.setVariable("number", 42);
        workflow.setVariable("boolean", true);

        assertEquals("value", workflow.getVariable("string"));
        assertEquals(42, workflow.getVariable("number"));
        assertEquals(true, workflow.getVariable("boolean"));
    }

    /**
     * Tests overwriting a variable.
     */
    @Test
    public void testOverwriteVariable() {
        workflow.setVariable("key", "oldValue");
        workflow.setVariable("key", "newValue");

        assertEquals("newValue", workflow.getVariable("key"));
    }

    /**
     * Tests getting a non-existent variable returns null.
     */
    @Test
    public void testGetNonExistentVariable() {
        assertNull(workflow.getVariable("nonExistent"));
    }

    /**
     * Tests that setting a variable updates the timestamp.
     */
    @Test
    public void testSetVariableUpdatesTimestamp() {
        long beforeUpdate = workflow.getUpdatedAt();

        try { Thread.sleep(10); } catch (InterruptedException e) {}

        workflow.setVariable("key", "value");

        assertTrue(workflow.getUpdatedAt() > beforeUpdate);
    }

    // =====================================
    // Touch Method Tests
    // =====================================

    /**
     * Tests that touch() updates the timestamp.
     */
    @Test
    public void testTouchUpdatesTimestamp() {
        long beforeTouch = workflow.getUpdatedAt();

        try { Thread.sleep(10); } catch (InterruptedException e) {}

        workflow.touch();

        assertTrue(workflow.getUpdatedAt() > beforeTouch);
    }

    // =====================================
    // Setter Tests
    // =====================================

    /**
     * Tests setting the description.
     */
    @Test
    public void testSetDescription() {
        workflow.setDescription("Test description");
        assertEquals("Test description", workflow.getDescription());
    }

    /**
     * Tests setting the creator.
     */
    @Test
    public void testSetCreatedBy() {
        workflow.setCreatedBy("admin");
        assertEquals("admin", workflow.getCreatedBy());
    }

    // =====================================
    // Helper Methods
    // =====================================

    /**
     * Creates a test step with the given ID.
     */
    private WorkflowStepModel createTestStep(String id) {
        return new WorkflowStepModel(id, "aemStep", 0, 0);
    }

    /**
     * Creates a test edge with the given parameters.
     */
    private WorkflowEdgeModel createTestEdge(String id, String source, String target) {
        WorkflowEdgeModel edge = new WorkflowEdgeModel();
        edge.setId(id);
        edge.setSource(source);
        edge.setTarget(target);
        return edge;
    }
}
