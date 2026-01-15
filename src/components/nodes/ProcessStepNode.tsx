import React from 'react';
import { Handle, Position, NodeProps } from '@reactflow/core';
import { Cog, Play } from 'lucide-react';

interface ProcessStepNodeData {
  label: string;
  description?: string;
  processType?: 'automated' | 'manual' | 'script';
  config?: Record<string, any>;
}

export const ProcessStepNode: React.FC<NodeProps<ProcessStepNodeData>> = ({ data, selected }) => {
  return (
    <div
      className={`process-step-node bg-white border-2 rounded-lg p-4 shadow-lg min-w-[200px] ${
        selected ? 'border-orange-500' : 'border-gray-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400"
      />
      
      <div className="flex items-center mb-2">
        <Cog className="w-5 h-5 text-orange-500 mr-2" />
        <span className="font-medium text-gray-800">{data.label}</span>
      </div>
      
      {data.description && (
        <p className="text-sm text-gray-600 mb-2">{data.description}</p>
      )}
      
      {data.processType && (
        <div className="flex items-center text-xs text-gray-500 mb-2">
          {data.processType === 'automated' && <Play className="w-3 h-3 mr-1" />}
          <span className="capitalize">{data.processType}</span>
        </div>
      )}
      
      <div className="mt-2">
        <span className="inline-block px-2 py-1 text-xs rounded bg-orange-100 text-orange-700">
          Process
        </span>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400"
      />
    </div>
  );
};