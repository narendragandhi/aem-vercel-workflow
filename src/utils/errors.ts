/**
 * @fileoverview Centralized Error Handling Utilities
 *
 * Provides standardized error handling, classification, and reporting
 * for the AEMFlow application. Includes typed errors, error boundaries
 * support, and integration with logging/monitoring services.
 *
 * @module utils/errors
 */

/**
 * Base error class for AEMFlow errors.
 */
export class AEMFlowError extends Error {
  /** Unique error code for identification */
  public readonly code: string;
  /** HTTP status code if applicable */
  public readonly statusCode?: number;
  /** Additional context data */
  public readonly context?: Record<string, unknown>;
  /** Whether this error is recoverable */
  public readonly recoverable: boolean;
  /** Timestamp when error occurred */
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string,
    options: {
      statusCode?: number;
      context?: Record<string, unknown>;
      recoverable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'AEMFlowError';
    this.code = code;
    this.statusCode = options.statusCode;
    this.context = options.context;
    this.recoverable = options.recoverable ?? true;
    this.timestamp = new Date();

    // Maintains proper stack trace (only works in V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AEMFlowError);
    }

    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, AEMFlowError.prototype);
  }

  /**
   * Creates a user-friendly error message.
   */
  toUserMessage(): string {
    return this.message;
  }

  /**
   * Serializes error for logging/reporting.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      recoverable: this.recoverable,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * Error thrown when a network request fails.
 */
export class NetworkError extends AEMFlowError {
  constructor(
    message: string,
    options: {
      statusCode?: number;
      url?: string;
      method?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, 'NETWORK_ERROR', {
      statusCode: options.statusCode,
      context: { url: options.url, method: options.method },
      recoverable: true,
      cause: options.cause,
    });
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }

  toUserMessage(): string {
    if (this.statusCode === 404) {
      return 'The requested resource was not found.';
    }
    if (this.statusCode === 401 || this.statusCode === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (this.statusCode && this.statusCode >= 500) {
      return 'The server encountered an error. Please try again later.';
    }
    return 'A network error occurred. Please check your connection and try again.';
  }
}

/**
 * Error thrown when data validation fails.
 */
export class ValidationError extends AEMFlowError {
  /** Field-specific validation errors */
  public readonly fieldErrors: Record<string, string[]>;

  constructor(
    message: string,
    fieldErrors: Record<string, string[]> = {},
    context?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', {
      context: { ...context, fieldErrors },
      recoverable: true,
    });
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Gets all error messages as a flat array.
   */
  getAllMessages(): string[] {
    return Object.values(this.fieldErrors).flat();
  }

  toUserMessage(): string {
    const messages = this.getAllMessages();
    if (messages.length === 0) {
      return this.message;
    }
    if (messages.length === 1) {
      return messages[0];
    }
    return `${this.message}: ${messages.join(', ')}`;
  }
}

/**
 * Error thrown when a workflow operation fails.
 */
export class WorkflowError extends AEMFlowError {
  /** ID of the affected workflow */
  public readonly workflowId?: string;
  /** Step ID if error is step-specific */
  public readonly stepId?: string;

  constructor(
    message: string,
    options: {
      workflowId?: string;
      stepId?: string;
      recoverable?: boolean;
    } = {}
  ) {
    super(message, 'WORKFLOW_ERROR', {
      context: { workflowId: options.workflowId, stepId: options.stepId },
      recoverable: options.recoverable ?? true,
    });
    this.name = 'WorkflowError';
    this.workflowId = options.workflowId;
    this.stepId = options.stepId;
    Object.setPrototypeOf(this, WorkflowError.prototype);
  }
}

/**
 * Error thrown when authentication/authorization fails.
 */
export class AuthError extends AEMFlowError {
  constructor(message: string, statusCode: number = 401) {
    super(message, 'AUTH_ERROR', {
      statusCode,
      recoverable: false,
    });
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }

  toUserMessage(): string {
    if (this.statusCode === 401) {
      return 'Your session has expired. Please log in again.';
    }
    if (this.statusCode === 403) {
      return 'You do not have permission to perform this action.';
    }
    return 'Authentication failed. Please log in again.';
  }
}

// =====================================
// Error Classification
// =====================================

/**
 * Classifies an error into a known error type.
 */
export function classifyError(error: unknown): AEMFlowError {
  if (error instanceof AEMFlowError) {
    return error;
  }

  if (error instanceof TypeError) {
    return new AEMFlowError(
      error.message || 'A type error occurred',
      'TYPE_ERROR',
      { recoverable: true, cause: error }
    );
  }

  if (error instanceof Error) {
    // Check for network-related errors
    if (
      error.name === 'TypeError' &&
      (error.message.includes('fetch') || error.message.includes('network'))
    ) {
      return new NetworkError('Network request failed', { cause: error });
    }

    return new AEMFlowError(
      error.message || 'An unexpected error occurred',
      'UNKNOWN_ERROR',
      { recoverable: true, cause: error }
    );
  }

  // Handle non-Error throws
  return new AEMFlowError(
    String(error) || 'An unexpected error occurred',
    'UNKNOWN_ERROR',
    { recoverable: true }
  );
}

// =====================================
// Error Handling Utilities
// =====================================

/**
 * Options for error handling.
 */
interface ErrorHandlerOptions {
  /** Show user notification */
  notify?: boolean;
  /** Log to console */
  log?: boolean;
  /** Report to monitoring service */
  report?: boolean;
  /** Custom notification message */
  notificationMessage?: string;
}

