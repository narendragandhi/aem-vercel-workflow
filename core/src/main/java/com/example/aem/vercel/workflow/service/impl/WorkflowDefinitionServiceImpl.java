package com.example.aem.vercel.workflow.service.impl;

import com.example.aem.vercel.workflow.model.WorkflowDefinitionModel;
import com.example.aem.vercel.workflow.model.WorkflowStepModel;
import com.example.aem.vercel.workflow.model.WorkflowEdgeModel;
import com.example.aem.vercel.workflow.model.WorkflowExecutionModel;
import com.example.aem.vercel.workflow.model.WorkflowPortModel;
import com.example.aem.vercel.workflow.repository.WorkflowDefinitionRepository;
import com.example.aem.vercel.workflow.service.WorkflowDefinitionService;
import com.example.aem.vercel.workflow.config.WorkflowConfig;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.metatype.annotations.Designate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * OSGi service implementation for managing workflow definitions.
 *
 * <p>This service provides CRUD operations for workflow definitions via a
 * pluggable repository, with caching support for improved read performance.</p>
 *
 * <h2>Features</h2>
 * <ul>
 *   <li>Create, read, update, and delete workflow definitions</li>
 *   <li>In-memory caching with configurable enable/disable</li>
 *   <li>Workflow validation with detailed error reporting</li>
 *   <li>Workflow duplication with unique ID generation</li>
 *   <li>Search by name, description, or creator</li>
 *   <li>Input sanitization to prevent path traversal attacks</li>
 * </ul>
 *
 * <h2>Configuration</h2>
 * <p>The service is configured via {@link WorkflowConfig} OSGi configuration:</p>
 * <ul>
 *   <li>{@code enableCache} - Enable/disable in-memory caching</li>
 * </ul>
 *
 * <h2>Security</h2>
 * <p>All workflow IDs are sanitized to prevent path traversal attacks.</p>
 *
 * @author AEMFlow Team
 * @version 2.0.0
 * @since 1.0.0
 * @see WorkflowDefinitionService
 * @see WorkflowDefinitionModel
 */
@Component(
    service = WorkflowDefinitionService.class,
    immediate = true
)
@Designate(ocd = WorkflowConfig.class)
public class WorkflowDefinitionServiceImpl implements WorkflowDefinitionService {

    /** Logger for this service. */
    private static final Logger LOG = LoggerFactory.getLogger(WorkflowDefinitionServiceImpl.class);

    /** Thread-safe cache for workflow definitions. */
    private final Map<String, WorkflowDefinitionModel> cache = new ConcurrentHashMap<>();

    @Reference
    private WorkflowDefinitionRepository workflowRepository;

    /** OSGi configuration for this service. */
    private WorkflowConfig config;

    @Activate
    protected void activate(WorkflowConfig config) {
        this.config = config;
        LOG.info("WorkflowDefinitionService activated with cache enabled: {}", config.enableCache());
    }

    @Override
    public WorkflowDefinitionModel createWorkflow(WorkflowDefinitionModel workflow) {
        if (workflow == null) {
            throw new IllegalArgumentException("Workflow cannot be null");
        }
        
        WorkflowValidationResult validation = validateWorkflow(workflow);
        if (!validation.isValid()) {
            throw new IllegalArgumentException("Invalid workflow: " + String.join(", ", validation.getErrors()));
        }

        // Generate ID if not provided
        if (workflow.getId() == null || workflow.getId().isEmpty()) {
            workflow.setId("workflow-" + UUID.randomUUID().toString());
        }

        // Set timestamps
        workflow.setCreatedAt(System.currentTimeMillis());
        workflow.setUpdatedAt(System.currentTimeMillis());

        WorkflowDefinitionModel created = workflowRepository.create(workflow);

        if (config.enableCache()) {
            cache.put(created.getId(), created);
        }

        LOG.info("Created workflow: {}", created.getId());
        return created;
    }

