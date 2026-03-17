import React from 'react';
import { Handle, NodeProps, Position } from '@reactflow/core';
import { Clock } from 'lucide-react';

interface DelayNodeData {
  label: string;
  description?: string;
  duration?: number;
  unit?: 'ms' | 'seconds' | 'minutes' | 'hours';
}

export const DelayNode: React.FC<NodeProps<DelayNodeData>> = ({ data, selected }) => {
  const duration = data.duration || 1000;
  const unit = data.unit || 'ms';
  
  const formatDuration = () => {
    if (unit === 'ms') {return `${duration}ms`;}
    if (unit === 'seconds') {return `${duration}s`;}
    if (unit === 'minutes') {return `${duration}m`;}
    if (unit === 'hours') {return `${duration}h`;}
    return `${duration}`;
  };
  
  return (
    <div
      className={`delay-node border-2 rounded-lg shadow-lg min-w-[180px] ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300 bg-gray-50'
      }`}
      style={{ padding: '12px' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      <div className="flex items-center justify-center gap-2 mb-2">
        <Clock className="w-5 h-5 text-gray-600" />
        <span className="font-medium text-gray-800 text-sm">{data.label || 'Delay'}</span>
      </div>
      
      <div className="text-center">
        <div className="text-lg font-bold text-gray-700">{formatDuration()}</div>
        <div className="text-xs text-gray-500">Wait time</div>
      </div>
      
      {data.description && (
        <p className="text-xs text-gray-600 mt-2">{data.description}</p>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-400 border-2 border-white"
      />
    </div>
  );
};
