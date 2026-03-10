/**
 * @fileoverview Start/End Node Component
 *
 * Renders start and end nodes for workflow boundaries.
 * Fully accessible with proper ARIA attributes and keyboard support.
 *
 * @module components/nodes/StartEndNode
 */

import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@reactflow/core';
import { PlayCircle, CheckCircle, StopCircle } from 'lucide-react';

/**
 * Data structure for Start/End Node.
 */
interface StartEndNodeData {
  /** Display label for the node */
  label: string;
  /** Whether this is a start node (true) or end node (false) */
  isStart?: boolean;
  /** Optional description */
  description?: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Start/End Node Component
 *
 * Renders workflow boundary nodes (start or end) with appropriate styling
 * and accessibility features.
 *
 * @example
 * ```tsx
 * // Start node
 * <StartEndNode
 *   data={{ label: 'Begin Workflow', isStart: true }}
 *   selected={false}
 * />
 *
 * // End node
 * <StartEndNode
 *   data={{ label: 'Complete', isStart: false }}
 *   selected={false}
 * />
 * ```
 */
export const StartEndNode: React.FC<NodeProps<StartEndNodeData>> = memo(({
  data,
  selected,
  id,
}) => {
  const isStart = data.isStart ?? true;
  const nodeId = `start-end-node-${id}`;

  /**
   * Gets the appropriate icon based on node type and selection state.
   */
  const getIcon = useCallback(() => {
    if (isStart) {
      return (
        <PlayCircle
          className={`w-6 h-6 mb-2 transition-colors ${
            selected ? 'text-green-600 dark:text-green-400' : 'text-green-500 dark:text-green-500'
          }`}
          aria-hidden="true"
        />
      );
    }
    return (
      <CheckCircle
        className={`w-6 h-6 mb-2 transition-colors ${
          selected ? 'text-red-600 dark:text-red-400' : 'text-red-500 dark:text-red-500'
        }`}
        aria-hidden="true"
      />
    );
  }, [isStart, selected]);

  /**
   * Handles keyboard events for accessibility.
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // Trigger selection or action
    }
  }, []);

  const baseClasses = `
    start-end-node border-2 rounded-full p-4 shadow-lg min-w-[120px] text-center
    transition-all cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const colorClasses = isStart
    ? `bg-green-50 dark:bg-green-900/30 ${
        selected
          ? 'border-green-500 ring-2 ring-green-200 dark:ring-green-800 focus:ring-green-500'
          : 'border-green-400 dark:border-green-600 focus:ring-green-400'
      }`
    : `bg-red-50 dark:bg-red-900/30 ${
        selected
          ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800 focus:ring-red-500'
          : 'border-red-400 dark:border-red-600 focus:ring-red-400'
      }`;

  return (
    <div
      id={nodeId}
      role="button"
      tabIndex={0}
      aria-label={`${isStart ? 'Start' : 'End'} node: ${data.label}. ${data.description || ''}`}
      className={`${baseClasses} ${colorClasses}`}
      onKeyDown={handleKeyDown}
    >
      {/* Source Handle for Start Node */}
      {isStart && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 bg-green-400 dark:bg-green-500 border-2 border-white dark:border-gray-800"
          aria-label="Output connection point"
        />
      )}

      {/* Target Handle for End Node */}
      {!isStart && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-red-400 dark:bg-red-500 border-2 border-white dark:border-gray-800"
          aria-label="Input connection point"
        />
      )}

      {/* Content */}
      <div className="flex flex-col items-center">
        {getIcon()}

        <span
          className={`font-medium text-sm transition-colors ${
            isStart
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          }`}
        >
          {data.label}
        </span>

        {data.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-[100px] truncate">
            {data.description}
          </p>
        )}
      </div>

      {/* Visual indicator for node type */}
      <span className="sr-only">
        {isStart ? 'Workflow start point' : 'Workflow end point'}
      </span>
    </div>
  );
});

StartEndNode.displayName = 'StartEndNode';

export default StartEndNode;
