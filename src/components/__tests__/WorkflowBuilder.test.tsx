import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkflowBuilder } from '../WorkflowBuilder';
import { WorkflowDefinition } from '@/types/workflow';

// Mock ReactFlow components
jest.mock('@reactflow/core', () => ({
  ReactFlow: ({ children, onSave }: any) => (
    <div data-testid="react-flow">
      {children}
      {onSave && (
        <button onClick={() => onSave(mockWorkflowData)} data-testid="save-button">
          Save Workflow
        </button>
      )}
    </div>
  ),
  useNodesState: (initial: any) => [initial, jest.fn(), jest.fn()],
  useEdgesState: (initial: any) => [initial, jest.fn(), jest.fn()],
  addEdge: (edge: any, edges: any) => [...edges, edge],
  BackgroundVariant: {
    Dots: 'dots'
  }
}));

jest.mock('@reactflow/background', () => ({
  Background: ({ children }: any) => <div data-testid="background">{children}</div>,
  BackgroundVariant: { Dots: 'dots' },
}));

jest.mock('@reactflow/controls', () => ({
  Controls: () => <div data-testid="controls" />,
}));

jest.mock('@reactflow/minimap', () => ({
  MiniMap: () => <div data-testid="minimap" />,
}));

// Mock node components
jest.mock('../nodes/AEMStepNode', () => ({
  AEMStepNode: ({ data, selected }: any) => (
    <div data-testid="aem-step-node" data-selected={selected}>
      {data.label}
    </div>
  ),
}));

jest.mock('../nodes/ProcessStepNode', () => ({
  ProcessStepNode: ({ data, selected }: any) => (
    <div data-testid="process-step-node" data-selected={selected}>
      {data.label}
    </div>
  ),
}));

jest.mock('../nodes/StartEndNode', () => ({
  StartEndNode: ({ data, selected }: any) => (
    <div data-testid="start-end-node" data-selected={selected}>
      {data.label}
    </div>
  ),
}));

// Mock workflow store
jest.mock('@/hooks/useWorkflowStore', () => ({
  useWorkflowStore: () => ({
    currentWorkflow: null,
    setCurrentWorkflow: jest.fn(),
    updateWorkflow: jest.fn(),
  }),
}));

const mockWorkflowData: WorkflowDefinition = {
  id: 'test-workflow',
  name: 'Test Workflow',
  description: 'Test description',
  steps: [],
  edges: [],
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  createdBy: 'test-user',
};

