import React, { useState, useEffect } from 'react';
import { WorkflowBuilder } from '@/components/WorkflowBuilder';
import { workflowService } from '@/services/workflowService';
import { WorkflowDefinition } from '@/types/workflow';

/**
 * Example 1: Basic Workflow Builder
 * Shows a simple workflow builder with save functionality
 */
export const BasicWorkflowBuilder = () => {
  const handleSave = (workflow: WorkflowDefinition) => {
    console.log('Saving workflow:', workflow);
    // Here you would typically save to your backend
    alert(`Workflow "${workflow.name}" saved with ${workflow.steps.length} steps`);
  };

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
      <h2>Basic Workflow Builder</h2>
      <WorkflowBuilder onSave={handleSave} />
    </div>
  );
};

/**
 * Example 2: Workflow Editor with Existing Workflow
 * Shows loading and editing an existing workflow
 */
export const WorkflowEditor = ({ workflowId }: { workflowId: string }) => {
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        setLoading(true);
        const data = await workflowService.getWorkflow(workflowId);
        setWorkflow(data);
        setError(null);
      } catch (err) {
        setError('Failed to load workflow');
        console.error('Error loading workflow:', err);
      } finally {
        setLoading(false);
      }
    };

    if (workflowId) {
      loadWorkflow();
    }
  }, [workflowId]);

  const handleSave = async (updatedWorkflow: WorkflowDefinition) => {
    try {
      const saved = await workflowService.saveWorkflow(updatedWorkflow);
      setWorkflow(saved);
      alert('Workflow saved successfully!');
    } catch (err) {
      setError('Failed to save workflow');
      console.error('Error saving workflow:', err);
    }
  };

  if (loading) {
    return <div>Loading workflow...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
      <h2>Editing Workflow: {workflow?.name}</h2>
      <WorkflowBuilder 
        workflow={workflow || undefined} 
        onSave={handleSave}
      />
    </div>
  );
};

/**
 * Example 3: Read-only Workflow Viewer
 * Shows a workflow in view-only mode
 */
export const WorkflowViewer = ({ workflow }: { workflow: WorkflowDefinition }) => {
  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
      <h2>Viewing Workflow: {workflow.name}</h2>
      <p>{workflow.description}</p>
      <WorkflowBuilder workflow={workflow} readOnly={true} />
    </div>
  );
};

/**
 * Example 4: Workflow Manager with List and Editor
 * Shows a complete workflow management interface
 */
export const WorkflowManager = () => {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        setLoading(true);
        const data = await workflowService.getWorkflows();
        setWorkflows(data);
        setError(null);
      } catch (err) {
        setError('Failed to load workflows');
        console.error('Error loading workflows:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflows();
  }, []);

  const handleSave = async (workflow: WorkflowDefinition) => {
    try {
      const saved = await workflowService.saveWorkflow(workflow);
      setWorkflows(prev => 
        prev.map(w => w.id === saved.id ? saved : w)
      );
      setSelectedWorkflow(saved);
      alert('Workflow saved successfully!');
    } catch (err) {
      setError('Failed to save workflow');
      console.error('Error saving workflow:', err);
    }
  };

  const handleDelete = async (workflowId: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await workflowService.deleteWorkflow(workflowId);
        setWorkflows(prev => prev.filter(w => w.id !== workflowId));
        if (selectedWorkflow?.id === workflowId) {
          setSelectedWorkflow(null);
        }
        alert('Workflow deleted successfully!');
      } catch (err) {
        setError('Failed to delete workflow');
        console.error('Error deleting workflow:', err);
      }
    }
  };

  const createNewWorkflow = () => {
    const newWorkflow: WorkflowDefinition = {
      id: `workflow-${Date.now()}`,
      name: 'New Workflow',
      description: 'A new workflow',
      steps: [],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
    };
    setSelectedWorkflow(newWorkflow);
  };

  if (loading) {
    return <div>Loading workflows...</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar with workflow list */}
      <div style={{ width: '300px', borderRight: '1px solid #ccc', padding: '20px' }}>
        <h3>Workflows</h3>
        <button 
          onClick={createNewWorkflow}
          style={{ 
            marginBottom: '20px', 
            padding: '10px 15px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px' 
          }}
        >
          Create New Workflow
        </button>
        
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {workflows.map(workflow => (
            <li 
              key={workflow.id} 
              style={{ 
                marginBottom: '10px', 
                padding: '10px', 
                border: selectedWorkflow?.id === workflow.id ? '2px solid #007bff' : '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <div onClick={() => setSelectedWorkflow(workflow)}>
                <strong>{workflow.name}</strong>
                <br />
                <small>{workflow.description}</small>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(workflow.id);
                }}
                style={{ 
                  marginTop: '5px', 
                  padding: '5px 10px', 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main workflow editor area */}
      <div style={{ flex: 1, padding: '20px' }}>
        {selectedWorkflow ? (
          <div style={{ height: '100%' }}>
            <h2>Editing: {selectedWorkflow.name}</h2>
            <WorkflowBuilder 
              workflow={selectedWorkflow} 
              onSave={handleSave}
            />
          </div>
        ) : (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#666'
          }}>
            Select a workflow to edit or create a new one
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Example 5: Workflow Execution Demo
 * Shows how to execute workflows and view results
 */
export const WorkflowExecutor = () => {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const data = await workflowService.getWorkflows();
        setWorkflows(data);
      } catch (err) {
        setError('Failed to load workflows');
        console.error('Error loading workflows:', err);
      }
    };

    loadWorkflows();
  }, []);

  const handleExecute = async () => {
    if (!selectedWorkflow) return;

    try {
      setExecuting(true);
      setError(null);
      const result = await workflowService.executeWorkflow(selectedWorkflow.id);
      setExecutionResult(result);
      alert('Workflow executed successfully!');
    } catch (err) {
      setError('Failed to execute workflow');
      console.error('Error executing workflow:', err);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Workflow Executor</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="workflow-select">Select Workflow: </label>
        <select 
          id="workflow-select"
          value={selectedWorkflow?.id || ''}
          onChange={(e) => {
            const workflow = workflows.find(w => w.id === e.target.value);
            setSelectedWorkflow(workflow || null);
          }}
          style={{ marginLeft: '10px', padding: '5px' }}
        >
          <option value="">Choose a workflow...</option>
          {workflows.map(workflow => (
            <option key={workflow.id} value={workflow.id}>
              {workflow.name}
            </option>
          ))}
        </select>
        
        <button 
          onClick={handleExecute}
          disabled={!selectedWorkflow || executing}
          style={{ 
            marginLeft: '10px', 
            padding: '5px 15px', 
            backgroundColor: executing ? '#ccc' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px' 
          }}
        >
          {executing ? 'Executing...' : 'Execute Workflow'}
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      {selectedWorkflow && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Selected Workflow</h3>
          <p><strong>Name:</strong> {selectedWorkflow.name}</p>
          <p><strong>Description:</strong> {selectedWorkflow.description}</p>
          <p><strong>Steps:</strong> {selectedWorkflow.steps.length}</p>
          
          <div style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}>
            <WorkflowBuilder workflow={selectedWorkflow} readOnly={true} />
          </div>
        </div>
      )}

      {executionResult && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px' }}>
          <h3>Execution Result</h3>
          <pre>{JSON.stringify(executionResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};