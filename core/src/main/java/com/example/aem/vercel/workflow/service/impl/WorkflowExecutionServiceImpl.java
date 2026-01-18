package com.example.aem.vercel.workflow.service.impl;

import com.example.aem.vercel.workflow.model.WorkflowExecutionModel;
import com.example.aem.vercel.workflow.model.WorkflowDefinitionModel;
import com.example.aem.vercel.workflow.service.WorkflowDefinitionService;
import com.example.aem.vercel.workflow.service.WorkflowExecutionService;
import com.example.aem.vercel.workflow.config.WorkflowConfig;
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
import java.util.stream.Collectors;

/**
 * Implementation of WorkflowExecutionService.
 * Manages workflow execution runtime state and lifecycle.
 */
@Component(
    service = WorkflowExecutionService.class,
    immediate = true
)
@Designate(ocd = WorkflowConfig.class)
public class WorkflowExecutionServiceImpl implements WorkflowExecutionService {

    private static final Logger LOG = LoggerFactory.getLogger(WorkflowExecutionServiceImpl.class);
    private static final String EXECUTIONS_PATH = "/var/workflows/executions";
    private static final String NODE_TYPE = "nt:unstructured";
    private static final String EXECUTION_NODE_TYPE = "vercel:execution";

    private final Map<String, WorkflowExecutionModel> activeExecutions = new ConcurrentHashMap<>();

    @Reference
    private WorkflowDefinitionService workflowDefinitionService;

    private WorkflowConfig config;

    @Activate
    protected void activate(WorkflowConfig config) {
        this.config = config;
        initializeExecutionsPath();
        LOG.info("WorkflowExecutionService activated with max active executions: {}", config.maxActiveExecutions());
    }

    private void initializeExecutionsPath() {
        // Implementation would initialize JCR path for storing executions
        LOG.info("Workflow executions path initialized: {}", EXECUTIONS_PATH);
    }

    @Override
    public WorkflowExecutionModel startExecution(String workflowId, String userId, Map<String, Object> initialVariables) {
        if (workflowId == null || workflowId.isEmpty()) {
            throw new IllegalArgumentException("Workflow ID is required");
        }

        Optional<WorkflowDefinitionModel> workflowOpt = workflowDefinitionService.getWorkflow(workflowId);
        if (workflowOpt.isEmpty()) {
            throw new IllegalArgumentException("Workflow not found: " + workflowId);
        }

        if (activeExecutions.size() >= config.maxActiveExecutions()) {
            throw new IllegalStateException("Maximum active executions reached: " + config.maxActiveExecutions());
        }

        WorkflowDefinitionModel workflow = workflowOpt.get();
        WorkflowExecutionModel execution = new WorkflowExecutionModel();
        execution.setId("exec-" + UUID.randomUUID().toString());
        execution.setWorkflowId(workflowId);
        execution.setCurrentStep("start");
        
        if (initialVariables != null) {
            execution.getVariables().putAll(initialVariables);
        }

        // Set workflow-specific variables
        execution.setVariable("workflowName", workflow.getName());
        execution.setVariable("workflowDescription", workflow.getDescription());
        execution.setVariable("startedBy", userId);
        execution.setVariable("startTime", execution.getStartTime());

        activeExecutions.put(execution.getId(), execution);
        saveExecution(execution);

        // Start execution in background thread
        executeWorkflowAsync(execution, workflow, userId);

        LOG.info("Started workflow execution: {} for workflow: {} by user: {}", 
                execution.getId(), workflowId, userId);
        
        return execution;
    }

    @Override
    public Optional<WorkflowExecutionModel> getExecution(String executionId) {
        if (executionId == null || executionId.isEmpty()) {
            return Optional.empty();
        }

        // Check active executions first
        WorkflowExecutionModel active = activeExecutions.get(executionId);
        if (active != null) {
            return Optional.of(active);
        }

        // Load from persistent storage
        return loadExecution(executionId);
    }

