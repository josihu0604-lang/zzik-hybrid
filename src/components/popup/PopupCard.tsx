'use client';

import { memo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { m } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { PopupCardHeader } from './PopupCardHeader';
import { PopupCardStats } from './PopupCardStats';
import { PopupCardCTA } from './PopupCardCTA';
import {
  colors,
  radii,
  shadows,
  categories,
  typography,
  gradients,
  rgba,
} from '@/lib/design-tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { duration } from '@/lib/animations';

/**
 * PopupCard Component v4 - Refactored for Maintainability
 *
 * Split into subcomponents:
 * - PopupCardHeader: Brand info + category badge
 * - PopupCardStats: Participant stats + deadline
 * - PopupCardCTA: Participate button
 */

export interface PopupData {
  id: string;
  brandName: string;
  brandLogo?: string;
  /** 팝업 대표 이미지 (16:9 권장) */
  imageUrl?: string;
  title: string;
  location: string;
  currentParticipants: number;
  goalParticipants: number;
  daysLeft: number;
  category: keyof typeof categories;
  isParticipated?: boolean;
}

interface PopupCardProps {
  popup: PopupData;
  onParticipate: (popupId: string) => void;
  onCardClick: (popupId: string) => void;
  highlightText?: (text: string) => React.ReactNode;
}

// Get temperature based on progress
function getTemperature(progress: number): 'cold' | 'warm' | 'hot' | 'done' {
  if (progress >= 100) return 'done';
  if (progress >= 70) return 'hot';
  if (progress >= 30) return 'warm';
  return 'cold';
}

// Memoize subcomponents to prevent unnecessary re-renders when parent re-renders
const MemoizedPopupCardHeader = memo(PopupCardHeader);
const MemoizedPopupCardStats = memo(PopupCardStats);
const MemoizedPopupCardCTA = memo(PopupCardCTA);

function PopupCardComponent({ popup, onParticipate, onCardClick, highlightText }: PopupCardProps) {
  const router = useRouter();
  const progress = Math.min((popup.currentParticipants / popup.goalParticipants) * 100, 100);
  const temperature = getTemperature(progress);
  const isUrgent = popup.daysLeft <= 3 && temperature !== 'done';
  const isDone = temperature === 'done';
  // DES-023: 희소성 배지 - 남은 자리 10명 이하
  const remaining = popup.goalParticipants - popup.currentParticipants;
  const showScarcityBadge = remaining > 0 && remaining <= 10 && !isDone;
  const prefersReducedMotion = useReducedMotion();

  // PERF-002: Prefetch popup detail page on hover for faster navigation
  const hasPrefetchedRef = useRef(false);
  const handleMouseEnter = useCallback(() => {
    if (!hasPrefetchedRef.current) {
      router.prefetch(`/popup/${popup.id}`);
      hasPrefetchedRef.current = true;
    }
  }, [router, popup.id]);

  return (
    <m.article
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      // DES-206: whileHover 통일 - scale: 1.02, y: -4
      whileHover={prefersReducedMotion ? undefined : { scale: 1.02, y: -4 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      onClick={() => onCardClick(popup.id)}
      onMouseEnter={handleMouseEnter}
      onFocusCapture={handleMouseEnter}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardClick(popup.id);
        }
      }}
      tabIndex={0}
      className="relative cursor-pointer group rounded-2xl tap-haptic touch-target-extended"
      style={{
        transformOrigin: 'center center',
        // DES-133: Focus ring 토큰화
        outlineOffset: '2px',
      }}
      onFocus={(e) => {
        if (e.currentTarget === e.target) {
          e.currentTarget.style.outline = `2px solid ${colors.focus.ring}`;
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
      role="article"
      aria-label={`${popup.brandName} ${popup.title} 팝업 상세보기`}
      aria-labelledby={`popup-card-title-${popup.id}`}
      aria-describedby={`popup-card-stats-${popup.id}`}
    >
      {/* Card Container - App Store Level Design */}
      <div
        className="relative overflow-hidden group-hover:shadow-2xl"
        style={{
          background: colors.space[850],
          border: `1px solid ${isDone ? colors.temperature.done.border : isUrgent ? colors.temperature.hot.border : colors.border.subtle}`,
          borderRadius: radii['2xl'],
          boxShadow: isDone
            ? `${shadows.glow.success}, ${shadows.lg}`
            : isUrgent
              ? `${shadows.glow.primary}, ${shadows.lg}`
              : shadows.md,
          transition: 'box-shadow 300ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
      >
        {/* Hero Image Section (16:9 ratio) */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {popup.imageUrl ? (
            <Image
              src={popup.imageUrl}
              alt={`${popup.brandName} ${popup.title}`}
              fill
              priority
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgZmlsbD0iIzFhMWMxZiIvPjwvc3ZnPg=="
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            /* Fallback: Category gradient background with brand logo */
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: gradients.flame,
                opacity: 0.9,
              }}
            >
              {popup.brandLogo ? (
                <Image
                  src={popup.brandLogo}
                  alt={popup.brandName}
                  width={80}
                  height={80}
                  loading="lazy"
                  className="object-contain opacity-90"
                />
              ) : (
                <span className="text-5xl font-bold text-white/30">
                  {popup.brandName.charAt(0)}
                </span>
              )}
            </div>
          )}

          {/* Image Overlay Gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, transparent 40%, ${rgba.black[80]} 100%)`,
            }}
          />

          {/* Category + Deadline Badge on Image */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: rgba.black[60],
                backdropFilter: 'blur(8px)',
                color: categories[popup.category]?.color || colors.flame[400],
              }}
            >
              {categories[popup.category]?.label || popup.category}
            </span>
            {popup.daysLeft > 0 && (
              <span
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: isUrgent ? rgba.flame[90] : rgba.black[60],
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                }}
              >
                <Clock size={12} />
                D-{popup.daysLeft}
              </span>
            )}
          </div>

          {/* Brand Name on Image Bottom */}
          <div className="absolute bottom-3 left-4 right-4">
            <MemoizedPopupCardHeader popup={popup} highlightText={highlightText} variant="overlay" />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Title */}
          <h2
            id={`popup-card-title-${popup.id}`}
            className="mb-1 line-clamp-2"
            style={{
              color: colors.text.primary,
              fontSize: typography.fontSize.lg.size,
              lineHeight: typography.fontSize.lg.lineHeight,
              fontWeight: typography.fontWeight.bold,
              letterSpacing: typography.fontSize.lg.letterSpacing,
            }}
          >
            {highlightText ? highlightText(popup.title) : popup.title}
          </h2>

          {/* Location */}
          <div className="flex items-center gap-1 mb-4">
            <MapPin size={14} style={{ color: colors.text.muted }} />
            <span
              style={{
                color: colors.text.secondary,
                fontSize: typography.fontSize.sm.size,
              }}
            >
              {popup.location}
            </span>
          </div>

          {/* Progress Bar */}
          <div
            className="mb-3"
            role="progressbar"
            aria-valuenow={popup.currentParticipants}
            aria-valuemin={0}
            aria-valuemax={popup.goalParticipants}
            aria-label={`펀딩 진행률 ${Math.round(progress)}%`}
          >
            <ProgressBar
              current={popup.currentParticipants}
              goal={popup.goalParticipants}
              showLabel
              size="md"
            />
          </div>

          {/* Stats Row */}
          <div id={`popup-card-stats-${popup.id}`} className="mb-4">
            <MemoizedPopupCardStats
              currentParticipants={popup.currentParticipants}
              goalParticipants={popup.goalParticipants}
              daysLeft={popup.daysLeft}
              isDone={isDone}
              isUrgent={isUrgent}
            />
          </div>

          {/* Full-width CTA Button */}
          <MemoizedPopupCardCTA
            popupId={popup.id}
            isParticipated={popup.isParticipated || false}
            isDone={isDone}
            onParticipate={onParticipate}
            fullWidth
          />
        </div>

        {/* Hot Card Border Animation - DES-205: opacity 애니메이션 */}
        {isUrgent && !isDone && !prefersReducedMotion && (
          <m.div
            className="absolute inset-0 pointer-events-none hot-border-pulse"
            style={{
              borderRadius: radii['2xl'],
              border: `1.5px solid ${colors.temperature.hot.border}`,
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: duration.major * 5, // 2s
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            aria-hidden="true"
          />
        )}

        {/* DES-023: Scarcity Badge - 남은 자리 10명 이하 */}
        {showScarcityBadge && (
          <m.div
            initial={{ scale: 0, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: rgba.error[95],
              border: `2px solid ${colors.error}`,
              boxShadow: `0 4px 16px ${rgba.error[15]}, 0 0 20px ${rgba.error[10]}`,
            }}
            role="status"
            aria-label={`단 ${remaining}자리 남음`}
          >
            <m.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: duration.major * 2.5, repeat: Infinity }} // 1s
              style={{
                color: 'white',
                fontSize: '16px',
              }}
              role="img"
              aria-label="불꽃"
            >
              🔥
            </m.span>
            <span
              style={{
                color: 'white',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0.03em',
              }}
            >
              단 {remaining}자리!
            </span>
          </m.div>
        )}

        {/* Done Badge */}
        {isDone && (
          <m.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: colors.temperature.done.bg,
              border: `2px solid ${colors.temperature.done.border}`,
              boxShadow: `0 4px 16px ${colors.temperature.done.border}40`,
            }}
            role="status"
            aria-label="펀딩 목표 달성, 오픈 확정"
          >
            <span
              role="img"
              aria-label="축하 파티"
              style={{
                fontSize: '16px',
                color: colors.temperature.done.text,
              }}
            >
              🎉
            </span>
            <span
              style={{
                color: colors.temperature.done.text,
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0.03em',
              }}
              aria-hidden="true"
            >
              OPEN
            </span>
          </m.div>
        )}
      </div>
    </m.article>
  );
}

// Memoize to prevent unnecessary re-renders
export const PopupCard = memo(PopupCardComponent);
export default PopupCard;
