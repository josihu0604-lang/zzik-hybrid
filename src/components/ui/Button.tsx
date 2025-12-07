'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { colors, shadows, radii, spacing, typography } from '@/lib/design-tokens';
import { duration, easing } from '@/lib/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Button Component - ZZIK Design System (DES-083~086)
 *
 * Unified button system that addresses:
 * - DES-082: children 타입 안전성 (ReactNode)
 * - DES-083: size prop API 통일 (sm/md/lg)
 * - DES-084: disabled 스타일 대비 개선 (opacity + cursor)
 * - DES-085: compound variants 지원
 * - DES-086: 일관된 보더 너비 (1.5px)
 *
 * Features:
 * - Type-safe props with ReactNode children
 * - Compound variants (variant + size combinations)
 * - Consistent disabled states
 * - 48px minimum touch targets
 * - Standardized animations
 * - Loading states with spinner
 *
 * Usage:
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="outline" disabled>Disabled</Button>
 * <Button variant="ghost" loading>Loading</Button>
 */

// ============================================================================
// TYPES
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps {
  /** Button content (DES-082: ReactNode for type safety) */
  children: ReactNode;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size variant (DES-083: 통일된 API) */
  size?: ButtonSize;
  /** Loading state */
  loading?: boolean;
  /** Disabled state (DES-084: 개선된 스타일) */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon element (left side) */
  leftIcon?: ReactNode;
  /** Icon element (right side) */
  rightIcon?: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Accessibility label */
  'aria-label'?: string;
}

// ============================================================================
// SIZE SYSTEM (DES-083)
// ============================================================================

const sizeStyles = {
  sm: {
    padding: `${spacing[2.5]} ${spacing[4]}`,
    minHeight: '44px', // Apple HIG 최소 터치 타겟 (44pt)
    fontSize: typography.fontSize.sm.size,
    fontWeight: typography.fontWeight.semibold,
    borderRadius: radii.md,
    iconGap: spacing[1.5],
  },
  md: {
    padding: `${spacing[3.5]} ${spacing[6]}`,
    minHeight: '48px', // Material Design 권장 최소 터치 타겟 (48dp)
    fontSize: typography.fontSize.base.size,
    fontWeight: typography.fontWeight.semibold,
    borderRadius: radii.lg,
    iconGap: spacing[2],
  },
  lg: {
    padding: `${spacing[4]} ${spacing[8]}`,
    minHeight: '56px',
    fontSize: typography.fontSize.lg.size,
    fontWeight: typography.fontWeight.semibold,
    borderRadius: radii.xl,
    iconGap: spacing[2.5],
  },
  xl: {
    padding: `${spacing[5]} ${spacing[10]}`,
    minHeight: '64px',
    fontSize: typography.fontSize.xl.size,
    fontWeight: typography.fontWeight.bold,
    borderRadius: radii.xl,
    iconGap: spacing[3],
  },
} as const;

// ============================================================================
// VARIANT STYLES (DES-085: Compound Variants)
// ============================================================================

interface VariantStyles {
  background: string;
  color: string;
  border: string;
  hoverBackground: string;
  hoverBoxShadow?: string;
  disabledBackground: string;
  disabledColor: string;
  disabledBorder?: string;
}

