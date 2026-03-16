import React from 'react';
import { render, screen } from '@testing-library/react';
import { AEMStepNode } from '../AEMStepNode';

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  ExternalLink: () => <div data-testid="external-link-icon" />,
  GitBranch: () => <div data-testid="git-branch-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
}));

// Mock Handle component
jest.mock('@reactflow/core', () => ({
  Handle: ({ type, position }: any) => (
    <div data-testid={`handle-${type}-${position}`} />
  ),
  Position: {
    Top: 'top',
    Bottom: 'bottom'
  }
}));

describe('AEMStepNode', () => {
  const defaultProps = {
    id: 'test-node',
    data: {
      label: 'Test Step',
      description: 'Test description',
      participant: 'Test User',
      stepType: 'participant' as const,
    },
    selected: false,
  };

  it('renders node with label', () => {
    render(<AEMStepNode {...defaultProps} />);
    expect(screen.getByText('Test Step')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<AEMStepNode {...defaultProps} />);
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders participant when provided', () => {
    render(<AEMStepNode {...defaultProps} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders step type badge', () => {
    render(<AEMStepNode {...defaultProps} />);
    expect(screen.getByText('participant')).toBeInTheDocument();
  });

  it('applies selected styling when selected', () => {
    const { container } = render(
      <AEMStepNode {...defaultProps} selected={true} />
    );
    expect(container.firstChild).toHaveClass('border-blue-500');
  });

  it('renders default styling when not selected', () => {
    const { container } = render(
      <AEMStepNode {...defaultProps} selected={false} />
    );
    // Component uses colored borders based on stepType (participant = blue)
    expect(container.firstChild).toHaveClass('border-blue-300');
  });

  it('renders handles for connections', () => {
    render(<AEMStepNode {...defaultProps} />);
    expect(screen.getByTestId('handle-target-top')).toBeInTheDocument();
    expect(screen.getByTestId('handle-source-bottom')).toBeInTheDocument();
  });

  it('applies correct step type color', () => {
    const { container } = render(
      <AEMStepNode {...defaultProps} data={{ ...defaultProps.data, stepType: 'process' as const }} />
    );
    // Process stepType uses green border color
    expect(container.firstChild).toHaveClass('border-green-300');
  });

  it('renders without optional props', () => {
    const minimalProps = {
      id: 'test-node',
      data: { label: 'Minimal Step' },
      selected: false,
    };

    render(<AEMStepNode {...minimalProps} />);
    expect(screen.getByText('Minimal Step')).toBeInTheDocument();
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    // Without stepType, participant badge won't appear
    expect(screen.queryByText('participant')).not.toBeInTheDocument();
  });
});