    @Override
    public WorkflowDefinitionModel updateWorkflow(String id, WorkflowDefinitionModel workflow) {
        String sanitizedId = sanitizeId(id);
        if (sanitizedId == null || sanitizedId.isEmpty()) {
            throw new IllegalArgumentException("Workflow ID cannot be null");
        }
        
        Optional<WorkflowDefinitionModel> existing = getWorkflow(sanitizedId);
        if (existing.isEmpty()) {
            throw new IllegalArgumentException("Workflow not found: " + sanitizedId);
        }

        WorkflowDefinitionModel existingWorkflow = existing.get();
        workflow.setId(sanitizedId);
        workflow.setCreatedAt(existingWorkflow.getCreatedAt());
        workflow.setUpdatedAt(System.currentTimeMillis());

        WorkflowValidationResult validation = validateWorkflow(workflow);
        if (!validation.isValid()) {
            throw new IllegalArgumentException("Invalid workflow: " + String.join(", ", validation.getErrors()));
        }

        WorkflowDefinitionModel updated = workflowRepository.update(sanitizedId, workflow);

        if (config.enableCache()) {
            cache.put(sanitizedId, updated);
        }

        LOG.info("Updated workflow: {}", sanitizedId);
        return updated;
    }

    @Override
    public Optional<WorkflowDefinitionModel> getWorkflow(String id) {
        String sanitizedId = sanitizeId(id);
        if (sanitizedId == null || sanitizedId.isEmpty()) {
            return Optional.empty();
        }

        // Check cache first
        if (config.enableCache()) {
            WorkflowDefinitionModel cached = cache.get(sanitizedId);
            if (cached != null) {
                return Optional.of(cached);
            }
        }

        Optional<WorkflowDefinitionModel> workflow = workflowRepository.get(sanitizedId);
        workflow.ifPresent(item -> {
            if (config.enableCache()) {
                cache.put(sanitizedId, item);
            }
        });
        return workflow;
    }

    @Override
    public List<WorkflowDefinitionModel> getAllWorkflows() {
        List<WorkflowDefinitionModel> workflows = new ArrayList<>();
        
        for (WorkflowDefinitionModel workflow : workflowRepository.list()) {
            workflows.add(workflow);
            if (config.enableCache()) {
                cache.put(workflow.getId(), workflow);
            }
        }

        return workflows;
    }

    @Override
    public boolean deleteWorkflow(String id) {
        String sanitizedId = sanitizeId(id);
        if (sanitizedId == null || sanitizedId.isEmpty()) {
            return false;
        }

        boolean deleted = workflowRepository.delete(sanitizedId);
        if (deleted && config.enableCache()) {
            cache.remove(sanitizedId);
        }
        if (deleted) {
            LOG.info("Deleted workflow: {}", sanitizedId);
        }
        return deleted;
    }

    @Override
    public WorkflowValidationResult validateWorkflow(WorkflowDefinitionModel workflow) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        if (workflow.getName() == null || workflow.getName().trim().isEmpty()) {
            errors.add("Workflow name is required");
        }

        if (workflow.getSteps() == null || workflow.getSteps().isEmpty()) {
            errors.add("Workflow must have at least one step");
        } else {
            // Validate steps
            Set<String> stepIds = new HashSet<>();
            for (var step : workflow.getSteps()) {
                if (step.getId() == null || step.getId().trim().isEmpty()) {
                    errors.add("Step ID is required");
                } else if (!stepIds.add(step.getId())) {
                    errors.add("Duplicate step ID: " + step.getId());
                }

                if (step.getType() == null || step.getType().trim().isEmpty()) {
                    errors.add("Step type is required for step: " + step.getId());
                }
            }

            // Validate edges
            if (workflow.getEdges() != null) {
                for (var edge : workflow.getEdges()) {
                    if (edge.getSource() == null || edge.getSource().trim().isEmpty()) {
                        errors.add("Edge source is required");
                    } else if (!stepIds.contains(edge.getSource())) {
                        errors.add("Edge source not found: " + edge.getSource());
                    }

                    if (edge.getTarget() == null || edge.getTarget().trim().isEmpty()) {
                        errors.add("Edge target is required");
                    } else if (!stepIds.contains(edge.getTarget())) {
                        errors.add("Edge target not found: " + edge.getTarget());
                    }
                }
            }

            // Check for start and end nodes
            boolean hasStart = stepIds.stream().anyMatch(id -> id.equals("start"));
            boolean hasEnd = stepIds.stream().anyMatch(id -> id.equals("end"));
            
            if (!hasStart) {
                warnings.add("Workflow should have a start node");
            }
            if (!hasEnd) {
                warnings.add("Workflow should have an end node");
            }
        }

