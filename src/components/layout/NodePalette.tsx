import React from 'react';
import {
  AlertCircle,
  Clock,
  Cog,
  FileText,
  GitBranch,
  Image,
  Layers,
  Mail,
  Play,
  Repeat,
  Route,
  Send,
  User,
} from 'lucide-react';

interface NodePaletteProps {
  onAddNode: (type: string, label: string) => void;
}

interface NodeCategory {
  name: string;
  icon: React.ReactNode;
  nodes: { type: string; label: string; icon: React.ReactNode; color: string; description: string }[];
}

const nodeCategories: NodeCategory[] = [
  {
    name: 'Flow Control',
    icon: <Play size={16} />,
    nodes: [
      { type: 'start', label: 'Start', icon: <Play size={14} />, color: '#22c55e', description: 'Workflow start point' },
      { type: 'end', label: 'End', icon: <Play size={14} />, color: '#ef4444', description: 'Workflow end point' },
      { type: 'process', label: 'Process Step', icon: <Cog size={14} />, color: '#3b82f6', description: 'Execute a process' },
      { type: 'condition', label: 'Condition', icon: <GitBranch size={14} />, color: '#f59e0b', description: 'Branch based on logic' },
      { type: 'branch', label: 'OR Split', icon: <GitBranch size={14} />, color: '#8b5cf6', description: 'Split into multiple paths' },
    ],
  },
  {
    name: 'User Interaction',
    icon: <User size={16} />,
    nodes: [
      { type: 'participant', label: 'Participant', icon: <User size={14} />, color: '#ec4899', description: 'Assign to user' },
      { type: 'participantChooser', label: 'Participant Chooser', icon: <User size={14} />, color: '#ec4899', description: 'Dynamic user selection' },
    ],
  },
  {
    name: 'DAM',
    icon: <Image size={16} />,
    nodes: [
      { type: 'damUpdateAsset', label: 'Update Asset', icon: <Image size={14} />, color: '#14b8a6', description: 'Update DAM asset' },
      { type: 'damTranscode', label: 'Transcode', icon: <Layers size={14} />, color: '#06b6d4', description: 'Transcode asset' },
      { type: 'damMetadataWrite', label: 'Write Metadata', icon: <FileText size={14} />, color: '#0ea5e9', description: 'Write metadata' },
    ],
  },
  {
    name: 'Notification',
    icon: <Mail size={16} />,
    nodes: [
      { type: 'emailNotification', label: 'Email', icon: <Mail size={14} />, color: '#f97316', description: 'Send email notification' },
    ],
  },
  {
    name: 'Page',
    icon: <FileText size={16} />,
    nodes: [
      { type: 'pageActivation', label: 'Activate Page', icon: <Send size={14} />, color: '#22c55e', description: 'Publish page' },
      { type: 'callWorkflow', label: 'Call Workflow', icon: <Repeat size={14} />, color: '#6366f1', description: 'Trigger another workflow' },
    ],
  },
  {
    name: 'Advanced',
    icon: <Cog size={16} />,
    nodes: [
      { type: 'delay', label: 'Delay', icon: <Clock size={14} />, color: '#64748b', description: 'Wait for duration' },
      { type: 'loop', label: 'Loop', icon: <Repeat size={14} />, color: '#eab308', description: 'Repeat steps' },
      { type: 'parallel', label: 'Parallel', icon: <Layers size={14} />, color: '#8b5cf6', description: 'Run in parallel' },
      { type: 'errorHandler', label: 'Error Handler', icon: <AlertCircle size={14} />, color: '#ef4444', description: 'Handle errors' },
    ],
  },
  {
    name: 'Forms',
    icon: <FileText size={16} />,
    nodes: [
      { type: 'formsProcess', label: 'Forms Process', icon: <FileText size={14} />, color: '#3b82f6', description: 'Process adaptive form' },
      { type: 'graniteRouting', label: 'Granite Routing', icon: <Route size={14} />, color: '#8b5cf6', description: 'Route to endpoint' },
    ],
  },
];

export const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto h-full">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Nodes</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Click to add to canvas</p>
      </div>

      <div className="p-2">
        {nodeCategories.map((category) => (
          <div key={category.name} className="mb-4">
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              {category.icon}
              {category.name}
            </div>
            <div className="grid grid-cols-1 gap-1 mt-1">
              {category.nodes.map((node) => (
                <button
                  key={node.type}
                  onClick={() => onAddNode(node.type, node.label)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                  title={node.description}
                >
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${node.color}20` }}
                  >
                    <span style={{ color: node.color }}>{node.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {node.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {node.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodePalette;
