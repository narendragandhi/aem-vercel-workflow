import React from 'react';
import { render, screen } from '@testing-library/react';
import { StartEndNode } from '../StartEndNode';

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  PlayCircle: () => <div data-testid="play-circle-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
}));

// Mock Handle component
jest.mock('@reactflow/core', () => ({
  Handle: ({ type, position }: any) => (
    <div data-testid={`handle-${type}-${position}`} />
  ),
}));

describe('StartEndNode', () => {
  const defaultStartProps = {
    id: 'start-node',
    data: {
      label: 'Start',
      isStart: true,
      description: 'Workflow start point',
    },
    selected: false,
  };

  const defaultEndProps = {
    id: 'end-node',
    data: {
      label: 'End',
      isStart: false,
      description: 'Workflow end point',
    },
    selected: false,
  };

  it('renders start node with correct icon and styling', () => {
    render(<StartEndNode {...defaultStartProps} />);
    expect(screen.getByTestId('play-circle-icon')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('renders end node with correct icon and styling', () => {
    render(<StartEndNode {...defaultEndProps} />);
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    expect(screen.getByText('End')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<StartEndNode {...defaultStartProps} />);
    expect(screen.getByText('Workflow start point')).toBeInTheDocument();
  });

  it('applies correct styling for start node', () => {
    const { container } = render(<StartEndNode {...defaultStartProps} />);
    expect(container.firstChild).toHaveClass('border-green-400', 'bg-green-50');
  });

  it('applies correct styling for end node', () => {
    const { container } = render(<StartEndNode {...defaultEndProps} />);
    expect(container.firstChild).toHaveClass('border-red-400', 'bg-red-50');
  });

  it('applies selected styling when selected for start node', () => {
    const { container } = render(
      <StartEndNode {...defaultStartProps} selected={true} />
    );
    expect(container.firstChild).toHaveClass('border-green-500');
  });

  it('applies selected styling when selected for end node', () => {
    const { container } = render(
      <StartEndNode {...defaultEndProps} selected={true} />
    );
    expect(container.firstChild).toHaveClass('border-red-500');
  });

  it('renders source handle for start node', () => {
    render(<StartEndNode {...defaultStartProps} />);
    expect(screen.getByTestId('handle-source-Bottom')).toBeInTheDocument();
  });

  it('renders target handle for end node', () => {
    render(<StartEndNode {...defaultEndProps} />);
    expect(screen.getByTestId('handle-target-Top')).toBeInTheDocument();
  });

  it('defaults to start node when isStart is not specified', () => {
    const propsWithoutStartFlag = {
      id: 'test-node',
      data: { label: 'Default Start' },
      selected: false,
    };

    render(<StartEndNode {...propsWithoutStartFlag} />);
    expect(screen.getByTestId('play-circle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('handle-source-Bottom')).toBeInTheDocument();
  });

  it('renders without optional props', () => {
    const minimalProps = {
      id: 'minimal-node',
      data: { label: 'Minimal' },
      selected: false,
    };

    const { container } = render(<StartEndNode {...minimalProps} />);
    expect(screen.getByText('Minimal')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('border-green-400', 'bg-green-50');
    expect(screen.queryByText('Workflow start point')).not.toBeInTheDocument();
  });

  it('applies correct text color for start node', () => {
    const { container } = render(<StartEndNode {...defaultStartProps} />);
    expect(container.querySelector('.text-green-700')).toBeInTheDocument();
  });

  it('applies correct text color for end node', () => {
    const { container } = render(<StartEndNode {...defaultEndProps} />);
    expect(container.querySelector('.text-red-700')).toBeInTheDocument();
  });
});