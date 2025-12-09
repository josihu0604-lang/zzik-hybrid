'use client';

import { type ReactNode } from 'react';
import { colors } from '@/lib/design-tokens';

/**
 * Icon Component - ZZIK Design System (DES-090~096)
 *
 * Standardized icon system that addresses:
 * - DES-090: 3가지 표준 사이즈 (sm: 16px, md: 20px, lg: 24px)
 * - DES-091: 일관된 viewBox="0 0 24 24"
 * - DES-092: strokeWidth는 고정 (1.5 or 2)
 * - DES-093: size만 조정, strokeWidth는 스케일 안함
 * - DES-094: 아이콘-텍스트 gap 표준화 (8px = spacing[2])
 * - DES-095: vertical-align: middle로 정렬
 * - DES-096: 최소 터치 영역 44x44px
 *
 * Usage:
 * <Icon name="heart" size="md" />
 * <IconButton icon={<HeartIcon />} onClick={...} aria-label="..." />
 */

// ============================================================================
// TYPES
// ============================================================================

export type IconSize = 'sm' | 'md' | 'lg';
export type IconColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'flame'
  | 'success'
  | 'warning'
  | 'error';

interface BaseIconProps {
  /** Icon size (sm: 16px, md: 20px, lg: 24px) */
  size?: IconSize;
  /** Icon color */
  color?: IconColor | string;
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Accessibility label */
  'aria-label'?: string;
  /** Decorative icon (hidden from screen readers) */
  'aria-hidden'?: boolean;
}

// ============================================================================
// SIZE SYSTEM (DES-090)
// ============================================================================

const iconSizeMap = {
  sm: 16, // Small - for inline text
  md: 20, // Medium - default
  lg: 24, // Large - for headers/emphasis
} as const;

// ============================================================================
// COLOR SYSTEM
// ============================================================================

const iconColorMap: Record<IconColor, string> = {
  primary: colors.text.primary,
  secondary: colors.text.secondary,
  tertiary: colors.text.tertiary,
  flame: colors.flame[500],
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
};

function getIconColor(color: IconColor | string): string {
  return iconColorMap[color as IconColor] || color;
}

// ============================================================================
// BASE ICON WRAPPER
// ============================================================================

interface IconWrapperProps extends BaseIconProps {
  children: ReactNode;
  /** viewBox for SVG (default: "0 0 24 24") */
  viewBox?: string;
  /** Fill for filled icons */
  fill?: string;
  /** Stroke for outlined icons */
  stroke?: string;
  /** Stroke width (DES-092: 고정값, 스케일 안함) */
  strokeWidth?: number;
}

export function IconWrapper({
  children,
  size = 'md',
  color = 'primary',
  className = '',
  style,
  viewBox = '0 0 24 24',
  fill = 'none',
  stroke = 'currentColor',
  strokeWidth = 2,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = !ariaLabel,
}: IconWrapperProps) {
  const iconSize = iconSizeMap[size];
  const iconColor = getIconColor(color);

  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox={viewBox}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{
        color: iconColor,
        verticalAlign: 'middle', // DES-095: 수직 정렬
        flexShrink: 0,
        ...style,
      }}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      role={ariaLabel ? 'img' : undefined}
    >
      {children}
    </svg>
  );
}

// ============================================================================
// ICON BUTTON (DES-096: 터치 영역)
// ============================================================================

interface IconButtonProps {
  /** Icon element to render */
  icon: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Required accessibility label */
  'aria-label': string;
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * IconButton with proper touch target (44x44px minimum)
 */
export function IconButton({
  icon,
  onClick,
  disabled = false,
  'aria-label': ariaLabel,
  className = '',
  style,
  type = 'button',
}: IconButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        minWidth: '44px', // DES-096: Apple HIG minimum
        minHeight: '44px',
        padding: '10px',
        borderRadius: '9999px',
        background: 'transparent',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: colors.text.secondary,
        transition: 'all 0.2s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.color = colors.text.primary;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = colors.text.secondary;
      }}
    >
      {icon}
    </button>
  );
}

// ============================================================================
// ICON WITH TEXT (DES-094: gap 표준화)
// ============================================================================

interface IconWithTextProps {
  /** Icon element */
  icon: ReactNode;
  /** Text content */
  children: ReactNode;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Gap between icon and text (default: 8px) */
  gap?: number;
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
}

/**
 * Icon with text component with standardized spacing
 */
export function IconWithText({
  icon,
  children,
  iconPosition = 'left',
  gap = 8, // DES-094: 표준 gap (spacing[2])
  className = '',
  style,
}: IconWithTextProps) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${gap}px`,
        ...style,
      }}
    >
      {iconPosition === 'left' && icon}
      {children}
      {iconPosition === 'right' && icon}
    </span>
  );
}

// ============================================================================
// COMMON ICONS
// ============================================================================

export function HeartIcon(props: BaseIconProps) {
  return (
    <IconWrapper {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </IconWrapper>
  );
}

export function StarIcon(props: BaseIconProps) {
  return (
    <IconWrapper {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </IconWrapper>
  );
}

export function SearchIcon(props: BaseIconProps) {
  return (
    <IconWrapper {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </IconWrapper>
  );
}

export function XIcon(props: BaseIconProps) {
  return (
    <IconWrapper {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </IconWrapper>
  );
}

export function CheckIcon(props: BaseIconProps) {
  return (
    <IconWrapper {...props}>
      <polyline points="20 6 9 17 4 12" />
    </IconWrapper>
  );
}

export function ChevronDownIcon(props: BaseIconProps) {
  return (
    <IconWrapper {...props}>
      <polyline points="6 9 12 15 18 9" />
    </IconWrapper>
  );
}

export function ChevronUpIcon(props: BaseIconProps) {
  return (
    <IconWrapper {...props}>
      <polyline points="18 15 12 9 6 15" />
    </IconWrapper>
  );
}

export function ChevronLeftIcon(props: BaseIconProps) {
  return (
    <IconWrapper {...props}>
      <polyline points="15 18 9 12 15 6" />
    </IconWrapper>
  );
}

export function ChevronRightIcon(props: BaseIconProps) {
  return (
    <IconWrapper {...props}>
      <polyline points="9 18 15 12 9 6" />
    </IconWrapper>
  );
}

export function InfoIcon(props: BaseIconProps) {
  return (
    <IconWrapper {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </IconWrapper>
  );
}

export function AlertCircleIcon(props: BaseIconProps) {
  return (
    <IconWrapper {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </IconWrapper>
  );
}

export function AlertTriangleIcon(props: BaseIconProps) {
  return (
    <IconWrapper {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </IconWrapper>
  );
}

export function LoaderIcon(props: BaseIconProps) {
  return (
    <IconWrapper {...props}>
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </IconWrapper>
  );
}

export default IconWrapper;
