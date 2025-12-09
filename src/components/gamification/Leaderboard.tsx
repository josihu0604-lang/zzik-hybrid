'use client';

import { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Users,
  MapPin,
  Calendar,
  Flame,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';
import { useLocale } from '@/providers/LocaleProvider';
import Image from 'next/image';
import Link from 'next/link';

// ============================================
// Types & Interfaces
// ============================================

export interface LeaderboardUser {
  id: string;
  rank: number;
  previousRank?: number;
  name: string;
  username: string;
  avatar?: string;
  points: number;
  level: number;
  streak?: number;
  badges: number;
  reviews?: number;
  isVerified?: boolean;
  isCurrentUser?: boolean;
  region?: string;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime';
export type LeaderboardCategory = 'overall' | 'reviews' | 'photos' | 'checkins' | 'helpful';

interface LeaderboardProps {
  users: LeaderboardUser[];
  currentUserRank?: LeaderboardUser;
  period?: LeaderboardPeriod;
  category?: LeaderboardCategory;
  onPeriodChange?: (period: LeaderboardPeriod) => void;
  onCategoryChange?: (category: LeaderboardCategory) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  showPodium?: boolean;
  title?: string;
  className?: string;
}

// ============================================
// Constants
// ============================================

const PERIOD_OPTIONS: { value: LeaderboardPeriod; label: string; labelKo: string }[] = [
  { value: 'daily', label: 'Today', labelKo: '오늘' },
  { value: 'weekly', label: 'This Week', labelKo: '이번 주' },
  { value: 'monthly', label: 'This Month', labelKo: '이번 달' },
  { value: 'allTime', label: 'All Time', labelKo: '전체' },
];

const CATEGORY_OPTIONS: { value: LeaderboardCategory; label: string; labelKo: string; icon: React.ReactNode }[] = [
  { value: 'overall', label: 'Overall', labelKo: '종합', icon: <Trophy size={16} /> },
  { value: 'reviews', label: 'Reviews', labelKo: '리뷰', icon: <Star size={16} /> },
  { value: 'photos', label: 'Photos', labelKo: '사진', icon: <span>📸</span> },
  { value: 'checkins', label: 'Check-ins', labelKo: '체크인', icon: <MapPin size={16} /> },
  { value: 'helpful', label: 'Helpful', labelKo: '도움', icon: <span>👍</span> },
];

const RANK_COLORS = {
  1: { bg: '#FFD70030', border: '#FFD700', icon: colors.yellow[400] },
  2: { bg: '#C0C0C030', border: '#C0C0C0', icon: '#C0C0C0' },
  3: { bg: '#CD7F3230', border: '#CD7F32', icon: '#CD7F32' },
};

// ============================================
// Sub-Components
// ============================================

// Rank Change Indicator
function RankChange({ current, previous }: { current: number; previous?: number }) {
  if (!previous || current === previous) {
    return <Minus size={14} style={{ color: rgba.white[30] }} />;
  }
  
  const diff = previous - current;
  const isUp = diff > 0;
  
  return (
    <span 
      className="flex items-center gap-0.5 text-xs font-semibold"
      style={{ color: isUp ? colors.green[400] : colors.red[400] }}
    >
      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {Math.abs(diff)}
    </span>
  );
}

// Podium Display (Top 3)
function Podium({ users, locale }: { users: LeaderboardUser[]; locale: string }) {
  const top3 = users.slice(0, 3);
  const orderedPositions = [1, 0, 2]; // Display order: 2nd, 1st, 3rd

  return (
    <div className="flex items-end justify-center gap-4 py-6">
      {orderedPositions.map((position, displayIndex) => {
        const user = top3[position];
        if (!user) return null;

        const height = position === 0 ? 'h-28' : position === 1 ? 'h-24' : 'h-20';
        const avatarSize = position === 0 ? 'w-20 h-20' : 'w-16 h-16';
        const rankConfig = RANK_COLORS[user.rank as keyof typeof RANK_COLORS];

        return (
          <m.div
            key={user.id}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: displayIndex * 0.15 }}
          >
            {/* Avatar */}
            <div className="relative mb-2">
              <div 
                className={`${avatarSize} rounded-full overflow-hidden border-4`}
                style={{ 
                  borderColor: rankConfig.border,
                  boxShadow: `0 0 20px ${rankConfig.border}40`,
                }}
              >
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center font-bold text-2xl"
                    style={{ background: rgba.white[10] }}
                  >
                    {user.name[0].toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Crown/Medal */}
              <div 
                className="absolute -top-3 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ 
                  background: rankConfig.bg, 
                  border: `2px solid ${rankConfig.border}` 
                }}
              >
                {user.rank === 1 ? (
                  <Crown size={16} style={{ color: rankConfig.icon }} />
                ) : (
                  <Medal size={16} style={{ color: rankConfig.icon }} />
                )}
              </div>
            </div>

            {/* Name & Points */}
            <p className="font-semibold text-white text-sm truncate max-w-[80px]">
              {user.name}
            </p>
            <p className="text-xs" style={{ color: rankConfig.icon }}>
              {user.points.toLocaleString()} P
            </p>

            {/* Pedestal */}
            <div 
              className={`${height} w-20 mt-2 rounded-t-xl flex items-end justify-center pb-2`}
              style={{ 
                background: `linear-gradient(to top, ${rankConfig.border}40, ${rankConfig.border}10)`,
              }}
            >
              <span 
                className="text-3xl font-black"
                style={{ color: rankConfig.border }}
              >
                {user.rank}
              </span>
            </div>
          </m.div>
        );
      })}
    </div>
  );
}

