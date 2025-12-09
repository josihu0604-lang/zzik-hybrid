/**
 * useGamification - Gamification system hooks
 * 
 * Provides easy-to-use interfaces for:
 * - Points and rewards
 * - Badges and achievements
 * - Leaderboard
 * - Progress tracking
 */

'use client';

import { useCallback, useEffect, useMemo } from 'react';
import {
  useGamificationStore,
  selectTierProgress,
  selectBadgesByCategory,
  selectTopLeaders,
  selectClaimableAchievements,
  type Badge,
  type BadgeCategory,
  type BadgeProgress,
  type PointsData,
  type PointTransaction,
  type LeaderboardEntry,
  type LeaderboardType,
  type LeaderboardPeriod,
  type Achievement,
} from '@/stores';
import { useHaptic } from './useHaptic';
import { useConfetti } from './useConfetti';

// ===========================================
// usePoints - Points management hook
// ===========================================

export interface UsePointsOptions {
  autoFetch?: boolean;
}

export interface UsePointsReturn {
  points: PointsData;
  tier: string;
  tierProgress: {
    current: number;
    required: number;
    percentage: number;
    nextTier: string | null;
  };
  isLoading: boolean;
  error: string | null;
  history: PointTransaction[];
  refresh: () => Promise<void>;
}

export function usePoints(options: UsePointsOptions = {}): UsePointsReturn {
  const { autoFetch = true } = options;
  
  const store = useGamificationStore();
  const tierProgress = useGamificationStore(selectTierProgress);
  
  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      store.fetchPoints();
    }
  }, [autoFetch]);
  
  return {
    points: store.points,
    tier: store.points.tier,
    tierProgress,
    isLoading: store.isLoading,
    error: store.error,
    history: store.points.history,
    refresh: store.fetchPoints,
  };
}

// ===========================================
// useBadges - Badge management hook
// ===========================================

export interface UseBadgesOptions {
  autoFetch?: boolean;
  category?: BadgeCategory;
}

export interface UseBadgesReturn {
  earned: Badge[];
  available: Badge[];
  progress: BadgeProgress[];
  totalEarned: number;
  totalAvailable: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getBadgesByCategory: (category: BadgeCategory) => {
    earned: Badge[];
    available: Badge[];
  };
}

export function useBadges(options: UseBadgesOptions = {}): UseBadgesReturn {
  const { autoFetch = true, category } = options;
  
  const store = useGamificationStore();
  
  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      store.fetchBadges();
    }
  }, [autoFetch]);
  
  // Get badges by category
  const getBadgesByCategory = useCallback((cat: BadgeCategory) => {
    return {
      earned: store.earnedBadges.filter(b => b.category === cat),
      available: store.availableBadges.filter(b => b.category === cat),
    };
  }, [store.earnedBadges, store.availableBadges]);
  
  // Filter by category if provided
  const filteredEarned = category 
    ? store.earnedBadges.filter(b => b.category === category)
    : store.earnedBadges;
  
  const filteredAvailable = category
    ? store.availableBadges.filter(b => b.category === category)
    : store.availableBadges;
  
  return {
    earned: filteredEarned,
    available: filteredAvailable,
    progress: store.badgeProgress,
    totalEarned: store.earnedBadges.length,
    totalAvailable: store.availableBadges.length,
    isLoading: store.isLoading,
    error: store.error,
    refresh: store.fetchBadges,
    getBadgesByCategory,
  };
}

// ===========================================
// useLeaderboard - Leaderboard hook
// ===========================================

export interface UseLeaderboardOptions {
  type?: LeaderboardType;
  period?: LeaderboardPeriod;
  country?: string;
  limit?: number;
  autoFetch?: boolean;
}

export interface UseLeaderboardReturn {
  entries: LeaderboardEntry[];
  topThree: LeaderboardEntry[];
  userRank: LeaderboardEntry | null;
  type: LeaderboardType;
  period: LeaderboardPeriod;
  country?: string;
  isLoading: boolean;
  error: string | null;
  setType: (type: LeaderboardType) => void;
  setPeriod: (period: LeaderboardPeriod) => void;
  setCountry: (country?: string) => void;
  refresh: () => Promise<void>;
}

