/**
 * useSticky Hook
 *
 * Handles sticky element behavior using Intersection Observer.
 * Extracted from CategoryFilter for reuse across components.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseStickyOptions {
  /** Threshold for intersection observer (0-1) */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Initial sticky state */
  initialSticky?: boolean;
}

interface UseStickyReturn<T extends HTMLElement> {
  /** Ref to attach to the sticky element */
  ref: React.RefObject<T>;
  /** Whether the element is currently stuck */
  isSticky: boolean;
  /** Current scroll direction */
  scrollDirection: 'up' | 'down' | null;
  /** Distance scrolled from the sentinel */
  scrollOffset: number;
}

/**
 * Custom hook for sticky element behavior
 * Uses Intersection Observer for performant scroll detection
 */
export function useSticky<T extends HTMLElement = HTMLDivElement>(
  options: UseStickyOptions = {}
): UseStickyReturn<T> {
  const { threshold = 0, rootMargin = '0px', initialSticky = false } = options;

  const ref = useRef<T>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const lastScrollY = useRef(0);

  const [isSticky, setIsSticky] = useState(initialSticky);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Track scroll direction
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY.current) {
      setScrollDirection('down');
    } else if (currentScrollY < lastScrollY.current) {
      setScrollDirection('up');
    }

    lastScrollY.current = currentScrollY;

    // Calculate offset from sentinel
    if (sentinelRef.current) {
      const sentinelRect = sentinelRef.current.getBoundingClientRect();
      setScrollOffset(Math.max(0, -sentinelRect.top));
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const element = ref.current;
    if (!element) return;

    // Create sentinel element for intersection detection
    const sentinel = document.createElement('div');
    sentinel.style.cssText =
      'position: absolute; top: 0; left: 0; right: 0; height: 1px; pointer-events: none;';
    element.parentElement?.insertBefore(sentinel, element);
    sentinelRef.current = sentinel;

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Element is sticky when sentinel is out of view (scrolled past)
          setIsSticky(!entry.isIntersecting);
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(sentinel);

    // Add scroll listener for direction tracking
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      sentinel.remove();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold, rootMargin, handleScroll]);

  return {
    ref,
    isSticky,
    scrollDirection,
    scrollOffset,
  };
}

/**
 * Simplified version for basic sticky detection only
 */
export function useStickySimple<T extends HTMLElement = HTMLDivElement>(
  stickyOffset: number = 0
): { ref: React.RefObject<T>; isSticky: boolean } {
  const ref = useRef<T>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      setIsSticky(rect.top <= stickyOffset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [stickyOffset]);

  return { ref, isSticky };
}

export default useSticky;
