'use client';

import { useState, forwardRef, useId } from 'react';

interface CosmicInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  onChange?: (value: string) => void;
}

export const CosmicInput = forwardRef<HTMLInputElement, CosmicInputProps>(
  ({ label, error, icon, className = '', onChange, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = useId();
    const errorId = useId();

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-white/60 text-xs font-medium font-outfit">
            {label}
          </label>
        )}
        <div
          className={`relative rounded-xl transition-all duration-300 ${
            focused ? 'ring-2 ring-linear-orange/50' : ''
          } ${error ? 'ring-2 ring-red-500/50' : ''}`}
        >
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">{icon}</div>
          )}
          <input
            id={inputId}
            ref={ref}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => onChange?.(e.target.value)}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? 'true' : 'false'}
            className={`w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none font-outfit transition-colors ${
              icon ? 'pl-12' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

CosmicInput.displayName = 'CosmicInput';
