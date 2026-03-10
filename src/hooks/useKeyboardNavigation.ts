/**
 * @fileoverview Keyboard Navigation Hook for AEMFlow
 *
 * Provides keyboard navigation utilities for workflow components,
 * including focus management, arrow key navigation, and keyboard shortcuts.
 *
 * @module hooks/useKeyboardNavigation
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Navigation direction types.
 */
export type NavigationDirection = 'up' | 'down' | 'left' | 'right' | 'next' | 'prev';

/**
 * Options for keyboard navigation.
 */
interface UseKeyboardNavigationOptions {
  /** Items to navigate through */
  items: string[];
  /** Callback when item is selected */
  onSelect?: (itemId: string) => void;
  /** Callback when item receives focus */
  onFocus?: (itemId: string, index: number) => void;
  /** Whether navigation is enabled */
  enabled?: boolean;
  /** Whether to loop at boundaries */
  loop?: boolean;
  /** Orientation of items */
  orientation?: 'horizontal' | 'vertical' | 'grid';
  /** Number of columns for grid layout */
  columns?: number;
  /** Initial focused index */
  initialIndex?: number;
}

/**
 * Return type for keyboard navigation hook.
 */
interface UseKeyboardNavigationReturn {
  /** Currently focused index */
  focusedIndex: number;
  /** Currently focused item ID */
  focusedItemId: string | null;
  /** Set focused index */
  setFocusedIndex: (index: number) => void;
  /** Handle keyboard event */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Get props for a navigable item */
  getItemProps: (itemId: string, index: number) => {
    tabIndex: number;
    'aria-selected': boolean;
    onFocus: () => void;
    onKeyDown: (event: React.KeyboardEvent) => void;
  };
  /** Focus a specific item */
  focusItem: (itemId: string) => void;
  /** Focus first item */
  focusFirst: () => void;
  /** Focus last item */
  focusLast: () => void;
  /** Move focus in direction */
  moveFocus: (direction: NavigationDirection) => void;
}

/**
 * Hook for managing keyboard navigation in lists and grids.
 *
 * @example
 * ```tsx
 * const { getItemProps, handleKeyDown } = useKeyboardNavigation({
 *   items: nodeIds,
 *   onSelect: (id) => selectNode(id),
 *   orientation: 'vertical',
 * });
 *
 * return (
 *   <ul onKeyDown={handleKeyDown}>
 *     {items.map((item, index) => (
 *       <li key={item.id} {...getItemProps(item.id, index)}>
 *         {item.name}
 *       </li>
 *     ))}
 *   </ul>
 * );
 * ```
 */
