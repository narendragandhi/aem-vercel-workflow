import React from 'react';
import { Handle, NodeProps, Position } from '@reactflow/core';
import { Repeat } from 'lucide-react';

interface LoopNodeData {
  label: string;
  description?: string;
  maxIterations?: number;
  condition?: string;
}

export const LoopNode: React.FC<NodeProps<LoopNodeData>> = ({ data, selected }) => {
  const iterations = data.maxIterations || 10;
  
  return (
    <div
      className={`loop-node border-2 rounded-lg shadow-lg min-w-[200px] ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-indigo-300 bg-indigo-50'
      }`}
      style={{ padding: '12px' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      <div className="flex items-center justify-center gap-2 mb-2">
        <Repeat className="w-5 h-5 text-indigo-600" />
        <span className="font-medium text-gray-800 text-sm">{data.label || 'Loop'}</span>
      </div>
      
      <div className="text-xs bg-indigo-100 p-2 rounded text-gray-700 mb-2">
        <div>Max: {iterations} iterations</div>
        {data.condition && <div className="font-mono mt-1">{data.condition}</div>}
      </div>
      
      {data.description && (
        <p className="text-xs text-gray-600 mb-2">{data.description}</p>
      )}
      
      <div className="flex justify-around mt-2">
        <Handle
          type="source"
          position={Position.Bottom}
          id="body"
          style={{ left: '30%' }}
          className="w-3 h-3 bg-blue-400 border-2 border-white"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="done"
          style={{ left: '70%' }}
          className="w-3 h-3 bg-green-400 border-2 border-white"
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Loop</span>
        <span>Done</span>
      </div>
    </div>
  );
};
