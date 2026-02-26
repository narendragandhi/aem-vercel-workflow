import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@reactflow/core';
import { Route, Users, ArrowRight, Settings } from 'lucide-react';

interface GraniteRoutingNodeData {
  label: string;
  description?: string;
  routeType?: 'participant' | 'group' | 'dynamic';
  routeRules?: string[];
  assignTo?: string;
  groupName?: string;
  expression?: string;
}

export const GraniteRoutingNode: React.FC<NodeProps<GraniteRoutingNodeData>> = ({ data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRouteIcon = () => {
    switch (data.routeType) {
      case 'participant': return Users;
      case 'group': return Users;
      case 'dynamic': return ArrowRight;
      default: return Route;
    }
  };

  const getRouteColor = () => {
    switch (data.routeType) {
      case 'participant': return 'border-teal-400 bg-teal-50';
      case 'group': return 'border-indigo-400 bg-indigo-50';
      case 'dynamic': return 'border-pink-400 bg-pink-50';
      default: return 'border-cyan-400 bg-cyan-50';
    }
  };

  const RouteIcon = getRouteIcon();

  return (
    <div
      className={`granite-routing-node border-2 rounded-lg shadow-lg min-w-[220px] transition-all ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : getRouteColor()
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
          <RouteIcon className="w-5 h-5 text-gray-700 mr-2 flex-shrink-0" />
          <span className="font-medium text-gray-800 text-sm">{data.label}</span>
        </div>
        {data.routeType && (
          <span className={`inline-block px-2 py-1 text-xs rounded font-medium ${
            data.routeType === 'participant' ? 'bg-teal-100 text-teal-700' :
            data.routeType === 'group' ? 'bg-indigo-100 text-indigo-700' :
            data.routeType === 'dynamic' ? 'bg-pink-100 text-pink-700' :
            'bg-cyan-100 text-cyan-700'
          }`}>
            {data.routeType}
          </span>
        )}
      </div>

      {data.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{data.description}</p>
      )}

      {data.assignTo && (
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Users className="w-3 h-3 mr-1" />
          Assign to: {data.assignTo}
        </div>
      )}

      {data.groupName && (
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Users className="w-3 h-3 mr-1" />
          Group: {data.groupName}
        </div>
      )}

      {isExpanded && (
        <div className="mt-3 space-y-2 border-t pt-2">
          {data.expression && (
            <div className="flex items-center text-xs text-gray-500">
              <Settings className="w-3 h-3 mr-1" />
              <span className="truncate">Expression: {data.expression}</span>
            </div>
          )}

          {data.routeRules && data.routeRules.length > 0 && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Route Rules:</span>
              <ul className="mt-1 space-y-1">
                {data.routeRules.slice(0, 3).map((rule, idx) => (
                  <li key={idx} className="ml-2">• {rule}</li>
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