    @Override
    public List<WorkflowExecutionModel> getExecutionsByWorkflow(String workflowId) {
        if (workflowId == null || workflowId.isEmpty()) {
            return Collections.emptyList();
        }

        List<WorkflowExecutionModel> executions = new ArrayList<>();
        
        // Add active executions
        executions.addAll(activeExecutions.values().stream()
            .filter(exec -> workflowId.equals(exec.getWorkflowId()))
            .collect(Collectors.toList()));

        // Load from persistent storage
        executions.addAll(loadExecutionsByWorkflow(workflowId));

        return executions;
    }

    @Override
    public List<WorkflowExecutionModel> getRunningExecutions() {
        return activeExecutions.values().stream()
            .filter(WorkflowExecutionModel::isRunning)
            .collect(Collectors.toList());
    }

    @Override
    public boolean pauseExecution(String executionId) {
        WorkflowExecutionModel execution = activeExecutions.get(executionId);
        if (execution != null && execution.isRunning()) {
            execution.pause();
            execution.addLog("INFO", "Execution paused by user");
            saveExecution(execution);
            LOG.info("Paused execution: {}", executionId);
            return true;
        }
        return false;
    }

    @Override
    public boolean resumeExecution(String executionId) {
        WorkflowExecutionModel execution = activeExecutions.get(executionId);
        if (execution != null && execution.isPaused()) {
            execution.resume();
            execution.addLog("INFO", "Execution resumed by user");
            saveExecution(execution);
            LOG.info("Resumed execution: {}", executionId);
            return true;
        }
        return false;
    }

    @Override
    public boolean cancelExecution(String executionId, String reason) {
        WorkflowExecutionModel execution = activeExecutions.get(executionId);
        if (execution != null && execution.isRunning()) {
            execution.fail("Cancelled: " + reason);
            activeExecutions.remove(executionId);
            saveExecution(execution);
            LOG.info("Cancelled execution: {} - {}", executionId, reason);
            return true;
        }
        return false;
    }

    @Override
    public List<com.example.aem.vercel.workflow.model.WorkflowLogEntryModel> getExecutionLogs(String executionId, int limit) {
        Optional<WorkflowExecutionModel> executionOpt = getExecution(executionId);
        if (executionOpt.isEmpty()) {
            return Collections.emptyList();
        }

        WorkflowExecutionModel execution = executionOpt.get();
        List<com.example.aem.vercel.workflow.model.WorkflowLogEntryModel> logs = execution.getLogs();
        
        if (limit > 0 && logs.size() > limit) {
            return logs.subList(logs.size() - limit, logs.size());
        }
        
        return logs;
    }

    @Override
    public Map<String, Object> getExecutionVariables(String executionId) {
        Optional<WorkflowExecutionModel> executionOpt = getExecution(executionId);
        return executionOpt.map(WorkflowExecutionModel::getVariables).orElse(Collections.emptyMap());
    }

    @Override
    public boolean updateExecutionVariable(String executionId, String key, Object value) {
        WorkflowExecutionModel execution = activeExecutions.get(executionId);
        if (execution != null) {
            execution.setVariable(key, value);
            execution.addLog("DEBUG", "Updated variable: " + key);
            saveExecution(execution);
            return true;
        }
        return false;
    }

    @Override
    public String getExecutionStatus(String executionId) {
        Optional<WorkflowExecutionModel> executionOpt = getExecution(executionId);
        return executionOpt.map(WorkflowExecutionModel::getStatus).orElse("not_found");
    }

    @Override
    public Optional<String> getCurrentStep(String executionId) {
        Optional<WorkflowExecutionModel> executionOpt = getExecution(executionId);
        return executionOpt.map(WorkflowExecutionModel::getCurrentStep);
    }

    @Override
    public long getExecutionDuration(String executionId) {
        Optional<WorkflowExecutionModel> executionOpt = getExecution(executionId);
        return executionOpt.map(WorkflowExecutionModel::getDuration).orElse(0L);
    }

    @Override
    public boolean isExecutionRunning(String executionId) {
        Optional<WorkflowExecutionModel> executionOpt = getExecution(executionId);
        return executionOpt.map(WorkflowExecutionModel::isRunning).orElse(false);
    }

