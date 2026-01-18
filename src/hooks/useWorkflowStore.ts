import { create } from 'zustand';
import { WorkflowDefinition } from '@/types/workflow';
import { WorkflowApiService } from '@/services/workflowApi';

interface WorkflowState {
  currentWorkflow: WorkflowDefinition | null;
  workflows: WorkflowDefinition[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentWorkflow: (workflow: WorkflowDefinition | null) => void;
  updateWorkflow: (workflow: WorkflowDefinition) => void;
  addWorkflow: (workflow: WorkflowDefinition) => void;
  removeWorkflow: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // API Actions
  loadWorkflows: () => Promise<void>;
  loadWorkflow: (id: string) => Promise<void>;
  saveWorkflow: (workflow: WorkflowDefinition) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  startExecution: (workflowId: string) => Promise<{id: string; status: string; message: string}>;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  currentWorkflow: null,
  workflows: [],
  isLoading: false,
  error: null,

  setCurrentWorkflow: (workflow) => {
    set({ currentWorkflow: workflow });
  },

  updateWorkflow: (workflow) => {
    const { workflows, currentWorkflow } = get();
    const updatedWorkflows = workflows.map(w => 
      w.id === workflow.id ? workflow : w
    );
    
    set({
      workflows: updatedWorkflows,
      currentWorkflow: currentWorkflow?.id === workflow.id ? workflow : currentWorkflow
    });
  },

  addWorkflow: (workflow) => {
    const { workflows } = get();
    set({
      workflows: [...workflows, workflow]
    });
  },

  removeWorkflow: (id) => {
    const { workflows, currentWorkflow } = get();
    const updatedWorkflows = workflows.filter(w => w.id !== id);
    
    set({
      workflows: updatedWorkflows,
      currentWorkflow: currentWorkflow?.id === id ? null : currentWorkflow
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  // API Actions
  loadWorkflows: async () => {
    set({ isLoading: true, error: null });
    try {
      const workflows = await WorkflowApiService.getWorkflows();
      set({ workflows, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load workflows', isLoading: false });
    }
  },

  loadWorkflow: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const workflow = await WorkflowApiService.getWorkflow(id);
      set({ currentWorkflow: workflow, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load workflow', isLoading: false });
    }
  },

  saveWorkflow: async (workflow) => {
    set({ isLoading: true, error: null });
    try {
      let savedWorkflow: WorkflowDefinition;
      
      // Check if it's a new workflow
      const existingWorkflow = get().workflows.find(w => w.id === workflow.id);
      
      if (existingWorkflow) {
        savedWorkflow = await WorkflowApiService.updateWorkflow(workflow.id, workflow);
        get().updateWorkflow(savedWorkflow);
      } else {
        savedWorkflow = await WorkflowApiService.createWorkflow(workflow);
        get().addWorkflow(savedWorkflow);
      }
      
      set({ currentWorkflow: savedWorkflow, isLoading: false });
      return savedWorkflow;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to save workflow', isLoading: false });
      throw error;
    }
  },

  deleteWorkflow: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await WorkflowApiService.deleteWorkflow(id);
      get().removeWorkflow(id);
      set({ isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete workflow', isLoading: false });
      throw error;
    }
  },

  startExecution: async (workflowId: string) => {
    try {
      return await WorkflowApiService.startWorkflowExecution(workflowId);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to start workflow execution' });
      throw error;
    }
  }
}));