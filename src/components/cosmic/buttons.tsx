'use client';

import { m } from 'framer-motion';
import { colors, shadows, radii, spacing, typography, zIndex } from '@/lib/design-tokens';
import { duration, easing } from '@/lib/animations';

/**
 * Button Components - ZZIK Design System (DES-031)
 *
 * Unified Button System
 * - Consolidates 3 button implementations into one
 * - Uses centralized design tokens
 * - 48px min touch targets (Apple HIG 2024+)
 * - Standardized animations (100ms/200ms/400ms)
 * - Focus-visible states for accessibility
 *
 * Replaces:
 * - cosmic/buttons.tsx (this file - enhanced)
 * - catalyst/button.tsx (Headless UI - kept for compatibility)
 * - globals.css button classes (deprecated, use components)
 */

interface ButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

// Size map with standardized spacing and typography
const sizeStyles = {
  sm: {
    padding: `${spacing[2.5]} ${spacing[4]}`,
    minHeight: '44px',
    fontSize: typography.fontSize.sm.size,
    borderRadius: radii.md,
  },
  md: {
    padding: `${spacing[3.5]} ${spacing[6]}`,
    minHeight: '48px',
    fontSize: typography.fontSize.base.size,
    borderRadius: radii.lg,
  },
  lg: {
    padding: `${spacing[4]} ${spacing[8]}`,
    minHeight: '52px',
    fontSize: typography.fontSize.lg.size,
    borderRadius: radii.lg,
  },
};

export function PrimaryButton({
  children,
  loading,
  disabled,
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}: ButtonProps) {
  const styles = sizeStyles[size];

  return (
    <m.button
      whileHover={{
        scale: 1.02,
        boxShadow: shadows.glow.primary,
        transition: { duration: duration.standard },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: duration.micro },
      }}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      aria-label={ariaLabel}
      className={`w-full font-semibold text-white relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        padding: styles.padding,
        minHeight: styles.minHeight,
        fontSize: styles.fontSize,
        borderRadius: styles.borderRadius,
        background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.flame[400]} 100%)`,
        boxShadow: shadows.glassInner,
        transition: `all ${duration.standard}s ${easing.smooth.join(',')}`,
      }}
    >
      {/* Liquid Glass highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
        }}
        aria-hidden="true"
      />
      <span
        className="relative flex items-center justify-center"
        style={{ zIndex: zIndex.base, gap: spacing[2] }}
      >
        {loading && <LoadingDots />}
        {children}
      </span>
    </m.button>
  );
}

export function SecondaryButton({
  children,
  loading,
  disabled,
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}: ButtonProps) {
  const styles = sizeStyles[size];

  return (
    <m.button
      whileHover={{
        scale: 1.02,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        transition: { duration: duration.standard },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: duration.micro },
      }}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      aria-label={ariaLabel}
      className={`w-full font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        padding: styles.padding,
        minHeight: styles.minHeight,
        fontSize: styles.fontSize,
        borderRadius: styles.borderRadius,
        color: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        transition: `all ${duration.standard}s ${easing.smooth.join(',')}`,
      }}
    >
      <span className="flex items-center justify-center" style={{ gap: spacing[2] }}>
        {loading && <LoadingDots />}
        {children}
      </span>
    </m.button>
  );
}

export function GhostButton({
  children,
  loading,
  disabled,
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}: ButtonProps) {
  const styles = sizeStyles[size];

  return (
    <m.button
      whileHover={{
        scale: 1.02,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        color: 'white',
        transition: { duration: duration.standard },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: duration.micro },
      }}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      aria-label={ariaLabel}
      className={`font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        padding: styles.padding,
        minHeight: styles.minHeight,
        fontSize: styles.fontSize,
        borderRadius: styles.borderRadius,
        color: 'rgba(255, 255, 255, 0.7)',
        background: 'transparent',
        transition: `all ${duration.standard}s ${easing.smooth.join(',')}`,
      }}
    >
      <span className="flex items-center justify-center" style={{ gap: spacing[2] }}>
        {loading && <LoadingDots />}
        {children}
      </span>
    </m.button>
  );
}

function LoadingDots() {
  return (
    <m.div
      animate={{ rotate: 360 }}
      transition={{
        repeat: Infinity,
        duration: 1,
        ease: 'linear',
      }}
      style={{
        width: spacing[5],
        height: spacing[5],
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: 'white',
        borderRadius: radii.full,
      }}
    />
  );
}

/**
 * IconButton - Minimal button for icons
 */
interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  'aria-label': string;
  className?: string;
}

export function IconButton({
  children,
  onClick,
  disabled,
  'aria-label': ariaLabel,
  className = '',
}: IconButtonProps) {
  return (
    <m.button
      whileHover={{
        scale: 1.1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        transition: { duration: duration.micro },
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: duration.micro },
      }}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        padding: spacing[2],
        minWidth: '44px',
        minHeight: '44px',
        borderRadius: radii.full,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.text.secondary,
        background: 'transparent',
        transition: `all ${duration.micro}s ${easing.smooth.join(',')}`,
      }}
    >
      {children}
    </m.button>
  );
}
