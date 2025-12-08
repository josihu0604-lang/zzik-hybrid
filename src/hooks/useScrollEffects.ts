'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { getScrollPosition, type ScrollPosition } from '@/lib/mobile-ux';

/**
 * DES-114~117: 스크롤 관련 Hook
 *
 * - DES-114: 스크롤 위치 복원
 * - DES-115: Overscroll 조정
 * - DES-116: Infinite scroll
 * - DES-117: 수평 스크롤 인디케이터
 */

// ============================================================================
// DES-114: 스크롤 위치 복원
// ============================================================================

const scrollPositions = new Map<string, number>();

/**
 * 페이지 스크롤 위치 저장/복원 Hook
 */
export function useScrollRestoration(key?: string) {
  const pathname = usePathname();
  const scrollKey = key || pathname;
  const restoredRef = useRef(false);

  // 스크롤 위치 저장
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleScroll = () => {
      scrollPositions.set(scrollKey, window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollKey]);

  // 스크롤 위치 복원
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (restoredRef.current) return;

    const savedPosition = scrollPositions.get(scrollKey);
    if (savedPosition !== undefined) {
      // 약간의 딜레이 후 복원 (DOM 렌더링 완료 대기)
      requestAnimationFrame(() => {
        window.scrollTo({
          top: savedPosition,
          behavior: 'instant' as ScrollBehavior,
        });
        restoredRef.current = true;
      });
    }
  }, [scrollKey]);

  // 수동 저장/복원 함수
  const saveScrollPosition = useCallback(() => {
    scrollPositions.set(scrollKey, window.scrollY);
  }, [scrollKey]);

  const restoreScrollPosition = useCallback(() => {
    const savedPosition = scrollPositions.get(scrollKey);
    if (savedPosition !== undefined) {
      window.scrollTo({
        top: savedPosition,
        behavior: 'smooth',
      });
    }
  }, [scrollKey]);

  const clearScrollPosition = useCallback(() => {
    scrollPositions.delete(scrollKey);
  }, [scrollKey]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition,
  };
}

// ============================================================================
// DES-116: Infinite Scroll
// ============================================================================

interface UseInfiniteScrollOptions {
  /** 데이터 로드 함수 */
  onLoadMore: () => void | Promise<void>;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 더 불러올 데이터가 있는지 */
  hasMore: boolean;
  /** 하단으로부터의 임계값 (px) */
  threshold?: number;
  /** Root element (기본: window) */
  root?: HTMLElement | null;
}

export function useInfiniteScroll({
  onLoadMore,
  isLoading,
  hasMore,
  threshold = 300,
  root = null,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!hasMore || isLoading) return;

    const options: IntersectionObserverInit = {
      root,
      rootMargin: `0px 0px ${threshold}px 0px`,
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    }, options);

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observerRef.current.observe(currentSentinel);
    }

    return () => {
      if (observerRef.current && currentSentinel) {
        observerRef.current.unobserve(currentSentinel);
      }
    };
  }, [hasMore, isLoading, onLoadMore, threshold, root]);

  // Sentinel element를 렌더링할 ref 반환
  return sentinelRef;
}

// ============================================================================
// DES-117: 수평 스크롤 인디케이터
// ============================================================================

/**
 * 수평 스크롤 상태 추적 Hook
 */
export function useHorizontalScroll<T extends HTMLElement = HTMLDivElement>() {
  const scrollRef = useRef<T | null>(null);
  const [scrollState, setScrollState] = useState<ScrollPosition>({
    atStart: true,
    atEnd: false,
    scrollPercentage: 0,
  });

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;

    const state = getScrollPosition(scrollRef.current);
    setScrollState(state);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const element = scrollRef.current;
    if (!element) return;

    // 초기 상태 설정
    updateScrollState();

    // 스크롤 이벤트 리스너
    element.addEventListener('scroll', updateScrollState, { passive: true });

    // 리사이즈 감지
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState]);

  return {
    scrollRef,
    scrollState,
    updateScrollState,
  };
}

// ============================================================================
// DES-115: Pull-to-Refresh 지원
// ============================================================================

interface UsePullToRefreshOptions {
  /** 새로고침 함수 */
  onRefresh: () => Promise<void>;
  /** 임계값 (px) */
  threshold?: number;
  /** 활성화 여부 */
  enabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  enabled = true,
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartRef = useRef<number>(0);
  const isPullingRef = useRef(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || window.scrollY > 0) return;

      touchStartRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    },
    [enabled]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPullingRef.current || !enabled) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartRef.current;

      if (distance > 0 && window.scrollY === 0) {
        // 저항 효과 (rubber band effect)
        const resistedDistance = Math.min(distance * 0.5, threshold * 1.5);
        setPullDistance(resistedDistance);

        // 임계값 초과 시 스크롤 방지
        if (resistedDistance > threshold) {
          e.preventDefault();
        }
      }
    },
    [threshold, enabled]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current || !enabled) return;

    isPullingRef.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh, enabled]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!enabled) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, enabled]);

  return {
    isRefreshing,
    pullDistance,
    isPulling: isPullingRef.current,
  };
}

// ============================================================================
// 스크롤 방향 감지
// ============================================================================

type ScrollDirection = 'up' | 'down' | null;

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up');
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollDirection;
}

export default {
  useScrollRestoration,
  useInfiniteScroll,
  useHorizontalScroll,
  usePullToRefresh,
  useScrollDirection,
};
