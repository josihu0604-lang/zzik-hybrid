'use client';

import { memo } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import type { Participant } from '@/types/participant';
import { typography } from '@/lib/design-tokens';
import { getColorFromName } from '@/lib/color-utils';

/**
 * ParticipantAvatars - 최근 참여자 아바타 스택
 *
 * 겹치는 원형 아바타로 최근 참여자 표시
 * 실시간으로 새 참여자 추가 애니메이션
 *
 * PERFORMANCE: Memoized to prevent re-renders when parent updates
 */

interface ParticipantAvatarsProps {
  participants: Participant[];
  totalCount: number;
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: {
    avatar: 28,
    overlap: 8,
    fontSize: typography.fontSize.xs.size,
    lineHeight: typography.fontSize.xs.lineHeight,
  },
  md: {
    avatar: 36,
    overlap: 10,
    fontSize: typography.fontSize.xs.size,
    lineHeight: typography.fontSize.xs.lineHeight,
  },
  lg: {
    avatar: 44,
    overlap: 12,
    fontSize: typography.fontSize.sm.size,
    lineHeight: typography.fontSize.sm.lineHeight,
  },
};

function ParticipantAvatarsComponent({
  participants,
  totalCount,
  maxVisible = 5,
  size = 'md',
  className = '',
}: ParticipantAvatarsProps) {
  const sizeConfig = SIZES[size];
  const visibleParticipants = participants.slice(0, maxVisible);
  const remainingCount = totalCount - visibleParticipants.length;

  if (participants.length === 0 && totalCount === 0) {
    return null;
  }

  return (
    <div className={`flex items-center ${className}`}>
      {/* Avatar Stack */}
      <div className="flex -space-x-2 relative">
        {/* DES-213: popLayout 조건부 적용 - 성능 최적화 */}
        <AnimatePresence mode={visibleParticipants.length > 0 ? 'popLayout' : 'sync'}>
          {visibleParticipants.map((participant, index) => (
            <m.div
              key={participant.id}
              initial={{ scale: 0, x: -20, opacity: 0 }}
              animate={{ scale: 1, x: 0, opacity: 1 }}
              exit={{ scale: 0, x: -20, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
                delay: index * 0.05,
              }}
              className="relative rounded-full flex items-center justify-center font-bold text-white shadow-lg group cursor-pointer"
              style={{
                width: sizeConfig.avatar,
                height: sizeConfig.avatar,
                background: participant.avatar
                  ? `url(${participant.avatar}) center/cover`
                  : getColorFromName(participant.name),
                border: '2px solid #08090a',
                zIndex: maxVisible - index,
              }}
              title={participant.name}
              role="img"
              aria-label={`${participant.name} 참여자`}
            >
              {!participant.avatar && (
                <span style={{ fontSize: sizeConfig.fontSize, lineHeight: sizeConfig.lineHeight }}>
                  {participant.name.charAt(0)}
                </span>
              )}

              {/* DES-153: 참여자 아바타 툴팁 - 호버 시 정보 표시 */}
              <m.div
                initial={{ opacity: 0, y: 5 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'rgba(0, 0, 0, 0.9)',
                  color: 'white',
                  zIndex: 100,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
              >
                {participant.name}
              </m.div>

              {/* New participant glow */}
              {index === 0 && (
                <m.div
                  className="absolute inset-0 rounded-full"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 2 }}
                  style={{
                    background: getColorFromName(participant.name),
                    filter: 'blur(8px)',
                  }}
                />
              )}
            </m.div>
          ))}
        </AnimatePresence>

        {/* Remaining count badge */}
        {remainingCount > 0 && (
          <m.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative rounded-full flex items-center justify-center font-bold shadow-lg"
            style={{
              width: sizeConfig.avatar,
              height: sizeConfig.avatar,
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid #08090a',
              backdropFilter: 'blur(8px)',
              zIndex: 0,
            }}
          >
            <span
              className="text-white/80"
              style={{ fontSize: sizeConfig.fontSize, lineHeight: sizeConfig.lineHeight }}
            >
              +{remainingCount > 99 ? '99+' : remainingCount}
            </span>
          </m.div>
        )}
      </div>

      {/* Participant text */}
      <m.span
        key={totalCount}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="ml-3 text-linear-text-secondary text-sm"
      >
        <span className="font-bold text-white">{totalCount}</span>명 참여중
      </m.span>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const ParticipantAvatars = memo(ParticipantAvatarsComponent);
export default ParticipantAvatars;
