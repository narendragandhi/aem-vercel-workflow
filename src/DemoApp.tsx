import React, { useEffect, useState } from 'react';
import { WorkflowBuilder } from './components/WorkflowBuilder';
import { useWorkflowStore } from './hooks/useWorkflowStore';
import { DEMO_WORKFLOWS } from './data/demoWorkflows';

export default function DemoApp() {
  const { currentWorkflow, setCurrentWorkflow, loadWorkflows, saveWorkflow } = useWorkflowStore();
  const [debug, setDebug] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('DemoApp mounted');
    setDebug('DemoApp mounted, loading...');
    
    try {
      setCurrentWorkflow(DEMO_WORKFLOWS[0]);
      setDebug('DemoApp ready! ' + DEMO_WORKFLOWS[0].name);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  const handleSave = async (workflow: any) => {
    try {
      alert('Workflow saved successfully!');
    } catch (error) {
      alert('Error saving workflow: ' + error);
    }
  };

  if (error) {
    return <div style={{ padding: 20, color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
          <span style={{ color: '#6366f1' }}>AEM</span>Flow - Visual Workflow Builder
        </h1>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{debug}</div>
      </div>
      
      <div style={{ flex: 1 }}>
        <WorkflowBuilder workflow={DEMO_WORKFLOWS[0]} onSave={handleSave} />
      </div>
      
      <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#64748b' }}>
        <strong>Demo:</strong> Drag nodes, connect them, click &quot;Save Workflow&quot;.
      </div>
    </div>
  );
}