    @Override
    public boolean isExecutionCompleted(String executionId) {
        Optional<WorkflowExecutionModel> executionOpt = getExecution(executionId);
        return executionOpt.map(WorkflowExecutionModel::isCompleted).orElse(false);
    }

    @Override
    public boolean isExecutionFailed(String executionId) {
        Optional<WorkflowExecutionModel> executionOpt = getExecution(executionId);
        return executionOpt.map(WorkflowExecutionModel::isFailed).orElse(false);
    }

    @Override
    public List<WorkflowExecutionModel> getRecentExecutions(int limit) {
        // Implementation would load recent executions from storage
        return Collections.emptyList();
    }

    @Override
    public List<WorkflowExecutionModel> getExecutionsByUser(String userId) {
        // Implementation would load executions by user from storage
        return Collections.emptyList();
    }

    @Override
    public int cleanupOldExecutions(int olderThanDays) {
        // Implementation would clean up old completed executions
        LOG.info("Cleaning up executions older than {} days", olderThanDays);
        return 0;
    }

    @Override
    public ExecutionStatistics getExecutionStatistics(String workflowId) {
        // Implementation would calculate statistics from storage
        return new ExecutionStatistics(0, 0, 0, 0, 0.0);
    }

    private void executeWorkflowAsync(WorkflowExecutionModel execution, WorkflowDefinitionModel workflow, String userId) {
        Thread executionThread = new Thread(() -> {
            try {
                execution.addLog("INFO", "Starting workflow execution");
                
                // Simple linear execution - would be enhanced for complex workflows
                List<String> executionPath = calculateExecutionPath(workflow);
                
                for (String stepId : executionPath) {
                    if (!execution.isRunning()) {
                        break; // Execution was paused or cancelled
                    }
                    
                    execution.setCurrentStep(stepId);
                    execution.addLog("INFO", "Executing step: " + stepId, stepId);
                    
                    // Simulate step execution
                    executeStep(execution, workflow, stepId);
                    
                    // Small delay to simulate work
                    Thread.sleep(1000);
                }
                
                if (execution.isRunning()) {
                    execution.complete();
                    execution.addLog("INFO", "Workflow execution completed successfully");
                }
                
            } catch (Exception e) {
                execution.fail("Execution error: " + e.getMessage());
                LOG.error("Workflow execution failed: {}", execution.getId(), e);
            } finally {
                activeExecutions.remove(execution.getId());
                saveExecution(execution);
            }
        });
        
        executionThread.start();
    }

    private List<String> calculateExecutionPath(WorkflowDefinitionModel workflow) {
        // Simple implementation - find path from start to end
        List<String> path = new ArrayList<>();
        
        // Find start step
        String currentStep = workflow.getSteps().stream()
            .filter(step -> "startEnd".equals(step.getType()) && "Start".equals(step.getData().get("label")))
            .map(step -> step.getId())
            .findFirst()
            .orElse("start");
        
        path.add(currentStep);
        
        // Follow edges to end
        while (true) {
            final String currentStepForLambda = currentStep; // Capture for lambda
            String nextStep = workflow.getEdges().stream()
                .filter(edge -> currentStepForLambda.equals(edge.getSource()))
                .map(edge -> edge.getTarget())
                .findFirst()
                .orElse(null);
            
            if (nextStep == null || nextStep.equals("end") || path.contains(nextStep)) {
                break;
            }
            
            path.add(nextStep);
            currentStep = nextStep;
        }
        
        return path;
    }

    private void executeStep(WorkflowExecutionModel execution, WorkflowDefinitionModel workflow, String stepId) {
        // Implementation would execute the actual step logic
        // For now, just log the step execution
        execution.addLog("DEBUG", "Step execution logic would run here", stepId);
    }

    private void saveExecution(WorkflowExecutionModel execution) {
        // Implementation would save execution to JCR
        LOG.debug("Saved execution: {}", execution.getId());
    }

    private Optional<WorkflowExecutionModel> loadExecution(String executionId) {
        // Implementation would load execution from JCR
        return Optional.empty();
    }

    private List<WorkflowExecutionModel> loadExecutionsByWorkflow(String workflowId) {
        // Implementation would load executions by workflow from JCR
        return Collections.emptyList();
    }


}