import React from 'react';
import { Handle, Position, NodeProps } from '@reactflow/core';
import { UserCheck, Users, UserPlus } from 'lucide-react';

interface ParticipantChooserData {
  label: string;
  description?: string;
  chooserType?: 'user' | 'group' | 'dynamic';
  rules?: string;
}

export const ParticipantChooserNode: React.FC<NodeProps<ParticipantChooserData>> = ({ data, selected }) => {
  const chooserType = data.chooserType || 'dynamic';
  
  const getIcon = () => {
    switch (chooserType) {
      case 'user': return <UserCheck className="w-5 h-5 text-blue-500" />;
      case 'group': return <Users className="w-5 h-5 text-green-500" />;
      default: return <UserPlus className="w-5 h-5 text-purple-500" />;
    }
  };

  const getColor = () => {
    switch (chooserType) {
      case 'user': return 'border-blue-300 bg-blue-50';
      case 'group': return 'border-green-300 bg-green-50';
      default: return 'border-purple-300 bg-purple-50';
    }
  };

  const getLabel = () => {
    switch (chooserType) {
      case 'user': return 'Specific User';
      case 'group': return 'User Group';
      default: return 'Dynamic Chooser';
    }
  };

  return (
    <div
      className={`participant-chooser-node border-2 rounded-lg shadow-lg min-w-[200px] ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : getColor()
      }`}
      style={{ padding: '12px' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <span className="font-medium text-gray-800 text-sm">{data.label || 'Participant Chooser'}</span>
      </div>
      
      {data.description && (
        <p className="text-xs text-gray-600 mb-2">{data.description}</p>
      )}
      
      <div className="text-xs">
        <span className="inline-block px-2 py-1 rounded bg-white border text-gray-600">
          {getLabel()}
        </span>
      </div>
      
      {data.rules && (
        <div className="text-xs text-gray-500 mt-1 truncate">
          Rules: {data.rules}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </div>
  );
};
