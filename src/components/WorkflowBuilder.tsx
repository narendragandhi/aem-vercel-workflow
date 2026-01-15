import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
} from '@reactflow/core';
import '@reactflow/core/dist/style.css';
import '@reactflow/background/dist/style.css';
import '@reactflow/controls/dist/style.css';
import '@reactflow/minimap/dist/style.css';

import { WorkflowDefinition, WorkflowStep, WorkflowEdge } from '@/types/workflow';
import { useWorkflowStore } from '@/hooks/useWorkflowStore';
import { AEMStepNode } from './nodes/AEMStepNode';
import { ProcessStepNode } from './nodes/ProcessStepNode';
import { StartEndNode } from './nodes/StartEndNode';

const nodeTypes: NodeTypes = {
  aemStep: AEMStepNode,
  processStep: ProcessStepNode,
  startEnd: StartEndNode,
};

interface WorkflowBuilderProps {
  workflow?: WorkflowDefinition;
  onSave?: (workflow: WorkflowDefinition) => void;
  readOnly?: boolean;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflow,
  onSave,
  readOnly = false
}) => {
  const { currentWorkflow, setCurrentWorkflow, updateWorkflow } = useWorkflowStore();

  const initialNodes = useMemo(() => {
    if (workflow) {
      return workflow.steps.map((step): Node => ({
        id: step.id,
        type: getNodeType(step.type),
        position: step.position,
        data: step.data,
        draggable: !readOnly,
      }));
    }
    
    // Default start and end nodes
    return [
      {
        id: 'start',
        type: 'startEnd',
        position: { x: 250, y: 25 },
        data: { label: 'Start', isStart: true },
        draggable: !readOnly,
      },
      {
        id: 'end',
        type: 'startEnd',
        position: { x: 250, y: 500 },
        data: { label: 'End', isStart: false },
        draggable: !readOnly,
      }
    ];
  }, [workflow, readOnly]);

  const initialEdges = useMemo(() => {
    if (workflow) {
      return workflow.edges.map((edge): Edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type || 'default',
        data: edge.data,
        animated: true,
      }));
    }
    return [];
  }, [workflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return;
      
      const newEdge: Edge = {
        ...params,
        id: `edge-${Date.now()}`,
        animated: true,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [readOnly, setEdges]
  );

  const onNodesChangeHandler = useCallback(
    (changes: any) => {
      if (readOnly) return;
      onNodesChange(changes);
    },
    [readOnly, onNodesChange]
  );

  const onEdgesChangeHandler = useCallback(
    (changes: any) => {
      if (readOnly) return;
      onEdgesChange(changes);
    },
    [readOnly, onEdgesChange]
  );

  const handleSave = useCallback(() => {
    const workflowDefinition: WorkflowDefinition = {
      id: workflow?.id || `workflow-${Date.now()}`,
      name: workflow?.name || 'Untitled Workflow',
      description: workflow?.description,
      steps: nodes.map((node): WorkflowStep => ({
        id: node.id,
        type: node.type as string,
        position: node.position,
        data: node.data,
      })),
      edges: edges.map((edge): WorkflowEdge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
        data: edge.data,
      })),
      variables: workflow?.variables,
      createdAt: workflow?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin', // Should come from user session
    };

    if (onSave) {
      onSave(workflowDefinition);
    }
  }, [nodes, edges, workflow, onSave]);

  return (
    <div className="workflow-builder" style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />
        <MiniMap 
          nodeStrokeColor="#fff"
          nodeColor={(node) => {
            switch (node.type) {
              case 'startEnd': return '#10b981';
              case 'aemStep': return '#3b82f6';
              case 'processStep': return '#f59e0b';
              default: return '#6b7280';
            }
          }}
          nodeBorderRadius={2}
        />
      </ReactFlow>
      
      {!readOnly && (
        <div className="workflow-actions" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
          >
            Save Workflow
          </button>
        </div>
      )}
    </div>
  );
};

function getNodeType(type: string): string {
  switch (type) {
    case 'aemStep': return 'aemStep';
    case 'processStep': return 'processStep';
    case 'startEnd': return 'startEnd';
    default: return 'aemStep';
  }
}