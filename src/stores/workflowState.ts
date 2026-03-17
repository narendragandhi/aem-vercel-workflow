import { create } from 'zustand';
import { Connection, Edge, EdgeChange, Node, NodeChange } from '@reactflow/core';

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  readOnly: boolean;
  history: { nodes: Node[]; edges: Edge[] }[];
  historyIndex: number;
  
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  updateNode: (nodeId: string, data: Partial<Node['data']>) => void;
  deleteNode: (nodeId: string) => void;
  selectNode: (node: Node | null) => void;
  setReadOnly: (readOnly: boolean) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  clearHistory: () => void;
  clearAll: () => void;
}

export const useWorkflowState = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  readOnly: false,
  history: [],
  historyIndex: -1,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: changes.reduce((acc, change) => {
        if (change.type === 'remove') {
          return acc.filter((node) => node.id !== change.id);
        }
        if (change.type === 'select') {
          return acc.map((node) => 
            node.id === change.id 
              ? { ...node, selected: change.selected }
              : node
          );
        }
        return acc;
      }, state.nodes),
    }));
  },
  
  onEdgesChange: (changes) => {
    set((state) => ({
      edges: changes.reduce((acc, change) => {
        if (change.type === 'remove') {
          return acc.filter((edge) => edge.id !== change.id);
        }
        return acc;
      }, state.edges),
    }));
  },
  
  onConnect: (connection) => {
    if (!connection.source || !connection.target) {return;}
    
    const edgeLabel = connection.sourceHandle === 'true' 
      ? 'Yes' 
      : connection.sourceHandle === 'false' 
        ? 'No' 
        : undefined;
    
    const newEdge: Edge = {
      id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      animated: true,
      label: edgeLabel,
    };
    
    set((state) => ({
      edges: [...state.edges, newEdge],
    }));
    
    get().pushHistory();
  },
  
  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
    get().pushHistory();
  },
  
  updateNode: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }));
  },
  
  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
    }));
    get().pushHistory();
  },
  
  selectNode: (node) => set({ selectedNode: node }),
  
  setReadOnly: (readOnly) => set({ readOnly }),
  
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        nodes: history[newIndex].nodes,
        edges: history[newIndex].edges,
        historyIndex: newIndex,
      });
    }
  },
  
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        nodes: history[newIndex].nodes,
        edges: history[newIndex].edges,
        historyIndex: newIndex,
      });
    }
  },
  
  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
  
  clearHistory: () => set({ history: [], historyIndex: -1 }),
  
  clearAll: () => {
    set({ nodes: [], edges: [], selectedNode: null });
    get().pushHistory();
  },
}));
