import React from 'react';
import { Handle, NodeProps, Position } from '@reactflow/core';
import { Mail, User, Users } from 'lucide-react';

interface EmailNotificationData {
  label: string;
  description?: string;
  recipients?: string;
  subject?: string;
  template?: string;
}

export const EmailNotificationNode: React.FC<NodeProps<EmailNotificationData>> = ({ data, selected }) => {
  return (
    <div
      className={`email-node border-2 rounded-lg shadow-lg min-w-[220px] ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-cyan-300 bg-cyan-50'
      }`}
      style={{ padding: '12px' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      <div className="flex items-center gap-2 mb-2">
        <Mail className="w-5 h-5 text-cyan-500" />
        <span className="font-medium text-gray-800 text-sm">{data.label || 'Email Notification'}</span>
      </div>
      
      {data.description && (
        <p className="text-xs text-gray-600 mb-2">{data.description}</p>
      )}
      
      {data.recipients && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
          <User className="w-3 h-3" />
          {data.recipients}
        </div>
      )}
      
      {data.subject && (
        <div className="text-xs text-gray-500 truncate">
          Subject: {data.subject}
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
