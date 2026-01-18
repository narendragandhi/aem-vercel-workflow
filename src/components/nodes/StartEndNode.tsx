import React from 'react';
import { Handle, Position, NodeProps } from '@reactflow/core';
import { PlayCircle, CheckCircle } from 'lucide-react';

interface StartEndNodeData {
  label: string;
  isStart?: boolean;
  description?: string;
}

export const StartEndNode: React.FC<NodeProps<StartEndNodeData>> = ({ data, selected }) => {
  const isStart = data.isStart ?? true;
  
  return (
    <div
      className={`start-end-node border-2 rounded-full p-4 shadow-lg min-w-[120px] text-center ${
        selected ? 'border-green-500' : isStart ? 'border-green-400' : 'border-red-400'
      } ${isStart ? 'bg-green-50' : 'bg-red-50'}`}
    >
      {isStart && (
        <Handle
          type="source"
          position="bottom"
          className="w-3 h-3 bg-green-400"
        />
      )}
      
      
      {!isStart && (
        <Handle
          type="target"
          position="top"
          className="w-3 h-3 bg-red-400"
        />
      )}
      <div className="flex flex-col items-center">
        {isStart ? (
          <PlayCircle className={`w-6 h-6 mb-2 ${selected ? 'text-green-600' : 'text-green-500'}`} />
        ) : (
          <CheckCircle className={`w-6 h-6 mb-2 ${selected ? 'text-red-600' : 'text-red-500'}`} />
        )}
        
        <span className={`font-medium text-sm ${
          isStart ? 'text-green-700' : 'text-red-700'
        }`}>
          {data.label}
        </span>
        
        {data.description && (
          <p className="text-xs text-gray-600 mt-1">{data.description}</p>
        )}
      </div>
      
      {!isStart && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-red-400"
        />
      )}
    </div>
  );
};