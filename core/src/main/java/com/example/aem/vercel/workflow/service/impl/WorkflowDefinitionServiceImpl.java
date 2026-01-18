package com.example.aem.vercel.workflow.service.impl;

import com.example.aem.vercel.workflow.model.WorkflowDefinitionModel;
import com.example.aem.vercel.workflow.model.WorkflowStepModel;
import com.example.aem.vercel.workflow.model.WorkflowEdgeModel;
import com.example.aem.vercel.workflow.model.WorkflowExecutionModel;
import com.example.aem.vercel.workflow.service.WorkflowDefinitionService;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import com.example.aem.vercel.workflow.config.WorkflowConfig;
import org.apache.sling.api.resource.ResourceResolverFactory;
import org.apache.sling.api.resource.ValueMap;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.metatype.annotations.Designate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementation of WorkflowDefinitionService.
 * Stores workflow definitions in JCR under /var/workflows/definitions
 */
@Component(
    service = WorkflowDefinitionService.class,
    immediate = true
)
@Designate(ocd = WorkflowConfig.class)
public class WorkflowDefinitionServiceImpl implements WorkflowDefinitionService {

    private static final Logger LOG = LoggerFactory.getLogger(WorkflowDefinitionServiceImpl.class);
    
    private static final String WORKFLOWS_PATH = "/var/workflows/definitions";
    private static final String NODE_TYPE = "nt:unstructured";
    private static final String WORKFLOW_NODE_TYPE = "vercel:workflow";
    
    private final Map<String, WorkflowDefinitionModel> cache = new ConcurrentHashMap<>();

    @Reference
    private ResourceResolverFactory resourceResolverFactory;

    private WorkflowConfig config;

    @Activate
    protected void activate(WorkflowConfig config) {
        this.config = config;
        initializeWorkflowsPath();
        LOG.info("WorkflowDefinitionService activated with cache enabled: {}", config.enableCache());
    }

    private void initializeWorkflowsPath() {
        try (ResourceResolver resolver = resourceResolverFactory.getServiceResourceResolver(null)) {
            Session session = resolver.adaptTo(Session.class);
            if (!session.nodeExists(WORKFLOWS_PATH)) {
                Node workflowsNode = session.getRootNode().addNode(WORKFLOWS_PATH.substring(1), NODE_TYPE);
                session.save();
                LOG.info("Created workflows path: {}", WORKFLOWS_PATH);
            }
        } catch (org.apache.sling.api.resource.LoginException e) {
            LOG.error("Failed to obtain resource resolver: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to obtain resource resolver", e);
        } catch (Exception e) {
            LOG.error("Failed to initialize workflows path", e);
        }
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

        try (ResourceResolver resolver = resourceResolverFactory.getServiceResourceResolver(null)) {
            Session session = resolver.adaptTo(Session.class);
            Node workflowsNode = session.getNode(WORKFLOWS_PATH);
            
            Node workflowNode = workflowsNode.addNode(workflow.getId(), WORKFLOW_NODE_TYPE);
            saveWorkflowToNode(workflowNode, workflow);
            session.save();

            if (config.enableCache()) {
                cache.put(workflow.getId(), workflow);
            }

            LOG.info("Created workflow: {}", workflow.getId());
            return workflow;
            
        } catch (org.apache.sling.api.resource.LoginException e) {
            LOG.error("Failed to obtain resource resolver to create workflow", e);
            throw new RuntimeException("Failed to obtain resource resolver", e);
        } catch (RepositoryException e) {
            LOG.error("Failed to create workflow", e);
            throw new RuntimeException("Failed to create workflow", e);
        }
    }