describe('WorkflowBuilder', () => {
  const defaultProps = {
    onSave: jest.fn(),
    readOnly: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders workflow builder with default nodes', () => {
    render(<WorkflowBuilder {...defaultProps} />);
    
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    expect(screen.getByTestId('background')).toBeInTheDocument();
    expect(screen.getByTestId('controls')).toBeInTheDocument();
    expect(screen.getByTestId('minimap')).toBeInTheDocument();
  });

  it('renders start and end nodes by default', () => {
    render(<WorkflowBuilder {...defaultProps} />);
    
    const startEndNodes = screen.getAllByTestId('start-end-node');
    expect(startEndNodes).toHaveLength(2);
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('End')).toBeInTheDocument();
  });

  it('renders save button when not in read-only mode', () => {
    render(<WorkflowBuilder {...defaultProps} />);
    
    expect(screen.getByText('Save Workflow')).toBeInTheDocument();
  });

  it('does not render save button in read-only mode', () => {
    render(<WorkflowBuilder {...defaultProps} readOnly={true} />);
    
    expect(screen.queryByText('Save Workflow')).not.toBeInTheDocument();
  });

  it('loads workflow data when provided', () => {
    const mockWorkflow = {
      ...mockWorkflowData,
      steps: [
        {
          id: 'step-1',
          type: 'aemStep',
          position: { x: 100, y: 100 },
          data: { label: 'Test Step' },
        },
      ],
    };

    render(<WorkflowBuilder {...defaultProps} workflow={mockWorkflow} />);
    
    expect(screen.getByText('Test Step')).toBeInTheDocument();
  });

  it('calls onSave with workflow data when save is clicked', async () => {
    const mockOnSave = jest.fn();
    render(<WorkflowBuilder {...defaultProps} onSave={mockOnSave} />);
    
    const saveButton = screen.getByText('Save Workflow');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
    
    const savedWorkflow = mockOnSave.mock.calls[0][0];
    expect(savedWorkflow).toHaveProperty('id');
    expect(savedWorkflow).toHaveProperty('name');
    expect(savedWorkflow).toHaveProperty('steps');
    expect(savedWorkflow).toHaveProperty('edges');
  });

  it('generates workflow ID when not provided', () => {
    const mockOnSave = jest.fn();
    render(<WorkflowBuilder {...defaultProps} onSave={mockOnSave} />);
    
    const saveButton = screen.getByText('Save Workflow');
    fireEvent.click(saveButton);
    
    const savedWorkflow = mockOnSave.mock.calls[0][0];
    expect(savedWorkflow.id).toMatch(/^workflow-\d+$/);
  });

  it('uses existing workflow ID when provided', () => {
    const existingWorkflow = { ...mockWorkflowData };
    const mockOnSave = jest.fn();
    
    render(
      <WorkflowBuilder 
        {...defaultProps} 
        workflow={existingWorkflow}
        onSave={mockOnSave}
      />
    );
    
    const saveButton = screen.getByText('Save Workflow');
    fireEvent.click(saveButton);
    
    const savedWorkflow = mockOnSave.mock.calls[0][0];
    expect(savedWorkflow.id).toBe(existingWorkflow.id);
  });

  it('includes start and end nodes in saved workflow', () => {
    const mockOnSave = jest.fn();
    render(<WorkflowBuilder {...defaultProps} onSave={mockOnSave} />);
    
    const saveButton = screen.getByText('Save Workflow');
    fireEvent.click(saveButton);
    
    const savedWorkflow = mockOnSave.mock.calls[0][0];
    expect(savedWorkflow.steps).toHaveLength(2);
    
    const startNode = savedWorkflow.steps.find(step => step.id === 'start');
    const endNode = savedWorkflow.steps.find(step => step.id === 'end');
    
    expect(startNode).toBeDefined();
    expect(startNode?.data.label).toBe('Start');
    expect(endNode).toBeDefined();
    expect(endNode?.data.label).toBe('End');
  });

  it('preserves workflow metadata when saving', () => {
    const existingWorkflow = {
      ...mockWorkflowData,
      name: 'Existing Workflow',
      description: 'Existing description',
      variables: { var1: 'value1' },
    };
    
    const mockOnSave = jest.fn();
    render(
      <WorkflowBuilder 
        {...defaultProps} 
        workflow={existingWorkflow}
        onSave={mockOnSave}
      />
    );
    
    const saveButton = screen.getByText('Save Workflow');
    fireEvent.click(saveButton);
    
    const savedWorkflow = mockOnSave.mock.calls[0][0];
    expect(savedWorkflow.name).toBe('Existing Workflow');
    expect(savedWorkflow.description).toBe('Existing description');
    expect(savedWorkflow.variables).toEqual({ var1: 'value1' });
  });

  it('sets createdBy to admin by default', () => {
    const mockOnSave = jest.fn();
    render(<WorkflowBuilder {...defaultProps} onSave={mockOnSave} />);
    
    const saveButton = screen.getByText('Save Workflow');
    fireEvent.click(saveButton);
    
    const savedWorkflow = mockOnSave.mock.calls[0][0];
    expect(savedWorkflow.createdBy).toBe('admin');
  });

  it('updates timestamp when saving', () => {
    const mockOnSave = jest.fn();
    render(<WorkflowBuilder {...defaultProps} onSave={mockOnSave} />);
    
    const saveButton = screen.getByText('Save Workflow');
    fireEvent.click(saveButton);
    
    const savedWorkflow = mockOnSave.mock.calls[0][0];
    expect(savedWorkflow.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});