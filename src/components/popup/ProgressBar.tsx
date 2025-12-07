'use client';

import { m } from '@/lib/motion';
import { colors } from '@/lib/design-tokens';

interface ProgressBarProps {
  current: number;
  goal: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ProgressBar({ current, goal, size = 'md', showLabel = true }: ProgressBarProps) {
  const percentage = Math.min(Math.round((current / goal) * 100), 100);
  const isComplete = percentage >= 100;

  const heights = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2',
  };

  return (
    <div className="w-full">
      <div
        className={`${heights[size]} w-full rounded-full overflow-hidden`}
        style={{ background: 'rgba(255, 255, 255, 0.08)' }}
      >
        <m.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: isComplete
              ? `linear-gradient(90deg, ${colors.success} 0%, #16a34a 100%)`
              : `linear-gradient(90deg, ${colors.flame[500]} 0%, ${colors.flame[400]} 100%)`,
          }}
        />
      </div>
      {showLabel && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs" style={{ color: colors.text.tertiary }}>
            {current.toLocaleString()}/{goal.toLocaleString()}명
          </span>
          <span
            className="text-xs font-bold"
            style={{ color: isComplete ? colors.success : colors.flame[500] }}
          >
            {percentage}%
          </span>
        </div>
      )}
    </div>
  );
}
