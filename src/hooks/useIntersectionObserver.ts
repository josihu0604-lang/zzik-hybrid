'use client';

import { useState, useEffect, useRef, useCallback, type RefObject } from 'react';

/**
 * Intersection Observer Options
 */
interface UseIntersectionObserverOptions {
  /**
   * Element that is used as the viewport
   * @default null (browser viewport)
   */
  root?: Element | null;

  /**
   * Margin around the root
   * @default '0px'
   */
  rootMargin?: string;

  /**
   * Visibility threshold(s) to trigger callback
   * @default 0
   */
  threshold?: number | number[];

  /**
   * Only trigger once then disconnect
   * @default false
   */
  triggerOnce?: boolean;

  /**
   * Freeze observer after first intersection
   * @default false
   */
  freezeOnceVisible?: boolean;
}

interface UseIntersectionObserverReturn {
  /**
   * Ref to attach to the observed element
   */
  ref: RefObject<HTMLElement | null>;

  /**
   * Whether element is currently intersecting
   */
  isIntersecting: boolean;

  /**
   * Full IntersectionObserverEntry (null if not observed yet)
   */
  entry: IntersectionObserverEntry | null;

  /**
   * Manually disconnect the observer
   */
  disconnect: () => void;
}

/**
 * useIntersectionObserver Hook
 *
 * Tracks when an element enters or leaves the viewport.
 * Useful for lazy loading, infinite scroll, and animations.
 *
 * @example
 * ```tsx
 * // Basic usage - lazy load image
 * const { ref, isIntersecting } = useIntersectionObserver();
 * return (
 *   <div ref={ref}>
 *     {isIntersecting && <img src={imageSrc} />}
 *   </div>
 * );
 *
 * // With threshold and trigger once
 * const { ref, isIntersecting } = useIntersectionObserver({
 *   threshold: 0.5,
 *   triggerOnce: true
 * });
 *
 * // Animate on scroll
 * const { ref, isIntersecting } = useIntersectionObserver({
 *   rootMargin: '-100px',
 *   freezeOnceVisible: true
 * });
 * ```
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    triggerOnce = false,
    freezeOnceVisible = false,
  } = options;

  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  // Frozen state - once visible, stay visible
  const frozen = freezeOnceVisible && isIntersecting;

  // Disconnect function
  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Skip if frozen or no element
    if (frozen || !elementRef.current) return;

    // Skip if IntersectionObserver not supported
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: assume visible
      setIsIntersecting(true);
      return;
    }

    // Create observer
    const observer = new IntersectionObserver(
      ([observerEntry]) => {
        setEntry(observerEntry);
        setIsIntersecting(observerEntry.isIntersecting);

        // Disconnect after first intersection if triggerOnce
        if (triggerOnce && observerEntry.isIntersecting) {
          observer.disconnect();
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    observer.observe(elementRef.current);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, triggerOnce, frozen]);

  return {
    ref: elementRef,
    isIntersecting,
    entry,
    disconnect,
  };
}

/**
 * useInView - Simplified version
 *
 * @example
 * ```tsx
 * const ref = useRef(null);
 * const inView = useInView(ref);
 * ```
 */
export function useInView(
  ref: RefObject<Element | null>,
  options: IntersectionObserverInit = {}
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!ref.current || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, options.root, options.rootMargin, options.threshold]);

  return inView;
}

export default useIntersectionObserver;
