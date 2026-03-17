import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WorkflowMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  tags?: string[];
  folderId?: string;
  version?: number;
}

export interface WorkflowVersion {
  id: string;
  version: number;
  nodes: unknown[];
  edges: unknown[];
  createdAt: string;
  createdBy?: string;
  comment?: string;
}

export interface WorkspaceFolder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
}

interface WorkspaceState {
  currentWorkflowId: string | null;
  workflows: WorkflowMetadata[];
  versions: Record<string, WorkflowVersion[]>;
  folders: WorkspaceFolder[];
  currentFolderId: string | null;
  
  setCurrentWorkflow: (id: string | null) => void;
  addWorkflow: (workflow: WorkflowMetadata) => void;
  updateWorkflow: (id: string, updates: Partial<WorkflowMetadata>) => void;
  deleteWorkflow: (id: string) => void;
  getWorkflowsInFolder: (folderId?: string) => WorkflowMetadata[];
  
  addVersion: (workflowId: string, version: WorkflowVersion) => void;
  getVersions: (workflowId: string) => WorkflowVersion[];
  restoreVersion: (workflowId: string, versionId: string) => WorkflowVersion | null;
  
  addFolder: (folder: WorkspaceFolder) => void;
  deleteFolder: (id: string) => void;
  setCurrentFolder: (id: string | null) => void;
  
  searchWorkflows: (query: string) => WorkflowMetadata[];
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      currentWorkflowId: null,
      workflows: [],
      versions: {},
      folders: [],
      currentFolderId: null,

      setCurrentWorkflow: (id) => set({ currentWorkflowId: id }),

      addWorkflow: (workflow) => 
        set((state) => ({
          workflows: [...state.workflows, workflow],
        })),

      updateWorkflow: (id, updates) =>
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
          ),
        })),

      deleteWorkflow: (id) =>
        set((state) => ({
          workflows: state.workflows.filter((w) => w.id !== id),
          currentWorkflowId: state.currentWorkflowId === id ? null : state.currentWorkflowId,
        })),

      getWorkflowsInFolder: (folderId) => {
        const { workflows } = get();
        return workflows.filter((w) => w.folderId === folderId);
      },

      addVersion: (workflowId, version) =>
        set((state) => {
          const workflowVersions = state.versions[workflowId] || [];
          return {
            versions: {
              ...state.versions,
              [workflowId]: [...workflowVersions, version],
            },
          };
        }),

      getVersions: (workflowId) => {
        const { versions } = get();
        return versions[workflowId] || [];
      },

      restoreVersion: (workflowId, versionId) => {
        const versions = get().versions[workflowId] || [];
        return versions.find((v) => v.id === versionId) || null;
      },

      addFolder: (folder) =>
        set((state) => ({
          folders: [...state.folders, folder],
        })),

      deleteFolder: (id) =>
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== id),
          currentFolderId: state.currentFolderId === id ? null : state.currentFolderId,
        })),

      setCurrentFolder: (id) => set({ currentFolderId: id }),

      searchWorkflows: (query) => {
        const { workflows } = get();
        const lowerQuery = query.toLowerCase();
        return workflows.filter(
          (w) =>
            w.name.toLowerCase().includes(lowerQuery) ||
            w.description?.toLowerCase().includes(lowerQuery) ||
            w.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      },
    }),
    {
      name: 'aemflow-workspace',
      partialize: (state) => ({
        workflows: state.workflows,
        versions: state.versions,
        folders: state.folders,
      }),
    }
  )
);
