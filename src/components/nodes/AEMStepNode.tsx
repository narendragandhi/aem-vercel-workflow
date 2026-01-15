import React from 'react';
import { Handle, Position, NodeProps } from '@reactflow/core';
import { User, Settings } from 'lucide-react';

interface AEMStepNodeData {
  label: string;
  description?: string;
  participant?: string;
  stepType?: 'participant' | 'process' | 'external';
  config?: Record<string, any>;
}

export const AEMStepNode: React.FC<NodeProps<AEMStepNodeData>> = ({ data, selected }) => {
  return (
    <div
      className={`aem-step-node bg-white border-2 rounded-lg p-4 shadow-lg min-w-[200px] ${
        selected ? 'border-blue-500' : 'border-gray-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400"
      />
      
      <div className="flex items-center mb-2">
        <User className="w-5 h-5 text-blue-500 mr-2" />
        <span className="font-medium text-gray-800">{data.label}</span>
      </div>
      
      {data.description && (
        <p className="text-sm text-gray-600 mb-2">{data.description}</p>
      )}
      
      {data.participant && (
        <div className="flex items-center text-xs text-gray-500">
          <User className="w-3 h-3 mr-1" />
          {data.participant}
        </div>
      )}
      
      {data.stepType && (
        <div className="mt-2">
          <span className={`inline-block px-2 py-1 text-xs rounded ${
            data.stepType === 'participant' ? 'bg-blue-100 text-blue-700' :
            data.stepType === 'process' ? 'bg-green-100 text-green-700' :
            'bg-orange-100 text-orange-700'
          }`}>
            {data.stepType}
          </span>
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400"
      />
    </div>
  );
};