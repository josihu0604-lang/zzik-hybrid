'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';

/**
 * useVirtualList - Virtual list hook for large lists
 *
 * Renders only visible items to improve performance
 * with thousands of items.
 */

interface UseVirtualListOptions<T> {
  /** Full list of items */
  items: T[];
  /** Height of each item in pixels */
  itemHeight: number;
  /** Container height in pixels */
  containerHeight: number;
  /** Number of items to render above/below visible area */
  overscan?: number;
}

interface UseVirtualListReturn<T> {
  /** Visible items to render */
  virtualItems: Array<{
    item: T;
    index: number;
    style: React.CSSProperties;
  }>;
  /** Total height of the list (for scroll container) */
  totalHeight: number;
  /** Ref to attach to scroll container */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Current scroll position */
  scrollTop: number;
  /** Scroll to a specific index */
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
  /** Check if an index is visible */
  isItemVisible: (index: number) => boolean;
}

export function useVirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
}: UseVirtualListOptions<T>): UseVirtualListReturn<T> {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Handle scroll
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate visible range
  const { startIndex, endIndex } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);
    return { startIndex: start, endIndex: end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Generate virtual items
  const virtualItems = useMemo(() => {
    const result = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (i >= 0 && i < items.length) {
        result.push({
          item: items[i],
          index: i,
          style: {
            position: 'absolute' as const,
            top: i * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
          },
        });
      }
    }
    return result;
  }, [items, startIndex, endIndex, itemHeight]);

  // Total list height
  const totalHeight = items.length * itemHeight;

  // Scroll to specific index
  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      const container = containerRef.current;
      if (!container) return;

      const scrollPosition = index * itemHeight;
      container.scrollTo({ top: scrollPosition, behavior });
    },
    [itemHeight]
  );

  // Check if item is visible
  const isItemVisible = useCallback(
    (index: number) => {
      return index >= startIndex && index <= endIndex;
    },
    [startIndex, endIndex]
  );

  return {
    virtualItems,
    totalHeight,
    containerRef,
    scrollTop,
    scrollToIndex,
    isItemVisible,
  };
}

/**
 * useInfiniteScroll - Infinite scroll hook
 *
 * Loads more items when scrolled near the bottom.
 */

interface UseInfiniteScrollOptions {
  /** Callback to load more items */
  onLoadMore: () => void | Promise<void>;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Whether currently loading */
  isLoading: boolean;
  /** Threshold in pixels before bottom to trigger load */
  threshold?: number;
  /** Root element (defaults to window) */
  root?: Element | null;
}

interface UseInfiniteScrollReturn {
  /** Ref to attach to sentinel element */
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 200,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isLoading, threshold]);

  return { sentinelRef };
}

/**
 * useLazyLoad - Lazy load items as they come into view
 */

interface UseLazyLoadOptions {
  /** Total number of items */
  totalCount: number;
  /** Items per batch */
  batchSize?: number;
  /** Initial batch count */
  initialBatches?: number;
}

interface UseLazyLoadReturn {
  /** Number of items to render */
  visibleCount: number;
  /** Load more items */
  loadMore: () => void;
  /** Whether there are more items */
  hasMore: boolean;
  /** Reset to initial state */
  reset: () => void;
}

export function useLazyLoad({
  totalCount,
  batchSize = 10,
  initialBatches = 2,
}: UseLazyLoadOptions): UseLazyLoadReturn {
  const [visibleCount, setVisibleCount] = useState(
    Math.min(batchSize * initialBatches, totalCount)
  );

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + batchSize, totalCount));
  }, [batchSize, totalCount]);

  const hasMore = visibleCount < totalCount;

  const reset = useCallback(() => {
    setVisibleCount(Math.min(batchSize * initialBatches, totalCount));
  }, [batchSize, initialBatches, totalCount]);

  return { visibleCount, loadMore, hasMore, reset };
}

export default useVirtualList;
