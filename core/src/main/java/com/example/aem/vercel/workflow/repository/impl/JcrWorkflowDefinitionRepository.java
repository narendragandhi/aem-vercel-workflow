package com.example.aem.vercel.workflow.repository.impl;

import com.example.aem.vercel.workflow.model.WorkflowDefinitionModel;
import com.example.aem.vercel.workflow.model.WorkflowEdgeModel;
import com.example.aem.vercel.workflow.model.WorkflowPortModel;
import com.example.aem.vercel.workflow.model.WorkflowStepModel;
import com.example.aem.vercel.workflow.repository.WorkflowDefinitionRepository;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ResourceResolverFactory;
import org.apache.sling.api.resource.ValueMap;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component(service = WorkflowDefinitionRepository.class)
public class JcrWorkflowDefinitionRepository implements WorkflowDefinitionRepository {

    private static final Logger LOG = LoggerFactory.getLogger(JcrWorkflowDefinitionRepository.class);

    private static final String WORKFLOWS_PATH = "/var/workflows/definitions";
    private static final String NODE_TYPE = "nt:unstructured";
    private static final String WORKFLOW_NODE_TYPE = "vercel:workflow";

    @Reference
    private ResourceResolverFactory resourceResolverFactory;

    private ResourceResolver resourceResolver;
    private Session session;

    @Activate
    protected void activate() {
        try {
            Map<String, Object> param = new HashMap<>();
            param.put(ResourceResolverFactory.SUBSERVICE, "workflow-definition-service");
            this.resourceResolver = resourceResolverFactory.getServiceResourceResolver(param);
            this.session = resourceResolver.adaptTo(Session.class);
            ensurePathExists(WORKFLOWS_PATH, NODE_TYPE);
        } catch (org.apache.sling.api.resource.LoginException e) {
            LOG.error("Failed to get service resource resolver", e);
        } catch (RepositoryException e) {
            LOG.error("Failed to initialize workflows path", e);
        }
    }

    @Override
    public WorkflowDefinitionModel create(WorkflowDefinitionModel workflow) {
        try {
            Node workflowsNode = ensurePathExists(WORKFLOWS_PATH, NODE_TYPE);
            Node workflowNode = workflowsNode.addNode(workflow.getId(), WORKFLOW_NODE_TYPE);
            saveWorkflowToNode(workflowNode, workflow);
            session.save();
            return workflow;
        } catch (RepositoryException e) {
            LOG.error("Failed to create workflow", e);
            throw new RuntimeException("Failed to create workflow", e);
        }
    }

    @Override
    public WorkflowDefinitionModel update(String id, WorkflowDefinitionModel workflow) {
        try {
            Node workflowNode = session.getNode(WORKFLOWS_PATH + "/" + id);
            saveWorkflowToNode(workflowNode, workflow);
            session.save();
            return workflow;
        } catch (RepositoryException e) {
            LOG.error("Failed to update workflow: {}", id, e);
            throw new RuntimeException("Failed to update workflow", e);
        }
    }

    @Override
    public Optional<WorkflowDefinitionModel> get(String id) {
        try {
            Resource resource = resourceResolver.getResource(WORKFLOWS_PATH + "/" + id);
            if (resource == null) {
                return Optional.empty();
            }
            WorkflowDefinitionModel workflow = loadWorkflowFromResource(resource);
            return Optional.ofNullable(workflow);
        } catch (Exception e) {
            LOG.error("Failed to get workflow: {}", id, e);
            return Optional.empty();
        }
    }

    @Override
    public List<WorkflowDefinitionModel> list() {
        List<WorkflowDefinitionModel> workflows = new ArrayList<>();
        try {
            Resource workflowsResource = resourceResolver.getResource(WORKFLOWS_PATH);
            if (workflowsResource != null) {
                for (Resource child : workflowsResource.getChildren()) {
                    WorkflowDefinitionModel workflow = loadWorkflowFromResource(child);
                    if (workflow != null) {
                        workflows.add(workflow);
                    }
                }
            }
        } catch (Exception e) {
            LOG.error("Failed to list workflows", e);
        }
        return workflows;
    }

    @Override
    public boolean delete(String id) {
        try {
            String path = WORKFLOWS_PATH + "/" + id;
            if (session.nodeExists(path)) {
                session.getNode(path).remove();
                session.save();
                return true;
            }
        } catch (RepositoryException e) {
            LOG.error("Failed to delete workflow: {}", id, e);
        }
        return false;
    }

    private void saveWorkflowToNode(Node node, WorkflowDefinitionModel workflow) throws RepositoryException {
        node.setProperty("name", workflow.getName());
        node.setProperty("description", workflow.getDescription());
        node.setProperty("createdBy", workflow.getCreatedBy());
        node.setProperty("createdAt", workflow.getCreatedAt());
        node.setProperty("updatedAt", workflow.getUpdatedAt());

        Node stepsNode;
        if (node.hasNode("steps")) {
            stepsNode = node.getNode("steps");
            clearChildNodes(stepsNode);
        } else {
            stepsNode = node.addNode("steps", NODE_TYPE);
        }
        for (var step : workflow.getSteps()) {
            Node stepNode = stepsNode.addNode(step.getId(), NODE_TYPE);
            stepNode.setProperty("type", step.getType());
            stepNode.setProperty("title", step.getTitle());
            stepNode.setProperty("description", step.getDescription());
            stepNode.setProperty("positionX", step.getPositionX());
            stepNode.setProperty("positionY", step.getPositionY());
        }

        Node edgesNode;
        if (node.hasNode("edges")) {
            edgesNode = node.getNode("edges");
            clearChildNodes(edgesNode);
        } else {
            edgesNode = node.addNode("edges", NODE_TYPE);
        }
        for (WorkflowEdgeModel edge : workflow.getEdges()) {
            Node edgeNode = edgesNode.addNode(edge.getId(), NODE_TYPE);
            edgeNode.setProperty("source", edge.getSource());
            edgeNode.setProperty("target", edge.getTarget());
            edgeNode.setProperty("sourceHandle", edge.getSourceHandle());
            edgeNode.setProperty("targetHandle", edge.getTargetHandle());
            edgeNode.setProperty("type", edge.getType());
        }

        if (node.hasNode("variables")) {
            node.getNode("variables").remove();
        }
        if (!workflow.getVariables().isEmpty()) {
            Node variablesNode = node.addNode("variables", NODE_TYPE);
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

    private Node ensurePathExists(String path, String nodeType) throws RepositoryException {
        if (session.nodeExists(path)) {
            return session.getNode(path);
        }
        String normalized = path.startsWith("/") ? path.substring(1) : path;
        String[] parts = normalized.split("/");
        Node current = session.getRootNode();
        for (String part : parts) {
            if (current.hasNode(part)) {
                current = current.getNode(part);
            } else {
                current = current.addNode(part, nodeType);
            }
        }
        session.save();
        return current;
    }

    private void clearChildNodes(Node parent) throws RepositoryException {
        NodeIterator children = parent.getNodes();
        while (children.hasNext()) {
            children.nextNode().remove();
        }
    }
}
