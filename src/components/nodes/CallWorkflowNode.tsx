import React, { useState } from 'react';
import { Handle, NodeProps, Position } from '@reactflow/core';
import { ArrowRightCircle, GitBranch, Play, Settings } from 'lucide-react';

interface CallWorkflowNodeData {
  label: string;
  description?: string;
  workflowModel?: string;
  workflowId?: string;
  payloadType?: 'path' | 'metadata' | 'all';
  inheritVariables?: boolean;
  synchronous?: boolean;
}

export const CallWorkflowNode: React.FC<NodeProps<CallWorkflowNodeData>> = ({ data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`call-workflow-node border-2 rounded-lg shadow-lg min-w-[220px] transition-all ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-400 bg-slate-50'
      } ${isExpanded ? 'p-5' : 'p-4'}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <GitBranch className="w-5 h-5 text-gray-700 mr-2 flex-shrink-0" />
          <span className="font-medium text-gray-800 text-sm">{data.label}</span>
        </div>
        <span className="inline-block px-2 py-1 text-xs rounded font-medium bg-slate-100 text-slate-700">
          call
        </span>
      </div>

      {data.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{data.description}</p>
      )}

      {data.workflowModel && (
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Play className="w-3 h-3 mr-1" />
          Model: {data.workflowModel}
        </div>
      )}

      {isExpanded && (
        <div className="mt-3 space-y-2 border-t pt-2">
          {data.payloadType && (
            <div className="flex items-center text-xs text-gray-500">
              <ArrowRightCircle className="w-3 h-3 mr-1" />
              Payload: {data.payloadType}
            </div>
          )}

          {data.inheritVariables && (
            <div className="flex items-center text-xs text-blue-600">
              <Settings className="w-3 h-3 mr-1" />
              Inherit variables
            </div>
          )}

          {data.synchronous && (
            <div className="flex items-center text-xs text-green-600">
              <Play className="w-3 h-3 mr-1" />
              Synchronous execution
            </div>
          )}
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
