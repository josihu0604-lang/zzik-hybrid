'use client';

import { m } from 'framer-motion';
import { colors } from '@/lib/design-tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * LoadingSpinner - 통합 로딩 스피너 컴포넌트
 *
 * DES-030, DES-154: 로딩 스피너 일관성 통일
 * - 전체 앱에서 동일한 스타일 사용
 * - Flame Coral 색상 통일
 * - 일관된 애니메이션 (1s linear)
 */

interface LoadingSpinnerProps {
  /** Spinner size in pixels */
  size?: number;
  /** Border thickness */
  borderWidth?: number;
  /** Primary color (track color) */
  trackColor?: string;
  /** Accent color (spinning part) */
  accentColor?: string;
  /** Additional CSS classes */
  className?: string;
  /** Accessibility label */
  label?: string;
}

export function LoadingSpinner({
  size = 40,
  borderWidth = 3,
  trackColor = 'rgba(255, 255, 255, 0.1)',
  accentColor = colors.flame[500],
  className = '',
  label = '로딩 중',
}: LoadingSpinnerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.div
      animate={prefersReducedMotion ? {} : { rotate: 360 }}
      transition={prefersReducedMotion ? {} : { duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        border: `${borderWidth}px solid ${trackColor}`,
        borderTopColor: accentColor,
        opacity: prefersReducedMotion ? 0.7 : 1,
      }}
      role="status"
      aria-label={label}
    />
  );
}

/**
 * FullPageLoader - 전체 페이지 로딩 컴포넌트
 */
interface FullPageLoaderProps {
  /** Background color */
  bgColor?: string;
  /** Spinner props */
  spinnerProps?: LoadingSpinnerProps;
}

export function FullPageLoader({ bgColor = colors.space[950], spinnerProps }: FullPageLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: bgColor }}>
      <LoadingSpinner {...spinnerProps} />
    </div>
  );
}

/**
 * LoginLoading - 로그인 페이지 전용 로딩 컴포넌트
 */
export function LoginLoading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: colors.space[950] }}
    >
      <LoadingSpinner
        size={40}
        borderWidth={3}
        trackColor="rgba(255, 255, 255, 0.1)"
        accentColor={colors.flame[500]}
        label="로딩 중"
      />
    </div>
  );
}

/**
 * LeaderSkeleton - 리더 페이지 전용 스켈레톤 로딩
 */
export function LeaderSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-24 rounded-xl bg-linear-surface" />
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-linear-surface" />
        ))}
      </div>
      {/* Content Skeleton */}
      <div className="h-40 rounded-xl bg-linear-surface" />
      <div className="h-48 rounded-xl bg-linear-surface" />
    </div>
  );
}

/**
 * InlineSpinner - 인라인 로딩 스피너 (버튼 내부 등)
 */
interface InlineSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export function InlineSpinner({
  size = 20,
  color = 'currentColor',
  className = '',
}: InlineSpinnerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.div
      animate={prefersReducedMotion ? {} : { rotate: 360 }}
      transition={prefersReducedMotion ? {} : { duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        border: `2px solid rgba(255, 255, 255, 0.3)`,
        borderTopColor: color,
        opacity: prefersReducedMotion ? 0.7 : 1,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * ContentLoader - 콘텐츠 로딩 상태 (중앙 정렬)
 * 팝업 상세, 지도 등에서 사용
 */
interface ContentLoaderProps {
  message?: string;
  spinnerSize?: number;
}

export function ContentLoader({ message = '로딩 중...', spinnerSize = 48 }: ContentLoaderProps) {
  return (
    <div className="min-h-screen bg-space-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner
          size={spinnerSize}
          borderWidth={4}
          trackColor="rgba(255, 107, 91, 0.3)"
          accentColor={colors.flame[500]}
        />
        <div className="text-white/50 text-sm">{message}</div>
      </div>
    </div>
  );
}

/**
 * CardSkeleton - 카드 형태 스켈레톤
 */
interface CardSkeletonProps {
  count?: number;
  className?: string;
}

export function CardSkeleton({ count = 3, className = '' }: CardSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <m.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-xl p-4"
          style={{
            background: 'rgba(18, 19, 20, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div className="flex items-center gap-4">
            <m.div
              className="w-12 h-12 rounded-xl"
              style={{ background: 'rgba(255, 107, 91, 0.2)' }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="flex-1 space-y-2">
              <m.div
                className="h-3 rounded"
                style={{ background: 'rgba(255, 255, 255, 0.1)', width: '40%' }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <m.div
                className="h-4 rounded"
                style={{ background: 'rgba(255, 255, 255, 0.15)', width: '80%' }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
              />
            </div>
          </div>
        </m.div>
      ))}
    </div>
  );
}

export default LoadingSpinner;
