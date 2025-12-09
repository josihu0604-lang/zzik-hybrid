'use client';

import { ReactNode } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { colors } from '@/lib/design-tokens';

/**
 * PullToRefresh - 풀 투 리프레시 컴포넌트
 *
 * Features:
 * - ZZIK 불꽃 아이콘 인디케이터
 * - 당김 진행률에 따른 스케일/회전
 * - 리프레시 중 스핀 애니메이션
 * - Glassmorphism 스타일
 */

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  className = '',
}: PullToRefreshProps) {
  const { pullDistance, pullProgress, isReadyToRefresh, isRefreshing, handlers, containerRef } =
    usePullToRefresh({
      threshold: 80,
      maxPull: 120,
      onRefresh,
      disabled,
    });

  const showIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      style={{
        touchAction: 'pan-y',
        overscrollBehavior: 'contain',
      }}
      {...handlers}
    >
      {/* Pull Indicator */}
      <AnimatePresence>
        {showIndicator && (
          <m.div
            initial={{ opacity: 0, y: -40 }}
            animate={{
              opacity: 1,
              y: Math.min(pullDistance - 40, 40),
            }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute left-1/2 -translate-x-1/2 z-50"
            style={{ top: 0 }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 48,
                height: 48,
                background: 'rgba(18, 19, 20, 0.9)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${isReadyToRefresh ? colors.flame[500] : colors.border.default}`,
                boxShadow: isReadyToRefresh
                  ? `0 4px 20px rgba(255, 107, 91, 0.4)`
                  : '0 4px 20px rgba(0, 0, 0, 0.3)',
                transition: 'border-color 200ms, box-shadow 200ms',
              }}
            >
              <m.div
                animate={{
                  scale: 0.5 + pullProgress * 0.5,
                  rotate: isRefreshing ? 360 : pullProgress * 180,
                }}
                transition={
                  isRefreshing
                    ? { repeat: Infinity, duration: 1, ease: 'linear' }
                    : { type: 'spring', stiffness: 300, damping: 20 }
                }
              >
                <Flame
                  size={24}
                  style={{
                    color: isReadyToRefresh ? colors.flame[500] : colors.text.secondary,
                    transition: 'color 200ms',
                  }}
                  strokeWidth={2.5}
                />
              </m.div>
            </div>

            {/* 텍스트 라벨 */}
            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: pullProgress > 0.3 ? 1 : 0 }}
              className="text-center mt-2 text-xs font-medium"
              style={{
                color: isReadyToRefresh ? colors.flame[400] : colors.text.muted,
              }}
            >
              {isRefreshing
                ? '업데이트 중...'
                : isReadyToRefresh
                  ? '놓아서 새로고침'
                  : '당겨서 새로고침'}
            </m.p>
          </m.div>
        )}
      </AnimatePresence>

      {/* Content with pull transform */}
      <m.div
        animate={{
          y: pullDistance,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {children}
      </m.div>
    </div>
  );
}

export default PullToRefresh;
