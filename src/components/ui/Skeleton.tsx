/**
 * @fileoverview Skeleton Loading Components for AEMFlow
 *
 * Provides skeleton loading placeholders that match the shape of content
 * to reduce perceived loading time and prevent layout shifts.
 *
 * @module components/ui/Skeleton
 */

import React from 'react';

/**
 * Base skeleton props
 */
interface SkeletonProps {
  /** Additional CSS classes */
  className?: string;
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Whether to use rounded corners */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Animation style */
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Base Skeleton component with customizable dimensions and animation.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'md',
  animation = 'pulse',
}) => {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      role="status"
      aria-label="Loading..."
      className={`bg-gray-200 dark:bg-gray-700 ${roundedClasses[rounded]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

/**
 * Text skeleton that mimics text lines.
 */
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`} role="status" aria-label="Loading text...">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height={16}
        width={i === lines - 1 ? '75%' : '100%'}
        rounded="sm"
      />
    ))}
  </div>
);

/**
 * Avatar skeleton for profile images.
 */
export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  return (
    <Skeleton
      width={sizes[size]}
      height={sizes[size]}
      rounded="full"
      className={className}
    />
  );
};

/**
 * Card skeleton for card-like content.
 */
export const SkeletonCard: React.FC<{
  hasImage?: boolean;
  className?: string;
}> = ({ hasImage = true, className = '' }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}
    role="status"
    aria-label="Loading card..."
  >
    {hasImage && (
      <Skeleton height={160} className="mb-4" rounded="md" />
    )}
    <Skeleton height={24} width="60%" className="mb-2" rounded="sm" />
    <SkeletonText lines={2} />
  </div>
);

/**
 * Workflow node skeleton for the canvas.
 */
export const SkeletonNode: React.FC<{
  className?: string;
}> = ({ className = '' }) => (
  <div
    className={`bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 min-w-[200px] ${className}`}
    role="status"
    aria-label="Loading node..."
  >
    <div className="flex items-center mb-3">
      <Skeleton width={20} height={20} rounded="sm" className="mr-2" />
      <Skeleton width={120} height={18} rounded="sm" />
    </div>
    <Skeleton width="100%" height={12} rounded="sm" className="mb-2" />
    <Skeleton width="75%" height={12} rounded="sm" />
  </div>
);

/**
 * Table row skeleton.
 */
export const SkeletonTableRow: React.FC<{
  columns?: number;
  className?: string;
}> = ({ columns = 4, className = '' }) => (
  <tr className={className} role="status" aria-label="Loading row...">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton height={16} rounded="sm" />
      </td>
    ))}
  </tr>
);

/**
 * List item skeleton.
 */
export const SkeletonListItem: React.FC<{
  hasAvatar?: boolean;
  className?: string;
}> = ({ hasAvatar = true, className = '' }) => (
  <div
    className={`flex items-center p-3 ${className}`}
    role="status"
    aria-label="Loading list item..."
  >
    {hasAvatar && <SkeletonAvatar size="sm" className="mr-3" />}
    <div className="flex-1">
      <Skeleton height={16} width="60%" className="mb-2" rounded="sm" />
      <Skeleton height={12} width="40%" rounded="sm" />
    </div>
  </div>
);

/**
 * Workflow canvas skeleton.
 */
export const SkeletonWorkflowCanvas: React.FC<{
  className?: string;
}> = ({ className = '' }) => (
  <div
    className={`relative w-full h-full min-h-[500px] bg-gray-50 dark:bg-gray-900 ${className}`}
    role="status"
    aria-label="Loading workflow canvas..."
  >
    {/* Toolbar skeleton */}
    <div className="absolute top-4 left-4 right-4 flex items-center gap-2">
      <Skeleton width={100} height={36} rounded="md" />
      <Skeleton width={100} height={36} rounded="md" />
      <Skeleton width={100} height={36} rounded="md" />
      <div className="flex-1" />
      <Skeleton width={80} height={36} rounded="md" />
    </div>

    {/* Canvas nodes skeleton */}
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-8">
      <SkeletonNode />
      <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
      <SkeletonNode />
      <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
      <SkeletonNode />
    </div>

    {/* Minimap skeleton */}
    <div className="absolute bottom-4 right-4">
      <Skeleton width={150} height={100} rounded="md" />
    </div>

    {/* Controls skeleton */}
    <div className="absolute bottom-4 left-4 flex flex-col gap-1">
      <Skeleton width={32} height={32} rounded="sm" />
      <Skeleton width={32} height={32} rounded="sm" />
      <Skeleton width={32} height={32} rounded="sm" />
    </div>
  </div>
);

/**
 * Template gallery skeleton.
 */
export const SkeletonTemplateGallery: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 6, className = '' }) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
    role="status"
    aria-label="Loading templates..."
  >
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} hasImage />
    ))}
  </div>
);

/**
 * Analytics dashboard skeleton.
 */
export const SkeletonAnalytics: React.FC<{
  className?: string;
}> = ({ className = '' }) => (
  <div className={`space-y-6 ${className}`} role="status" aria-label="Loading analytics...">
    {/* Stats row */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <Skeleton width={60} height={12} className="mb-2" rounded="sm" />
          <Skeleton width={80} height={32} rounded="sm" />
        </div>
      ))}
    </div>

    {/* Chart area */}
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <Skeleton width={200} height={24} className="mb-4" rounded="sm" />
      <Skeleton height={200} rounded="md" />
    </div>

    {/* Table */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Skeleton width={150} height={20} rounded="sm" />
      </div>
      <table className="w-full">
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonTableRow key={i} columns={4} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Skeleton;
