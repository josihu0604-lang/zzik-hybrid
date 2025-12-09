'use client';

import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useConfetti } from '@/hooks/useConfetti';
import {
  colors,
  radii,
  typography,
  getTemperatureStyles,
  getTemperatureName,
} from '@/lib/design-tokens';
import { duration } from '@/lib/animations';

/**
 * ProgressBar Component v3 - 2026 Production Design
 *
 * Temperature System with Design Tokens:
 * - Cold (0-30%): Subtle orange, calm state
 * - Warm (30-70%): Building heat, gradient glow
 * - Hot (70-99%): Full heat, pulsing fire effect
 * - Done (100%): Green celebration + confetti
 */

interface ProgressBarProps {
  current: number;
  goal: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  onComplete?: () => void;
}

type Temperature = 'cold' | 'warm' | 'hot' | 'done';
type Pattern = 'dots' | 'stripes' | 'waves' | 'checkered';

interface GradientStyles {
  gradient: string;
  opacity: number;
  glow: string;
  borderGlow: string;
  pattern: Pattern;
}

function getGradient(temp: Temperature): GradientStyles {
  switch (temp) {
    case 'cold':
      return {
        gradient: `linear-gradient(90deg, ${colors.flame[500]} 0%, ${colors.flame[500]} 100%)`,
        opacity: 0.4,
        glow: 'none',
        borderGlow: 'none',
        pattern: 'dots', // 점선 패턴으로 cold 상태 구분
      };
    case 'warm':
      return {
        gradient: `linear-gradient(90deg, ${colors.flame[500]} 0%, ${colors.flame[400]} 100%)`,
        opacity: 0.7,
        glow: `0 0 12px ${colors.temperature.warm.glow}`,
        borderGlow: `inset 0 0 8px ${colors.temperature.warm.glow}`,
        pattern: 'stripes', // 줄무늬 패턴으로 warm 상태 구분
      };
    case 'hot':
      return {
        gradient: `linear-gradient(90deg, ${colors.flame[500]} 0%, ${colors.flame[400]} 40%, ${colors.ember[500]} 100%)`,
        opacity: 1,
        glow: `0 0 20px ${colors.temperature.hot.glow}, 0 0 40px rgba(255, 107, 91, 0.3)`,
        borderGlow: `inset 0 0 12px rgba(255, 107, 91, 0.3)`,
        pattern: 'waves', // 물결 패턴으로 hot 상태 구분
      };
    case 'done':
      return {
        gradient: `linear-gradient(90deg, ${colors.success} 0%, ${colors.successLight} 50%, ${colors.successLighter} 100%)`,
        opacity: 1,
        glow: `0 0 25px ${colors.temperature.done.glow}, 0 0 50px rgba(74, 222, 128, 0.3)`,
        borderGlow: `inset 0 0 15px rgba(34, 197, 94, 0.2)`,
        pattern: 'checkered', // 체크 패턴으로 done 상태 구분
      };
  }
}

const SIZE_MAP = {
  sm: { height: '6px', labelSize: '11px' },
  md: { height: '10px', labelSize: '12px' },
  lg: { height: '14px', labelSize: '13px' },
};

