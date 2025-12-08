'use client';

import { memo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Clock, Flame, Users } from 'lucide-react';
import { colors, radii, gradients, typography, liquidGlass } from '@/lib/design-tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { CardSize } from '@/components/layout/BentoGrid';

/**
 * BentoPopupCard - Bento Grid 최적화 팝업 카드
 *
 * 2026 트렌드:
 * - Hero: 풀너비 16:9, 대형 텍스트
 * - Featured: 4:5 비율, 핵심 정보만
 * - Standard: 4:5 비율, 컴팩트
 * - Compact: 1:1 정사각형, 최소 정보
 */

export interface BentoPopupData {
  id: string;
  brandName: string;
  brandLogo?: string;
  imageUrl?: string;
  title: string;
  location: string;
  currentParticipants: number;
  goalParticipants: number;
  daysLeft: number;
  category: string;
  isParticipated?: boolean;
}

interface BentoPopupCardProps {
  popup: BentoPopupData;
  size?: CardSize;
  onParticipate: (popupId: string) => void;
  onCardClick: (popupId: string) => void;
}

function getTemperature(progress: number): 'cold' | 'warm' | 'hot' | 'done' {
  if (progress >= 100) return 'done';
  if (progress >= 70) return 'hot';
  if (progress >= 30) return 'warm';
  return 'cold';
}

function BentoPopupCardComponent({
  popup,
  size = 'standard',
  onParticipate,
  onCardClick,
}: BentoPopupCardProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const progress = Math.min((popup.currentParticipants / popup.goalParticipants) * 100, 100);
  const temperature = getTemperature(progress);
  const isDone = temperature === 'done';
  const isHot = temperature === 'hot';
  const isUrgent = popup.daysLeft <= 3 && !isDone;

  // Prefetch
  const hasPrefetchedRef = useRef(false);
  const handleMouseEnter = useCallback(() => {
    if (!hasPrefetchedRef.current) {
      router.prefetch(`/popup/${popup.id}`);
      hasPrefetchedRef.current = true;
    }
  }, [router, popup.id]);

  const handleClick = () => onCardClick(popup.id);

  const handleParticipateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!popup.isParticipated && !isDone) {
      onParticipate(popup.id);
    }
  };

  // Size-specific styles
  const isHero = size === 'hero';
  const isFeatured = size === 'featured';
  const isCompact = size === 'compact';

  return (
    <m.article
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      className="relative cursor-pointer h-full rounded-2xl overflow-hidden group"
      style={{
        background: colors.space[850],
        border: `1px solid ${isHot || isUrgent ? colors.temperature.hot.border : colors.border.subtle}`,
        boxShadow: isHot ? '0 0 30px rgba(255, 107, 91, 0.2)' : '0 4px 20px rgba(0,0,0,0.3)',
      }}
      role="article"
      aria-label={`${popup.brandName} ${popup.title}`}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {popup.imageUrl ? (
          <Image
            src={popup.imageUrl}
            alt={popup.title}
            fill
            priority={isHero}
            loading={isHero ? 'eager' : 'lazy'}
            placeholder={isHero ? 'blur' : undefined}
            blurDataURL={
              isHero
                ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgZmlsbD0iIzFhMWMxZiIvPjwvc3ZnPg=='
                : undefined
            }
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={isHero ? '100vw' : '50vw'}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: gradients.flame, opacity: 0.8 }}>
            {popup.brandLogo ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={popup.brandLogo}
                  alt={popup.brandName}
                  width={isHero ? 120 : 60}
                  height={isHero ? 120 : 60}
                  loading="lazy"
                  className="object-contain opacity-50"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="font-bold text-white/20"
                  style={{ fontSize: isHero ? '80px' : isCompact ? '32px' : '48px' }}
                >
                  {popup.brandName.charAt(0)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: isHero
              ? 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.9) 100%)'
              : 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0.95) 100%)',
          }}
        />
      </div>

      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
        {/* Deadline Badge */}
        {popup.daysLeft > 0 && !isCompact && (
          <span
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
            style={{
              ...liquidGlass.frosted,
              color: isUrgent ? colors.flame[400] : '#fff',
            }}
          >
            <Clock size={12} />
            D-{popup.daysLeft}
          </span>
        )}

        {/* Status Badge */}
        {(isDone || isHot) && (
          <span
            className="px-2 py-1 rounded-full text-xs font-bold"
            style={{
              background: isDone ? 'rgba(34, 197, 94, 0.9)' : 'rgba(255, 107, 91, 0.9)',
              color: 'white',
            }}
          >
            {isDone ? '🎉 OPEN' : '🔥 HOT'}
          </span>
        )}
      </div>

      {/* Content - Bottom Aligned */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        {/* Brand Name (Hero/Featured only) */}
        {!isCompact && (
          <p className="text-xs font-medium mb-1 opacity-80" style={{ color: colors.flame[300] }}>
            {popup.brandName}
          </p>
        )}

        {/* Title */}
        <h3
          className={`font-bold text-white mb-2 ${isCompact ? 'line-clamp-2' : 'line-clamp-2'}`}
          style={{
            fontSize: isHero
              ? typography.fontSize.xl.size
              : isFeatured
                ? typography.fontSize.base.size
                : typography.fontSize.sm.size,
            lineHeight: isHero ? '1.3' : '1.4',
          }}
        >
          {popup.title}
        </h3>

        {/* Progress Bar */}
        <div className="mb-2">
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <m.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: isDone ? colors.success : isHot ? colors.flame[500] : colors.flame[400],
              }}
            />
          </div>
        </div>

        {/* Stats + CTA Row */}
        <div className="flex items-center justify-between">
          {/* Participants */}
          <div
            className="flex items-center gap-1 text-xs"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <Users size={12} />
            <span
              className="font-semibold"
              style={{ color: isDone ? colors.success : colors.flame[400] }}
            >
              {popup.currentParticipants}
            </span>
            <span>/{popup.goalParticipants}</span>
          </div>

          {/* CTA Button */}
          {!isCompact && (
            <m.button
              onClick={handleParticipateClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={popup.isParticipated || isDone}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: popup.isParticipated
                  ? 'rgba(255,255,255,0.1)'
                  : isDone
                    ? 'rgba(34, 197, 94, 0.2)'
                    : gradients.flame,
                color: popup.isParticipated ? 'rgba(255,255,255,0.5)' : '#fff',
                border: popup.isParticipated || isDone ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}
            >
              {popup.isParticipated ? (
                '참여완료'
              ) : isDone ? (
                '확정'
              ) : (
                <>
                  <Flame size={12} />
                  참여
                </>
              )}
            </m.button>
          )}
        </div>
      </div>

      {/* Hot Border Animation */}
      {isHot && !isDone && !prefersReducedMotion && (
        <m.div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: radii['2xl'],
            border: `2px solid ${colors.flame[500]}`,
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </m.article>
  );
}

export const BentoPopupCard = memo(BentoPopupCardComponent);
export default BentoPopupCard;
