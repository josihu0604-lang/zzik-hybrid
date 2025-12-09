'use client';

import { ReactNode, useState, useCallback, useRef, useEffect } from 'react';
import { m, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { colors } from '@/lib/design-tokens';
import { useHaptic } from '@/hooks/useHaptic';

/**
 * PullToRefresh - 당겨서 새로고침 컴포넌트
 *
 * Nielsen's Heuristics #3: User Control and Freedom
 * - 사용자가 직접 데이터를 새로고침할 수 있는 제어권 제공
 *
 * Apple HIG: Refresh Controls
 * - 자연스러운 풀 제스처와 시각적 피드백
 */

export interface PullToRefreshProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 새로고침 핸들러 */
  onRefresh: () => Promise<void>;
  /** 새로고침 가능 여부 */
  disabled?: boolean;
  /** 당기는 거리 임계값 */
  threshold?: number;
  /** 최대 당김 거리 */
  maxPull?: number;
  /** 새로고침 중 텍스트 */
  refreshingText?: string;
  /** 당기기 중 텍스트 */
  pullingText?: string;
  /** 릴리즈 텍스트 */
  releaseText?: string;
  /** 클래스명 */
  className?: string;
}

type PullState = 'idle' | 'pulling' | 'ready' | 'refreshing';

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  threshold = 80,
  maxPull = 150,
  refreshingText = '새로고침 중...',
  pullingText = '당겨서 새로고침',
  releaseText = '놓으면 새로고침',
  className = '',
}: PullToRefreshProps) {
  const [state, setState] = useState<PullState>('idle');
  const [touchStart, setTouchStart] = useState(0);
  const pullDistance = useMotionValue(0);
  const haptic = useHaptic();
  const containerRef = useRef<HTMLDivElement>(null);

  // Transform for visual feedback
  const indicatorY = useTransform(pullDistance, [0, maxPull], [0, maxPull * 0.5]);
  const indicatorOpacity = useTransform(pullDistance, [0, threshold * 0.5, threshold], [0, 0.5, 1]);
  const indicatorScale = useTransform(pullDistance, [0, threshold], [0.8, 1]);
  const rotation = useTransform(pullDistance, [0, threshold, maxPull], [0, 180, 360]);

  const isAtTop = useCallback(() => {
    if (!containerRef.current) return true;
    return containerRef.current.scrollTop <= 0;
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || state === 'refreshing') return;
      if (!isAtTop()) return;

      setTouchStart(e.touches[0].clientY);
    },
    [disabled, state, isAtTop]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || state === 'refreshing') return;
      if (touchStart === 0) return;
      if (!isAtTop()) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStart;

      if (diff > 0) {
        // Pulling down
        const pullValue = Math.min(diff * 0.5, maxPull); // Resistance factor
        pullDistance.set(pullValue);

        if (pullValue >= threshold && state !== 'ready') {
          setState('ready');
          haptic.tap();
        } else if (pullValue < threshold && pullValue > 0 && state !== 'pulling') {
          setState('pulling');
        }
      }
    },
    [disabled, state, touchStart, threshold, maxPull, pullDistance, haptic, isAtTop]
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || state === 'refreshing') return;

    const currentPull = pullDistance.get();

    if (currentPull >= threshold) {
      // Trigger refresh
      setState('refreshing');
      pullDistance.set(threshold * 0.6); // Keep indicator visible

      try {
        haptic.success();
        await onRefresh();
      } catch {
        haptic.error();
      } finally {
        setState('idle');
        pullDistance.set(0);
      }
    } else {
      // Reset
      setState('idle');
      pullDistance.set(0);
    }

    setTouchStart(0);
  }, [disabled, state, threshold, pullDistance, onRefresh, haptic]);

  // Handle scroll lock during pull
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (state === 'pulling' || state === 'ready') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [state]);

  const getStatusText = () => {
    switch (state) {
      case 'pulling':
        return pullingText;
      case 'ready':
        return releaseText;
      case 'refreshing':
        return refreshingText;
      default:
        return '';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: state === 'idle' ? 'auto' : 'none' }}
    >
      {/* Pull Indicator */}
      <m.div
        className="absolute left-0 right-0 flex flex-col items-center justify-center pointer-events-none"
        style={{
          top: 0,
          y: indicatorY,
          opacity: indicatorOpacity,
          scale: indicatorScale,
          height: threshold * 0.6,
          zIndex: 10,
        }}
      >
        <m.div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: `${colors.flame[500]}20`,
            border: `1px solid ${colors.flame[500]}40`,
            rotate: rotation,
          }}
        >
          {state === 'refreshing' ? (
            <RefreshCw size={20} className="animate-spin" style={{ color: colors.flame[500] }} />
          ) : (
            <ArrowDown
              size={20}
              style={{
                color: colors.flame[500],
                transform: state === 'ready' ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          )}
        </m.div>

        <AnimatePresence mode="wait">
          {state !== 'idle' && (
            <m.span
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="text-xs mt-2 font-medium"
              style={{ color: colors.text.secondary }}
            >
              {getStatusText()}
            </m.span>
          )}
        </AnimatePresence>
      </m.div>

      {/* Content */}
      <m.div
        style={{
          y: useTransform(pullDistance, (v) => v * 0.3),
        }}
      >
        {children}
      </m.div>
    </div>
  );
}

// ============================================================================
// InfiniteScroll - 무한 스크롤
// ============================================================================

interface InfiniteScrollProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 더 불러오기 핸들러 */
  onLoadMore: () => Promise<void>;
  /** 더 불러올 데이터 있음 */
  hasMore: boolean;
  /** 로딩 중 */
  isLoading: boolean;
  /** 로딩 요소 */
  loader?: ReactNode;
  /** 끝 메시지 */
  endMessage?: ReactNode;
  /** 임계값 (뷰포트 바닥에서 몇 px) */
  threshold?: number;
  /** 클래스명 */
  className?: string;
}

export function InfiniteScroll({
  children,
  onLoadMore,
  hasMore,
  isLoading,
  loader,
  endMessage,
  threshold = 200,
  className = '',
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading && !loadingRef.current) {
          loadingRef.current = true;
          try {
            await onLoadMore();
          } finally {
            loadingRef.current = false;
          }
        }
      },
      {
        rootMargin: `0px 0px ${threshold}px 0px`,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, onLoadMore, threshold]);

  return (
    <div className={className}>
      {children}

      {/* Sentinel for intersection observer */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-4">
          {loader || (
            <m.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw size={24} style={{ color: colors.flame[500] }} />
            </m.div>
          )}
        </div>
      )}

      {/* End message */}
      {!hasMore && !isLoading && endMessage && (
        <div className="flex justify-center py-4">
          <span className="text-sm" style={{ color: colors.text.tertiary }}>
            {endMessage}
          </span>
        </div>
      )}
    </div>
  );
}

export default PullToRefresh;
