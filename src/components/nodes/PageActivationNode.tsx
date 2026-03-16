import React, { useState } from 'react';
import { Handle, NodeProps, Position } from '@reactflow/core';
import { AlertTriangle, CheckCircle, Globe, Settings, UploadCloud } from 'lucide-react';

interface PageActivationNodeData {
  label: string;
  description?: string;
  publishTarget?: 'author' | 'publish' | 'preview';
  replicationType?: 'replicate' | 'reverse-replicate';
  includeChildren?: boolean;
  deepPublish?: boolean;
  activationPath?: string;
}

export const PageActivationNode: React.FC<NodeProps<PageActivationNodeData>> = ({ data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTargetColor = () => {
    switch (data.publishTarget) {
      case 'author': return 'border-green-400 bg-green-50';
      case 'publish': return 'border-blue-400 bg-blue-50';
      case 'preview': return 'border-purple-400 bg-purple-50';
      default: return 'border-teal-400 bg-teal-50';
    }
  };

  return (
    <div
      className={`page-activation-node border-2 rounded-lg shadow-lg min-w-[220px] transition-all ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : getTargetColor()
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
          <Globe className="w-5 h-5 text-gray-700 mr-2 flex-shrink-0" />
          <span className="font-medium text-gray-800 text-sm">{data.label}</span>
        </div>
        {data.publishTarget && (
          <span className={`inline-block px-2 py-1 text-xs rounded font-medium ${
            data.publishTarget === 'author' ? 'bg-green-100 text-green-700' :
            data.publishTarget === 'publish' ? 'bg-blue-100 text-blue-700' :
            data.publishTarget === 'preview' ? 'bg-purple-100 text-purple-700' :
            'bg-teal-100 text-teal-700'
          }`}>
            {data.publishTarget}
          </span>
        )}
      </div>

      {data.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{data.description}</p>
      )}

      {data.replicationType && (
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <UploadCloud className="w-3 h-3 mr-1" />
          {data.replicationType === 'replicate' ? 'Publish' : 'Unpublish'}
        </div>
      )}

      {isExpanded && (
        <div className="mt-3 space-y-2 border-t pt-2">
          {data.includeChildren && (
            <div className="flex items-center text-xs text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Include children
            </div>
          )}

          {data.deepPublish && (
            <div className="flex items-center text-xs text-blue-600">
              <Globe className="w-3 h-3 mr-1" />
              Deep publish
            </div>
          )}

          {data.activationPath && (
            <div className="text-xs text-gray-500">
              <span className="font-medium">Path:</span> {data.activationPath}
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
