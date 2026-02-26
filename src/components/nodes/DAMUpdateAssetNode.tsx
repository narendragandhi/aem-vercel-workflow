import React from 'react';
import { Handle, Position, NodeProps } from '@reactflow/core';
import { Image, Video, FileText, Download } from 'lucide-react';

interface DAMUpdateAssetData {
  label: string;
  description?: string;
  processType?: 'metadata' | 'thumbnail' | 'rendition' | 'full';
  mimeTypes?: string[];
}

export const DAMUpdateAssetNode: React.FC<NodeProps<DAMUpdateAssetData>> = ({ data, selected }) => {
  const processType = data.processType || 'metadata';
  
  const getIcon = () => {
    switch (processType) {
      case 'thumbnail': return <Image className="w-5 h-5 text-purple-500" />;
      case 'rendition': return <Image className="w-5 h-5 text-blue-500" />;
      case 'full': return <Video className="w-5 h-5 text-orange-500" />;
      default: return <Download className="w-5 h-5 text-green-500" />;
    }
  };

  const getColor = () => {
    switch (processType) {
      case 'thumbnail': return 'border-purple-300 bg-purple-50';
      case 'rendition': return 'border-blue-300 bg-blue-50';
      case 'full': return 'border-orange-300 bg-orange-50';
      default: return 'border-green-300 bg-green-50';
    }
  };

  return (
    <div
      className={`dam-node border-2 rounded-lg shadow-lg min-w-[200px] ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : getColor()
      }`}
      style={{ padding: '12px' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <span className="font-medium text-gray-800 text-sm">{data.label || 'DAM Update'}</span>
      </div>
      
      {data.description && (
        <p className="text-xs text-gray-600 mb-2">{data.description}</p>
      )}
      
      <div className="text-xs text-gray-500">
        <span className="inline-block px-2 py-1 rounded bg-white border">
          {processType === 'metadata' && 'Update Metadata'}
          {processType === 'thumbnail' && 'Generate Thumbnails'}
          {processType === 'rendition' && 'Create Renditions'}
          {processType === 'full' && 'Full Processing'}
        </span>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </div>
  );
};
