'use client';

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useVirtualizer, VirtualizerOptions, Virtualizer } from '@tanstack/react-virtual';

/**
 * useVirtualScroll - 가상 스크롤 관리 훅
 *
 * @features
 * - @tanstack/react-virtual 기반 가상화
 * - 스크롤 위치 복원 (페이지 이동 후 복귀)
 * - 동적 아이템 높이 측정
 * - 무한 스크롤 지원
 * - 스크롤 이벤트 최적화
 */

export interface UseVirtualScrollOptions<T> {
  /** 아이템 배열 */
  items: T[];
  /** 아이템 예상 높이 */
  estimateSize?: number;
  /** 오버스캔 카운트 */
  overscan?: number;
  /** 스크롤 위치 복원 키 (localStorage에 저장) */
  scrollRestorationKey?: string;
  /** 무한 스크롤: 더 많은 아이템이 있는지 */
  hasMore?: boolean;
  /** 무한 스크롤: 더 로드하는 콜백 */
  onLoadMore?: () => void | Promise<void>;
  /** 무한 스크롤: 로드 트리거 임계값 */
  loadMoreThreshold?: number;
  /** 동적 높이 측정 활성화 */
  enableDynamicSize?: boolean;
  /** 가로 스크롤 모드 */
  horizontal?: boolean;
}

export interface UseVirtualScrollReturn<T> {
  /** @tanstack/react-virtual의 Virtualizer 인스턴스 */
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  /** 스크롤 컨테이너 ref */
  scrollRef: React.RefObject<HTMLDivElement>;
  /** 현재 스크롤 위치 */
  scrollOffset: number;
  /** 특정 인덱스로 스크롤 */
  scrollToIndex: (
    index: number,
    options?: { align?: 'start' | 'center' | 'end'; behavior?: 'auto' | 'smooth' }
  ) => void;
  /** 특정 오프셋으로 스크롤 */
  scrollToOffset: (offset: number, options?: { behavior?: 'auto' | 'smooth' }) => void;
  /** 스크롤 위치 저장 */
  saveScrollPosition: () => void;
  /** 스크롤 위치 복원 */
  restoreScrollPosition: () => void;
  /** 현재 표시 중인 아이템 */
  visibleItems: Array<{ index: number; item: T }>;
  /** 아이템이 보이는지 확인 */
  isItemVisible: (index: number) => boolean;
}

/**
 * useVirtualScroll Hook
 * 가상 스크롤 로직을 관리하고 스크롤 위치를 복원합니다
 */
export function useVirtualScroll<T>({
  items,
  estimateSize = 80,
  overscan = 5,
  scrollRestorationKey,
  hasMore = false,
  onLoadMore,
  loadMoreThreshold = 3,
  enableDynamicSize = true,
  horizontal = false,
}: UseVirtualScrollOptions<T>): UseVirtualScrollReturn<T> {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);

  // Virtualizer 설정
  const virtualizerOptions: Partial<VirtualizerOptions<HTMLDivElement, Element>> = {
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan,
    horizontal,
  };

  // 동적 높이 측정 활성화
  if (enableDynamicSize && typeof window !== 'undefined' && typeof ResizeObserver !== 'undefined') {
    virtualizerOptions.measureElement = (element: Element) => {
      const size = horizontal
        ? element.getBoundingClientRect().width
        : element.getBoundingClientRect().height;
      return size;
    };
  }

  const virtualizer = useVirtualizer(
    virtualizerOptions as VirtualizerOptions<HTMLDivElement, Element>
  );

  // 현재 스크롤 오프셋
  const scrollOffset = virtualizer.scrollOffset ?? 0;

  // 스크롤 위치 저장
  const saveScrollPosition = useCallback(() => {
    if (!scrollRestorationKey || typeof window === 'undefined') return;

    try {
      const position = {
        offset: scrollOffset,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(`virtual-scroll-${scrollRestorationKey}`, JSON.stringify(position));
    } catch (error) {
      console.error('Failed to save scroll position:', error);
    }
  }, [scrollRestorationKey, scrollOffset]);

  // 스크롤 위치 복원
  const restoreScrollPosition = useCallback(() => {
    if (!scrollRestorationKey || typeof window === 'undefined') return;

    try {
      const saved = sessionStorage.getItem(`virtual-scroll-${scrollRestorationKey}`);
      if (!saved) return;

      const { offset, timestamp } = JSON.parse(saved);

      // 30분 이내 데이터만 복원
      const MAX_AGE = 30 * 60 * 1000;
      if (Date.now() - timestamp > MAX_AGE) {
        sessionStorage.removeItem(`virtual-scroll-${scrollRestorationKey}`);
        return;
      }

      // 다음 프레임에서 스크롤 복원 (DOM 렌더링 후)
      requestAnimationFrame(() => {
        virtualizer.scrollToOffset(offset, { behavior: 'auto' });
      });
    } catch (error) {
      console.error('Failed to restore scroll position:', error);
    }
  }, [scrollRestorationKey, virtualizer]);

  // 컴포넌트 마운트 시 스크롤 위치 복원
  useEffect(() => {
    restoreScrollPosition();
  }, [restoreScrollPosition]);

  // 컴포넌트 언마운트 시 스크롤 위치 저장
  useEffect(() => {
    return () => {
      saveScrollPosition();
    };
  }, [saveScrollPosition]);

  // 무한 스크롤 처리
  useEffect(() => {
    if (!hasMore || !onLoadMore || isLoadingMoreRef.current) return;

    const virtualItems = virtualizer.getVirtualItems();
    if (virtualItems.length === 0) return;

    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    // 마지막 아이템이 임계값 이내로 들어오면 로드
    if (lastItem.index >= items.length - loadMoreThreshold) {
      isLoadingMoreRef.current = true;

      Promise.resolve(onLoadMore()).finally(() => {
        isLoadingMoreRef.current = false;
      });
    }
  }, [virtualizer, items.length, hasMore, onLoadMore, loadMoreThreshold]);

  // 특정 인덱스로 스크롤
  const scrollToIndex = useCallback(
    (
      index: number,
      options?: { align?: 'start' | 'center' | 'end'; behavior?: 'auto' | 'smooth' }
    ) => {
      virtualizer.scrollToIndex(index, {
        align: options?.align ?? 'start',
        behavior: options?.behavior as 'auto' | 'smooth' | undefined,
      });
    },
    [virtualizer]
  );

  // 특정 오프셋으로 스크롤
  const scrollToOffset = useCallback(
    (offset: number, options?: { behavior?: 'auto' | 'smooth' }) => {
      virtualizer.scrollToOffset(offset, {
        behavior: options?.behavior as 'auto' | 'smooth' | undefined,
      });
    },
    [virtualizer]
  );

  // 현재 표시 중인 아이템
  const visibleItems = useMemo(() => {
    return virtualizer.getVirtualItems().map((virtualItem) => ({
      index: virtualItem.index,
      item: items[virtualItem.index],
    }));
  }, [virtualizer, items]);

  // 아이템이 보이는지 확인
  const isItemVisible = useCallback(
    (index: number) => {
      const virtualItems = virtualizer.getVirtualItems();
      return virtualItems.some((item) => item.index === index);
    },
    [virtualizer]
  );

  return {
    virtualizer,
    scrollRef,
    scrollOffset,
    scrollToIndex,
    scrollToOffset,
    saveScrollPosition,
    restoreScrollPosition,
    visibleItems,
    isItemVisible,
  };
}

