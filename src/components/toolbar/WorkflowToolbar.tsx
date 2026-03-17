import React from 'react';
import {
  AlertTriangle,
  BarChart3,
  Brain,
  Cloud,
  Command,
  Download,
  FileUp,
  GitBranch,
  Grid3X3,
  Layout,
  Library,
  Play,
  Redo2,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Undo2,
  Users,
} from 'lucide-react';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onClear: () => void;
  onSave: () => void;
  onExport: () => void;
  onImport: () => void;
  onAutoLayout: () => void;
  onSimulate: () => void;
  onAnalytics: () => void;
  onAnalysis: () => void;
  onValidation: () => void;
  onStats: () => void;
  onTemplateGallery: () => void;
  onTemplates: () => void;
  onDocGenerator: () => void;
  onCommandPalette: () => void;
  onAI: () => void;
  onAEM: () => void;
  onCollaboration: () => void;
  canUndo: boolean;
  canRedo: boolean;
  validationCount?: number;
  validationError?: boolean;
}

const buttonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '8px 12px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 500,
  color: '#fff',
  transition: 'all 0.2s',
} as const;

export const WorkflowToolbar: React.FC<ToolbarProps> = ({
  onUndo,
  onRedo,
  onReset,
  onClear,
  onSave,
  onExport,
  onImport,
  onAutoLayout,
  onSimulate,
  onAnalytics,
  onAnalysis,
  onValidation,
  onStats,
  onTemplateGallery,
  onTemplates,
  onDocGenerator,
  onCommandPalette,
  onAI,
  onAEM,
  onCollaboration,
  canUndo,
  canRedo,
  validationCount,
  validationError,
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Undo/Redo */}
      <div className="flex gap-1 pr-2 border-r border-gray-200 dark:border-gray-700">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{ ...buttonStyle, background: '#64748b' }}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={14} /> Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={{ ...buttonStyle, background: '#64748b' }}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={14} /> Redo
        </button>
        <button onClick={onReset} style={{ ...buttonStyle, background: '#64748b' }} title="Reset View">
          <RotateCcw size={14} />
        </button>
      </div>

      {/* File Operations */}
      <div className="flex gap-1 pr-2 border-r border-gray-200 dark:border-gray-700">
        <button onClick={onSave} style={{ ...buttonStyle, background: '#22c55e' }} title="Save Workflow">
          <Save size={14} /> Save
        </button>
        <button onClick={onExport} style={{ ...buttonStyle, background: '#3b82f6' }} title="Export Workflow">
          <Download size={14} /> Export
        </button>
        <button onClick={onImport} style={{ ...buttonStyle, background: '#3b82f6' }} title="Import Workflow">
          <FileUp size={14} /> Import
        </button>
      </div>

      {/* Layout */}
      <div className="flex gap-1 pr-2 border-r border-gray-200 dark:border-gray-700">
        <button onClick={onAutoLayout} style={{ ...buttonStyle, background: '#8b5cf6' }} title="Auto Layout">
          <Layout size={14} /> Layout
        </button>
      </div>

      {/* Tools */}
      <div className="flex gap-1 pr-2 border-r border-gray-200 dark:border-gray-700">
        <button onClick={onSimulate} style={{ ...buttonStyle, background: '#10b981' }} title="Simulate Workflow">
          <Play size={14} /> Simulate
        </button>
        <button onClick={onAnalytics} style={{ ...buttonStyle, background: '#06b6d4' }} title="Analytics Dashboard">
          <BarChart3 size={14} /> Analytics
        </button>
        <button onClick={onAnalysis} style={{ ...buttonStyle, background: '#8b5cf6' }} title="AI Workflow Analysis">
          <Brain size={14} /> Analyze
        </button>
      </div>

      {/* Validation & Stats */}
      <div className="flex gap-1 pr-2 border-r border-gray-200 dark:border-gray-700">
        <button
          onClick={onValidation}
          style={{
            ...buttonStyle,
            background: validationError ? '#ef4444' : validationCount ? '#eab308' : '#22c55e',
          }}
          title="Validate Workflow"
        >
          <AlertTriangle size={14} /> Validate {validationCount ? `(${validationCount})` : ''}
        </button>
        <button onClick={onStats} style={{ ...buttonStyle, background: '#64748b' }} title="Quick Stats">
          <BarChart3 size={14} /> Stats
        </button>
      </div>

      {/* Templates & Docs */}
      <div className="flex gap-1 pr-2 border-r border-gray-200 dark:border-gray-700">
        <button onClick={onTemplateGallery} style={{ ...buttonStyle, background: '#0ea5e9' }} title="Template Gallery">
          <Grid3X3 size={14} /> Gallery
        </button>
        <button onClick={onTemplates} style={{ ...buttonStyle, background: '#0ea5e9' }}>
          <Library size={14} /> Templates
        </button>
        <button onClick={onDocGenerator} style={{ ...buttonStyle, background: '#8b5cf6' }} title="Generate Documentation">
          <GitBranch size={14} /> Docs
        </button>
      </div>

      {/* AI & Advanced */}
      <div className="flex gap-1 pr-2 border-r border-gray-200 dark:border-gray-700">
        <button onClick={onCommandPalette} style={{ ...buttonStyle, background: '#475569' }} title="Command Palette (Cmd+K)">
          <Command size={14} />
        </button>
        <button
          onClick={onAI}
          style={{ ...buttonStyle, background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', fontWeight: 'bold' }}
        >
          <Sparkles size={14} /> AI Generate
        </button>
      </div>

      {/* Integration */}
      <div className="flex gap-1">
        <button onClick={onAEM} style={{ ...buttonStyle, background: '#0ea5e9' }} title="AEM Integration">
          <Cloud size={14} /> AEM
        </button>
        <button onClick={onCollaboration} style={{ ...buttonStyle, background: '#ec4899' }} title="Real-time Collaboration">
          <Users size={14} /> Collaborate
        </button>
        <button onClick={onClear} style={{ ...buttonStyle, background: '#ef4444' }} title="Clear Canvas">
          <Trash2 size={14} /> Clear
        </button>
      </div>
    </div>
  );
};

export default WorkflowToolbar;
