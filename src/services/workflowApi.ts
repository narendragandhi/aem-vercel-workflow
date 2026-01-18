import { WorkflowDefinition } from '@/types/workflow';

const API_BASE_URL = '/bin/workflows';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

export const WorkflowApiService = {
  getWorkflows: async (): Promise<WorkflowDefinition[]> => {
    const response = await fetch(API_BASE_URL);
    return handleResponse(response);
  },

  getWorkflow: async (id: string): Promise<WorkflowDefinition> => {
    const response = await fetch(`${API_BASE_URL}?id=${id}`);
    return handleResponse(response);
  },

  createWorkflow: async (workflow: WorkflowDefinition): Promise<WorkflowDefinition> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workflow),
    });
    return handleResponse(response);
  },

  updateWorkflow: async (id: string, workflow: WorkflowDefinition): Promise<WorkflowDefinition> => {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workflow),
    });
    return handleResponse(response);
  },

  deleteWorkflow: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },

  startWorkflowExecution: async (workflowId: string): Promise<{id: string; status: string; message: string}> => {
    // This is a placeholder and should be implemented in a separate execution API
    console.warn('startWorkflowExecution is not implemented yet');
    return Promise.resolve({ id: 'exec-123', status: 'STARTED', message: 'Execution started' });
  }
};
