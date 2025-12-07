'use client';

import { useRef, useEffect, useCallback, type RefObject, type MutableRefObject } from 'react';

/**
 * Focus Trap Options
 *
 * WCAG 2.1 AA 준수를 위한 포커스 트랩 옵션
 */
export interface FocusTrapOptions {
  /**
   * 포커스 트랩 활성화 여부
   * @default true
   */
  enabled?: boolean;

  /**
   * 초기 포커스를 설정할 요소
   * - RefObject: 특정 요소 참조
   * - 'first': 첫 번째 포커스 가능한 요소
   * - 'last': 마지막 포커스 가능한 요소
   * @default 'first'
   */
  initialFocus?: RefObject<HTMLElement> | 'first' | 'last';

  /**
   * 포커스 트랩이 비활성화될 때 포커스를 복원할 요소
   * - RefObject: 특정 요소 참조
   * - true: 트랩 활성화 전 포커스된 요소로 복원
   * - false: 복원하지 않음
   * @default true
   */
  returnFocus?: RefObject<HTMLElement> | boolean;

  /**
   * Escape 키 핸들러
   * @param event KeyboardEvent
   */
  onEscape?: (event: KeyboardEvent) => void;

  /**
   * body 스크롤 방지 여부
   * @default true
   */
  preventScroll?: boolean;

  /**
   * 포커스 가능한 요소 선택자
   * @default 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
   */
  focusableSelector?: string;
}

/**
 * Focus Trap Return
 */
export interface FocusTrapReturn<T extends HTMLElement = HTMLElement> {
  /**
   * 포커스 트랩 컨테이너 ref (mutable)
   */
  containerRef: MutableRefObject<T | null>;

  /**
   * 첫 번째 포커스 가능한 요소 가져오기
   */
  getFirstFocusable: () => HTMLElement | null;

  /**
   * 마지막 포커스 가능한 요소 가져오기
   */
  getLastFocusable: () => HTMLElement | null;

  /**
   * 모든 포커스 가능한 요소 가져오기
   */
  getAllFocusable: () => HTMLElement[];
}

/**
 * Default focusable selector
 * WCAG 2.1 AA 준수: 모든 인터랙티브 요소 포함
 */
const DEFAULT_FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * useFocusTrap Hook
 *
 * Modal, BottomSheet, Dialog 등에서 포커스를 컨테이너 내부로 제한하는 훅
 *
 * Features:
 * - Tab/Shift+Tab으로 포커스 순환
 * - Escape 키로 닫기
 * - 초기 포커스 설정
 * - 포커스 복원
 * - body 스크롤 방지
 * - WCAG 2.1 AA 준수
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const closeButtonRef = useRef<HTMLButtonElement>(null);
 *   const { containerRef } = useFocusTrap({
 *     enabled: isOpen,
 *     initialFocus: closeButtonRef,
 *     onEscape: onClose,
 *   });
 *
 *   return (
 *     <div ref={containerRef} role="dialog" aria-modal="true">
 *       <button ref={closeButtonRef} onClick={onClose}>Close</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  options: FocusTrapOptions = {}
): FocusTrapReturn<T> {
  const {
    enabled = true,
    initialFocus = 'first',
    returnFocus = true,
    onEscape,
    preventScroll = true,
    focusableSelector = DEFAULT_FOCUSABLE_SELECTOR,
  } = options;

  const containerRef = useRef<T>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  /**
   * Get all focusable elements within container
   */
  const getAllFocusable = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const elements = containerRef.current.querySelectorAll<HTMLElement>(focusableSelector);
    return Array.from(elements).filter((el) => {
      // Filter out hidden elements
      const style = window.getComputedStyle(el);
      return (
        style.display !== 'none' && style.visibility !== 'hidden' && !el.hasAttribute('aria-hidden')
      );
    });
  }, [focusableSelector]);

  /**
   * Get first focusable element
   */
  const getFirstFocusable = useCallback((): HTMLElement | null => {
    const elements = getAllFocusable();
    return elements[0] || null;
  }, [getAllFocusable]);

  /**
   * Get last focusable element
   */
  const getLastFocusable = useCallback((): HTMLElement | null => {
    const elements = getAllFocusable();
    return elements[elements.length - 1] || null;
  }, [getAllFocusable]);

  /**
   * Handle Tab key for focus cycling
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || !containerRef.current) return;

      // Escape key
      if (event.key === 'Escape') {
        onEscape?.(event);
        return;
      }

      // Tab key
      if (event.key === 'Tab') {
        const focusableElements = getAllFocusable();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement as HTMLElement;

        // Shift + Tab (backward)
        if (event.shiftKey) {
          if (activeElement === firstElement || !containerRef.current.contains(activeElement)) {
            event.preventDefault();
            lastElement?.focus();
          }
        }
        // Tab (forward)
        else {
          if (activeElement === lastElement || !containerRef.current.contains(activeElement)) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    },
    [enabled, onEscape, getAllFocusable]
  );

  /**
   * Set initial focus
   */
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Save previously focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Set initial focus
    const setInitialFocusWithDelay = () => {
      if (!containerRef.current) return;

      let elementToFocus: HTMLElement | null = null;

      if (typeof initialFocus === 'object' && 'current' in initialFocus) {
        // RefObject
        elementToFocus = initialFocus.current;
      } else if (initialFocus === 'first') {
        elementToFocus = getFirstFocusable();
      } else if (initialFocus === 'last') {
        elementToFocus = getLastFocusable();
      }

      // Focus the element
      elementToFocus?.focus();
    };

    // Delay to ensure DOM is ready and animations have started
    const timeoutId = setTimeout(setInitialFocusWithDelay, 0);

    return () => clearTimeout(timeoutId);
  }, [enabled, initialFocus, getFirstFocusable, getLastFocusable]);

  /**
   * Set up keyboard event listener and scroll lock
   */
  useEffect(() => {
    if (!enabled) return;

    // Add keyboard listener
    document.addEventListener('keydown', handleKeyDown);

    // Prevent body scroll
    if (preventScroll) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown, preventScroll]);

  /**
   * Restore focus when trap is disabled
   */
  useEffect(() => {
    // Capture ref values at effect creation time
    const returnFocusRef =
      typeof returnFocus === 'object' && 'current' in returnFocus ? returnFocus : null;
    const prevElement = previouslyFocusedElement.current;

    return () => {
      if (!returnFocus) return;

      if (returnFocusRef) {
        // RefObject - use captured ref
        returnFocusRef.current?.focus();
      } else if (returnFocus === true && prevElement) {
        // Restore to previously focused element
        prevElement.focus();
      }
    };
  }, [returnFocus]);

  return {
    containerRef,
    getFirstFocusable,
    getLastFocusable,
    getAllFocusable,
  };
}

/**
 * Helper: Create focus trap ref for inline use
 *
 * @example
 * ```tsx
 * <div ref={createFocusTrapRef({ enabled: isOpen, onEscape: onClose })} />
 * ```
 */
export function createFocusTrapRef<T extends HTMLElement = HTMLElement>(
  options: FocusTrapOptions = {}
) {
  // This is a simplified version for inline use
  // For full features, use useFocusTrap hook
  return (element: T | null) => {
    if (!element || !options.enabled) return;

    const focusableSelector = options.focusableSelector || DEFAULT_FOCUSABLE_SELECTOR;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        options.onEscape?.(event);
        return;
      }

      if (event.key === 'Tab') {
        const focusableElements = Array.from(
          element.querySelectorAll<HTMLElement>(focusableSelector)
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  };
}

export default useFocusTrap;
