'use client';

import { memo } from 'react';
import { Users, PartyPopper, TrendingUp, Clock, Check } from 'lucide-react';
import { colors } from '@/lib/design-tokens';

interface PopupCardStatsProps {
  currentParticipants: number;
  goalParticipants: number;
  daysLeft: number;
  isDone: boolean;
  isUrgent: boolean;
}

function PopupCardStatsComponent({
  currentParticipants,
  goalParticipants,
  daysLeft,
  isDone,
  isUrgent,
}: PopupCardStatsProps) {
  const remaining = goalParticipants - currentParticipants;

  return (
    <>
      {/* Stats Row */}
      <div
        className="flex items-center gap-4 mb-4 pb-4"
        style={{ borderBottom: `1px solid ${colors.border.subtle}` }}
      >
        {/* Participants */}
        <div className="flex items-center gap-1.5">
          <Users size={14} style={{ color: colors.text.tertiary }} aria-hidden="true" />
          <span
            style={{
              color: colors.text.secondary,
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {currentParticipants.toLocaleString()}명 참여
          </span>
        </div>

        {/* Remaining or Done */}
        {isDone ? (
          <div className="flex items-center gap-1.5">
            <PartyPopper
              size={14}
              style={{ color: colors.temperature.done.text }}
              aria-hidden="true"
            />
            <span
              style={{
                color: colors.temperature.done.text,
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              오픈 확정
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5" aria-live="polite">
            <TrendingUp size={14} style={{ color: colors.flame[400] }} aria-hidden="true" />
            <span
              style={{
                color: colors.flame[400],
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {remaining > 0 ? `${remaining}명 남음` : '목표 달성!'}
            </span>
          </div>
        )}
      </div>

      {/* Deadline Badge */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
          style={{
            background: isDone
              ? colors.temperature.done.bg
              : isUrgent
                ? 'rgba(239, 68, 68, 0.1)'
                : colors.space[800],
          }}
          aria-label={isDone ? '펀딩 확정됨' : `마감까지 ${daysLeft}일 남음`}
        >
          {isDone ? (
            <Check size={14} style={{ color: colors.temperature.done.text }} aria-hidden="true" />
          ) : (
            <Clock
              size={14}
              style={{ color: isUrgent ? colors.error : colors.text.tertiary }}
              aria-hidden="true"
            />
          )}
          <span
            style={{
              color: isDone
                ? colors.temperature.done.text
                : isUrgent
                  ? colors.error
                  : colors.text.secondary,
              fontSize: '13px',
              fontWeight: 500,
            }}
            aria-hidden="true"
          >
            {isDone ? '확정됨' : `D-${daysLeft}`}
          </span>
        </div>

        {/* Urgent Pulse */}
        {isUrgent && !isDone && (
          <div className="relative flex h-2 w-2" aria-label="긴급" role="status">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: colors.error }}
              aria-hidden="true"
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: colors.error }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export const PopupCardStats = memo(PopupCardStatsComponent);
export default PopupCardStats;