export function useLeaderboard(options: UseLeaderboardOptions = {}): UseLeaderboardReturn {
  const { 
    type: initialType = 'points',
    period: initialPeriod = 'weekly',
    country: initialCountry,
    limit = 50,
    autoFetch = true,
  } = options;
  
  const store = useGamificationStore();
  const topThree = useGamificationStore(selectTopLeaders(3));
  
  // Set initial values
  useEffect(() => {
    store.setLeaderboardType(initialType);
    store.setLeaderboardPeriod(initialPeriod);
    if (initialCountry !== undefined) {
      store.setLeaderboardCountry(initialCountry);
    }
  }, []);
  
  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      store.fetchLeaderboard({ limit });
    }
  }, [autoFetch, limit]);
  
  // Set type
  const setType = useCallback((type: LeaderboardType) => {
    store.setLeaderboardType(type);
    store.fetchLeaderboard({ type, limit });
  }, [store, limit]);
  
  // Set period
  const setPeriod = useCallback((period: LeaderboardPeriod) => {
    store.setLeaderboardPeriod(period);
    store.fetchLeaderboard({ period, limit });
  }, [store, limit]);
  
  // Set country
  const setCountry = useCallback((country?: string) => {
    store.setLeaderboardCountry(country);
    store.fetchLeaderboard({ country, limit });
  }, [store, limit]);
  
  return {
    entries: store.leaderboard,
    topThree,
    userRank: store.userRank,
    type: store.leaderboardType,
    period: store.leaderboardPeriod,
    country: store.leaderboardCountry,
    isLoading: store.isLoading,
    error: store.error,
    setType,
    setPeriod,
    setCountry,
    refresh: () => store.fetchLeaderboard({ limit }),
  };
}

// ===========================================
// useAchievements - Achievements hook
// ===========================================

export interface UseAchievementsOptions {
  autoFetch?: boolean;
}

export interface UseAchievementsReturn {
  achievements: Achievement[];
  claimable: Achievement[];
  claimedCount: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  claim: (achievementId: string) => Promise<{
    success: boolean;
    pointsEarned?: number;
    badge?: Badge;
    newTier?: string;
  }>;
  refresh: () => Promise<void>;
}

export function useAchievements(options: UseAchievementsOptions = {}): UseAchievementsReturn {
  const { autoFetch = true } = options;
  
  const store = useGamificationStore();
  const claimable = useGamificationStore(selectClaimableAchievements);
  const { triggerHaptic } = useHaptic();
  const { triggerConfetti } = useConfetti();
  
  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      store.fetchAchievements();
    }
  }, [autoFetch]);
  
  // Claim achievement
  const claim = useCallback(async (achievementId: string) => {
    const result = await store.claimAchievement(achievementId);
    
    if (result.success) {
      triggerHaptic('success');
      triggerConfetti();
    } else {
      triggerHaptic('error');
    }
    
    return result;
  }, [store, triggerHaptic, triggerConfetti]);
  
  const claimedCount = store.achievements.filter(a => a.isClaimed).length;
  
  return {
    achievements: store.achievements,
    claimable,
    claimedCount,
    totalCount: store.achievements.length,
    isLoading: store.isLoading,
    error: store.error,
    claim,
    refresh: store.fetchAchievements,
  };
}

// ===========================================
// useGamificationNotifications - Notification handling
// ===========================================

export interface UseGamificationNotificationsReturn {
  notifications: Array<{
    type: 'badge' | 'achievement' | 'tier_up';
    data: object;
  }>;
  hasNotifications: boolean;
  clear: (index: number) => void;
  clearAll: () => void;
}

export function useGamificationNotifications(): UseGamificationNotificationsReturn {
  const store = useGamificationStore();
  const { triggerConfetti } = useConfetti();
  
  // Auto-trigger confetti for new notifications
  useEffect(() => {
    if (store.pendingNotifications.length > 0) {
      const latest = store.pendingNotifications[store.pendingNotifications.length - 1];
      if (latest.type === 'badge' || latest.type === 'tier_up') {
        triggerConfetti();
      }
    }
  }, [store.pendingNotifications.length, triggerConfetti]);
  
  return {
    notifications: store.pendingNotifications,
    hasNotifications: store.pendingNotifications.length > 0,
    clear: store.clearNotification,
    clearAll: store.clearAllNotifications,
  };
}

// ===========================================
// usePointsAnimation - Animated points display
// ===========================================

export interface UsePointsAnimationReturn {
  displayPoints: number;
  isAnimating: boolean;
  animate: (from: number, to: number, duration?: number) => void;
}

export function usePointsAnimation(initialValue = 0): UsePointsAnimationReturn {
  const [displayPoints, setDisplayPoints] = useState(initialValue);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const animate = useCallback((from: number, to: number, duration = 1000) => {
    setIsAnimating(true);
    const startTime = Date.now();
    const diff = to - from;
    
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutCubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setDisplayPoints(Math.round(from + diff * eased));
      
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(tick);
  }, []);
  
  return {
    displayPoints,
    isAnimating,
    animate,
  };
}

// Need to import useState
import { useState } from 'react';
