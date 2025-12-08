'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { m } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'flame' | 'success';
}

const sizes = {
  sm: {
    track: 'w-8 h-5',
    thumb: 'w-3.5 h-3.5',
    translate: 'translate-x-3.5',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-4.5 h-4.5',
    translate: 'translate-x-5',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'w-5.5 h-5.5',
    translate: 'translate-x-7',
  },
};

const variants = {
  default: 'bg-white/30',
  flame: 'bg-flame-500',
  success: 'bg-green-500',
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      className,
      label,
      description,
      size = 'md',
      variant = 'flame',
      checked,
      disabled,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const switchId = id || `switch-${Math.random().toString(36).slice(2, 9)}`;
    const sizeConfig = sizes[size];

    return (
      <label
        htmlFor={switchId}
        className={cn(
          'flex items-center gap-3 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {/* Hidden input */}
        <input
          ref={ref}
          type="checkbox"
          id={switchId}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="sr-only"
          role="switch"
          aria-checked={checked}
          {...props}
        />

        {/* Switch track */}
        <m.div
          className={cn(
            'relative rounded-full transition-colors duration-200',
            sizeConfig.track,
            checked ? variants[variant] : 'bg-white/10'
          )}
          animate={{ backgroundColor: checked ? undefined : undefined }}
        >
          {/* Thumb */}
          <m.div
            className={cn(
              'absolute top-1/2 left-1 -translate-y-1/2 rounded-full bg-white shadow-md',
              sizeConfig.thumb
            )}
            animate={{
              x: checked ? parseInt(sizeConfig.translate.replace('translate-x-', '')) * 4 : 0,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </m.div>

        {/* Label & description */}
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-white">{label}</span>
            )}
            {description && (
              <span className="text-xs text-white/50">{description}</span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';
