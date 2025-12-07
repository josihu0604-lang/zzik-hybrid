'use client';

import { memo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { m } from '@/lib/motion';
import { Clock, Star, MapPin, Ticket, Sparkles } from 'lucide-react';
import { colors, radii, gradients, typography, liquidGlass } from '@/lib/design-tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTranslation } from '@/i18n';
import type { CardSize } from '@/components/layout/BentoGrid';

/**
 * ExperienceCard - VIP K-POP Experience Card Component
 *
 * Types:
 * - Hightough: Meet & Greet with artists
 * - Soundcheck: Exclusive soundcheck access
 * - Backstage: Behind-the-scenes access
 * - Popup: Pop-up event check-in
 */

export type ExperienceType = 'hightough' | 'soundcheck' | 'backstage' | 'popup';

export interface ExperienceData {
  id: string;
  artistName: string;
  artistImage?: string;
  coverImage?: string;
  title: string;
  location: string;
  country: string;
  type: ExperienceType;
  price: number;
  currency: string;
  spotsLeft: number;
  totalSpots: number;
  daysLeft: number;
  deadline: string;
  isBooked?: boolean;
}

interface ExperienceCardProps {
  experience: ExperienceData;
  size?: CardSize;
  onBook: (experienceId: string) => void;
  onCardClick: (experienceId: string) => void;
}

const TYPE_ICONS: Record<ExperienceType, typeof Sparkles> = {
  hightough: Star,
  soundcheck: Sparkles,
  backstage: Ticket,
  popup: MapPin,
};

const TYPE_COLORS: Record<ExperienceType, string> = {
  hightough: colors.spark[400],
  soundcheck: colors.flame[400],
  backstage: colors.ember[400],
  popup: colors.flame[300],
};

function getUrgencyLevel(
  daysLeft: number,
  spotsLeft: number,
  totalSpots: number
): 'low' | 'medium' | 'high' | 'soldout' {
  if (spotsLeft === 0) return 'soldout';
  const spotsPercentage = (spotsLeft / totalSpots) * 100;
  if (daysLeft <= 2 || spotsPercentage <= 10) return 'high';
  if (daysLeft <= 5 || spotsPercentage <= 30) return 'medium';
  return 'low';
}

function formatPrice(price: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    THB: '฿',
    IDR: 'Rp',
    PHP: '₱',
    KZT: '₸',
    TWD: 'NT$',
    SGD: 'S$',
    MYR: 'RM',
    JPY: '¥',
    KRW: '₩',
    CNY: '¥',
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${price.toLocaleString()}`;
}

function ExperienceCardComponent({
  experience,
  size = 'standard',
  onBook,
  onCardClick,
}: ExperienceCardProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation();

  const urgency = getUrgencyLevel(experience.daysLeft, experience.spotsLeft, experience.totalSpots);
  const isSoldOut = urgency === 'soldout';
  const isUrgent = urgency === 'high';
  const TypeIcon = TYPE_ICONS[experience.type];
  const typeColor = TYPE_COLORS[experience.type];

  // Prefetch
  const hasPrefetchedRef = useRef(false);
  const handleMouseEnter = useCallback(() => {
    if (!hasPrefetchedRef.current) {
      router.prefetch(`/experience/${experience.id}`);
      hasPrefetchedRef.current = true;
    }
  }, [router, experience.id]);

  const handleClick = () => onCardClick(experience.id);

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!experience.isBooked && !isSoldOut) {
      onBook(experience.id);
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
        border: `1px solid ${isUrgent ? colors.flame[500] : colors.border.subtle}`,
        boxShadow: isUrgent ? '0 0 30px rgba(255, 107, 91, 0.2)' : '0 4px 20px rgba(0,0,0,0.3)',
      }}
      role="article"
      aria-label={`${experience.artistName} ${experience.title}`}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {experience.coverImage ? (
          <Image
            src={experience.coverImage}
            alt={experience.title}
            fill
            priority={isHero}
            loading={isHero ? 'eager' : 'lazy'}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={isHero ? '100vw' : '50vw'}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: gradients.flame, opacity: 0.8 }}>
            {experience.artistImage ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={experience.artistImage}
                  alt={experience.artistName}
                  width={isHero ? 120 : 60}
                  height={isHero ? 120 : 60}
                  loading="lazy"
                  className="object-contain opacity-50 rounded-full"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="font-bold text-white/20"
                  style={{ fontSize: isHero ? '80px' : isCompact ? '32px' : '48px' }}
                >
                  {experience.artistName.charAt(0)}
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
        {/* Experience Type Badge */}
        <span
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
          style={{
            ...liquidGlass.frosted,
            color: typeColor,
          }}
        >
          <TypeIcon size={12} />
          {t(`experienceType.${experience.type}`)}
        </span>

        {/* Deadline Badge */}
        {experience.daysLeft > 0 && !isCompact && (
          <span
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
            style={{
              ...liquidGlass.frosted,
              color: isUrgent ? colors.flame[400] : '#fff',
            }}
          >
            <Clock size={12} />
            {experience.daysLeft <= 1 ? t('experience.closingSoon') : `D-${experience.daysLeft}`}
          </span>
        )}

        {/* Status Badge */}
        {isSoldOut && (
          <span
            className="px-2 py-1 rounded-full text-xs font-bold"
            style={{
              background: 'rgba(100, 100, 100, 0.9)',
              color: 'white',
            }}
          >
            {t('experience.soldOut')}
          </span>
        )}
      </div>

      {/* Content - Bottom Aligned */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        {/* Artist Name */}
        {!isCompact && (
          <p className="text-xs font-medium mb-1 opacity-80" style={{ color: typeColor }}>
            {experience.artistName}
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
          {experience.title}
        </h3>

        {/* Location */}
        {!isCompact && (
          <div className="flex items-center gap-1 mb-2 text-xs text-white/60">
            <MapPin size={10} />
            <span>{experience.location}</span>
          </div>
        )}

        {/* Price + Spots Row */}
        <div className="flex items-center justify-between mb-2">
          {/* Price */}
          <span className="text-base font-bold" style={{ color: colors.spark[400] }}>
            {formatPrice(experience.price, experience.currency)}
          </span>

          {/* Spots Left */}
          <span
            className="text-xs"
            style={{ color: isUrgent ? colors.flame[400] : 'rgba(255,255,255,0.6)' }}
          >
            {isSoldOut
              ? t('experience.soldOut')
              : t('experience.spotsLeft', { spots: experience.spotsLeft })}
          </span>
        </div>

        {/* CTA Button */}
        {!isCompact && (
          <m.button
            onClick={handleBookClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={experience.isBooked || isSoldOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: experience.isBooked
                ? 'rgba(255,255,255,0.1)'
                : isSoldOut
                  ? 'rgba(100,100,100,0.3)'
                  : gradients.flame,
              color: experience.isBooked || isSoldOut ? 'rgba(255,255,255,0.5)' : '#fff',
              border: experience.isBooked || isSoldOut ? '1px solid rgba(255,255,255,0.1)' : 'none',
            }}
          >
            {experience.isBooked ? (
              t('experience.booked')
            ) : isSoldOut ? (
              t('experience.soldOut')
            ) : (
              <>
                <Ticket size={14} />
                {t('experience.book')}
              </>
            )}
          </m.button>
        )}
      </div>

      {/* Urgent Border Animation */}
      {isUrgent && !isSoldOut && !prefersReducedMotion && (
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

export const ExperienceCard = memo(ExperienceCardComponent);
export default ExperienceCard;