    @Override
    public WorkflowDefinitionModel updateWorkflow(String id, WorkflowDefinitionModel workflow) {
        if (id == null || id.isEmpty()) {
            throw new IllegalArgumentException("Workflow ID cannot be null");
        }
        
        Optional<WorkflowDefinitionModel> existing = getWorkflow(id);
        if (existing.isEmpty()) {
            throw new IllegalArgumentException("Workflow not found: " + id);
        }

        WorkflowDefinitionModel existingWorkflow = existing.get();
        workflow.setId(id);
        workflow.setCreatedAt(existingWorkflow.getCreatedAt());
        workflow.setUpdatedAt(System.currentTimeMillis());

        WorkflowValidationResult validation = validateWorkflow(workflow);
        if (!validation.isValid()) {
            throw new IllegalArgumentException("Invalid workflow: " + String.join(", ", validation.getErrors()));
        }

        try (ResourceResolver resolver = resourceResolverFactory.getServiceResourceResolver(null)) {
            Session session = resolver.adaptTo(Session.class);
            Node workflowNode = session.getNode(WORKFLOWS_PATH + "/" + id);
            saveWorkflowToNode(workflowNode, workflow);
            session.save();

            if (config.enableCache()) {
                cache.put(id, workflow);
            }

            LOG.info("Updated workflow: {}", id);
            return workflow;
            
        } catch (org.apache.sling.api.resource.LoginException e) {
            LOG.error("Failed to obtain resource resolver to update workflow: {}", id, e);
            throw new RuntimeException("Failed to obtain resource resolver", e);
        } catch (RepositoryException e) {
            LOG.error("Failed to update workflow: {}", id, e);
            throw new RuntimeException("Failed to update workflow", e);
        }
    }

    @Override
    public Optional<WorkflowDefinitionModel> getWorkflow(String id) {
        if (id == null || id.isEmpty()) {
            return Optional.empty();
        }

        // Check cache first
        if (config.enableCache()) {
            WorkflowDefinitionModel cached = cache.get(id);
            if (cached != null) {
                return Optional.of(cached);
            }
        }

        try (ResourceResolver resolver = resourceResolverFactory.getServiceResourceResolver(null)) {
            String path = WORKFLOWS_PATH + "/" + id;
            Resource resource = resolver.getResource(path);
            
            if (resource != null) {
                WorkflowDefinitionModel workflow = loadWorkflowFromResource(resource);
                if (workflow != null && config.enableCache()) {
                    cache.put(id, workflow);
                }
                return Optional.of(workflow);
            }
        } catch (org.apache.sling.api.resource.LoginException e) {
            LOG.error("Failed to obtain resource resolver to get workflow: {}", id, e);
            return Optional.empty(); // Treat login failure as workflow not found for this method
        } catch (Exception e) {
            LOG.error("Failed to get workflow: {}", id, e);
        }

        return Optional.empty();
    }

    @Override
    public List<WorkflowDefinitionModel> getAllWorkflows() {
        List<WorkflowDefinitionModel> workflows = new ArrayList<>();
        
        try (ResourceResolver resolver = resourceResolverFactory.getServiceResourceResolver(null)) {
            Resource workflowsResource = resolver.getResource(WORKFLOWS_PATH);
            if (workflowsResource != null) {
                for (Resource child : workflowsResource.getChildren()) {
                    WorkflowDefinitionModel workflow = loadWorkflowFromResource(child);
                    if (workflow != null) {
                        workflows.add(workflow);
                        if (config.enableCache()) {
                            cache.put(workflow.getId(), workflow);
                        }
                    }
                }
            }
        } catch (org.apache.sling.api.resource.LoginException e) {
            LOG.error("Failed to obtain resource resolver to get all workflows", e);
            return Collections.emptyList(); // Return empty list on login failure
        } catch (Exception e) {
            LOG.error("Failed to get all workflows", e);
        }

        return workflows;
    }

