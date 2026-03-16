import React from 'react';
import { Handle, NodeProps, Position } from '@reactflow/core';
import { Layers } from 'lucide-react';

interface ParallelNodeData {
  label: string;
  description?: string;
  branchCount?: number;
  joinType?: 'all' | 'any';
}

export const ParallelNode: React.FC<NodeProps<ParallelNodeData>> = ({ data, selected }) => {
  const branchCount = data.branchCount || 2;
  const joinType = data.joinType || 'all';
  
  const branches = Array.from({ length: branchCount }, (_, i) => i);
  
  return (
    <div
      className={`parallel-node border-2 rounded-lg shadow-lg min-w-[240px] ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-cyan-300 bg-cyan-50'
      }`}
      style={{ padding: '12px' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      <div className="flex items-center justify-center gap-2 mb-2">
        <Layers className="w-5 h-5 text-cyan-600" />
        <span className="font-medium text-gray-800 text-sm">{data.label || 'Parallel'}</span>
      </div>
      
      <div className="text-xs bg-cyan-100 p-2 rounded text-gray-700 mb-2">
        <div>Branches: {branchCount}</div>
        <div>Join: {joinType === 'all' ? 'All must complete' : 'Any one completes'}</div>
      </div>
      
      {data.description && (
        <p className="text-xs text-gray-600 mb-2">{data.description}</p>
      )}
      
      <div className="flex justify-around mt-2">
        {branches.map((_, idx) => (
          <Handle
            key={idx}
            type="source"
            position={Position.Bottom}
            id={`branch-${idx}`}
            style={{ left: `${(idx + 1) * (100 / (branchCount + 1))}%` }}
            className="w-3 h-3 bg-purple-400 border-2 border-white"
          />
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        {branches.map((_, idx) => (
          <span key={idx}>Branch {idx + 1}</span>
        ))}
      </div>
    </div>
  );
};
