'use client';

import { m, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { liquidGlass, shadows } from '@/lib/design-tokens';

/**
 * GlassCard Component - Apple Liquid Glass (iOS 26 / 2026 Design)
 *
 * Uses centralized Liquid Glass design tokens for consistency.
 * Features: blur + saturate, multi-layer shadows, specular highlights
 */

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  hover?: boolean;
  glow?: 'flame' | 'primary' | 'secondary' | 'accent' | 'success' | null;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  variant?: 'frosted' | 'standard'; // DES-077: 2개만 유지
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

// DES-072: 시맨틱 네이밍 사용
const glowMap = {
  flame: shadows.glow.primary, // 레거시 호환 (flame → primary)
  primary: shadows.glow.primary,
  secondary: shadows.glow.secondary,
  accent: shadows.glow.accent,
  success: shadows.glow.success,
} as const;

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className = '',
      hover = true,
      glow = null,
      padding = 'md',
      variant = 'standard',
      ...props
    },
    ref
  ) => {
    // Glow shadow from design tokens
    const glowShadow = glow ? glowMap[glow] : undefined;

    // Hover effect with optional glow
    const hoverEffect = hover
      ? {
          scale: 1.01,
          y: -2,
          boxShadow: glowShadow,
        }
      : undefined;

    // Use centralized Liquid Glass tokens
    const glassStyle = liquidGlass[variant];

    return (
      <m.div
        ref={ref}
        whileHover={hoverEffect}
        className={`rounded-[20px] ${paddingMap[padding]} transition-shadow relative overflow-hidden ${className}`}
        style={glassStyle}
        {...props}
      >
        {/* Specular highlight - simulates glass reflection */}
        <div
          className="absolute top-0 left-0 right-0 h-1/2 rounded-t-[20px] pointer-events-none"
          style={{ background: liquidGlass.highlight }}
          aria-hidden="true"
        />
        <div className="relative">{children as React.ReactNode}</div>
      </m.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
