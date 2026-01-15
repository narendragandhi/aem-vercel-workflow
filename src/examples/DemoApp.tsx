import React from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BasicWorkflowBuilder, 
  WorkflowEditor, 
  WorkflowViewer, 
  WorkflowManager, 
  WorkflowExecutor 
} from '../examples/WorkflowExamples';
import { WorkflowDefinition } from '../types/workflow';

// Sample workflow for demonstration
const sampleWorkflow: WorkflowDefinition = {
  id: 'sample-workflow',
  name: 'Content Approval Workflow',
  description: 'A workflow for approving and publishing content',
  steps: [
    {
      id: 'start',
      type: 'startEnd',
      position: { x: 250, y: 25 },
      data: { label: 'Start', isStart: true },
    },
    {
      id: 'create-content',
      type: 'aemStep',
      position: { x: 200, y: 100 },
      data: { 
        label: 'Create Content', 
        description: 'Author creates new content',
        participant: 'Content Author',
        stepType: 'participant'
      },
    },
    {
      id: 'review',
      type: 'aemStep',
      position: { x: 200, y: 200 },
      data: { 
        label: 'Review Content', 
        description: 'Editor reviews content for quality',
        participant: 'Content Editor',
        stepType: 'participant'
      },
    },
    {
      id: 'approve',
      type: 'processStep',
      position: { x: 200, y: 300 },
      data: { 
        label: 'Auto Approval', 
        description: 'Automated approval check',
        processType: 'automated'
      },
    },
    {
      id: 'end',
      type: 'startEnd',
      position: { x: 250, y: 400 },
      data: { label: 'End', isStart: false },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'start',
      target: 'create-content',
    },
    {
      id: 'edge-2',
      source: 'create-content',
      target: 'review',
    },
    {
      id: 'edge-3',
      source: 'review',
      target: 'approve',
    },
    {
      id: 'edge-4',
      source: 'approve',
      target: 'end',
    },
  ],
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  createdBy: 'admin',
};

// Demo component that showcases all examples
const Demo = () => {
  const [activeExample, setActiveExample] = React.useState('basic');

  const renderExample = () => {
    switch (activeExample) {
      case 'basic':
        return <BasicWorkflowBuilder />;
      case 'editor':
        return <WorkflowEditor workflowId="sample-workflow" />;
      case 'viewer':
        return <WorkflowViewer workflow={sampleWorkflow} />;
      case 'manager':
        return <WorkflowManager />;
      case 'executor':
        return <WorkflowExecutor />;
      default:
        return <BasicWorkflowBuilder />;
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <div style={{ 
        padding: '10px 20px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #dee2e6' 
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>Workflow Builder Examples</h1>
        <nav style={{ marginTop: '10px' }}>
          {[
            { id: 'basic', label: 'Basic Builder' },
            { id: 'editor', label: 'Workflow Editor' },
            { id: 'viewer', label: 'Read-only Viewer' },
            { id: 'manager', label: 'Workflow Manager' },
            { id: 'executor', label: 'Workflow Executor' },
          ].map(example => (
            <button
              key={example.id}
              onClick={() => setActiveExample(example.id)}
              style={{
                marginRight: '10px',
                padding: '8px 16px',
                backgroundColor: activeExample === example.id ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {example.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderExample()}
      </div>
    </div>
  );
};

// Mount the demo app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Demo />);
} else {
  console.error('Root container not found');
}

export default Demo;