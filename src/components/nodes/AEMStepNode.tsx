import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@reactflow/core';
import { User, Settings, Clock, AlertTriangle, CheckCircle, GitBranch, ExternalLink } from 'lucide-react';

interface AEMStepNodeData {
  label: string;
  description?: string;
  participant?: string;
  stepType?: 'participant' | 'process' | 'external' | 'custom';
  config?: Record<string, any>;
  timeout?: number;
  autoAdvance?: boolean;
  notifications?: string[];
  parameters?: Record<string, any>;
}

export const AEMStepNode: React.FC<NodeProps<AEMStepNodeData>> = ({ data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getStepIcon = () => {
    switch (data.stepType) {
      case 'participant': return User;
      case 'process': return Settings;
      case 'external': return ExternalLink;
      default: return GitBranch;
    }
  };
  
  const getStepColor = () => {
    switch (data.stepType) {
      case 'participant': return 'border-blue-300 bg-blue-50';
      case 'process': return 'border-green-300 bg-green-50';
      case 'external': return 'border-orange-300 bg-orange-50';
      default: return 'border-purple-300 bg-purple-50';
    }
  };
  
  const StepIcon = getStepIcon();

  return (
    <div
      className={`aem-step-node border-2 rounded-lg shadow-lg min-w-[220px] transition-all ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : getStepColor()
      } ${isExpanded ? 'p-5' : 'p-4'}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <Handle
        type="target"
        position="top"
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <StepIcon className="w-5 h-5 text-gray-700 mr-2 flex-shrink-0" />
          <span className="font-medium text-gray-800 text-sm">{data.label}</span>
        </div>
        {data.stepType && (
          <span className={`inline-block px-2 py-1 text-xs rounded font-medium ${
            data.stepType === 'participant' ? 'bg-blue-100 text-blue-700' :
            data.stepType === 'process' ? 'bg-green-100 text-green-700' :
            data.stepType === 'external' ? 'bg-orange-100 text-orange-700' :
            'bg-purple-100 text-purple-700'
          }`}>
            {data.stepType}
          </span>
        )}
      </div>
      
      {data.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{data.description}</p>
      )}
      
      {data.participant && (
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <User className="w-3 h-3 mr-1" />
          Assigned to: {data.participant}
        </div>
      )}

      {isExpanded && (
        <div className="mt-3 space-y-2 border-t pt-2">
          {data.timeout && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              Timeout: {data.timeout} minutes
            </div>
          )}
          
          {data.autoAdvance && (
            <div className="flex items-center text-xs text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Auto-advance enabled
            </div>
          )}
          
          {data.notifications && data.notifications.length > 0 && (
            <div className="flex items-center text-xs text-orange-600">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {data.notifications.length} notification(s)
            </div>
          )}
          
          {data.parameters && Object.keys(data.parameters).length > 0 && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Parameters:</span>
              <ul className="mt-1 space-y-1">
                {Object.entries(data.parameters).slice(0, 3).map(([key, value]) => (
                  <li key={key} className="ml-2 truncate">
                    {key}: {typeof value === 'string' ? value.slice(0, 20) : String(value)}
                  </li>
                ))}
                {Object.keys(data.parameters).length > 3 && (
                  <li className="ml-2 text-gray-400">...and {Object.keys(data.parameters).length - 3} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <Handle
        type="source"
        position="bottom"
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </div>
  );
};