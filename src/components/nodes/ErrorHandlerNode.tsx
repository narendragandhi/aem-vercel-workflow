import React from 'react';
import { Handle, NodeProps, Position } from '@reactflow/core';
import { AlertTriangle, Shield } from 'lucide-react';

interface ErrorHandlerNodeData {
  label: string;
  description?: string;
  errorTypes?: string[];
  onError?: string;
}

export const ErrorHandlerNode: React.FC<NodeProps<ErrorHandlerNodeData>> = ({ data, selected }) => {
  const errorTypes = data.errorTypes || ['generic'];
  
  return (
    <div
      className={`error-handler-node border-2 rounded-lg shadow-lg min-w-[200px] ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-red-300 bg-red-50'
      }`}
      style={{ padding: '12px' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      <div className="flex items-center justify-center gap-2 mb-2">
        <Shield className="w-5 h-5 text-red-600" />
        <span className="font-medium text-gray-800 text-sm">{data.label || 'Error Handler'}</span>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-2">
        {errorTypes.map((type) => (
          <span
            key={type}
            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full"
          >
            {type}
          </span>
        ))}
      </div>
      
      {data.description && (
        <p className="text-xs text-gray-600 mb-2">{data.description}</p>
      )}
      
      <div className="flex justify-around mt-2">
        <Handle
          type="source"
          position={Position.Bottom}
          id="success"
          style={{ left: '30%' }}
          className="w-3 h-3 bg-green-400 border-2 border-white"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="error"
          style={{ left: '70%' }}
          className="w-3 h-3 bg-red-400 border-2 border-white"
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Handle</span>
        <span>Escalate</span>
      </div>
    </div>
  );
};
