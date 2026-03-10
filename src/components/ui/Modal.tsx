/**
 * @fileoverview Accessible Modal Dialog Component
 *
 * Provides a fully accessible modal dialog with focus trapping,
 * keyboard navigation, and proper ARIA attributes.
 *
 * @module components/ui/Modal
 */

import React, { useEffect, useRef, useCallback, memo } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

/**
 * Props for the Modal component.
 */
interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal should close */
  onClose: () => void;
  /** Modal title for accessibility */
  title: string;
  /** Optional subtitle or description */
  description?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether clicking backdrop closes modal */
  closeOnBackdrop?: boolean;
  /** Whether pressing Escape closes modal */
  closeOnEscape?: boolean;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Custom class for the modal container */
  className?: string;
  /** Footer content (e.g., action buttons) */
  footer?: React.ReactNode;
  /** Whether modal is in dark mode */
  darkMode?: boolean;
}

/**
 * Gets size-specific classes for the modal.
 */
const getSizeClasses = (size: ModalProps['size']): string => {
  switch (size) {
    case 'sm': return 'max-w-sm';
    case 'md': return 'max-w-md';
    case 'lg': return 'max-w-lg';
    case 'xl': return 'max-w-xl';
    case 'full': return 'max-w-4xl w-full mx-4';
    default: return 'max-w-md';
  }
};

/**
 * Custom hook for focus trapping within a container.
 */
function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Store currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the first focusable element in the container
    const container = containerRef.current;
    if (container) {
      const focusableElements = getFocusableElements(container);
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }

    // Restore focus when modal closes
    return () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Shift+Tab from first element -> focus last element
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
    // Tab from last element -> focus first element
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }, []);

  return { containerRef, handleKeyDown };
}

/**
 * Gets all focusable elements within a container.
 */
function getFocusableElements(container: HTMLElement): NodeListOf<Element> {
  return container.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
}

/**
 * Accessible Modal Dialog Component
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   title="Confirm Action"
 *   description="Are you sure you want to proceed?"
 *   footer={
 *     <>
 *       <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
 *       <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
 *     </>
 *   }
 * >
 *   <p>This action cannot be undone.</p>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = memo(({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  footer,
  darkMode = false,
}) => {
  const { containerRef, handleKeyDown } = useFocusTrap(isOpen);
  const titleId = `modal-title-${React.useId()}`;
  const descriptionId = description ? `modal-desc-${React.useId()}` : undefined;

  // Handle Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  }, [closeOnBackdrop, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 transition-opacity ${
          darkMode ? 'bg-black/70' : 'bg-black/50'
        }`}
        aria-hidden="true"
        onClick={handleBackdropClick}
        data-testid="backdrop"
      />

      {/* Modal Container */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleKeyDown}
        className={`relative w-full ${getSizeClasses(size)} transform transition-all
          ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          rounded-xl shadow-2xl ${className}`}
        data-testid="modal"
      >
        {/* Header */}
        <div className={`flex items-start justify-between p-6 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div>
            <h2
              id={titleId}
              className="text-lg font-semibold"
            >
              {title}
            </h2>
            {description && (
              <p
                id={descriptionId}
                className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {description}
              </p>
            )}
          </div>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors
                ${darkMode
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`flex items-center justify-end gap-3 p-6 border-t ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Render in portal for proper stacking
  return createPortal(modalContent, document.body);
});

Modal.displayName = 'Modal';

export default Modal;