// User Row
function UserRow({ user, locale }: { user: LeaderboardUser; locale: string }) {
  const isTopThree = user.rank <= 3;
  const rankConfig = isTopThree ? RANK_COLORS[user.rank as keyof typeof RANK_COLORS] : null;

  return (
    <m.div
      className={`flex items-center gap-3 p-3 rounded-xl ${user.isCurrentUser ? 'ring-2' : ''}`}
      style={{ 
        background: user.isCurrentUser ? colors.flame[500] + '15' : rgba.white[5],
        ringColor: user.isCurrentUser ? colors.flame[500] : 'transparent',
      }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Rank */}
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0"
        style={{ 
          background: rankConfig?.bg || rgba.white[10],
          color: rankConfig?.icon || rgba.white[70],
        }}
      >
        {isTopThree ? (
          user.rank === 1 ? <Crown size={18} /> : <Medal size={18} />
        ) : (
          user.rank
        )}
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name}
            width={40}
            height={40}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-white">
            {user.name[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white truncate">{user.name}</span>
          {user.isVerified && (
            <span className="text-xs" style={{ color: colors.blue[400] }}>✓</span>
          )}
          {user.isCurrentUser && (
            <span 
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: colors.flame[500], color: 'white' }}
            >
              {locale === 'ko' ? '나' : 'You'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: rgba.white[50] }}>
          <span>Lv.{user.level}</span>
          {user.streak && user.streak > 0 && (
            <span className="flex items-center gap-0.5" style={{ color: colors.flame[500] }}>
              <Flame size={12} />
              {user.streak}
            </span>
          )}
          <span>{user.badges} {locale === 'ko' ? '뱃지' : 'badges'}</span>
        </div>
      </div>

      {/* Points & Change */}
      <div className="text-right shrink-0">
        <p className="font-bold text-white">{user.points.toLocaleString()}</p>
        <RankChange current={user.rank} previous={user.previousRank} />
      </div>
    </m.div>
  );
}

// Current User Position (Sticky)
function CurrentUserPosition({ user, locale }: { user: LeaderboardUser; locale: string }) {
  return (
    <div 
      className="sticky bottom-4 mx-4 p-4 rounded-2xl backdrop-blur-lg"
      style={{ 
        background: `linear-gradient(135deg, ${colors.flame[500]}30, ${colors.purple[500]}20)`,
        border: `1px solid ${colors.flame[500]}40`,
        boxShadow: '0 -10px 30px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
          style={{ background: colors.flame[500] }}
        >
          #{user.rank}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white">
            {locale === 'ko' ? '내 순위' : 'Your Rank'}
          </p>
          <p className="text-sm" style={{ color: rgba.white[60] }}>
            {user.points.toLocaleString()} {locale === 'ko' ? '포인트' : 'points'}
          </p>
        </div>
        <RankChange current={user.rank} previous={user.previousRank} />
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function Leaderboard({
  users,
  currentUserRank,
  period = 'weekly',
  category = 'overall',
  onPeriodChange,
  onCategoryChange,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  showPodium = true,
  title,
  className = '',
}: LeaderboardProps) {
  const { locale } = useLocale();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={24} style={{ color: colors.yellow[400] }} />
          <h2 className="text-xl font-bold text-white">
            {title || (locale === 'ko' ? '리더보드' : 'Leaderboard')}
          </h2>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onPeriodChange?.(option.value)}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
            style={{
              background: period === option.value ? colors.flame[500] : rgba.white[5],
              color: period === option.value ? 'white' : rgba.white[60],
            }}
          >
            {locale === 'ko' ? option.labelKo : option.label}
          </button>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {CATEGORY_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onCategoryChange?.(option.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors"
            style={{
              background: category === option.value ? rgba.white[10] : rgba.white[5],
              color: category === option.value ? 'white' : rgba.white[50],
              border: `1px solid ${category === option.value ? rgba.white[20] : 'transparent'}`,
            }}
          >
            {option.icon}
            {locale === 'ko' ? option.labelKo : option.label}
          </button>
        ))}
      </div>

      {/* Podium for Top 3 */}
      {showPodium && users.length >= 3 && (
        <div 
          className="rounded-2xl p-4"
          style={{ background: rgba.white[5] }}
        >
          <Podium users={users} locale={locale} />
        </div>
      )}

      {/* User List */}
      <div className="space-y-2">
        {users.slice(showPodium ? 3 : 0).map((user, index) => (
          <m.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <Link href={`/user/${user.id}`}>
              <UserRow user={user} locale={locale} />
            </Link>
          </m.div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="w-full py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
          style={{ background: rgba.white[5], color: colors.flame[500] }}
        >
          {isLoading ? (
            <RefreshCw size={18} className="animate-spin mx-auto" />
          ) : (
            locale === 'ko' ? '더 보기' : 'Load More'
          )}
        </button>
      )}

      {/* Current User Position (if not in top results) */}
      {currentUserRank && !users.find(u => u.isCurrentUser) && (
        <CurrentUserPosition user={currentUserRank} locale={locale} />
      )}
    </div>
  );
}

// ============================================
// Exports
// ============================================

export default Leaderboard;
