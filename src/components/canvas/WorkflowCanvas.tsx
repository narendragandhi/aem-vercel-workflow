import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  NodeTypes,
  ReactFlowProvider,
  useReactFlow,
} from '@reactflow/core';
import 'reactflow/dist/style.css';

import { StartEndNode } from '../nodes/StartEndNode';
import { ProcessStepNode } from '../nodes/ProcessStepNode';
import { ConditionNode } from '../nodes/ConditionNode';
import { BranchNode } from '../nodes/BranchNode';
import { ParticipantChooserNode } from '../nodes/ParticipantChooserNode';
import { DAMUpdateAssetNode } from '../nodes/DAMUpdateAssetNode';
import { DAMTranscodeNode } from '../nodes/DAMTranscodeNode';
import { DAMMetadataWriteNode } from '../nodes/DAMMetadataWriteNode';
import { EmailNotificationNode } from '../nodes/EmailNotificationNode';
import { PageActivationNode } from '../nodes/PageActivationNode';
import { CallWorkflowNode } from '../nodes/CallWorkflowNode';
import { DelayNode } from '../nodes/DelayNode';
import { LoopNode } from '../nodes/LoopNode';
import { ParallelNode } from '../nodes/ParallelNode';
import { ErrorHandlerNode } from '../nodes/ErrorHandlerNode';
import { FormsProcessStepNode } from '../nodes/FormsProcessStepNode';
import { GraniteRoutingNode } from '../nodes/GraniteRoutingNode';
import { AEMStepNode } from '../nodes/AEMStepNode';

const nodeTypes: NodeTypes = {
  startEnd: StartEndNode,
  process: ProcessStepNode,
  condition: ConditionNode,
  branch: BranchNode,
  participant: ParticipantChooserNode,
  participantChooser: ParticipantChooserNode,
  damUpdateAsset: DAMUpdateAssetNode,
  damTranscode: DAMTranscodeNode,
  damMetadataWrite: DAMMetadataWriteNode,
  emailNotification: EmailNotificationNode,
  pageActivation: PageActivationNode,
  callWorkflow: CallWorkflowNode,
  delay: DelayNode,
  loop: LoopNode,
  parallel: ParallelNode,
  errorHandler: ErrorHandlerNode,
  formsProcess: FormsProcessStepNode,
  graniteRouting: GraniteRoutingNode,
  aemStep: AEMStepNode,
};

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  readOnly?: boolean;
  darkMode?: boolean;
}

const WorkflowCanvasInner: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  readOnly = false,
  darkMode = false,
}) => {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const bgColor = darkMode ? '#1e293b' : '#f8fafc';
  const miniMapMaskColor = darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <div className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          animated: true,
          style: { strokeWidth: 2 },
        }}
        proOptions={proOptions}
        minZoom={0.1}
        maxZoom={2}
        deleteKeyCode={['Backspace', 'Delete']}
        readOnly={readOnly}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color={darkMode ? '#475569' : '#cbd5e1'}
          style={{ backgroundColor: bgColor }}
        />
        <Controls
          showZoom={false}
          showFitView={false}
          showInteractive={false}
          className="!bottom-4 !left-4"
        />
        <MiniMap
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              startEnd: '#22c55e',
              process: '#3b82f6',
              condition: '#f59e0b',
              branch: '#8b5cf6',
              participant: '#ec4899',
              damUpdateAsset: '#14b8a6',
              damTranscode: '#06b6d4',
              damMetadataWrite: '#0ea5e9',
              emailNotification: '#f97316',
              pageActivation: '#22c55e',
              callWorkflow: '#6366f1',
              delay: '#64748b',
              loop: '#eab308',
              parallel: '#8b5cf6',
              errorHandler: '#ef4444',
              formsProcess: '#3b82f6',
              graniteRouting: '#8b5cf6',
              aemStep: '#3b82f6',
            };
            return colors[node.type || ''] || '#94a3b8';
          }}
          maskColor={miniMapMaskColor}
          className="!bottom-4 !right-4"
          style={{
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            borderRadius: '8px',
            border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
          }}
        />
      </ReactFlow>
    </div>
  );
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowCanvas;
