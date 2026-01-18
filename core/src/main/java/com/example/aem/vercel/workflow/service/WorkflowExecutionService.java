package com.example.aem.vercel.workflow.service;

import com.example.aem.vercel.workflow.model.WorkflowExecutionModel;
import org.osgi.annotation.versioning.ProviderType;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for managing workflow executions.
 * Provides runtime execution capabilities for workflow definitions.
 */
@ProviderType
public interface WorkflowExecutionService {

    /**
     * Start execution of a workflow.
     *
     * @param workflowId the workflow ID to execute
     * @param userId the user initiating the execution
     * @param initialVariables initial variables for the execution
     * @return the workflow execution instance
     */
    WorkflowExecutionModel startExecution(String workflowId, String userId, java.util.Map<String, Object> initialVariables);

    /**
     * Get a workflow execution by ID.
     *
     * @param executionId the execution ID
     * @return the execution if found
     */
    Optional<WorkflowExecutionModel> getExecution(String executionId);

    /**
     * Get all executions for a specific workflow.
     *
     * @param workflowId the workflow ID
     * @return list of executions
     */
    List<WorkflowExecutionModel> getExecutionsByWorkflow(String workflowId);

    /**
     * Get all running executions.
     *
     * @return list of running executions
     */
    List<WorkflowExecutionModel> getRunningExecutions();

    /**
     * Pause a running execution.
     *
     * @param executionId the execution ID
     * @return true if successfully paused
     */
    boolean pauseExecution(String executionId);

    /**
     * Resume a paused execution.
     *
     * @param executionId the execution ID
     * @return true if successfully resumed
     */
    boolean resumeExecution(String executionId);

    /**
     * Cancel a running execution.
     *
     * @param executionId the execution ID
     * @param reason the reason for cancellation
     * @return true if successfully cancelled
     */
    boolean cancelExecution(String executionId, String reason);

    /**
     * Get execution logs.
     *
     * @param executionId the execution ID
     * @param limit maximum number of log entries to return
     * @return list of log entries
     */
    List<com.example.aem.vercel.workflow.model.WorkflowLogEntryModel> getExecutionLogs(String executionId, int limit);

    /**
     * Get execution variables.
     *
     * @param executionId the execution ID
     * @return map of execution variables
     */
    java.util.Map<String, Object> getExecutionVariables(String executionId);

    /**
     * Update execution variable.
     *
     * @param executionId the execution ID
     * @param key the variable key
     * @param value the variable value
     * @return true if successfully updated
     */
    boolean updateExecutionVariable(String executionId, String key, Object value);

    /**
     * Get execution status.
     *
     * @param executionId the execution ID
     * @return the execution status
     */
    String getExecutionStatus(String executionId);

    /**
     * Get current execution step.
     *
     * @param executionId the execution ID
     * @return the current step ID if running
     */
    Optional<String> getCurrentStep(String executionId);

    /**
     * Get execution duration.
     *
     * @param executionId the execution ID
     * @return duration in milliseconds
     */
    long getExecutionDuration(String executionId);

    /**
     * Check if execution is running.
     *
     * @param executionId the execution ID
     * @return true if execution is running
     */
    boolean isExecutionRunning(String executionId);

    /**
     * Check if execution is completed.
     *
     * @param executionId the execution ID
     * @return true if execution is completed
     */
    boolean isExecutionCompleted(String executionId);

    /**
     * Check if execution is failed.
     *
     * @param executionId the execution ID
     * @return true if execution has failed
     */
    boolean isExecutionFailed(String executionId);

    /**
     * Get recent executions.
     *
     * @param limit maximum number of executions to return
     * @return list of recent executions
     */
    List<WorkflowExecutionModel> getRecentExecutions(int limit);

    /**
     * Get executions by user.
     *
     * @param userId the user ID
     * @return list of executions started by the user
     */
    List<WorkflowExecutionModel> getExecutionsByUser(String userId);

    /**
     * Clean up old completed executions.
     *
     * @param olderThanDays age threshold in days
     * @return number of executions cleaned up
     */
    int cleanupOldExecutions(int olderThanDays);

    /**
     * Get execution statistics.
     *
     * @param workflowId the workflow ID (optional, if null returns global stats)
     * @return execution statistics
     */
    ExecutionStatistics getExecutionStatistics(String workflowId);

    /**
     * Execution statistics data class.
     */
    class ExecutionStatistics {
        private final long totalExecutions;
        private final long runningExecutions;
        private final long completedExecutions;
        private final long failedExecutions;
        private final double averageDuration;

        public ExecutionStatistics(long totalExecutions, long runningExecutions, 
                                 long completedExecutions, long failedExecutions, double averageDuration) {
            this.totalExecutions = totalExecutions;
            this.runningExecutions = runningExecutions;
            this.completedExecutions = completedExecutions;
            this.failedExecutions = failedExecutions;
            this.averageDuration = averageDuration;
        }

        public long getTotalExecutions() { return totalExecutions; }
        public long getRunningExecutions() { return runningExecutions; }
        public long getCompletedExecutions() { return completedExecutions; }
        public long getFailedExecutions() { return failedExecutions; }
        public double getAverageDuration() { return averageDuration; }

        public double getSuccessRate() {
            return totalExecutions > 0 ? (double) completedExecutions / totalExecutions * 100 : 0;
        }

        public double getFailureRate() {
            return totalExecutions > 0 ? (double) failedExecutions / totalExecutions * 100 : 0;
        }
    }
}