        boolean valid = errors.isEmpty();
        return new WorkflowValidationResult(valid, errors, warnings);
    }

    @Override
    public WorkflowDefinitionModel duplicateWorkflow(String id, String newName) {
        Optional<WorkflowDefinitionModel> original = getWorkflow(id);
        if (original.isEmpty()) {
            throw new IllegalArgumentException("Workflow not found: " + id);
        }

        WorkflowDefinitionModel copy = cloneWorkflow(original.get());
        copy.setId("workflow-" + UUID.randomUUID().toString());
        copy.setName(newName);
        copy.setCreatedAt(System.currentTimeMillis());
        copy.setUpdatedAt(System.currentTimeMillis());

        return createWorkflow(copy);
    }

    @Override
    public List<WorkflowDefinitionModel> searchWorkflows(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllWorkflows();
        }

        String lowerQuery = query.toLowerCase();
        return getAllWorkflows().stream()
            .filter(workflow -> 
                (workflow.getName() != null && workflow.getName().toLowerCase().contains(lowerQuery)) ||
                (workflow.getDescription() != null && workflow.getDescription().toLowerCase().contains(lowerQuery)))
            .toList();
    }

    @Override
    public List<WorkflowDefinitionModel> getWorkflowsByCreator(String createdBy) {
        if (createdBy == null || createdBy.trim().isEmpty()) {
            return Collections.emptyList();
        }

        return getAllWorkflows().stream()
            .filter(workflow -> createdBy.equals(workflow.getCreatedBy()))
            .toList();
    }

    @Override
    public boolean isWorkflowNameAvailable(String name) {
        if (name == null || name.trim().isEmpty()) {
            return false;
        }

        return getAllWorkflows().stream()
            .noneMatch(workflow -> name.equals(workflow.getName()));
    }

    @Override
    public List<WorkflowExecutionModel> getWorkflowExecutionHistory(String workflowId) {
        // This would be implemented by delegating to WorkflowExecutionService
        return Collections.emptyList();
    }

    private WorkflowDefinitionModel cloneWorkflow(WorkflowDefinitionModel original) {
        WorkflowDefinitionModel clone = new WorkflowDefinitionModel();
        clone.setName(original.getName());
        clone.setDescription(original.getDescription());
        clone.setCreatedBy(original.getCreatedBy());
        
        // Clone steps
        for (WorkflowStepModel step : original.getSteps()) {
            WorkflowStepModel stepClone = new WorkflowStepModel();
            stepClone.setId(step.getId());
            stepClone.setType(step.getType());
            stepClone.setTitle(step.getTitle());
            stepClone.setDescription(step.getDescription());
            stepClone.setPositionX(step.getPositionX());
            stepClone.setPositionY(step.getPositionY());
            stepClone.setData(new HashMap<>(step.getData()));

            // Clone inputs
            if (step.getInputs() != null) {
                for (WorkflowPortModel input : step.getInputs()) {
                    WorkflowPortModel inputClone = new WorkflowPortModel();
                    inputClone.setId(input.getId());
                    inputClone.setName(input.getName());
                    inputClone.setType(input.getType());
                    inputClone.setDataType(input.getDataType());
                    inputClone.setRequired(input.isRequired());
                    stepClone.addInput(inputClone);
                }
            }

            // Clone outputs
            if (step.getOutputs() != null) {
                for (WorkflowPortModel output : step.getOutputs()) {
                    WorkflowPortModel outputClone = new WorkflowPortModel();
                    outputClone.setId(output.getId());
                    outputClone.setName(output.getName());
                    outputClone.setType(output.getType());
                    outputClone.setDataType(output.getDataType());
                    outputClone.setRequired(output.isRequired());
                    stepClone.addOutput(outputClone);
                }
            }
            clone.addStep(stepClone);
        }

        // Clone edges
        for (WorkflowEdgeModel edge : original.getEdges()) {
            WorkflowEdgeModel edgeClone = new WorkflowEdgeModel();
            edgeClone.setId(edge.getId());
            edgeClone.setSource(edge.getSource());
            edgeClone.setTarget(edge.getTarget());
            edgeClone.setSourceHandle(edge.getSourceHandle());
            edgeClone.setTargetHandle(edge.getTargetHandle());
            edgeClone.setType(edge.getType());
            edgeClone.setData(new HashMap<>(edge.getData()));
            clone.addEdge(edgeClone);
        }

        // Clone variables
        clone.setVariables(new HashMap<>(original.getVariables()));

        return clone;
    }

    private String sanitizeId(String id) {
        if (id == null) return null;
        // Only allow alphanumeric, hyphen, underscore to prevent path traversal
        return id.replaceAll("[^a-zA-Z0-9-_]", "");
    }

}
