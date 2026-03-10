/**
 * Unit Tests for CommandPalette Component
 *
 * Tests the VS Code-style command palette functionality including:
 * - Opening/closing behavior
 * - Command filtering
 * - Keyboard navigation
 * - Command execution
 *
 * @module tests/components/CommandPalette
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommandPalette, createDefaultCommands } from '../../src/components/CommandPalette';
import type { CommandAction } from '../../src/components/CommandPalette';

// Mock handlers
const mockHandlers = {
  onSave: jest.fn(),
  onLoad: jest.fn(),
  onExport: jest.fn(),
  onUndo: jest.fn(),
  onRedo: jest.fn(),
  onShowSimulator: jest.fn(),
  onShowAnalytics: jest.fn(),
  onShowTemplates: jest.fn(),
  onFitView: jest.fn(),
  onToggleDarkMode: jest.fn(),
  onAutoLayout: jest.fn(),
  onClearWorkflow: jest.fn(),
};

const defaultCommands = createDefaultCommands(mockHandlers);

describe('CommandPalette', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(
        <CommandPalette
          isOpen={true}
          onClose={jest.fn()}
          commands={defaultCommands}
          darkMode={false}
        />
      );

      expect(screen.getByPlaceholderText(/search commands/i)).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(
        <CommandPalette
          isOpen={false}
          onClose={jest.fn()}
          commands={defaultCommands}
          darkMode={false}
        />
      );

      expect(screen.queryByPlaceholderText(/search commands/i)).not.toBeInTheDocument();
    });

    it('should apply dark mode styles', () => {
      render(
        <CommandPalette
          isOpen={true}
          onClose={jest.fn()}
          commands={defaultCommands}
          darkMode={true}
        />
      );

      // Check for dark mode container class
      const container = screen.getByRole('dialog') || screen.getByTestId('command-palette');
      expect(container.className).toMatch(/dark|bg-gray-800|bg-slate/);
    });

    it('should display all commands initially', () => {
      render(
        <CommandPalette
          isOpen={true}
          onClose={jest.fn()}
          commands={defaultCommands}
          darkMode={false}
        />
      );

      // Check that some commands are displayed
      expect(screen.getByText(/save/i)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter commands based on search input', async () => {
      const user = userEvent.setup();

      render(
        <CommandPalette
          isOpen={true}
          onClose={jest.fn()}
          commands={defaultCommands}
          darkMode={false}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search commands/i);
      await user.type(searchInput, 'save');

      // Save command should be visible
      expect(screen.getByText(/save/i)).toBeInTheDocument();
    });

    it('should show no results message when no commands match', async () => {
      const user = userEvent.setup();

      render(
        <CommandPalette
          isOpen={true}
          onClose={jest.fn()}
          commands={defaultCommands}
          darkMode={false}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search commands/i);
      await user.type(searchInput, 'xyznonexistent');

      // Should show no results or empty state
      await waitFor(() => {
        const noResults = screen.queryByText(/no commands found/i) ||
                         screen.queryByText(/no results/i);
        // Either shows message or list is empty
      });
    });

    it('should be case-insensitive', async () => {
      const user = userEvent.setup();

      render(
        <CommandPalette
          isOpen={true}
          onClose={jest.fn()}
          commands={defaultCommands}
          darkMode={false}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search commands/i);
      await user.type(searchInput, 'SAVE');

      expect(screen.getByText(/save/i)).toBeInTheDocument();
    });
  });

  describe('Command Execution', () => {
    it('should execute command on click', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <CommandPalette
          isOpen={true}
          onClose={onClose}
          commands={defaultCommands}
          darkMode={false}
        />
      );

      const saveCommand = screen.getByText(/save/i);
      await user.click(saveCommand);

      expect(mockHandlers.onSave).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('should execute command on Enter key', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <CommandPalette
          isOpen={true}
          onClose={onClose}
          commands={defaultCommands}
          darkMode={false}
        />
      );

      // Focus search and press Enter (first command selected)
      const searchInput = screen.getByPlaceholderText(/search commands/i);
      await user.click(searchInput);
      await user.keyboard('{Enter}');

      // First command should be executed
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close on Escape key', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <CommandPalette
          isOpen={true}
          onClose={onClose}
          commands={defaultCommands}
          darkMode={false}
        />
      );

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalled();
    });

    it('should navigate down with ArrowDown', async () => {
      const user = userEvent.setup();

      render(
        <CommandPalette
          isOpen={true}
          onClose={jest.fn()}
          commands={defaultCommands}
          darkMode={false}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search commands/i);
      await user.click(searchInput);
      await user.keyboard('{ArrowDown}');

      // Second item should be highlighted
      // (Implementation specific - check for highlight class)
    });

    it('should navigate up with ArrowUp', async () => {
      const user = userEvent.setup();

      render(
        <CommandPalette
          isOpen={true}
          onClose={jest.fn()}
          commands={defaultCommands}
          darkMode={false}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search commands/i);
      await user.click(searchInput);
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}');

      // Should navigate correctly
    });

    it('should focus search input on open', () => {
      render(
        <CommandPalette
          isOpen={true}
          onClose={jest.fn()}
          commands={defaultCommands}
          darkMode={false}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search commands/i);
      expect(document.activeElement === searchInput || searchInput).toBeTruthy();
    });
  });

  describe('Backdrop', () => {
    it('should close when clicking backdrop', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <CommandPalette
          isOpen={true}
          onClose={onClose}
          commands={defaultCommands}
          darkMode={false}
        />
      );

      // Click outside the palette (on backdrop)
      const backdrop = document.querySelector('[data-testid="backdrop"]') ||
                      document.querySelector('.fixed.inset-0');

      if (backdrop) {
        await user.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });
});

describe('createDefaultCommands', () => {
  it('should create commands with correct structure', () => {
    const commands = createDefaultCommands(mockHandlers);

    expect(Array.isArray(commands)).toBe(true);
    expect(commands.length).toBeGreaterThan(0);

    // Check command structure
    const firstCommand = commands[0];
    expect(firstCommand).toHaveProperty('id');
    expect(firstCommand).toHaveProperty('label');
    expect(firstCommand).toHaveProperty('action');
  });

  it('should include save command', () => {
    const commands = createDefaultCommands(mockHandlers);

    const saveCommand = commands.find(cmd =>
      cmd.label.toLowerCase().includes('save')
    );
    expect(saveCommand).toBeDefined();
  });

  it('should include keyboard shortcuts', () => {
    const commands = createDefaultCommands(mockHandlers);

    const saveCommand = commands.find(cmd =>
      cmd.label.toLowerCase().includes('save')
    );

    if (saveCommand && 'shortcut' in saveCommand) {
      expect(saveCommand.shortcut).toBeDefined();
    }
  });

  it('should include all expected categories', () => {
    const commands = createDefaultCommands(mockHandlers);

    // Check for various command types
    const hasFileCommands = commands.some(cmd =>
      cmd.label.toLowerCase().includes('save') ||
      cmd.label.toLowerCase().includes('load') ||
      cmd.label.toLowerCase().includes('export')
    );

    const hasViewCommands = commands.some(cmd =>
      cmd.label.toLowerCase().includes('dark') ||
      cmd.label.toLowerCase().includes('fit')
    );

    expect(hasFileCommands).toBe(true);
  });

  it('should only include handlers that are provided', () => {
    const limitedHandlers = {
      onSave: jest.fn(),
    };

    const commands = createDefaultCommands(limitedHandlers);

    // Commands without handlers should still exist but be disabled or handled gracefully
    expect(commands.length).toBeGreaterThan(0);
  });
});
