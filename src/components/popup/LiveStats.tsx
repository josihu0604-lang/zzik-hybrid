'use client';

import { m } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Users, PartyPopper, Target, Radio } from 'lucide-react';
import { colors, typography } from '@/lib/design-tokens';

/**
 * LiveStats Component v2 - 2026 Production Design
 *
 * Real-time participation statistics with:
 * - Lucide icons
 * - Design token system
 * - Animated counters
 * - Live pulse indicator
 */

interface LiveStatsProps {
  totalParticipants: number;
  todayOpened: number;
  activeCampaigns: number;
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const duration = 500;
    const startValue = prevValueRef.current;
    const diff = value - startValue;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplayValue(Math.round(startValue + diff * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevValueRef.current = value;
        frameRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    // Cleanup: cancel animation frame on unmount or value change
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value]);

  return (
    <m.span
      key={value}
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      className="tabular-nums"
    >
      {displayValue.toLocaleString()}
      {suffix}
    </m.span>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  pulse?: boolean;
}

function StatItem({ icon, value, label, color, pulse }: StatItemProps) {
  return (
    <m.div
      animate={pulse ? { scale: 1.02 } : { scale: 1 }}
      className="flex items-center gap-2"
    >
      <div
        className="flex items-center justify-center w-7 h-7 rounded-lg"
        style={{ background: `${color}15` }}
      >
        {icon}
      </div>
      <div className="flex items-center gap-1">
        <span
          style={{
            color,
            fontWeight: typography.fontWeight.bold,
            fontSize: typography.fontSize.sm.size,
          }}
        >
          <AnimatedNumber value={value} />
        </span>
        <span
          style={{
            color: colors.text.tertiary,
            fontSize: typography.fontSize.xs.size,
          }}
        >
          {label}
        </span>
      </div>
    </m.div>
  );
}

export function LiveStats({ totalParticipants, todayOpened, activeCampaigns }: LiveStatsProps) {
  const [pulse, setPulse] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate live updates with proper cleanup
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const interval = setInterval(() => {
      setPulse(true);
      // Clear any existing timeout before creating new one
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setPulse(false), 200);
    }, 3000);

    return () => {
      clearInterval(interval);
      // Clean up pending timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-3" style={{ gap: '16px' }}>
      {/* Live indicator */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="relative flex h-2 w-2">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: colors.error }}
          />
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ background: colors.error }}
          />
        </span>
        <div className="flex items-center gap-1">
          <Radio size={12} style={{ color: colors.error }} />
          <span
            style={{
              color: colors.error,
              fontSize: '10px',
              fontWeight: typography.fontWeight.semibold,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Live
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 overflow-x-auto">
        <StatItem
          icon={<Users size={14} style={{ color: colors.flame[500] }} />}
          value={totalParticipants}
          label="참여중"
          color={colors.flame[500]}
          pulse={pulse}
        />

        <div className="w-px h-5 flex-shrink-0" style={{ background: colors.border.subtle }} />

        <StatItem
          icon={<PartyPopper size={14} style={{ color: colors.success }} />}
          value={todayOpened}
          label="오픈"
          color={colors.success}
        />

        <div className="w-px h-5 flex-shrink-0" style={{ background: colors.border.subtle }} />

        <StatItem
          icon={<Target size={14} style={{ color: colors.text.secondary }} />}
          value={activeCampaigns}
          label="캠페인"
          color={colors.text.primary}
        />
      </div>
    </div>
  );
}

export default LiveStats;
