import { WorkflowDefinition, WorkflowExecution } from '@/types/workflow';

const AEM_BASE_URL = process.env.REACT_APP_AEM_URL || 'http://localhost:4502';
const AEM_API_PATH = '/api/workflow';

class WorkflowService {
  private getAuthHeaders() {
    const auth = btoa('admin:admin'); // Should be dynamic in production
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    };
  }

  async getWorkflows(): Promise<WorkflowDefinition[]> {
    try {
      const response = await fetch(`${AEM_BASE_URL}${AEM_API_PATH}/definitions.json`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch workflows');
      return await response.json();
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  }

  async getWorkflow(id: string): Promise<WorkflowDefinition> {
    try {
      const response = await fetch(`${AEM_BASE_URL}${AEM_API_PATH}/definitions/${id}.json`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch workflow');
      return await response.json();
    } catch (error) {
      console.error('Error fetching workflow:', error);
      throw error;
    }
  }

  async saveWorkflow(workflow: WorkflowDefinition): Promise<WorkflowDefinition> {
    try {
      const response = await fetch(`${AEM_BASE_URL}${AEM_API_PATH}/definitions`, {
        method: workflow.id ? 'PUT' : 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(workflow)
      });
      if (!response.ok) throw new Error('Failed to save workflow');
      return await response.json();
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw error;
    }
  }

  async deleteWorkflow(id: string): Promise<void> {
    try {
      const response = await fetch(`${AEM_BASE_URL}${AEM_API_PATH}/definitions/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete workflow');
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  }

  async executeWorkflow(workflowId: string, variables?: Record<string, any>): Promise<WorkflowExecution> {
    try {
      const response = await fetch(`${AEM_BASE_URL}${AEM_API_PATH}/execute`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          workflowId,
          variables
        })
      });
      if (!response.ok) throw new Error('Failed to execute workflow');
      return await response.json();
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  }

  async getExecutions(workflowId?: string): Promise<WorkflowExecution[]> {
    try {
      const url = workflowId 
        ? `${AEM_BASE_URL}${AEM_API_PATH}/executions.json?workflowId=${workflowId}`
        : `${AEM_BASE_URL}${AEM_API_PATH}/executions.json`;
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch executions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching executions:', error);
      throw error;
    }
  }

  async getExecution(id: string): Promise<WorkflowExecution> {
    try {
      const response = await fetch(`${AEM_BASE_URL}${AEM_API_PATH}/executions/${id}.json`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch execution');
      return await response.json();
    } catch (error) {
      console.error('Error fetching execution:', error);
      throw error;
    }
  }

  async getAEMWorkflowSteps(): Promise<any[]> {
    try {
      const response = await fetch(`${AEM_BASE_URL}${AEM_API_PATH}/aem-steps.json`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch AEM workflow steps');
      return await response.json();
    } catch (error) {
      console.error('Error fetching AEM workflow steps:', error);
      throw error;
    }
  }
}

export const workflowService = new WorkflowService();