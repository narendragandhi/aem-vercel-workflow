/**
 * @fileoverview Process Step Node Component
 *
 * Renders a process step (automated, manual, or script) in the workflow builder.
 * Supports accessibility with ARIA attributes and keyboard navigation.
 *
 * @module components/nodes/ProcessStepNode
 */

import React, { memo, useCallback, useState } from 'react';
import { Handle, NodeProps, Position } from '@reactflow/core';
import { ChevronDown, ChevronUp, Cog, Hand, Play, Terminal } from 'lucide-react';

/**
 * Data structure for Process Step Node.
 */
interface ProcessStepNodeData {
  /** Display label for the step */
  label: string;
  /** Description of the process */
  description?: string;
  /** Type of process execution */
  processType?: 'automated' | 'manual' | 'script';
  /** Process configuration */
  config?: Record<string, unknown>;
  /** Script path or command (for script type) */
  script?: string;
  /** Timeout in seconds */
  timeout?: number;
  /** Retry count on failure */
  retryCount?: number;
}

/**
 * Gets the icon component based on process type.
 */
const getProcessIcon = (processType?: string): React.FC<{ className?: string }> => {
  switch (processType) {
    case 'automated':
      return Play;
    case 'manual':
      return Hand;
    case 'script':
      return Terminal;
    default:
      return Cog;
  }
};

/**
 * Gets color classes based on process type.
 */
const getProcessColorClasses = (processType?: string): { border: string; badge: string } => {
  switch (processType) {
    case 'automated':
      return {
        border: 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/30',
        badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      };
    case 'manual':
      return {
        border: 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/30',
        badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      };
    case 'script':
      return {
        border: 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/30',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      };
    default:
      return {
        border: 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/30',
        badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      };
  }
};

/**
 * Process Step Node Component
 *
 * Renders an automated or manual process step with expandable details.
 * Fully accessible with keyboard navigation and ARIA attributes.
 *
 * @example
 * ```tsx
 * <ProcessStepNode
 *   data={{
 *     label: 'Generate Thumbnails',
 *     description: 'Create image thumbnails',
 *     processType: 'automated',
 *     timeout: 30
 *   }}
 *   selected={false}
 * />
 * ```
 */
export const ProcessStepNode: React.FC<NodeProps<ProcessStepNodeData>> = memo(({
  data,
  selected,
  id,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const ProcessIcon = getProcessIcon(data.processType);
  const colors = getProcessColorClasses(data.processType);

  const hasDetails = data.timeout || data.retryCount || data.script || (data.config && Object.keys(data.config).length > 0);
  const nodeId = `process-step-node-${id}`;
  const detailsId = `${nodeId}-details`;

  /**
   * Toggles the expanded state.
   */
  const handleToggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  /**
   * Handles keyboard events for accessibility.
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  return (
    <div
      id={nodeId}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-controls={hasDetails ? detailsId : undefined}
      aria-label={`Process step: ${data.label}. ${data.description || ''} Type: ${data.processType || 'process'}. ${isExpanded ? 'Expanded' : 'Collapsed'}`}
      className={`process-step-node border-2 rounded-lg shadow-lg min-w-[200px] transition-all cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${selected ? 'border-orange-500 ring-2 ring-orange-200 dark:ring-orange-800' : colors.border}
        ${isExpanded ? 'p-5' : 'p-4'}`}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
    >
      {/* Target Handle (Input) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white dark:border-gray-800"
        aria-label="Input connection point"
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center flex-1 min-w-0">
          <ProcessIcon
            className="w-5 h-5 text-orange-500 dark:text-orange-400 mr-2 flex-shrink-0"
            aria-hidden="true"
          />
          <span className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">
            {data.label}
          </span>
        </div>

        {hasDetails && (
          <span className="text-gray-400 ml-2" aria-hidden="true">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        )}
      </div>

      {/* Description */}
      {data.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {data.description}
        </p>
      )}

      {/* Process Type Badge */}
      {data.processType && (
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
          <ProcessIcon className="w-3 h-3 mr-1" aria-hidden="true" />
          <span className="capitalize">{data.processType}</span>
        </div>
      )}

      {/* Type Badge */}
      <div className="mt-2">
        <span
          className={`inline-block px-2 py-1 text-xs rounded font-medium ${colors.badge}`}
          aria-label="Node type: Process"
        >
          Process
        </span>
      </div>

      {/* Expanded Details Panel */}
      {isExpanded && hasDetails && (
        <div
          id={detailsId}
          className="mt-3 space-y-2 border-t border-gray-200 dark:border-gray-600 pt-2"
          role="region"
          aria-label="Process details"
        >
          {data.timeout && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium mr-1">Timeout:</span>
              <span>{data.timeout}s</span>
            </div>
          )}

          {data.retryCount !== undefined && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium mr-1">Retries:</span>
              <span>{data.retryCount}</span>
            </div>
          )}

          {data.script && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">Script:</span>
              <code className="ml-1 bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">
                {data.script.length > 30 ? `${data.script.slice(0, 30)}...` : data.script}
              </code>
            </div>
          )}

          {data.config && Object.keys(data.config).length > 0 && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">Config:</span>
              <ul className="mt-1 space-y-1" aria-label="Process configuration">
                {Object.entries(data.config).slice(0, 3).map(([key, value]) => (
                  <li key={key} className="ml-2 truncate">
                    <span className="font-mono">{key}</span>:{' '}
                    {typeof value === 'string' ? value.slice(0, 20) : String(value)}
                  </li>
                ))}
                {Object.keys(data.config).length > 3 && (
                  <li className="ml-2 text-gray-400 dark:text-gray-500">
                    ...and {Object.keys(data.config).length - 3} more
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Source Handle (Output) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400 border-2 border-white dark:border-gray-800"
        aria-label="Output connection point"
      />
    </div>
  );
});

ProcessStepNode.displayName = 'ProcessStepNode';

export default ProcessStepNode;
