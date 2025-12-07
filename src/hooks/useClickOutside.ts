'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * useClickOutside Hook
 *
 * Detects clicks outside a referenced element.
 * Useful for closing dropdowns, modals, and popovers.
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setIsOpen(false));
 *
 * return (
 *   <div ref={ref}>
 *     <Dropdown isOpen={isOpen} />
 *   </div>
 * );
 * ```
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): void {
  // Store handler in ref to avoid recreating listener on every render
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(target)) {
        return;
      }

      handlerRef.current(event);
    };

    // Use mousedown instead of click for better UX
    // (click might fire after user releases mouse outside)
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, enabled]);
}

/**
 * useClickOutsideMultiple - Handle multiple refs
 *
 * @example
 * ```tsx
 * const buttonRef = useRef(null);
 * const menuRef = useRef(null);
 * useClickOutsideMultiple([buttonRef, menuRef], () => setIsOpen(false));
 * ```
 */
export function useClickOutsideMultiple<T extends HTMLElement = HTMLElement>(
  refs: RefObject<T | null>[],
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      // Check if click is inside any of the refs
      const isInside = refs.some((ref) => ref.current?.contains(target));

      if (!isInside) {
        handlerRef.current(event);
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [refs, enabled]);
}

export default useClickOutside;
