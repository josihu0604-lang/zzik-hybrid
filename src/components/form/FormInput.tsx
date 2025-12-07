'use client';

import { forwardRef, useState, useId, type InputHTMLAttributes } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

/**
 * FormInput - Styled form input with validation feedback
 */

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Field label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Show success state when valid */
  showSuccess?: boolean;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Input variant */
  variant?: 'default' | 'filled' | 'outline';
  /** Full width */
  fullWidth?: boolean;
  /** DES-118: Input mode for mobile keyboards */
  inputMode?: 'text' | 'email' | 'tel' | 'url' | 'numeric' | 'decimal' | 'search';
  /** DES-119: Autocomplete attribute - 자주 사용되는 값들 */
  autoComplete?:
    | 'off'
    | 'on'
    | 'name'
    | 'email'
    | 'tel'
    | 'street-address'
    | 'postal-code'
    | 'country'
    | 'current-password'
    | 'new-password'
    | 'username'
    | 'organization'
    | 'cc-name'
    | 'cc-number'
    | string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      showSuccess,
      leftIcon,
      rightIcon,
      variant = 'default',
      fullWidth = true,
      type = 'text',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const autoId = useId();
    const inputId = props.id || props.name || autoId;
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const hasError = !!error;
    const isValid = showSuccess && !hasError && props.value;

    const getVariantStyles = () => {
      const base = `
        w-full px-4 py-3 rounded-xl text-white text-base
        placeholder:text-linear-text-tertiary
        transition-all duration-200
        focus:outline-none
        disabled:opacity-50 disabled:cursor-not-allowed
      `;

      const states = hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
        : isValid
          ? 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
          : `border-white/10 focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20`;

      switch (variant) {
        case 'filled':
          return `${base} bg-white/5 border ${states}`;
        case 'outline':
          return `${base} bg-transparent border ${states}`;
        default:
          return `${base} bg-space-900 border ${states}`;
      }
    };

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-white mb-2">
            {label}
            {props.required && (
              <span className="text-flame-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-linear-text-tertiary">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            autoComplete={props.autoComplete}
            className={`
              ${getVariantStyles()}
              ${leftIcon ? 'pl-12' : ''}
              ${rightIcon || isPassword ? 'pr-12' : ''}
            `}
            id={inputId}
            aria-invalid={hasError}
            aria-describedby={
              [error ? `${inputId}-error` : null, helperText && !error ? `${inputId}-helper` : null]
                .filter(Boolean)
                .join(' ') || undefined
            }
            aria-required={props.required}
            {...props}
            style={{
              minHeight: '48px', // DES-105: 최소 터치 영역
              fontSize: '16px', // MOB-008: iOS 자동 줌 방지
              ...props.style,
            }}
          />

          {/* Right Icon / Password Toggle / Status */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center text-linear-text-tertiary hover:text-white transition-colors"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            )}
            {rightIcon && !isPassword && rightIcon}
            {isValid && <Check size={18} className="text-green-500" aria-hidden="true" />}
            {hasError && <AlertCircle size={18} className="text-red-500" aria-hidden="true" />}
          </div>
        </div>

        {/* Error / Helper Text */}
        <AnimatePresence mode="wait">
          {hasError ? (
            <m.p
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              onAnimationComplete={() => {
                // Scroll error message into view for keyboard users
                const errorElement = document.getElementById(`${inputId}-error`);
                if (errorElement) {
                  errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              id={`${inputId}-error`}
              className="mt-2 text-xs text-red-500 flex items-center gap-1"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle size={12} aria-hidden="true" />
              {error}
            </m.p>
          ) : helperText ? (
            <m.p
              key="helper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              id={`${inputId}-helper`}
              className="mt-2 text-xs text-linear-text-tertiary"
            >
              {helperText}
            </m.p>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

/**
 * FormTextarea - Styled textarea with validation
 */

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
  maxLength?: number;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, helperText, showCount, maxLength, className = '', ...props }, ref) => {
    const hasError = !!error;
    const currentLength = String(props.value || '').length;

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={props.id || props.name}
            className="block text-sm font-medium text-white mb-2"
          >
            {label}
            {props.required && (
              <span className="text-flame-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          maxLength={maxLength}
          className={`
            w-full px-4 py-3 rounded-xl text-white text-sm
            bg-space-900 border
            placeholder:text-linear-text-tertiary
            transition-all duration-200
            focus:outline-none resize-none
            ${
              hasError
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-white/10 focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20'
            }
          `}
          rows={4}
          style={{
            minHeight: '120px', // DES-105: 충분한 입력 공간
            fontSize: '16px', // MOB-008: iOS 자동 줌 방지
          }}
          id={props.id || props.name}
          aria-invalid={hasError}
          aria-describedby={
            [
              error ? `${props.name}-error` : null,
              helperText && !error ? `${props.name}-helper` : null,
            ]
              .filter(Boolean)
              .join(' ') || undefined
          }
          aria-required={props.required}
          {...props}
        />

        <div className="flex justify-between mt-2">
          {hasError ? (
            <p
              id={`${props.name}-error`}
              className="text-xs text-red-500 flex items-center gap-1"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle size={12} aria-hidden="true" />
              {error}
            </p>
          ) : helperText ? (
            <p id={`${props.name}-helper`} className="text-xs text-linear-text-tertiary">
              {helperText}
            </p>
          ) : (
            <span />
          )}

          {showCount && maxLength && (
            <span
              className={`text-xs ${
                currentLength >= maxLength ? 'text-red-500' : 'text-linear-text-tertiary'
              }`}
              aria-live="polite"
              aria-atomic="true"
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

/**
 * FormSelect - Styled select dropdown
 */

interface FormSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: FormSelectOption[];
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, options, placeholder, className = '', ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={props.id || props.name}
            className="block text-sm font-medium text-white mb-2"
          >
            {label}
            {props.required && (
              <span className="text-flame-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <select
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl text-white text-sm
            bg-space-900 border appearance-none
            transition-all duration-200
            focus:outline-none
            ${
              hasError
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-white/10 focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20'
            }
          `}
          style={{
            minHeight: '52px', // DES-105: 터치 타겟 개선 (48px + 여유)
            fontSize: '16px', // MOB-008: iOS 자동 줌 방지
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a8a8a8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
          }}
          id={props.id || props.name}
          aria-invalid={hasError}
          aria-describedby={error ? `${props.name}-error` : undefined}
          aria-required={props.required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        {hasError && (
          <p
            id={`${props.name}-error`}
            className="mt-2 text-xs text-red-500 flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle size={12} aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

/**
 * FormCheckbox - Styled checkbox
 */

interface FormCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const checkboxId =
      props.id || props.name || `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
      <div className={className}>
        <label htmlFor={checkboxId} className="flex items-start gap-3 cursor-pointer min-h-[48px]">
          <div className="relative mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              className="peer sr-only"
              id={checkboxId}
              aria-invalid={!!error}
              aria-describedby={error ? `${checkboxId}-error` : undefined}
              {...props}
            />
            <m.div
              className={`
                w-5 h-5 rounded-md border transition-all
                peer-checked:border-flame-500 peer-checked:bg-flame-500
                peer-focus:ring-2 peer-focus:ring-flame-500/20
                ${error ? 'border-red-500' : 'border-white/20'}
              `}
              whileTap={{ scale: 0.9 }}
              animate={{ scale: props.checked ? [1, 1.15, 1] : 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              aria-hidden="true"
            />
            <m.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: props.checked ? 1 : 0,
                opacity: props.checked ? 1 : 0,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute top-0.5 left-0.5"
            >
              <Check size={14} className="text-white" aria-hidden="true" />
            </m.div>
          </div>
          <span className="text-sm text-white">{label}</span>
        </label>
        {error && (
          <p
            id={`${checkboxId}-error`}
            className="mt-2 text-xs text-red-500 flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle size={12} aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';

export default FormInput;
