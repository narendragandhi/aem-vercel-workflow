import React from 'react';
import { Handle, Position, NodeProps } from '@reactflow/core';
import { GitBranch, XCircle, CheckCircle } from 'lucide-react';

interface BranchNodeData {
  label: string;
  description?: string;
  branchType?: 'xor' | 'and' | 'or';
  conditions?: { id: string; label: string; expression: string }[];
}

export const BranchNode: React.FC<NodeProps<BranchNodeData>> = ({ data, selected }) => {
  const branchType = data.branchType || 'xor';
  
  const getIcon = () => {
    switch (branchType) {
      case 'or': return <GitBranch className="w-5 h-5 text-purple-500" />;
      case 'and': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'xor': return <XCircle className="w-5 h-5 text-orange-500" />;
    }
  };

  const getColor = () => {
    switch (branchType) {
      case 'or': return 'border-purple-300 bg-purple-50';
      case 'and': return 'border-green-300 bg-green-50';
      case 'xor': return 'border-orange-300 bg-orange-50';
    }
  };

  return (
    <div
      className={`branch-node border-2 rounded-lg shadow-lg min-w-[200px] ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : getColor()
      }`}
      style={{ padding: '12px' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      <div className="flex items-center justify-center gap-2 mb-2">
        {getIcon()}
        <span className="font-medium text-gray-800 text-sm">{data.label || 'Branch'}</span>
      </div>
      
      {data.description && (
        <p className="text-xs text-gray-600 mb-2">{data.description}</p>
      )}
      
      <div className="flex justify-around mt-2">
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          style={{ left: '30%' }}
          className="w-3 h-3 bg-green-400 border-2 border-white"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          style={{ left: '70%' }}
          className="w-3 h-3 bg-red-400 border-2 border-white"
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>True</span>
        <span>False</span>
      </div>
    </div>
  );
};
