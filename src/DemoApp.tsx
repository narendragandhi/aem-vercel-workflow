import React from 'react';
import { WorkflowBuilder } from './components/WorkflowBuilder';
import { useWorkflowStore } from './hooks/useWorkflowStore';
import { DEMO_WORKFLOWS } from './data/demoWorkflows';

export default function DemoApp() {
  const { setCurrentWorkflow, loadWorkflows, saveWorkflow } = useWorkflowStore();

  // Load demo data on mount
  React.useEffect(() => {
    const initDemo = async () => {
      // Load demo workflows
      await loadWorkflows();
      // Set first demo as current
      if (DEMO_WORKFLOWS.length > 0) {
        setCurrentWorkflow(DEMO_WORKFLOWS[0]);
      }
    };
    initDemo();
  }, []);

  const handleSave = async (workflow: any) => {
    try {
      await saveWorkflow(workflow);
      alert('Workflow saved successfully!');
    } catch (error) {
      alert('Error saving workflow: ' + error);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f8fafc', 
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
          AEM Vercel Workflow Builder - Demo
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setCurrentWorkflow(DEMO_WORKFLOWS[0])}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Load Approval Workflow
          </button>
          <button 
            onClick={() => setCurrentWorkflow(DEMO_WORKFLOWS[1])}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#10b981', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Load Asset Workflow
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1 }}>
        <WorkflowBuilder onSave={handleSave} />
      </div>
      
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f1f5f9', 
        borderTop: '1px solid #e2e8f0',
        fontSize: '0.875rem',
        color: '#64748b'
      }}>
        <strong>🎯 Demo Instructions:</strong> 
        {' '}Drag nodes, connect them with edges, then click "Save Workflow". 
        {' '}Try switching between workflows using the buttons above.
      </div>
    </div>
  );
}