import { create } from 'zustand';
import { WorkflowDefinition } from '@/types/workflow';
import { DEMO_WORKFLOWS } from '@/data/demoWorkflows';

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

  // Use demo data directly since we don't have a real API
  loadWorkflows: async () => {
    set({ isLoading: true, error: null });
    try {
      // Use demo workflows for demo mode
      set({ workflows: DEMO_WORKFLOWS, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load workflows', isLoading: false });
    }
  },

  loadWorkflow: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const workflow = DEMO_WORKFLOWS.find(w => w.id === id);
      if (workflow) {
        set({ currentWorkflow: workflow, isLoading: false });
      } else {
        set({ error: 'Workflow not found', isLoading: false });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load workflow', isLoading: false });
    }
  },

  saveWorkflow: async (workflow) => {
    set({ isLoading: true, error: null });
    try {
      // In demo mode, just save to local state
      const existingWorkflow = get().workflows.find(w => w.id === workflow.id);
      
      if (existingWorkflow) {
        get().updateWorkflow(workflow);
      } else {
        get().addWorkflow(workflow);
      }
      
      set({ currentWorkflow: workflow, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to save workflow', isLoading: false });
      throw error;
    }
  },

  deleteWorkflow: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      get().removeWorkflow(id);
      set({ isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete workflow', isLoading: false });
      throw error;
    }
  },

  startExecution: async (workflowId: string) => {
    return { id: 'exec-123', status: 'STARTED', message: 'Execution started (demo mode)' };
  }
}));