'use client';

import { useCallback, useRef, useEffect } from 'react';
import { isTouchNearEdge } from '@/lib/mobile-ux';

/**
 * DES-107~109: 제스처 핸들러 Hook
 *
 * - DES-107: Long-press 메뉴
 * - DES-108: Double-tap 충돌 방지
 * - DES-109: Edge 제스처 충돌 방지
 */

// ============================================================================
// DES-107: Long-press Hook
// ============================================================================

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
  preventDefault?: boolean;
}

export function useLongPress({
  onLongPress,
  onClick,
  delay = 500,
  preventDefault = true,
}: UseLongPressOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const handleStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }

      isLongPressRef.current = false;

      timeoutRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress();

        // 햅틱 피드백 (지원하는 경우)
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, delay);
    },
    [onLongPress, delay, preventDefault]
  );

  const handleEnd = useCallback(
    (_e: React.TouchEvent | React.MouseEvent) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Long-press가 아니었다면 일반 클릭 처리
      if (!isLongPressRef.current && onClick) {
        onClick();
      }

      isLongPressRef.current = false;
    },
    [onClick]
  );

  const handleCancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isLongPressRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    onMouseDown: handleStart,
    onMouseUp: handleEnd,
    onMouseLeave: handleCancel,
    onTouchStart: handleStart,
    onTouchEnd: handleEnd,
    onTouchCancel: handleCancel,
  };
}

// ============================================================================
// DES-108: Double-tap 충돌 방지 Hook
// ============================================================================

interface UseDoubleTapOptions {
  onSingleTap?: () => void;
  onDoubleTap?: () => void;
  delay?: number;
}

export function useDoubleTap({ onSingleTap, onDoubleTap, delay = 300 }: UseDoubleTapOptions) {
  const lastTapRef = useRef<number>(0);
  const singleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    // Double-tap 감지
    if (timeSinceLastTap < delay && timeSinceLastTap > 0) {
      // Clear single-tap timeout
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
      }

      // Double-tap 실행
      if (onDoubleTap) {
        onDoubleTap();

        // 햅틱 피드백
        if (navigator.vibrate) {
          navigator.vibrate([30, 30, 30]);
        }
      }

      lastTapRef.current = 0;
    } else {
      // Single-tap 대기
      lastTapRef.current = now;

      if (onSingleTap) {
        singleTapTimeoutRef.current = setTimeout(() => {
          onSingleTap();
          singleTapTimeoutRef.current = null;
        }, delay);
      }
    }
  }, [onSingleTap, onDoubleTap, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
      }
    };
  }, []);

  return {
    onClick: handleTap,
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      handleTap();
    },
  };
}

// ============================================================================
// DES-109: Edge 제스처 충돌 방지 Hook
// ============================================================================

interface UseEdgeSafeSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventEdgeSwipes?: boolean;
}

export function useEdgeSafeSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventEdgeSwipes = true,
}: UseEdgeSafeSwipeOptions) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isEdgeSwipeRef = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;

      touchStartRef.current = { x, y };

      // Edge 영역 체크
      if (preventEdgeSwipes) {
        isEdgeSwipeRef.current = isTouchNearEdge(x, y, window.innerWidth, window.innerHeight);
      }
    },
    [preventEdgeSwipes]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      // Edge에서 시작된 스와이프는 무시
      if (isEdgeSwipeRef.current) {
        touchStartRef.current = null;
        isEdgeSwipeRef.current = false;
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // 수평 스와이프
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
      // 수직 스와이프
      else if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }

      touchStartRef.current = null;
      isEdgeSwipeRef.current = false;
    },
    [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]
  );

  const handleTouchCancel = useCallback(() => {
    touchStartRef.current = null;
    isEdgeSwipeRef.current = false;
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
  };
}

// ============================================================================
// DES-124: Swipe-back 충돌 방지
// ============================================================================

/**
 * iOS Safari의 swipe-back 제스처와 충돌하지 않도록 처리
 */
export function useSwipeBackSafe(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // iOS에서 왼쪽 edge에서 swipe 시작 시 기본 동작 방지
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const x = touch.clientX;

      // 왼쪽 edge (20px 이내)에서 시작된 터치는 스크롤만 허용
      if (x < 20) {
        // 스크롤 가능한 요소인지 확인
        let target = e.target as HTMLElement;
        let isScrollable = false;

        while (target && target !== document.body) {
          const overflow = window.getComputedStyle(target).overflowX;
          if (overflow === 'scroll' || overflow === 'auto') {
            isScrollable = true;
            break;
          }
          target = target.parentElement as HTMLElement;
        }

        // 스크롤 가능한 요소가 아니면 swipe-back 방지 안 함
        if (!isScrollable) {
          return;
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [enabled]);
}

export default {
  useLongPress,
  useDoubleTap,
  useEdgeSafeSwipe,
  useSwipeBackSafe,
};
