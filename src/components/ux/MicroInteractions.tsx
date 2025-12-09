'use client';

import { useState, useCallback, ReactNode, MouseEvent } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2, Sparkles } from 'lucide-react';
import { colors, radii, spacing, typography } from '@/lib/design-tokens';
import { useHaptic } from '@/hooks/useHaptic';

/**
 * MicroInteractions - 마이크로 인터랙션 컴포넌트
 *
 * Nielsen's Heuristics #1: Visibility of System Status
 * - 버튼 클릭, 호버 등에 즉각적인 피드백 제공
 * - 성공/실패 애니메이션으로 결과 명확하게 전달
 *
 * Apple HIG: Provide Feedback
 * - 모든 인터랙션에 시각적/촉각적 피드백
 */

// ============================================================================
// AnimatedButton - 애니메이션 버튼
// ============================================================================

/**
 * @deprecated This component is currently unused in the project.
 * Consider removing in a future version or document where it should be used.
 */
type ButtonState = 'idle' | 'loading' | 'success' | 'error';

/**
 * @deprecated This component is currently unused in the project.
 * Consider removing in a future version or document where it should be used.
 */
export interface AnimatedButtonProps {
  /** 버튼 텍스트 */
  children: ReactNode;
  /** 클릭 핸들러 (Promise 반환 시 자동 로딩 처리) */
  onClick?: () => void | Promise<void>;
  /** 버튼 변형 */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 비활성화 */
  disabled?: boolean;
  /** 성공 시 메시지 */
  successMessage?: string;
  /** 실패 시 메시지 */
  errorMessage?: string;
  /** 성공/실패 후 리셋 시간 (ms) */
  resetDelay?: number;
  /** 클래스명 */
  className?: string;
  /** 아이콘 */
  icon?: ReactNode;
  /** 전체 너비 */
  fullWidth?: boolean;
  /** 로딩 중 텍스트 */
  loadingText?: string;
}

const BUTTON_SIZE_CONFIG = {
  sm: {
    px: spacing[4],
    py: spacing[2],
    fontSize: typography.fontSize.sm.size,
    iconSize: 14,
  },
  md: {
    px: spacing[6],
    py: spacing[3],
    fontSize: typography.fontSize.base.size,
    iconSize: 16,
  },
  lg: {
    px: spacing[8],
    py: spacing[4],
    fontSize: typography.fontSize.lg.size,
    iconSize: 18,
  },
};

/**
 * @deprecated This component is currently unused in the project.
 * Consider removing in a future version or document where it should be used.
 */
export function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  successMessage,
  errorMessage,
  resetDelay = 2000,
  className = '',
  icon,
  fullWidth = false,
  loadingText = '처리 중...',
}: AnimatedButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');
  const haptic = useHaptic();
  const config = BUTTON_SIZE_CONFIG[size];

  const handleClick = useCallback(async () => {
    if (state !== 'idle' || disabled || !onClick) return;

    setState('loading');
    haptic.tap();

    try {
      await onClick();
      setState('success');
      haptic.success();
    } catch {
      setState('error');
      haptic.error();
    } finally {
      setTimeout(() => setState('idle'), resetDelay);
    }
  }, [state, disabled, onClick, haptic, resetDelay]);

  const getButtonStyles = () => {
    const baseStyles = {
      padding: `${config.py} ${config.px}`,
      fontSize: config.fontSize,
      borderRadius: radii.xl,
      fontWeight: typography.fontWeight.semibold,
    };

    if (state === 'success') {
      return {
        ...baseStyles,
        background: colors.success,
        color: 'white',
      };
    }

    if (state === 'error') {
      return {
        ...baseStyles,
        background: colors.error,
        color: 'white',
      };
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.ember[500]} 100%)`,
          color: 'white',
          boxShadow: '0 4px 16px rgba(255, 107, 91, 0.3)',
        };
      case 'secondary':
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.08)',
          color: colors.text.primary,
          border: `1px solid ${colors.border.default}`,
        };
      case 'ghost':
        return {
          ...baseStyles,
          background: 'transparent',
          color: colors.text.secondary,
        };
      default:
        return baseStyles;
    }
  };

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <m.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Loader2 size={config.iconSize} className="animate-spin" />
            {loadingText}
          </m.span>
        );
      case 'success':
        return (
          <m.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Check size={config.iconSize} strokeWidth={3} />
            {successMessage || '완료'}
          </m.span>
        );
      case 'error':
        return (
          <m.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <X size={config.iconSize} strokeWidth={3} />
            {errorMessage || '실패'}
          </m.span>
        );
      default:
        return (
          <span className="flex items-center gap-2">
            {icon}
            {children}
          </span>
        );
    }
  };

  return (
    <m.button
      onClick={handleClick}
      disabled={disabled || state !== 'idle'}
      whileHover={state === 'idle' ? { scale: 1.02 } : undefined}
      whileTap={state === 'idle' ? { scale: 0.98 } : undefined}
      className={`relative overflow-hidden transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{
        ...getButtonStyles(),
        willChange: 'transform',
      }}
      aria-busy={state === 'loading'}
      aria-disabled={disabled || state !== 'idle'}
    >
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </m.button>
  );
}

// ============================================================================
// SuccessAnimation - 성공 애니메이션
// ============================================================================