/**
 * useScrollRestoration - 스크롤 위치 복원 훅
 *
 * 페이지 이동 후 돌아왔을 때 이전 스크롤 위치를 복원합니다.
 */
export function useScrollRestoration(key: string) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 스크롤 위치 저장
  const savePosition = useCallback(() => {
    if (!scrollRef.current || typeof window === 'undefined') return;

    try {
      const position = {
        scrollTop: scrollRef.current.scrollTop,
        scrollLeft: scrollRef.current.scrollLeft,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(`scroll-${key}`, JSON.stringify(position));
    } catch (error) {
      console.error('Failed to save scroll position:', error);
    }
  }, [key]);

  // 스크롤 위치 복원
  const restorePosition = useCallback(() => {
    if (!scrollRef.current || typeof window === 'undefined') return;

    try {
      const saved = sessionStorage.getItem(`scroll-${key}`);
      if (!saved) return;

      const { scrollTop, scrollLeft, timestamp } = JSON.parse(saved);

      // 30분 이내 데이터만 복원
      const MAX_AGE = 30 * 60 * 1000;
      if (Date.now() - timestamp > MAX_AGE) {
        sessionStorage.removeItem(`scroll-${key}`);
        return;
      }

      scrollRef.current.scrollTop = scrollTop;
      scrollRef.current.scrollLeft = scrollLeft;
    } catch (error) {
      console.error('Failed to restore scroll position:', error);
    }
  }, [key]);

  // 마운트 시 복원
  useEffect(() => {
    restorePosition();
  }, [restorePosition]);

  // 언마운트 시 저장
  useEffect(() => {
    return () => {
      savePosition();
    };
  }, [savePosition]);

  // 스크롤 이벤트 핸들러 (자동 저장)
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      // Debounce: 스크롤 멈춘 후 500ms 후 저장
      clearTimeout(timeoutId);
      timeoutId = setTimeout(savePosition, 500);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      element.removeEventListener('scroll', handleScroll);
    };
  }, [savePosition]);

  return {
    scrollRef,
    savePosition,
    restorePosition,
  };
}

/**
 * useMeasureElement - 요소 크기 측정 훅
 *
 * ResizeObserver를 사용하여 요소의 크기를 실시간으로 측정합니다.
 */
export function useMeasureElement<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const sizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        sizeRef.current = { width, height };
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return {
    ref,
    getSize: () => sizeRef.current,
  };
}

/**
 * useInfiniteScroll - 무한 스크롤 훅
 *
 * IntersectionObserver를 사용한 간단한 무한 스크롤 구현
 */
export interface UseInfiniteScrollOptions {
  /** 더 로드하는 콜백 */
  onLoadMore: () => void | Promise<void>;
  /** 더 많은 아이템이 있는지 */
  hasMore: boolean;
  /** 로딩 중인지 */
  isLoading?: boolean;
  /** 루트 마진 (임계값) */
  rootMargin?: string;
  /** 임계값 */
  threshold?: number;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading = false,
  rootMargin = '100px',
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingRef.current) {
          isLoadingRef.current = true;
          Promise.resolve(onLoadMore()).finally(() => {
            isLoadingRef.current = false;
          });
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isLoading, rootMargin, threshold]);

  return { sentinelRef };
}

export default useVirtualScroll;
