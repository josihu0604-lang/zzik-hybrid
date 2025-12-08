'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { m, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  glow?: 'none' | 'flame' | 'spark' | 'success';
}

const cardVariants = {
  default: 'bg-space-850 border border-white/8',
  glass: `
    bg-space-850/75 backdrop-blur-[24px] backdrop-saturate-[180%]
    border border-white/12
    shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.3)]
  `,
  elevated: 'bg-space-800 shadow-lg border border-white/8',
  outlined: 'bg-transparent border border-white/12',
};

const paddingSizes = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

const glowColors = {
  none: '',
  flame: 'hover:shadow-[0_0_30px_rgba(255,107,91,0.15)]',
  spark: 'hover:shadow-[0_0_30px_rgba(255,217,61,0.15)]',
  success: 'hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hover = false,
      clickable = false,
      glow = 'none',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base
          'rounded-2xl transition-all duration-300',
          // Variant
          cardVariants[variant],
          // Padding
          paddingSizes[padding],
          // Hover
          hover && 'hover:bg-space-800 hover:border-white/15',
          // Clickable
          clickable && 'cursor-pointer active:scale-[0.98]',
          // Glow
          glowColors[glow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Glass Card with motion
export const GlassCard = forwardRef<HTMLDivElement, CardProps & { 
  animate?: boolean;
  delay?: number;
}>(
  ({ animate = true, delay = 0, children, className, ...props }, ref) => {
    if (!animate) {
      return (
        <Card ref={ref} variant="glass" className={className} {...props}>
          {children}
        </Card>
      );
    }

    return (
      <m.div
        ref={ref}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          delay,
        }}
      >
        <Card variant="glass" className={className} {...props}>
          {children}
        </Card>
      </m.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