    @Override
    public boolean deleteWorkflow(String id) {
        if (id == null || id.isEmpty()) {
            return false;
        }

        try (ResourceResolver resolver = resourceResolverFactory.getServiceResourceResolver(null)) {
            Session session = resolver.adaptTo(Session.class);
            String path = WORKFLOWS_PATH + "/" + id;
            
            if (session.nodeExists(path)) {
                session.getNode(path).remove();
                session.save();
                
                if (config.enableCache()) {
                    cache.remove(id);
                }
                
                LOG.info("Deleted workflow: {}", id);
                return true;
            }
        } catch (org.apache.sling.api.resource.LoginException e) {
            LOG.error("Failed to obtain resource resolver to delete workflow: {}", id, e);
            return false; // Return false on login failure
        } catch (RepositoryException e) {
            LOG.error("Failed to delete workflow: {}", id, e);
        }

        return false;
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

    private void saveWorkflowToNode(Node node, WorkflowDefinitionModel workflow) throws RepositoryException {
        node.setProperty("name", workflow.getName());
        node.setProperty("description", workflow.getDescription());
        node.setProperty("createdBy", workflow.getCreatedBy());
        node.setProperty("createdAt", workflow.getCreatedAt());
        node.setProperty("updatedAt", workflow.getUpdatedAt());

        // Save steps
        Node stepsNode = node.hasNode("steps") ? node.getNode("steps") : node.addNode("steps", NODE_TYPE);
        for (var step : workflow.getSteps()) {
            Node stepNode = stepsNode.addNode(step.getId(), NODE_TYPE);
            stepNode.setProperty("type", step.getType());
            stepNode.setProperty("title", step.getTitle());
            stepNode.setProperty("description", step.getDescription());
            stepNode.setProperty("positionX", step.getPositionX());
            stepNode.setProperty("positionY", step.getPositionY());
        }

        // Save edges
        Node edgesNode = node.hasNode("edges") ? node.getNode("edges") : node.addNode("edges", NODE_TYPE);
        for (var edge : workflow.getEdges()) {
            Node edgeNode = edgesNode.addNode(edge.getId(), NODE_TYPE);
            edgeNode.setProperty("source", edge.getSource());
            edgeNode.setProperty("target", edge.getTarget());
            edgeNode.setProperty("sourceHandle", edge.getSourceHandle());
            edgeNode.setProperty("targetHandle", edge.getTargetHandle());
            edgeNode.setProperty("type", edge.getType());
        }

        // Save variables
        if (!workflow.getVariables().isEmpty()) {
            Node variablesNode = node.hasNode("variables") ? node.getNode("variables") : node.addNode("variables", NODE_TYPE);
            for (Map.Entry<String, Object> entry : workflow.getVariables().entrySet()) {
                variablesNode.setProperty(entry.getKey(), entry.getValue().toString());
            }
        }
    }

    private WorkflowDefinitionModel loadWorkflowFromResource(Resource resource) {
        try {
            WorkflowDefinitionModel workflow = new WorkflowDefinitionModel();
            workflow.setId(resource.getName());
            
            ValueMap properties = resource.getValueMap();
            workflow.setName(properties.get("name", String.class));
            workflow.setDescription(properties.get("description", String.class));
            workflow.setCreatedBy(properties.get("createdBy", String.class));
            workflow.setCreatedAt(properties.get("createdAt", 0L));
            workflow.setUpdatedAt(properties.get("updatedAt", 0L));

            // Load steps
            Resource stepsResource = resource.getChild("steps");
            if (stepsResource != null) {
                for (Resource stepResource : stepsResource.getChildren()) {
                    ValueMap stepProps = stepResource.getValueMap();
                    WorkflowStepModel step = new WorkflowStepModel();
                    step.setId(stepResource.getName());
                    step.setType(stepProps.get("type", String.class));
                    step.setTitle(stepProps.get("title", String.class));
                    step.setDescription(stepProps.get("description", String.class));
                    step.setPositionX(stepProps.get("positionX", 0));
                    step.setPositionY(stepProps.get("positionY", 0));
                    workflow.addStep(step);
                }
            }

            // Load edges
            Resource edgesResource = resource.getChild("edges");
            if (edgesResource != null) {
                for (Resource edgeResource : edgesResource.getChildren()) {
                    ValueMap edgeProps = edgeResource.getValueMap();
                    WorkflowEdgeModel edge = new WorkflowEdgeModel();
                    edge.setId(edgeResource.getName());
                    edge.setSource(edgeProps.get("source", String.class));
                    edge.setTarget(edgeProps.get("target", String.class));
                    edge.setSourceHandle(edgeProps.get("sourceHandle", String.class));
                    edge.setTargetHandle(edgeProps.get("targetHandle", String.class));
                    edge.setType(edgeProps.get("type", String.class));
                    workflow.addEdge(edge);
                }
            }

            // Load variables
            Resource variablesResource = resource.getChild("variables");
            if (variablesResource != null) {
                for (Resource varResource : variablesResource.getChildren()) {
                    ValueMap varProps = varResource.getValueMap();
                    for (String key : varProps.keySet()) {
                        workflow.setVariable(key, varProps.get(key));
                    }
                }
            }

            return workflow;
            
        } catch (Exception e) {
            LOG.error("Failed to load workflow from resource: {}", resource.getPath(), e);
            return null;
        }
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


}