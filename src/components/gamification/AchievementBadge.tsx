'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Check,
  Star,
  Award,
  ChevronRight,
  Sparkles,
  Trophy,
  Target,
  Flame,
} from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';
import { useLocale } from '@/providers/LocaleProvider';
import Image from 'next/image';

// ============================================
// Types & Interfaces
// ============================================

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type BadgeCategory = 
  | 'explorer'      // 탐험
  | 'foodie'        // 맛집
  | 'social'        // 소셜
  | 'reviewer'      // 리뷰
  | 'photographer'  // 사진
  | 'vip'           // VIP
  | 'event'         // 이벤트
  | 'special';      // 특별

export interface Badge {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  icon: string; // emoji or icon name
  category: BadgeCategory;
  tier: BadgeTier;
  points: number;
  isLocked: boolean;
  isNew?: boolean;
  progress?: {
    current: number;
    target: number;
    label: string;
    labelKo: string;
  };
  earnedAt?: Date;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface AchievementBadgeProps {
  badge: Badge;
  variant?: 'default' | 'compact' | 'detailed' | 'showcase';
  onSelect?: (badge: Badge) => void;
  showProgress?: boolean;
  className?: string;
}

// ============================================
// Constants
// ============================================

const TIER_CONFIG: Record<BadgeTier, { color: string; bgColor: string; label: string; labelKo: string }> = {
  bronze: { color: '#CD7F32', bgColor: '#CD7F3220', label: 'Bronze', labelKo: '브론즈' },
  silver: { color: '#C0C0C0', bgColor: '#C0C0C020', label: 'Silver', labelKo: '실버' },
  gold: { color: '#FFD700', bgColor: '#FFD70020', label: 'Gold', labelKo: '골드' },
  platinum: { color: '#E5E4E2', bgColor: '#E5E4E220', label: 'Platinum', labelKo: '플래티넘' },
  diamond: { color: '#B9F2FF', bgColor: '#B9F2FF20', label: 'Diamond', labelKo: '다이아몬드' },
};

const CATEGORY_CONFIG: Record<BadgeCategory, { icon: React.ReactNode; color: string; label: string; labelKo: string }> = {
  explorer: { icon: <Target size={14} />, color: colors.green[400], label: 'Explorer', labelKo: '탐험가' },
  foodie: { icon: <span>🍜</span>, color: colors.orange[400], label: 'Foodie', labelKo: '미식가' },
  social: { icon: <span>👥</span>, color: colors.blue[400], label: 'Social', labelKo: '소셜' },
  reviewer: { icon: <Star size={14} />, color: colors.yellow[400], label: 'Reviewer', labelKo: '리뷰어' },
  photographer: { icon: <span>📸</span>, color: colors.purple[400], label: 'Photographer', labelKo: '사진작가' },
  vip: { icon: <span>👑</span>, color: colors.flame[500], label: 'VIP', labelKo: 'VIP' },
  event: { icon: <span>🎉</span>, color: colors.cyan[400], label: 'Event', labelKo: '이벤트' },
  special: { icon: <Sparkles size={14} />, color: colors.pink[400], label: 'Special', labelKo: '스페셜' },
};

const RARITY_CONFIG: Record<string, { color: string; glow: string; label: string; labelKo: string }> = {
  common: { color: rgba.white[60], glow: 'none', label: 'Common', labelKo: '일반' },
  uncommon: { color: colors.green[400], glow: `0 0 10px ${colors.green[400]}40`, label: 'Uncommon', labelKo: '고급' },
  rare: { color: colors.blue[400], glow: `0 0 15px ${colors.blue[400]}50`, label: 'Rare', labelKo: '희귀' },
  epic: { color: colors.purple[400], glow: `0 0 20px ${colors.purple[400]}60`, label: 'Epic', labelKo: '에픽' },
  legendary: { color: colors.flame[500], glow: `0 0 25px ${colors.flame[500]}70`, label: 'Legendary', labelKo: '전설' },
};

// ============================================
// Sub-Components
// ============================================

// Badge Icon Display
function BadgeIcon({
  badge,
  size = 'md',
}: {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const tierConfig = TIER_CONFIG[badge.tier];
  const rarityConfig = badge.rarity ? RARITY_CONFIG[badge.rarity] : null;

  const sizeMap = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
    xl: 'w-28 h-28 text-5xl',
  };

  return (
    <div className="relative">
      <m.div
        className={`${sizeMap[size]} rounded-2xl flex items-center justify-center relative overflow-hidden`}
        style={{ 
          background: badge.isLocked 
            ? rgba.white[10] 
            : `linear-gradient(135deg, ${tierConfig.color}30, ${tierConfig.color}10)`,
          border: `2px solid ${badge.isLocked ? rgba.white[20] : tierConfig.color}`,
          boxShadow: !badge.isLocked && rarityConfig ? rarityConfig.glow : 'none',
        }}
        whileHover={!badge.isLocked ? { scale: 1.05 } : undefined}
      >
        {badge.isLocked ? (
          <Lock size={size === 'sm' ? 16 : size === 'md' ? 20 : 28} style={{ color: rgba.white[30] }} />
        ) : (
          <span className={badge.icon.startsWith(':') ? '' : ''}>{badge.icon}</span>
        )}

        {/* Shine Effect */}
        {!badge.isLocked && (
          <m.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear', repeatDelay: 5 }}
          />
        )}
      </m.div>

      {/* New Badge Indicator */}
      {badge.isNew && !badge.isLocked && (
        <m.div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: colors.flame[500] }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <span className="text-xs font-bold text-white">!</span>
        </m.div>
      )}

      {/* Tier Ring */}
      {!badge.isLocked && (
        <div 
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ 
            background: tierConfig.bgColor, 
            color: tierConfig.color,
            border: `1px solid ${tierConfig.color}40`,
          }}
        >
          {badge.tier.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

// Progress Bar
function BadgeProgress({
  progress,
  tier,
  locale,
}: {
  progress: Badge['progress'];
  tier: BadgeTier;
  locale: string;
}) {
  if (!progress) return null;

  const percentage = Math.min((progress.current / progress.target) * 100, 100);
  const tierConfig = TIER_CONFIG[tier];

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs" style={{ color: rgba.white[50] }}>
          {locale === 'ko' ? progress.labelKo : progress.label}
        </span>
        <span className="text-xs font-semibold" style={{ color: tierConfig.color }}>
          {progress.current}/{progress.target}
        </span>
      </div>
      <div 
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: rgba.white[10] }}
      >
        <m.div
          className="h-full rounded-full"
          style={{ background: tierConfig.color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ============================================
// Main Component Variants
// ============================================

// Compact Variant
function CompactBadge({ badge, locale }: { badge: Badge; locale: string }) {
  const tierConfig = TIER_CONFIG[badge.tier];

  return (
    <div 
      className="flex items-center gap-2 p-2 rounded-xl"
      style={{ 
        background: badge.isLocked ? rgba.white[5] : tierConfig.bgColor,
        opacity: badge.isLocked ? 0.6 : 1,
      }}
    >
      <BadgeIcon badge={badge} size="sm" />
      <div className="flex-1 min-w-0">
        <p 
          className="text-sm font-medium truncate"
          style={{ color: badge.isLocked ? rgba.white[50] : 'white' }}
        >
          {locale === 'ko' ? badge.nameKo : badge.name}
        </p>
        {badge.progress && !badge.isLocked && (
          <div className="h-1 mt-1 rounded-full overflow-hidden" style={{ background: rgba.white[10] }}>
            <div 
              className="h-full rounded-full"
              style={{ 
                background: tierConfig.color, 
                width: `${(badge.progress.current / badge.progress.target) * 100}%` 
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Showcase Variant (for profile display)
function ShowcaseBadge({ badge, locale }: { badge: Badge; locale: string }) {
  const tierConfig = TIER_CONFIG[badge.tier];
  const rarityConfig = badge.rarity ? RARITY_CONFIG[badge.rarity] : null;

  return (
    <m.div 
      className="relative p-4 rounded-2xl text-center"
      style={{ 
        background: `linear-gradient(135deg, ${tierConfig.color}15, transparent)`,
        border: `2px solid ${tierConfig.color}40`,
      }}
      whileHover={{ scale: 1.02, boxShadow: rarityConfig?.glow || 'none' }}
    >
      <div className="flex justify-center mb-3">
        <BadgeIcon badge={badge} size="lg" />
      </div>
      <h4 className="font-bold text-white">{locale === 'ko' ? badge.nameKo : badge.name}</h4>
      <p className="text-xs mt-1" style={{ color: rgba.white[50] }}>
        {locale === 'ko' ? badge.descriptionKo : badge.description}
      </p>
      {rarityConfig && (
        <span 
          className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: rarityConfig.color + '20', color: rarityConfig.color }}
        >
          {locale === 'ko' ? rarityConfig.labelKo : rarityConfig.label}
        </span>
      )}
      {badge.earnedAt && (
        <p className="text-xs mt-2" style={{ color: rgba.white[40] }}>
          {new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }).format(badge.earnedAt)}
        </p>
      )}
    </m.div>
  );
}

// Detailed Variant (for badge details modal)
function DetailedBadge({ badge, locale }: { badge: Badge; locale: string }) {
  const tierConfig = TIER_CONFIG[badge.tier];
  const categoryConfig = CATEGORY_CONFIG[badge.category];
  const rarityConfig = badge.rarity ? RARITY_CONFIG[badge.rarity] : null;

  return (
    <div className="text-center">
      {/* Large Icon */}
      <div className="flex justify-center mb-4">
        <BadgeIcon badge={badge} size="xl" />
      </div>

      {/* Name */}
      <h3 className="text-2xl font-bold text-white mb-1">
        {locale === 'ko' ? badge.nameKo : badge.name}
      </h3>

      {/* Tier & Category */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span 
          className="text-xs px-2 py-1 rounded-full font-semibold"
          style={{ background: tierConfig.bgColor, color: tierConfig.color }}
        >
          {locale === 'ko' ? tierConfig.labelKo : tierConfig.label}
        </span>
        <span 
          className="text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1"
          style={{ background: categoryConfig.color + '20', color: categoryConfig.color }}
        >
          {categoryConfig.icon}
          {locale === 'ko' ? categoryConfig.labelKo : categoryConfig.label}
        </span>
      </div>

      {/* Rarity */}
      {rarityConfig && (
        <div className="mb-4">
          <span 
            className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full"
            style={{ 
              background: rarityConfig.color + '15', 
              color: rarityConfig.color,
              boxShadow: rarityConfig.glow,
            }}
          >
            <Sparkles size={14} />
            {locale === 'ko' ? rarityConfig.labelKo : rarityConfig.label}
          </span>
        </div>
      )}

      {/* Description */}
      <p className="text-sm mb-4" style={{ color: rgba.white[70] }}>
        {locale === 'ko' ? badge.descriptionKo : badge.description}
      </p>

      {/* Progress */}
      {badge.progress && (
        <div 
          className="p-4 rounded-xl mb-4"
          style={{ background: rgba.white[5] }}
        >
          <BadgeProgress progress={badge.progress} tier={badge.tier} locale={locale} />
        </div>
      )}

      {/* Points */}
      <div 
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
        style={{ background: colors.flame[500] + '20' }}
      >
        <Award size={18} style={{ color: colors.flame[500] }} />
        <span className="font-bold" style={{ color: colors.flame[400] }}>
          +{badge.points} {locale === 'ko' ? '포인트' : 'Points'}
        </span>
      </div>

      {/* Earned Date */}
      {badge.earnedAt && (
        <p className="mt-4 text-xs" style={{ color: rgba.white[40] }}>
          {locale === 'ko' ? '획득일' : 'Earned'}: {new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }).format(badge.earnedAt)}
        </p>
      )}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function AchievementBadge({
  badge,
  variant = 'default',
  onSelect,
  showProgress = true,
  className = '',
}: AchievementBadgeProps) {
  const { locale } = useLocale();
  const tierConfig = TIER_CONFIG[badge.tier];

  // Render variant
  if (variant === 'compact') {
    return (
      <m.div
        className={className}
        onClick={() => onSelect?.(badge)}
        whileTap={{ scale: 0.98 }}
      >
        <CompactBadge badge={badge} locale={locale} />
      </m.div>
    );
  }

  if (variant === 'showcase') {
    return (
      <div className={className}>
        <ShowcaseBadge badge={badge} locale={locale} />
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={className}>
        <DetailedBadge badge={badge} locale={locale} />
      </div>
    );
  }

  // Default variant
  return (
    <m.div
      className={`p-4 rounded-2xl cursor-pointer ${className}`}
      style={{ 
        background: badge.isLocked ? rgba.white[5] : tierConfig.bgColor,
        border: `1px solid ${badge.isLocked ? rgba.white[10] : tierConfig.color + '40'}`,
      }}
      onClick={() => onSelect?.(badge)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        <BadgeIcon badge={badge} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 
              className="font-semibold truncate"
              style={{ color: badge.isLocked ? rgba.white[50] : 'white' }}
            >
              {locale === 'ko' ? badge.nameKo : badge.name}
            </h4>
            {badge.isNew && (
              <span 
                className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: colors.flame[500], color: 'white' }}
              >
                NEW
              </span>
            )}
          </div>
          <p 
            className="text-xs mt-1 line-clamp-2"
            style={{ color: badge.isLocked ? rgba.white[30] : rgba.white[60] }}
          >
            {locale === 'ko' ? badge.descriptionKo : badge.description}
          </p>
          {showProgress && badge.progress && !badge.isLocked && (
            <BadgeProgress progress={badge.progress} tier={badge.tier} locale={locale} />
          )}
        </div>
        <ChevronRight size={18} style={{ color: rgba.white[30] }} />
      </div>
    </m.div>
  );
}

// ============================================
// Exports
// ============================================

export default AchievementBadge;
