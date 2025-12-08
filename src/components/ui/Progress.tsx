'use client';

import { cn } from '@/lib/utils';
import { m } from 'framer-motion';

export interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'flame' | 'spark' | 'success' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  label?: string;
  animate?: boolean;
  className?: string;
}

const progressColors = {
  default: 'bg-white/30',
  flame: 'bg-flame-500',
  spark: 'bg-spark-500',
  success: 'bg-green-500',
  gradient: 'bg-gradient-to-r from-flame-500 via-spark-500 to-green-500',
};

const trackColors = {
  default: 'bg-white/10',
  flame: 'bg-flame-500/20',
  spark: 'bg-spark-500/20',
  success: 'bg-green-500/20',
  gradient: 'bg-white/10',
};

const heights = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({
  value,
  max = 100,
  variant = 'flame',
  size = 'md',
  showValue = false,
  label,
  animate = true,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {/* Label & Value */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm text-white/70">{label}</span>}
          {showValue && (
            <span className="text-sm font-medium text-white/90">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          heights[size],
          trackColors[variant]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {/* Fill */}
        <m.div
          initial={animate ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
            duration: 0.8,
          }}
          className={cn(
            'h-full rounded-full',
            progressColors[variant]
          )}
        />
      </div>
    </div>
  );
}

// Circular Progress
interface CircularProgressProps extends Omit<ProgressProps, 'size'> {
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({
  value,
  max = 100,
  variant = 'flame',
  size = 64,
  strokeWidth = 4,
  showValue = false,
  animate = true,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const strokeColors: Record<string, string> = {
    default: '#ffffff4d',
    flame: '#FF6B5B',
    spark: '#FFD93D',
    success: '#22c55e',
    gradient: 'url(#progressGradient)',
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Gradient definition */}
        {variant === 'gradient' && (
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6B5B" />
              <stop offset="50%" stopColor="#FFD93D" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
        )}

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <m.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColors[variant]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animate ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset }}
          transition={{
            type: 'spring',
            stiffness: 60,
            damping: 15,
            duration: 1,
          }}
        />
      </svg>

      {/* Center value */}
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}
