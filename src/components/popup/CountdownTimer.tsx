'use client';

import { m, AnimatePresence } from 'framer-motion';
import { useFormattedCountdown } from '@/hooks/useCountdown';
import { colors } from '@/lib/design-tokens';

/**
 * CountdownTimer - D-Day 카운트다운 컴포넌트
 *
 * FOMO 엔진의 시간 압박 요소
 * - 마감 임박 시 빨간색으로 강조
 * - 실시간 초 단위 업데이트
 */

interface CountdownTimerProps {
  /** 마감 시간 (ISO string 또는 Date) */
  deadline: string | Date | null;
  /** 표시 형식 */
  format?: 'simple' | 'detailed' | 'badge';
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 애니메이션 활성화 */
  animated?: boolean;
}

const SIZE_STYLES = {
  sm: {
    fontSize: '11px',
    padding: '2px 6px',
  },
  md: {
    fontSize: '13px',
    padding: '4px 10px',
  },
  lg: {
    fontSize: '15px',
    padding: '6px 14px',
  },
};

export function CountdownTimer({
  deadline,
  format = 'simple',
  size = 'md',
  animated = true,
}: CountdownTimerProps) {
  const { formatted, timeLeft } = useFormattedCountdown(
    deadline,
    format === 'detailed' ? 'detailed' : 'simple'
  );

  if (!timeLeft) return null;

  const sizeStyle = SIZE_STYLES[size];
  const isUrgent = timeLeft.isUrgent;
  const isCritical = timeLeft.isCritical;
  const isExpired = timeLeft.isExpired;
  // DES-063: 마지막 1분 강한 알림
  const isLastMinute =
    !isExpired && timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0;

  // DES-021, DES-063: 색상 결정 - 마지막 1분 최강 강조
  const getColor = () => {
    if (isExpired) return colors.text.muted;
    if (isLastMinute) return '#dc2626'; // red-600 - 마지막 1분 (DES-063)
    if (isCritical) return '#ef4444'; // red-500 - 24시간 미만
    if (isUrgent) return '#f97316'; // orange-500 - 3일 미만
    return colors.text.secondary;
  };

  const getBgColor = () => {
    if (isExpired) return 'rgba(255, 255, 255, 0.05)';
    if (isLastMinute) return 'rgba(220, 38, 38, 0.3)'; // 마지막 1분 최강 (DES-063)
    if (isCritical) return 'rgba(239, 68, 68, 0.2)';
    if (isUrgent) return `rgba(249, 115, 22, 0.18)`;
    return 'rgba(255, 255, 255, 0.05)';
  };

  // Badge 형식
  if (format === 'badge') {
    return (
      <m.div
        initial={animated ? { scale: 0.9, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-flex items-center gap-1.5 rounded-full"
        style={{
          background: getBgColor(),
          padding: sizeStyle.padding,
          fontSize: sizeStyle.fontSize,
          fontWeight: 600,
          color: getColor(),
          willChange: 'transform, opacity',
        }}
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label={isExpired ? '마감됨' : `남은 시간: ${formatted}`}
      >
        {/* 깜빡이는 점 (긴급 상태) - DES-063: 마지막 1분 더 빠른 깜빡임 */}
        {(isUrgent || isCritical || isLastMinute) && !isExpired && (
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <m.span
              animate={{ opacity: [1, 0.3, 1] }}
              // DES-219: 깜빡임 완화 (0.75초 기본, 마지막 1분 0.5초)
              transition={{
                duration: isLastMinute ? 0.5 : 0.75, // DES-219: 깜빡임 완화
                repeat: Infinity,
              }}
              className="absolute inline-flex h-full w-full rounded-full"
              style={{
                background: getColor(),
                willChange: 'opacity',
              }}
            />
          </span>
        )}
        <span>{formatted}</span>
      </m.div>
    );
  }

  // Simple/Detailed 형식
  return (
    <AnimatePresence mode="wait">
      <m.span
        key={formatted}
        initial={animated ? { opacity: 0, y: 5 } : false}
        animate={{
          opacity: 1,
          y: 0,
          // DES-021, DES-063: 긴급 상태 시 펄스 애니메이션 (마지막 1분 더 강하게)
          scale:
            isUrgent || isCritical || isLastMinute
              ? isLastMinute
                ? [1, 1.1, 1]
                : [1, 1.05, 1]
              : 1,
        }}
        exit={{ opacity: 0, y: -5 }}
        transition={{
          duration: 0.15,
          scale: {
            duration: isLastMinute ? 0.8 : 1.5, // DES-063: 마지막 1분 더 빠르게
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        style={{
          fontSize: sizeStyle.fontSize,
          fontWeight: isUrgent || isCritical || isLastMinute ? 700 : 500, // DES-021, DES-063: 더 굵게
          color: getColor(),
          willChange: 'transform, opacity',
        }}
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label={isExpired ? '마감됨' : `남은 시간: ${formatted}`}
      >
        {formatted}
      </m.span>
    </AnimatePresence>
  );
}

/**
 * UrgentBadge - 마감 임박 배지
 *
 * 마감 3일 이내일 때만 표시
 */
interface UrgentBadgeProps {
  deadline: string | Date | null;
  className?: string;
}

export function UrgentBadge({ deadline, className = '' }: UrgentBadgeProps) {
  const { timeLeft } = useFormattedCountdown(deadline, 'simple');

  if (!timeLeft || timeLeft.isExpired || timeLeft.days > 3) return null;

  const isCritical = timeLeft.isCritical;
  const isUrgent = timeLeft.isUrgent;

  return (
    <m.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${className}`}
      style={{
        background: isCritical
          ? 'rgba(239, 68, 68, 0.95)'
          : isUrgent
            ? 'rgba(239, 68, 68, 0.85)'
            : 'rgba(255, 107, 91, 0.9)',
        color: 'white',
        boxShadow: isCritical
          ? '0 4px 20px rgba(239, 68, 68, 0.4)'
          : '0 4px 16px rgba(255, 107, 91, 0.3)',
        willChange: 'transform, opacity',
      }}
    >
      {/* 깜빡이는 점 */}
      <span className="relative flex h-2 w-2">
        <m.span
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inline-flex h-full w-full rounded-full bg-white"
          style={{ willChange: 'transform, opacity' }}
        />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
      </span>

      <span>
        {timeLeft.days > 0
          ? `D-${timeLeft.days} 마감 임박!`
          : timeLeft.hours > 0
            ? `${timeLeft.hours}시간 남음!`
            : `${timeLeft.minutes}분 남음!`}
      </span>
    </m.div>
  );
}

export default CountdownTimer;
