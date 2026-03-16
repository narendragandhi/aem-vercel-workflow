import React, { useState } from 'react';
import { Handle, NodeProps, Position } from '@reactflow/core';
import { CheckCircle, Film, Layers, Settings } from 'lucide-react';

interface DAMTranscodeNodeData {
  label: string;
  description?: string;
  preset?: 'hd' | 'web' | 'mobile' | 'custom';
  outputFormat?: string;
  presetList?: string[];
  thumbnail?: boolean;
  watermark?: boolean;
}

export const DAMTranscodeNode: React.FC<NodeProps<DAMTranscodeNodeData>> = ({ data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPresetColor = () => {
    switch (data.preset) {
      case 'hd': return 'border-red-400 bg-red-50';
      case 'web': return 'border-emerald-400 bg-emerald-50';
      case 'mobile': return 'border-cyan-400 bg-cyan-50';
      default: return 'border-rose-400 bg-rose-50';
    }
  };

  return (
    <div
      className={`dam-transcode-node border-2 rounded-lg shadow-lg min-w-[220px] transition-all ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : getPresetColor()
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
          <Film className="w-5 h-5 text-gray-700 mr-2 flex-shrink-0" />
          <span className="font-medium text-gray-800 text-sm">{data.label}</span>
        </div>
        {data.preset && (
          <span className={`inline-block px-2 py-1 text-xs rounded font-medium ${
            data.preset === 'hd' ? 'bg-red-100 text-red-700' :
            data.preset === 'web' ? 'bg-emerald-100 text-emerald-700' :
            data.preset === 'mobile' ? 'bg-cyan-100 text-cyan-700' :
            'bg-rose-100 text-rose-700'
          }`}>
            {data.preset}
          </span>
        )}
      </div>

      {data.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{data.description}</p>
      )}

      {data.outputFormat && (
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Layers className="w-3 h-3 mr-1" />
          Format: {data.outputFormat}
        </div>
      )}

      {isExpanded && (
        <div className="mt-3 space-y-2 border-t pt-2">
          {data.presetList && data.presetList.length > 0 && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Presets:</span>
              <ul className="mt-1">
                {data.presetList.slice(0, 3).map((p, idx) => (
                  <li key={idx} className="ml-2">• {p}</li>
                ))}
              </ul>
            </div>
          )}

          {data.thumbnail && (
            <div className="flex items-center text-xs text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Generate thumbnail
            </div>
          )}

          {data.watermark && (
            <div className="flex items-center text-xs text-orange-600">
              <Settings className="w-3 h-3 mr-1" />
              Apply watermark
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