/**
 * @deprecated This component is currently unused in the project.
 * Consider removing in a future version or document where it should be used.
 */
interface SuccessAnimationProps {
  /** 표시 여부 */
  show: boolean;
  /** 메시지 */
  message?: string;
  /** 완료 콜백 */
  onComplete?: () => void;
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * @deprecated This component is currently unused in the project.
 * Consider removing in a future version or document where it should be used.
 */
export function SuccessAnimation({
  show,
  message = '완료!',
  onComplete,
  size = 'md',
}: SuccessAnimationProps) {
  const iconSize = size === 'sm' ? 32 : size === 'md' ? 48 : 64;

  return (
    <AnimatePresence>
      {show && (
        <m.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onAnimationComplete={() => onComplete?.()}
          className="flex flex-col items-center gap-3"
        >
          {/* Checkmark Circle */}
          <m.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
            className="rounded-full flex items-center justify-center"
            style={{
              width: iconSize * 1.5,
              height: iconSize * 1.5,
              background: `${colors.success}20`,
              border: `2px solid ${colors.success}`,
            }}
          >
            <m.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Check size={iconSize} style={{ color: colors.success }} strokeWidth={3} />
            </m.div>
          </m.div>

          {/* Message */}
          <m.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white font-semibold"
            style={{ fontSize: size === 'sm' ? '14px' : size === 'md' ? '16px' : '18px' }}
          >
            {message}
          </m.p>

          {/* Confetti/Sparkles */}
          <m.div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <m.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 100,
                  y: (Math.random() - 0.5) * 100,
                  opacity: 0,
                  scale: [1, 1.5, 0],
                }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
                className="absolute left-1/2 top-1/2"
              >
                <Sparkles size={12} style={{ color: colors.spark[400] }} />
              </m.div>
            ))}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// FailureAnimation - 실패 애니메이션
// ============================================================================

/**
 * @deprecated This component is currently unused in the project.
 * Consider removing in a future version or document where it should be used.
 */
interface FailureAnimationProps {
  /** 표시 여부 */
  show: boolean;
  /** 메시지 */
  message?: string;
  /** 완료 콜백 */
  onComplete?: () => void;
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * @deprecated This component is currently unused in the project.
 * Consider removing in a future version or document where it should be used.
 */
export function FailureAnimation({
  show,
  message = '실패',
  onComplete,
  size = 'md',
}: FailureAnimationProps) {
  const iconSize = size === 'sm' ? 32 : size === 'md' ? 48 : 64;

  return (
    <AnimatePresence>
      {show && (
        <m.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onAnimationComplete={() => onComplete?.()}
          className="flex flex-col items-center gap-3"
        >
          {/* X Circle with Shake */}
          <m.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, x: [0, -5, 5, -5, 5, 0] }}
            transition={{
              scale: { type: 'spring', stiffness: 400, damping: 15 },
              x: { duration: 0.4, delay: 0.2 },
            }}
            className="rounded-full flex items-center justify-center"
            style={{
              width: iconSize * 1.5,
              height: iconSize * 1.5,
              background: `${colors.error}20`,
              border: `2px solid ${colors.error}`,
            }}
          >
            <X size={iconSize} style={{ color: colors.error }} strokeWidth={3} />
          </m.div>

          {/* Message */}
          <m.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white font-semibold"
            style={{ fontSize: size === 'sm' ? '14px' : size === 'md' ? '16px' : '18px' }}
          >
            {message}
          </m.p>
        </m.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// RippleEffect - 리플 이펙트
// ============================================================================

/**
 * @deprecated This component is currently unused in the project.
 * Consider removing in a future version or document where it should be used.
 */
interface RippleEffectProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 리플 색상 */
  color?: string;
  /** 비활성화 */
  disabled?: boolean;
  /** 클래스명 */
  className?: string;
}

/**
 * @deprecated This component is currently unused in the project.
 * Consider removing in a future version or document where it should be used.
 */
export function RippleEffect({
  children,
  color = 'rgba(255, 255, 255, 0.3)',
  disabled = false,
  className = '',
}: RippleEffectProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;
    const id = Date.now();

    setRipples((prev) => [...prev, { id, x, y, size }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      style={{ cursor: disabled ? 'default' : 'pointer' }}
    >
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <m.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
              background: color,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// PressEffect - 프레스 이펙트
// ============================================================================

/**
 * @deprecated This component is currently unused in the project.
 * Consider removing in a future version or document where it should be used.
 */
interface PressEffectProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 스케일 값 */
  scale?: number;
  /** 비활성화 */
  disabled?: boolean;
  /** 클래스명 */
  className?: string;
  /** 클릭 핸들러 */
  onClick?: () => void;
}

/**
 * @deprecated This component is currently unused in the project.
 * Consider removing in a future version or document where it should be used.
 */
export function PressEffect({
  children,
  scale = 0.97,
  disabled = false,
  className = '',
  onClick,
}: PressEffectProps) {
  const haptic = useHaptic();

  const handleTap = () => {
    if (disabled) return;
    haptic.tap();
    onClick?.();
  };

  return (
    <m.div
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      whileTap={!disabled ? { scale } : undefined}
      onClick={handleTap}
      className={className}
      style={{ cursor: disabled ? 'default' : 'pointer' }}
    >
      {children}
    </m.div>
  );
}

export default AnimatedButton;
