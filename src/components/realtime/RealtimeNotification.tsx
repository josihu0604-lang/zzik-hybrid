'use client';

import { useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { colors, opacity, zIndex, typography } from '@/lib/design-tokens';
import { getColorFromName } from '@/lib/color-utils';
import type { Participant } from '@/types/participant';

/**
 * RealtimeNotification - 실시간 참여 알림
 *
 * "방금 OOO님이 참여했어요!" 알림 표시
 * 자동 숨김 (5초)
 */

interface RealtimeNotificationProps {
  participant: Participant | null;
  className?: string;
}

export function RealtimeNotification({ participant, className = '' }: RealtimeNotificationProps) {
  // Memoize color calculation to avoid recalculating on every render
  const avatarColor = useMemo(
    () => (participant ? getColorFromName(participant.name) : ''),
    [participant]
  );
  return (
    <AnimatePresence>
      {participant && (
        <m.div
          key={participant.id}
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`fixed left-1/2 ${className}`}
          style={{ top: 'calc(4rem + env(safe-area-inset-top))', zIndex: zIndex.notification }}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-full shadow-lg"
            style={{
              background: `rgba(18, 19, 20, ${opacity[95]})`,
              backdropFilter: 'blur(24px)',
              border: `1px solid rgba(255, 107, 91, ${opacity[30]})`,
              boxShadow: `0 8px 32px rgba(0, 0, 0, ${opacity[40]}), 0 0 0 1px rgba(255, 107, 91, ${opacity[20]})`,
            }}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{
                background: participant.avatar
                  ? `url(${participant.avatar}) center/cover`
                  : avatarColor,
              }}
            >
              {!participant.avatar && participant.name.charAt(0)}
            </div>

            {/* Text */}
            <div className="flex items-center gap-1.5">
              <span className="text-white text-sm">
                <span className="font-bold">{participant.name}</span>
                <span className="text-linear-text-secondary">님이 방금 참여했어요!</span>
              </span>
            </div>

            {/* Animated pulse */}
            <m.div
              className="w-2 h-2 rounded-full"
              style={{ background: colors.flame[500] }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            />
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

/**
 * RealtimeBadge - 실시간 연결 상태 배지
 */
interface RealtimeBadgeProps {
  isConnected: boolean;
  isDemo: boolean;
  className?: string;
}

export function RealtimeBadge({ isConnected, isDemo, className = '' }: RealtimeBadgeProps) {
  if (!isConnected) return null;

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${className}`}
      style={{
        background: isDemo
          ? `rgba(255, 217, 61, ${opacity[15]})`
          : `rgba(34, 197, 94, ${opacity[15]})`,
        border: `1px solid ${isDemo ? `rgba(255, 217, 61, ${opacity[30]})` : `rgba(34, 197, 94, ${opacity[30]})`}`,
      }}
    >
      <m.div
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: isDemo ? colors.spark[400] : colors.success }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [1, 0.7, 1],
        }}
        // DES-218: 펄스 duration 1.5초로 통일
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      />
      <span
        className="font-medium"
        style={{
          color: isDemo ? colors.spark[500] : colors.success,
          fontSize: typography.fontSize.xs.size,
          lineHeight: typography.fontSize.xs.lineHeight,
        }}
      >
        {isDemo ? 'DEMO' : 'LIVE'}
      </span>
    </m.div>
  );
}

export default RealtimeNotification;
