/**
 * @fileoverview Error Boundary Component for AEMFlow
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * @module components/ErrorBoundary
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

/**
 * Props for the ErrorBoundary component.
 */
interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Custom fallback UI to render on error */
  fallback?: ReactNode;
  /** Callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Component name for error tracking */
  componentName?: string;
  /** Whether to show detailed error info (dev mode) */
  showDetails?: boolean;
}

/**
 * State for the ErrorBoundary component.
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches errors in its child tree.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   componentName="WorkflowBuilder"
 *   onError={(error) => trackError(error)}
 * >
 *   <WorkflowBuilder />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Updates state when an error is caught.
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Logs error information when an error is caught.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, you would send to error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  /**
   * Resets the error state to retry rendering.
   */
  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Navigates to home page.
   */
  handleGoHome = (): void => {
    window.location.href = '/';
  };

  /**
   * Copies error details to clipboard.
   */
  handleCopyError = async (): Promise<void> => {
    const { error, errorInfo } = this.state;
    const errorText = `
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      alert('Error details copied to clipboard');
    } catch {
      console.error('Failed to copy error details');
    }
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, componentName, showDetails } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-[400px] flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900"
        >
          <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>

            {/* Error Title */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h2>

            {/* Component Name */}
            {componentName && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Error in: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{componentName}</code>
              </p>
            )}

            {/* Error Message */}
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error?.message || 'An unexpected error occurred. Please try again.'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                aria-label="Try again"
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                aria-label="Go to home page"
              >
                <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                Go Home
              </button>

              <button
                onClick={this.handleCopyError}
                className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                aria-label="Copy error details for bug report"
              >
                <Bug className="w-4 h-4 mr-2" aria-hidden="true" />
                Copy Error
              </button>
            </div>

            {/* Detailed Error Info (Development) */}
            {showDetails && errorInfo && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                  Show technical details
                </summary>
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-auto max-h-64">
                  <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    <strong>Error:</strong> {error?.message}
                    {'\n\n'}
                    <strong>Stack:</strong> {error?.stack}
                    {'\n\n'}
                    <strong>Component Stack:</strong> {errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Higher-order component to wrap a component with error boundary.
 *
 * @example
 * ```tsx
 * const SafeWorkflowBuilder = withErrorBoundary(WorkflowBuilder, {
 *   componentName: 'WorkflowBuilder'
 * });
 * ```
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary
      componentName={displayName}
      {...errorBoundaryProps}
    >
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}

export default ErrorBoundary;