/**
 * Centralized error handler.
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): AEMFlowError {
  const { notify = true, log = true, report = true, notificationMessage } = options;

  const classifiedError = classifyError(error);

  // Log to console
  if (log) {
    console.error('[AEMFlow Error]', classifiedError.toJSON());
  }

  // Report to monitoring service (in production)
  if (report && process.env.NODE_ENV === 'production') {
    reportError(classifiedError);
  }

  // Show user notification
  if (notify) {
    const message = notificationMessage || classifiedError.toUserMessage();
    showErrorNotification(message, classifiedError.recoverable);
  }

  return classifiedError;
}

/** Error listeners for custom integrations */
const errorListeners: Array<(error: AEMFlowError) => void> = [];

/**
 * Registers an error listener for monitoring integrations.
 * Use this to integrate with services like Sentry, DataDog, etc.
 *
 * @example
 * ```ts
 * // Integrate with Sentry
 * addErrorListener((error) => {
 *   Sentry.captureException(error, {
 *     extra: error.context,
 *     tags: { code: error.code }
 *   });
 * });
 * ```
 */
export function addErrorListener(listener: (error: AEMFlowError) => void): void {
  errorListeners.push(listener);
}

/**
 * Removes an error listener.
 */
export function removeErrorListener(listener: (error: AEMFlowError) => void): void {
  const index = errorListeners.indexOf(listener);
  if (index > -1) {
    errorListeners.splice(index, 1);
  }
}

/**
 * Reports error to monitoring service.
 * Calls all registered error listeners and logs to console.
 */
function reportError(error: AEMFlowError): void {
  // Log error details for debugging
  console.error('[AEMFlow Error Report]', {
    code: error.code,
    message: error.message,
    context: error.context,
    timestamp: error.timestamp.toISOString(),
  });

  // Notify all registered listeners (e.g., Sentry, DataDog integrations)
  errorListeners.forEach((listener) => {
    try {
      listener(error);
    } catch (listenerError) {
      console.error('[Error Listener Failed]', listenerError);
    }
  });
}

/** Notification handler for displaying user messages */
let notificationHandler: ((message: string, options: { recoverable: boolean; type: 'error' | 'warning' }) => void) | null = null;

/**
 * Sets the notification handler for displaying errors to users.
 * Use this to integrate with toast libraries like react-hot-toast, sonner, etc.
 *
 * @example
 * ```ts
 * // Integrate with react-hot-toast
 * import toast from 'react-hot-toast';
 * setNotificationHandler((message, options) => {
 *   toast.error(message, { duration: options.recoverable ? 5000 : 10000 });
 * });
 *
 * // Integrate with sonner
 * import { toast } from 'sonner';
 * setNotificationHandler((message, options) => {
 *   toast.error(message, { duration: options.recoverable ? 5000 : 10000 });
 * });
 * ```
 */
export function setNotificationHandler(
  handler: (message: string, options: { recoverable: boolean; type: 'error' | 'warning' }) => void
): void {
  notificationHandler = handler;
}

/**
 * Shows error notification to user.
 * Uses custom handler if set, otherwise falls back to console.
 */
function showErrorNotification(message: string, recoverable: boolean): void {
  if (notificationHandler) {
    notificationHandler(message, { recoverable, type: 'error' });
  } else {
    // Fallback: Create a simple DOM notification if in browser
    if (typeof document !== 'undefined') {
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${recoverable ? '#ef4444' : '#dc2626'};
        color: white;
        border-radius: 8px;
        font-family: system-ui, sans-serif;
        font-size: 14px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
      }, recoverable ? 5000 : 10000);
    } else {
      console.warn('[User Notification]', message, { recoverable });
    }
  }
}

// =====================================
// Async Error Handling
// =====================================

/**
 * Result type for operations that can fail.
 */
export type Result<T, E = AEMFlowError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Wraps an async function with error handling.
 *
 * @example
 * ```ts
 * const result = await safeAsync(fetchWorkflow, workflowId);
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  options?: ErrorHandlerOptions
): Promise<Result<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const handledError = handleError(error, { notify: false, ...options });
    return { success: false, error: handledError };
  }
}

/**
 * Creates a wrapped async function with built-in error handling.
 *
 * @example
 * ```ts
 * const safeFetchWorkflow = withErrorHandling(fetchWorkflow, {
 *   notificationMessage: 'Failed to load workflow'
 * });
 * const workflow = await safeFetchWorkflow(id);
 * ```
 */
export function withErrorHandling<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options?: ErrorHandlerOptions
): (...args: TArgs) => Promise<Result<TReturn>> {
  return async (...args: TArgs): Promise<Result<TReturn>> => {
    return safeAsync(() => fn(...args), options);
  };
}

// =====================================
// HTTP Response Error Parsing
// =====================================

/**
 * Parses an HTTP response and throws appropriate error if not OK.
 */
export async function parseResponseError(response: Response): Promise<never> {
  let errorMessage = `Request failed with status ${response.status}`;
  let errorData: Record<string, unknown> | undefined;

  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      errorData = await response.json();
      errorMessage = (errorData as { message?: string }).message || errorMessage;
    } else {
      const text = await response.text();
      if (text) {
        errorMessage = text;
      }
    }
  } catch {
    // Ignore parsing errors
  }

  if (response.status === 401 || response.status === 403) {
    throw new AuthError(errorMessage, response.status);
  }

  if (response.status === 400 && errorData) {
    const fieldErrors = (errorData as { errors?: Record<string, string[]> }).errors || {};
    throw new ValidationError(errorMessage, fieldErrors);
  }

  throw new NetworkError(errorMessage, {
    statusCode: response.status,
    url: response.url,
  });
}

/**
 * Wraps fetch with automatic error handling.
 */
export async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    await parseResponseError(response);
  }

  return response.json();
}
