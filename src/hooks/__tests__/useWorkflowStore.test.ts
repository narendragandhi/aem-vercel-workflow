import { renderHook, act } from '@testing-library/react';
import { useWorkflowStore } from '../useWorkflowStore';
import { WorkflowDefinition } from '@/types/workflow';

const mockWorkflow: WorkflowDefinition = {
  id: 'test-workflow',
  name: 'Test Workflow',
  description: 'A test workflow',
  steps: [],
  edges: [],
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  createdBy: 'test-user',
};

describe('useWorkflowStore', () => {
  beforeEach(() => {
    // Clear store state by creating a fresh store for each test
    const { unmount } = renderHook(() => useWorkflowStore());
    unmount();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useWorkflowStore());
    
    expect(result.current.currentWorkflow).toBeNull();
    expect(result.current.workflows).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets current workflow', () => {
    const { result } = renderHook(() => useWorkflowStore());
    
    act(() => {
      result.current.setCurrentWorkflow(mockWorkflow);
    });
    
    expect(result.current.currentWorkflow).toEqual(mockWorkflow);
  });

  it('updates existing workflow in workflows list', () => {
    const { result } = renderHook(() => useWorkflowStore());
    
    // Add initial workflow
    act(() => {
      result.current.addWorkflow(mockWorkflow);
    });
    
    // Update workflow
    const updatedWorkflow = { ...mockWorkflow, name: 'Updated Workflow' };
    act(() => {
      result.current.updateWorkflow(updatedWorkflow);
    });
    
    expect(result.current.workflows).toHaveLength(1);
    expect(result.current.workflows[0].name).toBe('Updated Workflow');
  });

  it('updates current workflow if it matches updated workflow', () => {
    const { result } = renderHook(() => useWorkflowStore());
    
    // Set current workflow
    act(() => {
      result.current.setCurrentWorkflow(mockWorkflow);
    });
    
    // Update workflow
    const updatedWorkflow = { ...mockWorkflow, name: 'Updated Workflow' };
    act(() => {
      result.current.updateWorkflow(updatedWorkflow);
    });
    
    expect(result.current.currentWorkflow?.name).toBe('Updated Workflow');
  });

  it('does not update current workflow if IDs do not match', () => {
    const { result } = renderHook(() => useWorkflowStore());
    
    // Set current workflow
    act(() => {
      result.current.setCurrentWorkflow(mockWorkflow);
    });
    
    // Update different workflow
    const differentWorkflow = { ...mockWorkflow, id: 'different-id', name: 'Different Workflow' };
    act(() => {
      result.current.updateWorkflow(differentWorkflow);
    });
    
    expect(result.current.currentWorkflow?.name).toBe(mockWorkflow.name);
  });

  it('adds workflow to workflows list', () => {
    // Create a completely fresh store instance
    const { result } = renderHook(() => useWorkflowStore(), { wrapper: undefined });
    
    act(() => {
      result.current.addWorkflow(mockWorkflow);
    });
    
    expect(result.current.workflows).toHaveLength(1);
    expect(result.current.workflows[0]).toEqual(mockWorkflow);
  });

  it('removes workflow from workflows list', () => {
    const { result } = renderHook(() => useWorkflowStore());
    
    // Add workflow first
    act(() => {
      result.current.addWorkflow(mockWorkflow);
    });
    
    // Remove workflow
    act(() => {
      result.current.removeWorkflow(mockWorkflow.id);
    });
    
    expect(result.current.workflows).toHaveLength(0);
  });

  it('clears current workflow if it matches removed workflow', () => {
    const { result } = renderHook(() => useWorkflowStore());
    
    // Set current workflow
    act(() => {
      result.current.setCurrentWorkflow(mockWorkflow);
    });
    
    // Remove workflow
    act(() => {
      result.current.removeWorkflow(mockWorkflow.id);
    });
    
    expect(result.current.currentWorkflow).toBeNull();
  });

  it('does not clear current workflow if IDs do not match', () => {
    const { result } = renderHook(() => useWorkflowStore());
    const differentWorkflow = { ...mockWorkflow, id: 'different-id' };
    
    // Set current workflow
    act(() => {
      result.current.setCurrentWorkflow(mockWorkflow);
    });
    
    // Remove different workflow
    act(() => {
      result.current.removeWorkflow(differentWorkflow.id);
    });
    
    expect(result.current.currentWorkflow).toEqual(mockWorkflow);
  });

  it('sets loading state', () => {
    const { result } = renderHook(() => useWorkflowStore());
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.setLoading(false);
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('sets and clears error state', () => {
    const { result } = renderHook(() => useWorkflowStore());
    
    act(() => {
      result.current.setError('Test error');
    });
    
    expect(result.current.error).toBe('Test error');
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });

  it('can add multiple workflows', () => {
    const { result } = renderHook(() => useWorkflowStore());
    const mockWorkflow2 = { ...mockWorkflow, id: 'test-workflow-2' };
    
    act(() => {
      result.current.addWorkflow(mockWorkflow);
      result.current.addWorkflow(mockWorkflow2);
    });
    
    expect(result.current.workflows).toHaveLength(2);
    expect(result.current.workflows[0]).toEqual(mockWorkflow);
    expect(result.current.workflows[1]).toEqual(mockWorkflow2);
  });
});