export function useKeyboardNavigation(
  options: UseKeyboardNavigationOptions
): UseKeyboardNavigationReturn {
  const {
    items,
    onSelect,
    onFocus,
    enabled = true,
    loop = true,
    orientation = 'vertical',
    columns = 1,
    initialIndex = 0,
  } = options;

  const [focusedIndex, setFocusedIndex] = useState(initialIndex);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Update focused index when items change
  useEffect(() => {
    if (focusedIndex >= items.length) {
      setFocusedIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, focusedIndex]);

  /**
   * Gets the next index based on direction and boundaries.
   */
  const getNextIndex = useCallback(
    (currentIndex: number, direction: NavigationDirection): number => {
      const total = items.length;
      if (total === 0) return -1;

      let nextIndex: number;

      switch (direction) {
        case 'next':
        case 'down':
          nextIndex = currentIndex + 1;
          if (nextIndex >= total) {
            nextIndex = loop ? 0 : total - 1;
          }
          break;

        case 'prev':
        case 'up':
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) {
            nextIndex = loop ? total - 1 : 0;
          }
          break;

        case 'right':
          if (orientation === 'grid') {
            const row = Math.floor(currentIndex / columns);
            const col = currentIndex % columns;
            const nextCol = col + 1;
            if (nextCol >= columns || row * columns + nextCol >= total) {
              nextIndex = loop ? row * columns : currentIndex;
            } else {
              nextIndex = row * columns + nextCol;
            }
          } else {
            nextIndex = currentIndex + 1;
            if (nextIndex >= total) {
              nextIndex = loop ? 0 : total - 1;
            }
          }
          break;

        case 'left':
          if (orientation === 'grid') {
            const row = Math.floor(currentIndex / columns);
            const col = currentIndex % columns;
            const nextCol = col - 1;
            if (nextCol < 0) {
              nextIndex = loop ? row * columns + columns - 1 : currentIndex;
              if (nextIndex >= total) nextIndex = total - 1;
            } else {
              nextIndex = row * columns + nextCol;
            }
          } else {
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) {
              nextIndex = loop ? total - 1 : 0;
            }
          }
          break;

        default:
          nextIndex = currentIndex;
      }

      return nextIndex;
    },
    [items.length, loop, orientation, columns]
  );

  /**
   * Moves focus in the specified direction.
   */
  const moveFocus = useCallback(
    (direction: NavigationDirection) => {
      if (!enabled || items.length === 0) return;

      const nextIndex = getNextIndex(focusedIndex, direction);
      if (nextIndex !== focusedIndex) {
        setFocusedIndex(nextIndex);
        onFocus?.(items[nextIndex], nextIndex);

        // Focus the DOM element
        const element = itemRefs.current.get(items[nextIndex]);
        element?.focus();
      }
    },
    [enabled, items, focusedIndex, getNextIndex, onFocus]
  );

  /**
   * Handles keyboard events for navigation.
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!enabled) return;

      const key = event.key;
      let handled = false;

      switch (key) {
        case 'ArrowDown':
          if (orientation !== 'horizontal') {
            moveFocus('down');
            handled = true;
          }
          break;

        case 'ArrowUp':
          if (orientation !== 'horizontal') {
            moveFocus('up');
            handled = true;
          }
          break;

        case 'ArrowRight':
          if (orientation !== 'vertical') {
            moveFocus('right');
            handled = true;
          }
          break;

        case 'ArrowLeft':
          if (orientation !== 'vertical') {
            moveFocus('left');
            handled = true;
          }
          break;

        case 'Home':
          setFocusedIndex(0);
          onFocus?.(items[0], 0);
          itemRefs.current.get(items[0])?.focus();
          handled = true;
          break;

        case 'End':
          const lastIndex = items.length - 1;
          setFocusedIndex(lastIndex);
          onFocus?.(items[lastIndex], lastIndex);
          itemRefs.current.get(items[lastIndex])?.focus();
          handled = true;
          break;

        case 'Enter':
        case ' ':
          if (items[focusedIndex]) {
            onSelect?.(items[focusedIndex]);
            handled = true;
          }
          break;
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [enabled, orientation, moveFocus, items, focusedIndex, onFocus, onSelect]
  );

  /**
   * Gets props for a navigable item.
   */
  const getItemProps = useCallback(
    (itemId: string, index: number) => ({
      tabIndex: index === focusedIndex ? 0 : -1,
      'aria-selected': index === focusedIndex,
      ref: (element: HTMLElement | null) => {
        if (element) {
          itemRefs.current.set(itemId, element);
        } else {
          itemRefs.current.delete(itemId);
        }
      },
      onFocus: () => {
        setFocusedIndex(index);
        onFocus?.(itemId, index);
      },
      onKeyDown: handleKeyDown,
    }),
    [focusedIndex, onFocus, handleKeyDown]
  );

  /**
   * Focuses a specific item by ID.
   */
  const focusItem = useCallback(
    (itemId: string) => {
      const index = items.indexOf(itemId);
      if (index !== -1) {
        setFocusedIndex(index);
        onFocus?.(itemId, index);
        itemRefs.current.get(itemId)?.focus();
      }
    },
    [items, onFocus]
  );

  /**
   * Focuses the first item.
   */
  const focusFirst = useCallback(() => {
    if (items.length > 0) {
      setFocusedIndex(0);
      onFocus?.(items[0], 0);
      itemRefs.current.get(items[0])?.focus();
    }
  }, [items, onFocus]);

  /**
   * Focuses the last item.
   */
  const focusLast = useCallback(() => {
    if (items.length > 0) {
      const lastIndex = items.length - 1;
      setFocusedIndex(lastIndex);
      onFocus?.(items[lastIndex], lastIndex);
      itemRefs.current.get(items[lastIndex])?.focus();
    }
  }, [items, onFocus]);

  return {
    focusedIndex,
    focusedItemId: items[focusedIndex] ?? null,
    setFocusedIndex,
    handleKeyDown,
    getItemProps,
    focusItem,
    focusFirst,
    focusLast,
    moveFocus,
  };
}

