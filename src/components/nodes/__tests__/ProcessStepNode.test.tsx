import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProcessStepNode } from '../ProcessStepNode';

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  Cog: () => <div data-testid="cog-icon" />,
  Play: () => <div data-testid="play-icon" />,
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

describe('ProcessStepNode', () => {
  const defaultProps = {
    id: 'test-process-node',
    data: {
      label: 'Test Process',
      description: 'Test process description',
      processType: 'automated' as const,
    },
    selected: false,
  };

  it('renders process node with label', () => {
    render(<ProcessStepNode {...defaultProps} />);
    expect(screen.getByText('Test Process')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<ProcessStepNode {...defaultProps} />);
    expect(screen.getByText('Test process description')).toBeInTheDocument();
  });

  it('renders process type when provided', () => {
    render(<ProcessStepNode {...defaultProps} />);
    expect(screen.getByText('automated')).toBeInTheDocument();
  });

  it('renders process badge', () => {
    render(<ProcessStepNode {...defaultProps} />);
    expect(screen.getByText('Process')).toBeInTheDocument();
  });

  it('applies selected styling when selected', () => {
    const { container } = render(
      <ProcessStepNode {...defaultProps} selected={true} />
    );
    expect(container.firstChild).toHaveClass('border-orange-500');
  });

  it('applies default styling when not selected', () => {
    const { container } = render(
      <ProcessStepNode {...defaultProps} selected={false} />
    );
    expect(container.firstChild).toHaveClass('border-gray-300');
  });

  it('renders handles for connections', () => {
    render(<ProcessStepNode {...defaultProps} />);
    expect(screen.getByTestId('handle-target-top')).toBeInTheDocument();
    expect(screen.getByTestId('handle-source-bottom')).toBeInTheDocument();
  });

  it('shows play icon for automated processes', () => {
    render(
      <ProcessStepNode 
        {...defaultProps} 
        data={{ ...defaultProps.data, processType: 'automated' }}
      />
    );
    expect(screen.getByTestId('play-icon')).toBeInTheDocument();
  });

  it('does not show play icon for manual processes', () => {
    render(
      <ProcessStepNode 
        {...defaultProps} 
        data={{ ...defaultProps.data, processType: 'manual' }}
      />
    );
    expect(screen.queryByTestId('play-icon')).not.toBeInTheDocument();
  });

  it('renders without optional props', () => {
    const minimalProps = {
      id: 'test-process-node',
      data: { label: 'Minimal Process' },
      selected: false,
    };

    const { container } = render(<ProcessStepNode {...minimalProps} />);
    expect(screen.getByText('Minimal Process')).toBeInTheDocument();
    expect(screen.queryByText('Test process description')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cog-icon')).toBeInTheDocument();
  });
});