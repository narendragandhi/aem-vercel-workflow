import { create } from 'zustand';
import { WorkflowDefinition } from '@/types/workflow';

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
  }
}));