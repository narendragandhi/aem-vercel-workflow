import React from 'react';
import { render, screen } from '@testing-library/react';
import { CollaborationPanel } from '../../src/components/CollaborationPanel';

describe('CollaborationPanel', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when isOpen is true', () => {
    render(<CollaborationPanel {...defaultProps} />);
    expect(screen.getByText('Collaboration')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<CollaborationPanel {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Collaboration')).not.toBeInTheDocument();
  });

  it('should display current user name', () => {
    render(<CollaborationPanel {...defaultProps} />);
    expect(screen.getByText(/\(You\)/)).toBeInTheDocument();
  });

  it('should show online collaborators count', () => {
    render(<CollaborationPanel {...defaultProps} />);
    expect(screen.getByText(/other.*online/)).toBeInTheDocument();
  });

  it('should have a message input field', () => {
    render(<CollaborationPanel {...defaultProps} />);
    expect(screen.getByPlaceholderText(/Type a message/)).toBeInTheDocument();
  });

  it('should have a send button', () => {
    render(<CollaborationPanel {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});
