/**
 * Command Palette Component
 *
 * A VS Code-style command palette for quick actions:
 * - Keyboard shortcut: Cmd/Ctrl + K
 * - Fuzzy search for commands
 * - Recent commands
 * - Categorized actions
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, ArrowRightCircle, BarChart3, CheckCircle, Clipboard, Cog, Command, Copy,
  Download, Eye, EyeOff, FileText, FileUp, GitBranch, Globe,
  HelpCircle, Image, Keyboard, Layout, Library, Mail, Maximize2, Moon,
  Play, Plus, Redo2, RotateCcw, Save, Search,
  Settings, Sparkles, Sun, Trash2, Undo2, Upload, User,
  X, ZoomIn, ZoomOut
} from 'lucide-react';

export interface CommandAction {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  icon: React.ReactNode;
  category: 'file' | 'edit' | 'view' | 'workflow' | 'tools' | 'node';
  action: () => void;
  disabled?: boolean;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandAction[];
  darkMode?: boolean;
  recentCommands?: string[];
  onCommandExecuted?: (commandId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
  darkMode = false,
  recentCommands = [],
  onCommandExecuted,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search) {
      // Show recent commands first, then all commands
      const recent = recentCommands
        .map(id => commands.find(c => c.id === id))
        .filter(Boolean) as CommandAction[];
      const others = commands.filter(c => !recentCommands.includes(c.id));
      return [...recent, ...others];
    }

    const searchLower = search.toLowerCase();
    return commands
      .filter(cmd =>
        cmd.label.toLowerCase().includes(searchLower) ||
        cmd.description?.toLowerCase().includes(searchLower) ||
        cmd.category.toLowerCase().includes(searchLower)
      )
      .sort((a, b) => {
        // Prioritize matches at the start of the label
        const aStartsWith = a.label.toLowerCase().startsWith(searchLower);
        const bStartsWith = b.label.toLowerCase().startsWith(searchLower);
        if (aStartsWith && !bStartsWith) {return -1;}
        if (!aStartsWith && bStartsWith) {return 1;}
        return 0;
      });
  }, [commands, search, recentCommands]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = listRef.current?.children[selectedIndex] as HTMLElement;
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex] && !filteredCommands[selectedIndex].disabled) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filteredCommands, selectedIndex, onClose]);

  // Execute command
  const executeCommand = useCallback((command: CommandAction) => {
    command.action();
    onCommandExecuted?.(command.id);
    onClose();
  }, [onClose, onCommandExecuted]);

  if (!isOpen) {return null;}

  const bgColor = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const secondaryText = darkMode ? '#94a3b8' : '#64748b';
  const hoverBg = darkMode ? '#334155' : '#f1f5f9';
  const selectedBg = darkMode ? '#3b82f620' : '#3b82f610';

  const categoryColors: Record<string, string> = {
    file: '#10b981',
    edit: '#f59e0b',
    view: '#8b5cf6',
    workflow: '#3b82f6',
    tools: '#ec4899',
    node: '#06b6d4',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: bgColor,
          borderRadius: '12px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '60vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div style={{
          padding: '16px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <Search size={20} style={{ color: secondaryText }} />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '16px',
              color: textColor,
            }}
          />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            background: darkMode ? '#334155' : '#f1f5f9',
            borderRadius: '4px',
            fontSize: '11px',
            color: secondaryText,
          }}>
            <Command size={12} /> K
          </div>
        </div>

        {/* Commands list */}
        <div
          ref={listRef}
          style={{
            maxHeight: 'calc(60vh - 70px)',
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {filteredCommands.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '32px',
              color: secondaryText,
            }}>
              No commands found for "{search}"
            </div>
          ) : (
            <>
              {/* Group by category if not searching */}
              {!search && (
                <div style={{
                  padding: '8px 12px 4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: secondaryText,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {recentCommands.length > 0 ? 'Recent' : 'All Commands'}
                </div>
              )}

              {filteredCommands.map((command, index) => (
                <div
                  key={command.id}
                  onClick={() => !command.disabled && executeCommand(command)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: command.disabled ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: index === selectedIndex ? selectedBg : 'transparent',
                    opacity: command.disabled ? 0.5 : 1,
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `${categoryColors[command.category]}15`,
                    color: categoryColors[command.category],
                  }}>
                    {command.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: textColor,
                      marginBottom: '2px',
                    }}>
                      {command.label}
                    </div>
                    {command.description && (
                      <div style={{ fontSize: '12px', color: secondaryText }}>
                        {command.description}
                      </div>
                    )}
                  </div>

                  {command.shortcut && (
                    <div style={{
                      display: 'flex',
                      gap: '4px',
                    }}>
                      {command.shortcut.split('+').map((key, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '4px 8px',
                            background: darkMode ? '#334155' : '#e2e8f0',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 500,
                            color: secondaryText,
                          }}
                        >
                          {key}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div style={{
          padding: '8px 16px',
          borderTop: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          fontSize: '11px',
          color: secondaryText,
        }}>
          <span><strong>↑↓</strong> Navigate</span>
          <span><strong>Enter</strong> Select</span>
          <span><strong>Esc</strong> Close</span>
        </div>
      </div>
    </div>
  );
};

// Keyboard shortcuts panel
interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  isOpen,
  onClose,
  darkMode = false,
}) => {
  if (!isOpen) {return null;}

  const shortcuts = [
    { category: 'General', items: [
      { keys: ['Cmd/Ctrl', 'K'], action: 'Open command palette' },
      { keys: ['Cmd/Ctrl', 'S'], action: 'Save workflow' },
      { keys: ['Cmd/Ctrl', 'Z'], action: 'Undo' },
      { keys: ['Cmd/Ctrl', 'Shift', 'Z'], action: 'Redo' },
      { keys: ['Cmd/Ctrl', 'Y'], action: 'Redo (alternative)' },
      { keys: ['Esc'], action: 'Deselect / Close modal' },
    ]},
    { category: 'Canvas', items: [
      { keys: ['Scroll'], action: 'Zoom in/out' },
      { keys: ['Drag'], action: 'Pan canvas' },
      { keys: ['+'], action: 'Zoom in' },
      { keys: ['-'], action: 'Zoom out' },
      { keys: ['0'], action: 'Fit view' },
    ]},
    { category: 'Nodes', items: [
      { keys: ['Delete'], action: 'Delete selected node' },
      { keys: ['Backspace'], action: 'Delete selected node' },
      { keys: ['Cmd/Ctrl', 'C'], action: 'Copy node' },
      { keys: ['Cmd/Ctrl', 'V'], action: 'Paste node' },
      { keys: ['Cmd/Ctrl', 'D'], action: 'Duplicate node' },
    ]},
  ];

  const bgColor = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const secondaryText = darkMode ? '#94a3b8' : '#64748b';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: bgColor,
          borderRadius: '12px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Keyboard size={24} style={{ color: '#8b5cf6' }} />
            <h2 style={{ margin: 0, color: textColor, fontSize: '18px' }}>Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: textColor,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '16px 24px', maxHeight: 'calc(80vh - 120px)', overflowY: 'auto' }}>
          {shortcuts.map(section => (
            <div key={section.category} style={{ marginBottom: '24px' }}>
              <h3 style={{
                margin: '0 0 12px',
                fontSize: '13px',
                fontWeight: 600,
                color: secondaryText,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {section.category}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {section.items.map((shortcut, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                    }}
                  >
                    <span style={{ fontSize: '13px', color: textColor }}>{shortcut.action}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          <span style={{
                            padding: '4px 10px',
                            background: darkMode ? '#334155' : '#f1f5f9',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: textColor,
                            border: `1px solid ${borderColor}`,
                          }}>
                            {key}
                          </span>
                          {i < shortcut.keys.length - 1 && (
                            <span style={{ color: secondaryText, alignSelf: 'center' }}>+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          padding: '12px 24px',
          borderTop: `1px solid ${borderColor}`,
          textAlign: 'center',
          fontSize: '12px',
          color: secondaryText,
        }}>
          Press <strong>Cmd/Ctrl + K</strong> to open the command palette
        </div>
      </div>
    </div>
  );
};

// Default commands generator
export const createDefaultCommands = (handlers: {
  onSave?: () => void;
  onLoad?: () => void;
  onExport?: () => void;
  onExportXML?: () => void;
  onExportJSON?: () => void;
  onExportYAML?: () => void;
  onExportMarkdown?: () => void;
  onImport?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onAutoLayout?: () => void;
  onShowTemplates?: () => void;
  onShowAI?: () => void;
  onShowStats?: () => void;
  onShowSimulator?: () => void;
  onShowAnalytics?: () => void;
  onShowDocGenerator?: () => void;
  onToggleDarkMode?: () => void;
  onShowShortcuts?: () => void;
  onAddNode?: (type: string) => void;
  onValidate?: () => void;
  onClear?: () => void;
  onFitView?: () => void;
  onNewWorkflow?: () => void;
}): CommandAction[] => [
  // File commands
  {
    id: 'save',
    label: 'Save Workflow',
    description: 'Save current workflow to storage',
    shortcut: 'Cmd+S',
    icon: <Save size={16} />,
    category: 'file',
    action: handlers.onSave || (() => {}),
  },
  {
    id: 'load',
    label: 'Load Workflow',
    description: 'Load workflow from storage',
    icon: <Upload size={16} />,
    category: 'file',
    action: handlers.onLoad || (() => {}),
  },
  {
    id: 'export',
    label: 'Export to AEM XML',
    description: 'Export workflow as AEM-compatible XML',
    icon: <Download size={16} />,
    category: 'file',
    action: handlers.onExport || (() => {}),
  },
  {
    id: 'import',
    label: 'Import from XML',
    description: 'Import existing AEM workflow XML',
    icon: <FileUp size={16} />,
    category: 'file',
    action: handlers.onImport || (() => {}),
  },
  {
    id: 'export-json',
    label: 'Export to JSON',
    description: 'Export workflow as JSON file',
    icon: <FileText size={16} />,
    category: 'file',
    action: handlers.onExportJSON || (() => {}),
  },
  {
    id: 'export-yaml',
    label: 'Export to YAML',
    description: 'Export workflow as YAML file',
    icon: <FileText size={16} />,
    category: 'file',
    action: handlers.onExportYAML || (() => {}),
  },
  {
    id: 'export-markdown',
    label: 'Export to Markdown',
    description: 'Export workflow documentation',
    icon: <FileText size={16} />,
    category: 'file',
    action: handlers.onExportMarkdown || (() => {}),
  },
  {
    id: 'new-workflow',
    label: 'New Workflow',
    description: 'Start a new workflow',
    shortcut: 'Cmd+N',
    icon: <Plus size={16} />,
    category: 'file',
    action: handlers.onNewWorkflow || (() => {}),
  },

  // Edit commands
  {
    id: 'undo',
    label: 'Undo',
    description: 'Undo last action',
    shortcut: 'Cmd+Z',
    icon: <Undo2 size={16} />,
    category: 'edit',
    action: handlers.onUndo || (() => {}),
  },
  {
    id: 'redo',
    label: 'Redo',
    description: 'Redo last undone action',
    shortcut: 'Cmd+Shift+Z',
    icon: <Redo2 size={16} />,
    category: 'edit',
    action: handlers.onRedo || (() => {}),
  },
  {
    id: 'clear',
    label: 'Clear Workflow',
    description: 'Remove all nodes except Start/End',
    icon: <Trash2 size={16} />,
    category: 'edit',
    action: handlers.onClear || (() => {}),
  },

  // View commands
  {
    id: 'auto-layout',
    label: 'Auto Layout',
    description: 'Automatically arrange nodes',
    icon: <Layout size={16} />,
    category: 'view',
    action: handlers.onAutoLayout || (() => {}),
  },
  {
    id: 'fit-view',
    label: 'Fit View',
    description: 'Fit all nodes in view',
    shortcut: '0',
    icon: <Maximize2 size={16} />,
    category: 'view',
    action: handlers.onFitView || (() => {}),
  },
  {
    id: 'toggle-dark-mode',
    label: 'Toggle Dark Mode',
    description: 'Switch between light and dark theme',
    icon: <Moon size={16} />,
    category: 'view',
    action: handlers.onToggleDarkMode || (() => {}),
  },
  {
    id: 'keyboard-shortcuts',
    label: 'Keyboard Shortcuts',
    description: 'View all available shortcuts',
    shortcut: '?',
    icon: <Keyboard size={16} />,
    category: 'view',
    action: handlers.onShowShortcuts || (() => {}),
  },

  // Workflow commands
  {
    id: 'templates',
    label: 'Browse Templates',
    description: 'Load a pre-built workflow template',
    icon: <Library size={16} />,
    category: 'workflow',
    action: handlers.onShowTemplates || (() => {}),
  },
  {
    id: 'ai-generate',
    label: 'AI Generate',
    description: 'Generate workflow from description',
    icon: <Sparkles size={16} />,
    category: 'workflow',
    action: handlers.onShowAI || (() => {}),
  },
  {
    id: 'validate',
    label: 'Validate Workflow',
    description: 'Check workflow for errors',
    icon: <CheckCircle size={16} />,
    category: 'workflow',
    action: handlers.onValidate || (() => {}),
  },

  // Tools commands
  {
    id: 'simulator',
    label: 'Simulate Workflow',
    description: 'Run step-by-step simulation',
    icon: <Play size={16} />,
    category: 'tools',
    action: handlers.onShowSimulator || (() => {}),
  },
  {
    id: 'analytics',
    label: 'View Analytics',
    description: 'See workflow metrics and insights',
    icon: <BarChart3 size={16} />,
    category: 'tools',
    action: handlers.onShowAnalytics || (() => {}),
  },
  {
    id: 'stats',
    label: 'Workflow Stats',
    description: 'Quick statistics overview',
    icon: <BarChart3 size={16} />,
    category: 'tools',
    action: handlers.onShowStats || (() => {}),
  },
  {
    id: 'doc-generator',
    label: 'Generate Documentation',
    description: 'Auto-generate workflow docs',
    icon: <FileText size={16} />,
    category: 'tools',
    action: handlers.onShowDocGenerator || (() => {}),
  },

  // Node commands
  {
    id: 'add-aem-step',
    label: 'Add AEM Step',
    description: 'Add a participant step',
    icon: <User size={16} />,
    category: 'node',
    action: () => handlers.onAddNode?.('aemStep'),
  },
  {
    id: 'add-process',
    label: 'Add Process Step',
    description: 'Add an automated process',
    icon: <Cog size={16} />,
    category: 'node',
    action: () => handlers.onAddNode?.('processStep'),
  },
  {
    id: 'add-branch',
    label: 'Add Branch',
    description: 'Add a decision branch',
    icon: <GitBranch size={16} />,
    category: 'node',
    action: () => handlers.onAddNode?.('branch'),
  },
  {
    id: 'add-email',
    label: 'Add Email Notification',
    description: 'Add an email step',
    icon: <Mail size={16} />,
    category: 'node',
    action: () => handlers.onAddNode?.('emailNotification'),
  },
  {
    id: 'add-dam-update',
    label: 'Add DAM Update',
    description: 'Add a DAM asset update step',
    icon: <Image size={16} />,
    category: 'node',
    action: () => handlers.onAddNode?.('damUpdate'),
  },
  {
    id: 'add-page-activation',
    label: 'Add Page Activation',
    description: 'Add a publish step',
    icon: <Globe size={16} />,
    category: 'node',
    action: () => handlers.onAddNode?.('pageActivation'),
  },
  {
    id: 'add-call-workflow',
    label: 'Add Sub-Workflow',
    description: 'Call another workflow',
    icon: <ArrowRightCircle size={16} />,
    category: 'node',
    action: () => handlers.onAddNode?.('callWorkflow'),
  },
];

export default CommandPalette;
