'use client';

import { spacing, colors, radii, typography } from '@/lib/design-tokens';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
}

const variantStyles = {
  orange: {
    background: colors.temperature.warm.bg,
    color: colors.temperature.warm.text,
    border: `1px solid ${colors.temperature.warm.border}`,
  },
  success: {
    background: colors.temperature.done.bg,
    color: colors.temperature.done.text,
    border: `1px solid ${colors.temperature.done.border}`,
  },
  warning: {
    background: colors.temperature.warm.bg,
    color: colors.temperature.warm.text,
    border: `1px solid ${colors.temperature.warm.border}`,
  },
  error: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: colors.error,
    border: `1px solid rgba(239, 68, 68, 0.3)`,
  },
  neutral: {
    background: 'rgba(255, 255, 255, 0.04)',
    color: colors.text.secondary,
    border: `1px solid ${colors.border.subtle}`,
  },
};

const sizeStyles = {
  sm: {
    padding: `${spacing[1.5]} ${spacing[2.5]}`, // 6px 10px
    fontSize: typography.fontSize.xs.size,
    borderRadius: radii.full,
  },
  md: {
    padding: `${spacing[2]} ${spacing[3]}`, // 8px 12px
    fontSize: typography.fontSize.sm.size,
    borderRadius: radii.full,
  },
};

export function Badge({ children, variant = 'orange', size = 'sm' }: BadgeProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <span
      className="inline-flex items-center font-medium"
      style={{
        ...variantStyle,
        ...sizeStyle,
        fontWeight: typography.fontWeight.medium,
      }}
    >
      {children}
    </span>
  );
}
