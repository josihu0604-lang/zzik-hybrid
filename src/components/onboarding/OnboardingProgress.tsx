'use client';

import { m } from '@/lib/motion';
import { colors } from '@/lib/design-tokens';

/**
 * OnboardingProgress - 온보딩 진행률 인디케이터
 *
 * Features:
 * - 세그먼트 바 스타일
 * - 타이머 프로그레스 표시
 * - 터치/클릭 네비게이션
 * - 불꽃 테마 색상
 */

interface OnboardingProgressProps {
  /** 총 슬라이드 수 */
  total: number;
  /** 현재 슬라이드 인덱스 */
  current: number;
  /** 자동 진행 타이머 (초) */
  autoProgressDuration?: number;
  /** 자동 진행 남은 시간 (0-1) */
  timerProgress?: number;
  /** 클릭 핸들러 */
  onDotClick?: (index: number) => void;
  /** 변형 (dots: 점 스타일, bars: 바 스타일) */
  variant?: 'dots' | 'bars';
}

export function OnboardingProgress({
  total,
  current,
  timerProgress = 0,
  onDotClick,
  variant = 'bars',
}: OnboardingProgressProps) {
  if (variant === 'dots') {
    return (
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, index) => {
          const isActive = index === current;
          const isPast = index < current;

          return (
            <button
              key={index}
              onClick={() => onDotClick?.(index)}
              className="relative h-2 rounded-full overflow-hidden transition-all duration-300"
              style={{
                width: isActive ? 32 : 8,
                background: isPast ? colors.flame[500] : 'rgba(255, 255, 255, 0.2)',
              }}
              aria-label={`슬라이드 ${index + 1}로 이동`}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* 타이머 프로그레스 (활성 슬라이드만) */}
              {isActive && (
                <m.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: colors.flame[500],
                    transformOrigin: 'left',
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: timerProgress }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // 바 스타일 (기본)
  return (
    <div
      className="flex items-center gap-1.5"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
    >
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === current;
        const isPast = index < current;

        return (
          <button
            key={index}
            onClick={() => onDotClick?.(index)}
            className="relative flex-1 h-1 rounded-full overflow-hidden transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
            }}
            aria-label={`슬라이드 ${index + 1}로 이동`}
            aria-current={isActive ? 'step' : undefined}
          >
            {/* 완료된 세그먼트 */}
            {isPast && (
              <m.div
                className="absolute inset-0 rounded-full"
                style={{ background: colors.flame[500] }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* 현재 세그먼트 (타이머 진행) */}
            {isActive && (
              <m.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${colors.flame[500]} 0%, ${colors.spark[500]} 100%)`,
                  transformOrigin: 'left',
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: timerProgress }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * OnboardingProgressBar - 바 스타일 진행률
 */

interface OnboardingProgressBarProps {
  /** 총 슬라이드 수 */
  total: number;
  /** 현재 슬라이드 인덱스 */
  current: number;
}

export function OnboardingProgressBar({ total, current }: OnboardingProgressBarProps) {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="w-full">
      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ background: 'rgba(255, 255, 255, 0.1)' }}
      >
        <m.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #FF6B5B 0%, #FFD93D 100%)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-linear-text-tertiary text-xs">
          {current + 1} / {total}
        </span>
        <span className="text-xs" style={{ color: colors.flame[500] }}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

export default OnboardingProgress;
