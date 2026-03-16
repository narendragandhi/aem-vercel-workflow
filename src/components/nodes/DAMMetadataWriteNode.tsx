import React, { useState } from 'react';
import { Handle, NodeProps, Position } from '@reactflow/core';
import { Database, FileCode, Save, Settings } from 'lucide-react';

interface DAMMetadataWriteNodeData {
  label: string;
  description?: string;
  metadataSchema?: string;
  xmpWrite?: boolean;
  dcTerms?: string[];
  customMetadata?: Record<string, string>;
  overwrite?: boolean;
}

export const DAMMetadataWriteNode: React.FC<NodeProps<DAMMetadataWriteNodeData>> = ({ data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`dam-metadata-node border-2 rounded-lg shadow-lg min-w-[220px] transition-all ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-violet-400 bg-violet-50'
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
          <FileCode className="w-5 h-5 text-gray-700 mr-2 flex-shrink-0" />
          <span className="font-medium text-gray-800 text-sm">{data.label}</span>
        </div>
        <span className="inline-block px-2 py-1 text-xs rounded font-medium bg-violet-100 text-violet-700">
          metadata
        </span>
      </div>

      {data.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{data.description}</p>
      )}

      {data.metadataSchema && (
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Database className="w-3 h-3 mr-1" />
          Schema: {data.metadataSchema}
        </div>
      )}

      {isExpanded && (
        <div className="mt-3 space-y-2 border-t pt-2">
          {data.xmpWrite && (
            <div className="flex items-center text-xs text-green-600">
              <Save className="w-3 h-3 mr-1" />
              Write XMP
            </div>
          )}

          {data.overwrite && (
            <div className="flex items-center text-xs text-blue-600">
              <Settings className="w-3 h-3 mr-1" />
              Overwrite existing
            </div>
          )}

          {data.dcTerms && data.dcTerms.length > 0 && (
            <div className="text-xs text-gray-6">
              <span className="font-medium">Dublin Core:</span>
              <ul className="mt-1">
                {data.dcTerms.slice(0, 3).map((term, idx) => (
                  <li key={idx} className="ml-2">• {term}</li>
                ))}
              </ul>
            </div>
          )}

          {data.customMetadata && Object.keys(data.customMetadata).length > 0 && (
            <div className="text-xs text-gray-6">
              <span className="font-medium">Custom fields:</span>
              <ul className="mt-1">
                {Object.keys(data.customMetadata).slice(0, 3).map((key) => (
                  <li key={key} className="ml-2 truncate">{key}</li>
                ))}
              </ul>
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
