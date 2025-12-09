'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useHaptic } from './useHaptic';

/**
 * usePullToRefresh - 풀 투 리프레시 훅
 *
 * Features:
 * - 당기는 거리에 따른 진행률 계산
 * - 트리거 임계값 도달 시 햅틱 피드백
 * - 로딩 상태 관리
 * - 60fps 성능 최적화
 */

interface UsePullToRefreshOptions {
  /** 리프레시 트리거 임계값 (px) */
  threshold?: number;
  /** 최대 당김 거리 (px) */
  maxPull?: number;
  /** 리프레시 함수 */
  onRefresh: () => Promise<void>;
  /** 비활성화 */
  disabled?: boolean;
}

interface UsePullToRefreshReturn {
  /** 현재 당기는 거리 (px) */
  pullDistance: number;
  /** 당김 진행률 (0-1) */
  pullProgress: number;
  /** 트리거 준비 상태 */
  isReadyToRefresh: boolean;
  /** 리프레시 중 */
  isRefreshing: boolean;
  /** 터치 핸들러 */
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
  /** 컨테이너 ref */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function usePullToRefresh({
  threshold = 80,
  maxPull = 120,
  onRefresh,
  disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const haptic = useHaptic();
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const hasTriggeredHapticRef = useRef(false);

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const isReadyToRefresh = pullProgress >= 1;

  // 터치 시작
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || isRefreshing) return;

      const container = containerRef.current;
      // 스크롤이 최상단에 있을 때만 활성화
      if (container && container.scrollTop <= 0) {
        startYRef.current = e.touches[0].clientY;
        hasTriggeredHapticRef.current = false;
      }
    },
    [disabled, isRefreshing]
  );

  // 터치 이동
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || isRefreshing || startYRef.current === 0) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;

      // 아래로 당기는 경우만 처리
      if (diff > 0) {
        // 저항 효과 적용 (exponential decay)
        const resistance = 0.5;
        const distance = Math.min(diff * resistance, maxPull);
        setPullDistance(distance);

        // 임계값 도달 시 햅틱 피드백 (한 번만)
        if (distance >= threshold && !hasTriggeredHapticRef.current) {
          haptic.tap();
          hasTriggeredHapticRef.current = true;
        }

        // 스크롤 방지
        if (distance > 10) {
          e.preventDefault();
        }
      }
    },
    [disabled, isRefreshing, maxPull, threshold, haptic]
  );

  // 터치 종료
  const handleTouchEnd = useCallback(async () => {
    if (disabled || startYRef.current === 0) return;

    startYRef.current = 0;

    if (isReadyToRefresh && !isRefreshing) {
      setIsRefreshing(true);
      haptic.success();

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // 임계값 미도달 - 원위치
      setPullDistance(0);
    }
  }, [disabled, isReadyToRefresh, isRefreshing, onRefresh, haptic]);

  // 리프레시 중 고정 거리 유지
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (isRefreshing) {
      setPullDistance(threshold * 0.8);
    }
  }, [isRefreshing, threshold]);

  return {
    pullDistance,
    pullProgress,
    isReadyToRefresh,
    isRefreshing,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    containerRef,
  };
}

export default usePullToRefresh;