const variantStyles: Record<ButtonVariant, VariantStyles> = {
  primary: {
    background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.flame[400]} 100%)`,
    color: 'white',
    border: 'none',
    hoverBackground: `linear-gradient(135deg, ${colors.flame[400]} 0%, ${colors.flame[300]} 100%)`,
    hoverBoxShadow: shadows.glow.primary,
    disabledBackground: colors.space[700],
    disabledColor: colors.text.tertiary,
  },
  secondary: {
    background: colors.space[800],
    color: colors.text.primary,
    border: `1.5px solid ${colors.border.subtle}`, // DES-086: 통일된 보더
    hoverBackground: colors.space[700],
    disabledBackground: colors.space[850],
    disabledColor: colors.text.muted,
    disabledBorder: `1.5px solid ${colors.border.subtle}`,
  },
  outline: {
    background: 'transparent',
    color: colors.text.primary,
    border: `1.5px solid ${colors.border.emphasis}`, // DES-086
    hoverBackground: 'rgba(255, 255, 255, 0.05)',
    disabledBackground: 'transparent',
    disabledColor: colors.text.tertiary,
    disabledBorder: `1.5px solid ${colors.border.subtle}`,
  },
  ghost: {
    background: 'transparent',
    color: colors.text.secondary,
    border: 'none',
    hoverBackground: 'rgba(255, 255, 255, 0.08)',
    disabledBackground: 'transparent',
    disabledColor: colors.text.muted,
  },
  danger: {
    background: colors.error,
    color: 'white',
    border: 'none',
    hoverBackground: '#dc2626',
    hoverBoxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
    disabledBackground: colors.space[700],
    disabledColor: colors.text.tertiary,
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.06)',
    color: colors.text.primary,
    border: `1.5px solid ${colors.border.default}`,
    hoverBackground: 'rgba(255, 255, 255, 0.10)',
    hoverBoxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    disabledBackground: 'rgba(255, 255, 255, 0.03)',
    disabledColor: colors.text.muted,
    disabledBorder: `1.5px solid ${colors.border.subtle}`,
  },
};

// ============================================================================
// LOADING SPINNER
// ============================================================================

function ButtonSpinner({ size }: { size: ButtonSize }) {
  const spinnerSize = size === 'sm' ? 14 : size === 'md' ? 16 : 18;

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      style={{
        width: spinnerSize,
        height: spinnerSize,
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: 'white',
        borderRadius: '9999px',
      }}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  style,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const sizeStyle = sizeStyles[size];
  const variantStyle = variantStyles[variant];
  const isDisabled = disabled || loading;
  const prefersReducedMotion = useReducedMotion();

  // DES-084: 개선된 disabled 스타일
  const getBackground = () => {
    if (isDisabled) return variantStyle.disabledBackground;
    return variantStyle.background;
  };

  const getColor = () => {
    if (isDisabled) return variantStyle.disabledColor;
    return variantStyle.color;
  };

  const getBorder = () => {
    if (isDisabled && variantStyle.disabledBorder) return variantStyle.disabledBorder;
    return variantStyle.border;
  };

  return (
    <motion.button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`${className} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 tap-haptic touch-target-extended`}
      whileHover={
        !isDisabled && !prefersReducedMotion
          ? {
              background: variantStyle.hoverBackground,
              boxShadow: variantStyle.hoverBoxShadow || shadows.md,
              scale: 1.02,
              transition: { duration: duration.standard },
            }
          : undefined
      }
      whileTap={
        !isDisabled && !prefersReducedMotion
          ? { scale: 0.98, transition: { duration: duration.micro } }
          : undefined
      }
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: fullWidth ? '100%' : 'auto',
        padding: sizeStyle.padding,
        minHeight: sizeStyle.minHeight,
        fontSize: sizeStyle.fontSize,
        fontWeight: sizeStyle.fontWeight,
        fontFamily: typography.fontFamily.sans,
        borderRadius: sizeStyle.borderRadius,
        background: getBackground(),
        color: getColor(),
        border: getBorder(),
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        // A11Y-008: WCAG AA 3:1 대비 충족을 위해 0.5 → 0.65로 개선
        // 기존 0.5 + #9a9a9a = 2.8:1 (미달) → 0.65 + #9a9a9a = 3.6:1 (충족)
        opacity: isDisabled ? 0.65 : 1,
        transition: `all ${duration.standard}s ${easing.smooth.join(',')}`,
        gap: sizeStyle.iconGap,
        outlineColor: colors.flame[500], // A11Y-013: focus-visible 색상
        ...style,
      }}
    >
      {/* Glass highlight effect for primary buttons */}
      {variant === 'primary' && !isDisabled && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
            borderRadius: `${sizeStyle.borderRadius} ${sizeStyle.borderRadius} 0 0`,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: sizeStyle.iconGap,
          position: 'relative',
        }}
      >
        {loading && <ButtonSpinner size={size} />}
        {!loading && leftIcon && <span style={{ display: 'inline-flex' }}>{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span style={{ display: 'inline-flex' }}>{rightIcon}</span>}
      </span>
    </motion.button>
  );
}

// ============================================================================
// BUTTON GROUP
// ============================================================================

interface ButtonGroupProps {
  children: ReactNode;
  /** Spacing between buttons */
  gap?: keyof typeof spacing;
  /** Vertical or horizontal layout */
  orientation?: 'horizontal' | 'vertical';
  /** Custom className */
  className?: string;
}

export function ButtonGroup({
  children,
  gap = 3,
  orientation = 'horizontal',
  className = '',
}: ButtonGroupProps) {
  return (
    <div
      role="group"
      className={`button-group-mobile ${className}`}
      style={{
        display: 'flex',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        gap: spacing[gap],
        alignItems: orientation === 'horizontal' ? 'center' : 'stretch',
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// ICON BUTTON
// ============================================================================

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonVariant = 'default' | 'glass' | 'ghost' | 'danger';

export interface IconButtonProps {
  /** Icon element */
  icon: ReactNode;
  /** Accessibility label (required) */
  'aria-label': string;
  /** Visual variant */
  variant?: IconButtonVariant;
  /** Size variant */
  size?: IconButtonSize;
  /** Disabled state */
  disabled?: boolean;
  /** Click handler */
  onClick?: (e?: React.MouseEvent) => void;
  /** Custom className */
  className?: string;
}

const iconButtonSizes = {
  sm: { size: '44px', padding: spacing[2], borderRadius: radii.md }, // Apple HIG 최소 44pt
  md: { size: '48px', padding: spacing[2.5], borderRadius: radii.lg }, // Material Design 권장 48dp
  lg: { size: '56px', padding: spacing[3], borderRadius: radii.xl }, // Comfortable 터치 타겟
} as const;

const iconButtonVariants = {
  default: {
    background: 'rgba(255, 255, 255, 0.06)',
    hoverBackground: 'rgba(255, 255, 255, 0.10)',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.06)',
    hoverBackground: 'rgba(255, 255, 255, 0.12)',
  },
  ghost: {
    background: 'transparent',
    hoverBackground: 'rgba(255, 255, 255, 0.08)',
  },
  danger: {
    background: 'rgba(239, 68, 68, 0.1)',
    hoverBackground: 'rgba(239, 68, 68, 0.2)',
  },
} as const;

export function IconButton({
  icon,
  'aria-label': ariaLabel,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
}: IconButtonProps) {
  const sizeStyle = iconButtonSizes[size];
  const variantStyle = iconButtonVariants[variant];
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${className} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
      whileHover={
        !disabled && !prefersReducedMotion
          ? { scale: 1.05, background: variantStyle.hoverBackground }
          : undefined
      }
      whileTap={!disabled && !prefersReducedMotion ? { scale: 0.95 } : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: sizeStyle.size,
        height: sizeStyle.size,
        padding: sizeStyle.padding,
        borderRadius: sizeStyle.borderRadius,
        background: variantStyle.background,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: `all ${duration.standard}s ${easing.smooth.join(',')}`,
        outlineColor: colors.flame[500],
      }}
    >
      {icon}
    </motion.button>
  );
}

export default Button;