export function ProgressBar({
  current,
  goal,
  showLabel = false,
  size = 'md',
  animated = true,
  onComplete,
}: ProgressBarProps) {
  const progress = Math.min((current / goal) * 100, 100);
  const temperature = getTemperatureName(progress);
  const { fireMultiple } = useConfetti();

  // DES-114: useMemo로 스타일 계산 메모이제이션
  const gradientStyles = useMemo(() => getGradient(temperature), [temperature]);
  const tempStyles = useMemo(() => getTemperatureStyles(progress), [progress]);
  const sizeConfig = useMemo(() => SIZE_MAP[size], [size]);

  const prevProgressRef = useRef(progress);
  const [showIncrement, setShowIncrement] = useState(false);
  const hasCelebratedRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  // Celebrate on completion
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (temperature === 'done' && !hasCelebratedRef.current) {
      hasCelebratedRef.current = true;
      fireMultiple(10, 300, {
        particleCount: 3,
        spread: 55,
        startVelocity: 30,
        colors: [
          colors.flame[500],
          colors.flame[400],
          colors.success,
          colors.successLight,
          colors.spark[500],
        ],
      });
      onComplete?.();
    }
  }, [temperature, onComplete, fireMultiple]);

  // Show +1 animation on increment
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (current > (prevProgressRef.current / 100) * goal) {
      setShowIncrement(true);
      const timer = setTimeout(() => setShowIncrement(false), 1000);
      return () => clearTimeout(timer);
    }
    prevProgressRef.current = progress;
  }, [current, goal, progress]);

  return (
    <div className="w-full relative">
      {/* +1 Increment Popup (decorative) */}
      <AnimatePresence>
        {showIncrement && (
          <m.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.8 }}
            className="absolute -top-2 right-0 z-10"
            style={{
              color: colors.flame[500],
              fontSize: typography.fontSize.lg.size, // DES-134: 크기 증가 (sm -> lg)
              fontWeight: typography.fontWeight.bold,
            }}
            aria-hidden="true"
          >
            +1
          </m.div>
        )}
      </AnimatePresence>

      {/* Screen reader announcement for significant changes */}
      {temperature === 'done' && (
        <div className="sr-only" role="status" aria-live="assertive" aria-atomic="true">
          축하합니다! 펀딩 목표를 달성했습니다. 팝업 오픈이 확정되었습니다.
        </div>
      )}

      {/* Progress Track */}
      <div
        className="rounded-full overflow-hidden relative"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`펀딩 진행률 ${Math.round(progress)}%`}
        style={{
          height: sizeConfig.height,
          background: colors.space[800],
          boxShadow: gradientStyles.borderGlow,
          borderRadius: radii.full,
        }}
      >
        {/* Background pulse for hot state (decorative) */}
        {temperature === 'hot' && (
          <m.div
            className="absolute inset-0 rounded-full"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: duration.major * 3.75, // 1.5s (400ms * 3.75)
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ background: tempStyles.bg, willChange: 'opacity' }}
            aria-hidden="true"
          />
        )}

        {/* Progress Fill - GPU Accelerated scaleX */}
        <m.div
          initial={animated && !prefersReducedMotion ? { scaleX: 0 } : { scaleX: progress / 100 }}
          animate={{ scaleX: progress / 100 }}
          transition={
            animated && !prefersReducedMotion
              ? { duration: duration.progress, ease: [0.25, 0.46, 0.45, 0.94] } // DES-047: 500ms
              : { duration: 0 }
          }
          className="h-full rounded-full relative overflow-hidden"
          style={{
            background: gradientStyles.gradient,
            opacity: gradientStyles.opacity,
            boxShadow: gradientStyles.glow,
            borderRadius: radii.full,
            transformOrigin: 'left',
            width: '100%',
            willChange: 'transform',
          }}
        >
          {/* Pattern overlay for accessibility - different textures for each state */}
          {gradientStyles.pattern === 'dots' && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                backgroundSize: '4px 4px',
              }}
              aria-hidden="true"
            />
          )}
          {gradientStyles.pattern === 'stripes' && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)',
              }}
              aria-hidden="true"
            />
          )}
          {gradientStyles.pattern === 'waves' && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.2) 2px, transparent 4px)',
              }}
              aria-hidden="true"
            />
          )}
          {gradientStyles.pattern === 'checkered' && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%), linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%)',
                backgroundSize: '6px 6px',
                backgroundPosition: '0 0, 3px 3px',
              }}
              aria-hidden="true"
            />
          )}
          {/* Shine effect (decorative) */}
          {temperature !== 'cold' && (
            <m.div
              className="absolute inset-0 rounded-full"
              animate={{
                backgroundPosition: ['200% 0', '-200% 0'],
              }}
              transition={{
                duration: duration.major * 5, // 2s (400ms * 5)
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                backgroundSize: '50% 100%',
                borderRadius: radii.full,
                willChange: 'background-position',
              }}
              aria-hidden="true"
            />
          )}
        </m.div>
      </div>

      {/* Label */}
      {showLabel && (
        <div className="flex justify-between items-center mt-2">
          <m.span
            key={temperature}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              color: tempStyles.text,
              fontSize: sizeConfig.labelSize,
              fontWeight: typography.fontWeight.semibold,
            }}
            aria-live="polite"
            aria-atomic="true"
          >
            {temperature === 'done'
              ? '오픈 확정!'
              : temperature === 'hot'
                ? progress >= 90
                  ? '마지막 푸시! 거의 다 왔어요!'
                  : '거의 다 왔어요!'
                : temperature === 'warm'
                  ? `${goal - current}명만 더!`
                  : '함께 열어요!'}
          </m.span>
          <div className="flex items-center gap-1" aria-live="polite" aria-atomic="true">
            <m.span
              key={current}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              style={{
                color: tempStyles.text,
                fontSize: sizeConfig.labelSize,
                fontWeight: typography.fontWeight.bold,
              }}
            >
              {current.toLocaleString()}
            </m.span>
            <span
              style={{
                color: colors.text.muted,
                fontSize: sizeConfig.labelSize,
              }}
            >
              /{goal.toLocaleString()}명
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressBar;
