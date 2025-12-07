'use client';

import { type ReactNode } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import { useHorizontalScroll } from '@/hooks/useScrollEffects';
import { colors } from '@/lib/design-tokens';

/**
 * DES-117: 수평 스크롤 인디케이터
 *
 * Features:
 * - 좌우 그라데이션 힌트
 * - 스크롤 진행률 표시 (선택적)
 * - 자동 fade in/out
 */

interface HorizontalScrollIndicatorProps {
  /** 자식 요소 (스크롤 가능한 콘텐츠) */
  children: ReactNode;
  /** 그라데이션 너비 (px) */
  gradientWidth?: number;
  /** 진행률 바 표시 여부 */
  showProgress?: boolean;
  /** 커스텀 클래스 */
  className?: string;
}

export function HorizontalScrollIndicator({
  children,
  gradientWidth = 40,
  showProgress = false,
  className = '',
}: HorizontalScrollIndicatorProps) {
  const { scrollRef, scrollState } = useHorizontalScroll();

  return (
    <div className={`relative ${className}`}>
      {/* 스크롤 컨테이너 - MOB-018, MOB-020, MOB-023: 개선된 모바일 스크롤 */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide scroll-smooth-mobile scrollbar-mobile flick-sensitive"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>

      {/* 왼쪽 그라데이션 힌트 */}
      <AnimatePresence>
        {!scrollState.atStart && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-0 bottom-0 pointer-events-none z-10"
            style={{
              width: `${gradientWidth}px`,
              background: `linear-gradient(to right, rgba(8, 9, 10, 1) 0%, rgba(8, 9, 10, 0.8) 30%, transparent 100%)`,
            }}
            aria-hidden="true"
          >
            {/* 좌측 화살표 힌트 - MOB-017: 스와이프 방향 힌트 */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 swipe-hint-arrow-left">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: colors.text.tertiary }}
              >
                <path
                  d="M10 12L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* 오른쪽 그라데이션 힌트 */}
      <AnimatePresence>
        {!scrollState.atEnd && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-0 bottom-0 pointer-events-none z-10"
            style={{
              width: `${gradientWidth}px`,
              background: `linear-gradient(to left, rgba(8, 9, 10, 1) 0%, rgba(8, 9, 10, 0.8) 30%, transparent 100%)`,
            }}
            aria-hidden="true"
          >
            {/* 우측 화살표 힌트 - MOB-017: 스와이프 방향 힌트 */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 swipe-hint-arrow">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: colors.text.tertiary }}
              >
                <path
                  d="M6 12L10 8L6 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* 진행률 바 (선택적) */}
      {showProgress && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-white/5"
          role="progressbar"
          aria-valuenow={scrollState.scrollPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="스크롤 진행률"
        >
          <m.div
            className="h-full"
            style={{
              width: `${scrollState.scrollPercentage}%`,
              background: colors.flame[500],
            }}
            initial={{ width: 0 }}
            animate={{ width: `${scrollState.scrollPercentage}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      )}

      {/* 스크린 리더용 안내 */}
      <span className="sr-only">좌우로 스크롤하여 더 많은 콘텐츠를 확인하세요</span>
    </div>
  );
}

/**
 * 간단한 스크롤 힌트 컴포넌트
 */
interface ScrollHintProps {
  direction: 'left' | 'right';
  show: boolean;
}

export function ScrollHint({ direction, show }: ScrollHintProps) {
  return (
    <AnimatePresence>
      {show && (
        <m.div
          initial={{ opacity: 0, x: direction === 'left' ? 10 : -10 }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            x: direction === 'left' ? [10, 0, 10] : [-10, 0, -10],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none"
          style={{
            [direction]: '8px',
          }}
          aria-hidden="true"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255, 107, 91, 0.2)',
              border: '2px solid rgba(255, 107, 91, 0.4)',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: colors.flame[500] }}
            >
              {direction === 'left' ? (
                <path
                  d="M10 12L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M6 12L10 8L6 4"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

export default HorizontalScrollIndicator;
