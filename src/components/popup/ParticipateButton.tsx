'use client';

import { useState, useCallback, memo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Flame, Check, Loader2, Sparkles, PartyPopper } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useHaptic } from '@/hooks/useHaptic';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { colors, radii, typography, spacing } from '@/lib/design-tokens';

/**
 * ParticipateButton v2 - 2026 Production Design
 *
 * Features:
 * - Lucide icons (no emojis)
 * - Design token system
 * - State-based styling
 * - Haptic feedback
 * - Memoized for performance
 */

type ButtonState = 'idle' | 'loading' | 'participated' | 'error';

interface ParticipateButtonProps {
  popupId: string;
  popupName: string;
  isParticipated?: boolean;
  currentCount?: number;
  targetCount?: number;
  onParticipate?: (popupId: string) => Promise<boolean>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const SIZE_CONFIG = {
  sm: { px: spacing[4], py: spacing[2], fontSize: typography.fontSize.sm.size, iconSize: 16 },
  md: { px: spacing[6], py: spacing[3], fontSize: typography.fontSize.base.size, iconSize: 18 },
  lg: { px: spacing[8], py: spacing[4], fontSize: typography.fontSize.lg.size, iconSize: 20 },
};

function ParticipateButtonComponent({
  popupId,
  popupName,
  isParticipated = false,
  currentCount = 0,
  targetCount = 100,
  onParticipate,
  className = '',
  size = 'md',
  disabled = false,
}: ParticipateButtonProps) {
  const [state, setState] = useState<ButtonState>(isParticipated ? 'participated' : 'idle');
  const { celebrate, success, error: showError } = useToast();
  const haptic = useHaptic();
  const prefersReducedMotion = useReducedMotion();
  const config = SIZE_CONFIG[size];

  const progress = Math.min((currentCount / targetCount) * 100, 100);
  const isNearGoal = progress >= 90;
  const isGoalReached = progress >= 100;

  const handleClick = useCallback(async () => {
    if (state === 'loading' || state === 'participated' || disabled) return;

    setState('loading');
    haptic.tap();

    try {
      const result = onParticipate ? await onParticipate(popupId) : await simulateParticipate();

      if (result) {
        setState('participated');
        haptic.success();

        if (isGoalReached || currentCount + 1 >= targetCount) {
          celebrate(`목표 달성! "${popupName}" 팝업이 열려요!`);
        } else if (isNearGoal) {
          success(`참여 완료! 거의 다 왔어요! ${targetCount - currentCount - 1}명 남음`);
        } else {
          success(`참여 완료! 당신의 참여가 팝업을 열어요`);
        }
      } else {
        setState('error');
        haptic.error();
        showError('참여에 실패했어요. 다시 시도해주세요.');
        // U014: Changed error recovery time from 2s to 4s
        setTimeout(() => setState('idle'), 4000);
      }
    } catch {
      setState('error');
      haptic.error();
      showError('네트워크 오류가 발생했어요.');
      // U014: Changed error recovery time from 2s to 4s
      setTimeout(() => setState('idle'), 4000);
    }
  }, [
    state,
    disabled,
    popupId,
    popupName,
    onParticipate,
    haptic,
    celebrate,
    success,
    showError,
    isGoalReached,
    isNearGoal,
    currentCount,
    targetCount,
  ]);

  const simulateParticipate = async (): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return Math.random() > 0.1;
  };

  const getButtonStyles = () => {
    switch (state) {
      case 'participated':
        return {
          background: colors.success,
          color: 'white',
        };
      case 'error':
        return {
          background: colors.error,
          color: 'white',
        };
      default:
        return {
          background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.ember[500]} 100%)`,
          color: 'white',
          boxShadow: `0 4px 12px ${colors.flame[500]}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
        };
    }
  };

  return (
    <m.button
      onClick={handleClick}
      disabled={state === 'loading' || state === 'participated' || disabled}
      className={`relative overflow-hidden transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
      style={{
        padding: `${config.py} ${config.px}`,
        borderRadius: radii.xl,
        fontSize: config.fontSize,
        fontWeight: typography.fontWeight.semibold,
        cursor: state === 'loading' || state === 'participated' || disabled ? 'default' : 'pointer',
        willChange: 'transform, background-color', // DES-138: 성능 최적화
        ...getButtonStyles(),
        ...(state === 'idle' &&
          ({
            '--tw-ring-color': colors.focus.ring,
          } as React.CSSProperties)),
      }}
      aria-label={
        state === 'participated'
          ? '참여 완료됨'
          : state === 'loading'
            ? '참여 처리 중'
            : state === 'error'
              ? '참여 실패, 다시 시도'
              : `${popupName} 팝업 펀딩에 참여하기`
      }
      aria-pressed={state === 'participated'}
      aria-disabled={state === 'loading' || state === 'participated' || disabled}
      aria-busy={state === 'loading'}
      whileHover={state === 'idle' ? { scale: 1.02 } : {}}
      whileTap={state === 'idle' ? { scale: 0.98 } : {}}
    >
      {/* Pulse effect when near goal - respects reduced motion */}
      {isNearGoal && state === 'idle' && !prefersReducedMotion && (
        <m.div
          className="absolute inset-0"
          style={{ background: `${colors.flame[400]}4d` }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Shimmer effect for idle state - respects reduced motion */}
      {state === 'idle' && !prefersReducedMotion && (
        <m.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          }}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
      )}

      {/* Button content with animations */}
      <AnimatePresence mode="wait">
        {state === 'loading' && (
          <m.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center"
            style={{ gap: spacing[2] }}
          >
            <Loader2 size={config.iconSize} className="animate-spin" />
            <span>참여 중...</span>
          </m.div>
        )}

        {state === 'participated' && (
          <m.div
            key="participated"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center"
            style={{ gap: spacing[2] }}
          >
            <Check size={config.iconSize} strokeWidth={3} />
            <span>참여 완료</span>
          </m.div>
        )}

        {state === 'error' && (
          <m.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center"
            style={{ gap: spacing[2] }}
          >
            <span>다시 시도</span>
          </m.div>
        )}

        {state === 'idle' && (
          <m.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex items-center justify-center"
            style={{ gap: spacing[2] }}
          >
            <Flame size={config.iconSize} />
            <span>참여하기</span>
          </m.div>
        )}
      </AnimatePresence>

      {/* DES-025: Celebration confetti overlay - 2.5초, 12개 파티클, respects reduced motion */}
      {state === 'participated' && !prefersReducedMotion && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2.5 }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
        >
          {[...Array(12)].map((_, i) => (
            <m.div
              key={i}
              className="absolute"
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
              animate={{
                x: (Math.random() - 0.5) * 120,
                y: (Math.random() - 0.5) * 90,
                opacity: 0,
                scale: [0.5, 1.2, 0],
                rotate: (Math.random() - 0.5) * 360,
              }}
              transition={{ duration: 2, delay: i * 0.08, ease: 'easeOut' }}
            >
              {i % 3 === 0 ? (
                <Sparkles size={16} style={{ color: colors.spark[400] }} />
              ) : i % 3 === 1 ? (
                <PartyPopper size={16} style={{ color: colors.success }} />
              ) : (
                <Flame size={16} style={{ color: colors.flame[500] }} />
              )}
            </m.div>
          ))}
        </m.div>
      )}
    </m.button>
  );
}

// Memoize to prevent unnecessary re-renders
export const ParticipateButton = memo(ParticipateButtonComponent);
export default ParticipateButton;