/**
 * Hook for roving tabindex pattern.
 * Useful for toolbar, tabs, and other composite widgets.
 */
export function useRovingTabIndex<T extends HTMLElement = HTMLElement>(
  itemCount: number,
  options: {
    orientation?: 'horizontal' | 'vertical';
    loop?: boolean;
    onFocusChange?: (index: number) => void;
  } = {}
) {
  const { orientation = 'horizontal', loop = true, onFocusChange } = options;
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemsRef = useRef<(T | null)[]>([]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
      const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';

      let newIndex = index;

      if (event.key === prevKey) {
        newIndex = index - 1;
        if (newIndex < 0) newIndex = loop ? itemCount - 1 : 0;
        event.preventDefault();
      } else if (event.key === nextKey) {
        newIndex = index + 1;
        if (newIndex >= itemCount) newIndex = loop ? 0 : itemCount - 1;
        event.preventDefault();
      } else if (event.key === 'Home') {
        newIndex = 0;
        event.preventDefault();
      } else if (event.key === 'End') {
        newIndex = itemCount - 1;
        event.preventDefault();
      }

      if (newIndex !== index) {
        setFocusedIndex(newIndex);
        itemsRef.current[newIndex]?.focus();
        onFocusChange?.(newIndex);
      }
    },
    [itemCount, loop, orientation, onFocusChange]
  );

  const getTabProps = useCallback(
    (index: number) => ({
      tabIndex: index === focusedIndex ? 0 : -1,
      ref: (el: T | null) => {
        itemsRef.current[index] = el;
      },
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, index),
      onFocus: () => {
        setFocusedIndex(index);
        onFocusChange?.(index);
      },
    }),
    [focusedIndex, handleKeyDown, onFocusChange]
  );

  return {
    focusedIndex,
    setFocusedIndex,
    getTabProps,
    focusItem: (index: number) => {
      itemsRef.current[index]?.focus();
      setFocusedIndex(index);
    },
  };
}

/**
 * Hook for managing focus within a container (focus trap).
 */
export function useFocusManager(containerRef: React.RefObject<HTMLElement>) {
  const previousFocus = useRef<HTMLElement | null>(null);

  /**
   * Gets all focusable elements in the container.
   */
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const selector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(containerRef.current.querySelectorAll<HTMLElement>(selector));
  }, [containerRef]);

  /**
   * Focuses the first focusable element.
   */
  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    elements[0]?.focus();
  }, [getFocusableElements]);

  /**
   * Focuses the last focusable element.
   */
  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    elements[elements.length - 1]?.focus();
  }, [getFocusableElements]);

  /**
   * Saves current focus for later restoration.
   */
  const saveFocus = useCallback(() => {
    previousFocus.current = document.activeElement as HTMLElement;
  }, []);

  /**
   * Restores previously saved focus.
   */
  const restoreFocus = useCallback(() => {
    previousFocus.current?.focus();
    previousFocus.current = null;
  }, []);

  /**
   * Traps focus within the container.
   */
  const trapFocus = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    },
    [getFocusableElements]
  );

  return {
    getFocusableElements,
    focusFirst,
    focusLast,
    saveFocus,
    restoreFocus,
    trapFocus,
  };
}

export default useKeyboardNavigation;
