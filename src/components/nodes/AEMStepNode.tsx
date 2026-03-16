/**
 * @fileoverview AEM Step Node Component
 *
 * Renders an AEM participant or process step in the workflow builder.
 * Supports expandable details, accessibility, and keyboard navigation.
 *
 * @module components/nodes/AEMStepNode
 */

import React, { memo, useCallback, useState } from 'react';
import { Handle, NodeProps, Position } from '@reactflow/core';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Clock, ExternalLink, GitBranch, Settings, User } from 'lucide-react';

/**
 * Data structure for AEM Step Node.
 */
interface AEMStepNodeData {
  /** Display label for the step */
  label: string;
  /** Description of what this step does */
  description?: string;
  /** User/group assigned to this step */
  participant?: string;
  /** Type of step */
  stepType?: 'participant' | 'process' | 'external' | 'custom';
  /** Additional configuration */
  config?: Record<string, unknown>;
  /** Timeout in minutes */
  timeout?: number;
  /** Whether to auto-advance on completion */
  autoAdvance?: boolean;
  /** Email notifications to send */
  notifications?: string[];
  /** Step parameters */
  parameters?: Record<string, unknown>;
}

/**
 * Maps step type to icon component.
 */
const getStepIcon = (stepType?: string): React.FC<{ className?: string }> => {
  switch (stepType) {
    case 'participant': return User;
    case 'process': return Settings;
    case 'external': return ExternalLink;
    default: return GitBranch;
  }
};

/**
 * Maps step type to color classes.
 */
const getStepColorClasses = (stepType?: string): string => {
  switch (stepType) {
    case 'participant': return 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30';
    case 'process': return 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/30';
    case 'external': return 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/30';
    default: return 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/30';
  }
};

/**
 * Maps step type to badge color classes.
 */
const getBadgeColorClasses = (stepType?: string): string => {
  switch (stepType) {
    case 'participant': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    case 'process': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    case 'external': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
    default: return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
  }
};

/**
 * AEM Step Node Component
 *
 * Renders a workflow step node with expandable details panel.
 * Fully accessible with keyboard navigation and ARIA attributes.
 *
 * @example
 * ```tsx
 * <AEMStepNode
 *   data={{
 *     label: 'Content Review',
 *     description: 'Review content for approval',
 *     participant: 'content-reviewers',
 *     stepType: 'participant',
 *     timeout: 48
 *   }}
 *   selected={false}
 * />
 * ```
 */
export const AEMStepNode: React.FC<NodeProps<AEMStepNodeData>> = memo(({ data, selected, id }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const StepIcon = getStepIcon(data.stepType);
  const colorClasses = getStepColorClasses(data.stepType);
  const badgeClasses = getBadgeColorClasses(data.stepType);

  /**
   * Toggles the expanded state of the node details.
   */
  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  /**
   * Handles keyboard events for accessibility.
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggleExpand();
    }
  }, [handleToggleExpand]);

  const nodeId = `aem-step-node-${id}`;
  const detailsId = `${nodeId}-details`;
  const hasDetails = data.timeout || data.autoAdvance || data.notifications?.length || (data.parameters && Object.keys(data.parameters).length > 0);

  return (
    <div
      id={nodeId}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-controls={hasDetails ? detailsId : undefined}
      aria-label={`${data.stepType || 'Step'}: ${data.label}. ${data.description || ''} ${isExpanded ? 'Expanded' : 'Collapsed'}`}
      className={`aem-step-node border-2 rounded-lg shadow-lg min-w-[220px] transition-all cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${selected ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : colorClasses}
        ${isExpanded ? 'p-5' : 'p-4'}`}
      onClick={handleToggleExpand}
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
          <StepIcon
            className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-2 flex-shrink-0"
            aria-hidden="true"
          />
          <span className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">
            {data.label}
          </span>
        </div>

        <div className="flex items-center gap-2 ml-2">
          {data.stepType && (
            <span
              className={`inline-block px-2 py-1 text-xs rounded font-medium ${badgeClasses}`}
              aria-label={`Step type: ${data.stepType}`}
            >
              {data.stepType}
            </span>
          )}

          {hasDetails && (
            <span className="text-gray-400" aria-hidden="true">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {data.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {data.description}
        </p>
      )}

      {/* Participant Info */}
      {data.participant && (
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
          <User className="w-3 h-3 mr-1" aria-hidden="true" />
          <span>
            <span className="sr-only">Assigned to:</span>
            {data.participant}
          </span>
        </div>
      )}

      {/* Expanded Details Panel */}
      {isExpanded && hasDetails && (
        <div
          id={detailsId}
          className="mt-3 space-y-2 border-t border-gray-200 dark:border-gray-600 pt-2"
          role="region"
          aria-label="Step details"
        >
          {data.timeout && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
              <span>
                <span className="sr-only">Timeout:</span>
                {data.timeout} minutes
              </span>
            </div>
          )}

          {data.autoAdvance && (
            <div className="flex items-center text-xs text-green-600 dark:text-green-400">
              <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
              <span>Auto-advance enabled</span>
            </div>
          )}

          {data.notifications && data.notifications.length > 0 && (
            <div className="flex items-center text-xs text-orange-600 dark:text-orange-400">
              <AlertTriangle className="w-3 h-3 mr-1" aria-hidden="true" />
              <span>
                {data.notifications.length} notification{data.notifications.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {data.parameters && Object.keys(data.parameters).length > 0 && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">Parameters:</span>
              <ul className="mt-1 space-y-1" aria-label="Step parameters">
                {Object.entries(data.parameters).slice(0, 3).map(([key, value]) => (
                  <li key={key} className="ml-2 truncate">
                    <span className="font-mono">{key}</span>:{' '}
                    {typeof value === 'string' ? value.slice(0, 20) : String(value)}
                  </li>
                ))}
                {Object.keys(data.parameters).length > 3 && (
                  <li className="ml-2 text-gray-400 dark:text-gray-500">
                    ...and {Object.keys(data.parameters).length - 3} more
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

AEMStepNode.displayName = 'AEMStepNode';

export default AEMStepNode;
