import React, { useState } from 'react';
import { Handle, NodeProps, Position } from '@reactflow/core';
import { AlertCircle, CheckCircle, FileText, Save, Settings } from 'lucide-react';

interface FormsProcessStepNodeData {
  label: string;
  description?: string;
  formsAction?: string;
  formPath?: string;
  outputPath?: string;
  saveData?: boolean;
  submitAction?: 'submit' | 'save' | 'render';
  errorHandling?: 'rollback' | 'notify' | 'continue';
}

export const FormsProcessStepNode: React.FC<NodeProps<FormsProcessStepNodeData>> = ({ data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getFormsColor = () => {
    switch (data.submitAction) {
      case 'submit': return 'border-amber-400 bg-amber-50';
      case 'save': return 'border-orange-400 bg-orange-50';
      case 'render': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-amber-400 bg-amber-50';
    }
  };

  const getFormsIcon = () => {
    switch (data.submitAction) {
      case 'save': return Save;
      case 'render': return FileText;
      default: return FileText;
    }
  };

  const FormsIcon = getFormsIcon();

  return (
    <div
      className={`forms-process-node border-2 rounded-lg shadow-lg min-w-[220px] transition-all ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : getFormsColor()
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
          <FormsIcon className="w-5 h-5 text-gray-700 mr-2 flex-shrink-0" />
          <span className="font-medium text-gray-800 text-sm">{data.label}</span>
        </div>
        {data.submitAction && (
          <span className={`inline-block px-2 py-1 text-xs rounded font-medium ${
            data.submitAction === 'submit' ? 'bg-amber-100 text-amber-700' :
            data.submitAction === 'save' ? 'bg-orange-100 text-orange-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {data.submitAction}
          </span>
        )}
      </div>

      {data.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{data.description}</p>
      )}

      {data.formsAction && (
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Settings className="w-3 h-3 mr-1" />
          Action: {data.formsAction}
        </div>
      )}

      {isExpanded && (
        <div className="mt-3 space-y-2 border-t pt-2">
          {data.formPath && (
            <div className="text-xs text-gray-500">
              <span className="font-medium">Form:</span> {data.formPath}
            </div>
          )}

          {data.outputPath && (
            <div className="text-xs text-gray-500">
              <span className="font-medium">Output:</span> {data.outputPath}
            </div>
          )}

          {data.saveData && (
            <div className="flex items-center text-xs text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Save data enabled
            </div>
          )}

          {data.errorHandling && (
            <div className="flex items-center text-xs text-orange-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              On error: {data.errorHandling}
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
