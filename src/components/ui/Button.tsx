'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { m } from 'framer-motion';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'glass' | 'default';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  /** @deprecated Use isLoading instead */
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
}

const variants = {
  primary: `
    bg-flame-500 text-white
    hover:bg-flame-400 active:bg-flame-600
    shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]
    focus-visible:ring-2 focus-visible:ring-flame-500 focus-visible:ring-offset-2 focus-visible:ring-offset-space-950
  `,
  secondary: `
    bg-white/[0.04] text-white/90 border border-white/12
    hover:bg-white/[0.08] hover:border-white/15 active:bg-white/[0.04]
    backdrop-blur-xl
    focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-space-950
  `,
  ghost: `
    bg-transparent text-white/60
    hover:text-white hover:bg-white/[0.04] active:bg-white/[0.08]
    focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-space-950
  `,
  danger: `
    bg-red-500/15 text-red-400 border border-red-500/30
    hover:bg-red-500/25 active:bg-red-500/15
    focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-space-950
  `,
  success: `
    bg-green-500/15 text-green-400 border border-green-500/30
    hover:bg-green-500/25 active:bg-green-500/15
    focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-space-950
  `,
  outline: `
    bg-transparent text-white/70 border border-white/20
    hover:bg-white/[0.04] hover:border-white/30 active:bg-white/[0.08]
    focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-space-950
  `,
  glass: `
    bg-white/[0.06] text-white/90 border border-white/15
    backdrop-blur-xl
    hover:bg-white/[0.1] active:bg-white/[0.08]
    shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]
    focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-space-950
  `,
  // Default is an alias for secondary for backward compatibility
  default: `
    bg-white/[0.04] text-white/90 border border-white/12
    hover:bg-white/[0.08] hover:border-white/15 active:bg-white/[0.04]
    backdrop-blur-xl
    focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-space-950
  `,
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-[10px]',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
  xl: 'h-14 px-8 text-lg gap-3 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading = false, // Legacy support
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = false,
      disabled,
      type = 'button',
      children,
      ...props
    },
    ref
  ) => {
    const isLoadingState = isLoading || loading;

    return (
      <m.button
        ref={ref}
        whileHover={{ scale: disabled || isLoadingState ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoadingState ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-200 ease-out',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          // Variant
          variants[variant],
          // Size
          sizes[size],
          // Modifiers
          fullWidth && 'w-full',
          rounded && 'rounded-full',
          className
        )}
        disabled={disabled || isLoadingState}
        type={type}
        {...props}
      >
        {isLoadingState ? (
          <>
            <Spinner className="w-4 h-4" />
            <span className="ml-2">Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </m.button>
    );
  }
);

Button.displayName = 'Button';

// Spinner component
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// IconButton component for backward compatibility
export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'md', ...props }, ref) => {
    const iconSizes = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-14 h-14',
    };

    return (
      <Button
        ref={ref}
        className={cn(iconSizes[size], 'p-0', className)}
        size={size}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
