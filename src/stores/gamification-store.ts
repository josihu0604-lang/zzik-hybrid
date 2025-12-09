/**
 * Gamification Store - Zustand state management for gamification features
 * 
 * Manages:
 * - Points and transactions
 * - Badges and achievements
 * - Leaderboard
 * - Progress tracking
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ===========================================
// Types
// ===========================================

export type BadgeCategory = 'experience' | 'collector' | 'social' | 'achievement';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type TransactionType = 'earn' | 'spend' | 'expire' | 'refund';
export type LeaderboardType = 'points' | 'experiences' | 'referrals' | 'reviews';
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all-time';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  tier: BadgeTier;
  requirement: number;
  pointsReward: number;
  isActive: boolean;
  earnedAt?: string;
}

export interface BadgeProgress {
  badgeId: string;
  badge: Badge;
  current: number;
  required: number;
  percentage: number;
}

export interface PointTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  source: string;
  description: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}

export interface PointsData {
  total: number;
  available: number;
  pending: number;
  expiring: number;
  expiryDate?: string;
  tier: string;
  nextTierPoints?: number;
  history: PointTransaction[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  country: string;
  tier: string;
  score: number;
  change: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  requirement: number;
  currentProgress: number;
  isClaimed: boolean;
  canClaim: boolean;
  pointsReward: number;
}

// ===========================================
// Store State Interface
// ===========================================

interface GamificationState {
  // State - Points
  points: PointsData;
  
  // State - Badges
  earnedBadges: Badge[];
  availableBadges: Badge[];
  badgeProgress: BadgeProgress[];
  
  // State - Leaderboard
  leaderboard: LeaderboardEntry[];
  userRank: LeaderboardEntry | null;
  leaderboardType: LeaderboardType;
  leaderboardPeriod: LeaderboardPeriod;
  leaderboardCountry?: string;
  
  // State - Achievements
  achievements: Achievement[];
  
  // State - UI
  isLoading: boolean;
  error: string | null;
  
  // State - Notifications (for newly earned badges/achievements)
  pendingNotifications: Array<{
    type: 'badge' | 'achievement' | 'tier_up';
    data: object;
  }>;
  
  // Actions - Points
  setPoints: (points: PointsData) => void;
  updatePoints: (updates: Partial<PointsData>) => void;
  addPointTransaction: (transaction: PointTransaction) => void;
  
  // Actions - Badges
  setEarnedBadges: (badges: Badge[]) => void;
  setAvailableBadges: (badges: Badge[]) => void;
  setBadgeProgress: (progress: BadgeProgress[]) => void;
  addEarnedBadge: (badge: Badge) => void;
  
  // Actions - Leaderboard
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  setUserRank: (entry: LeaderboardEntry | null) => void;
  setLeaderboardType: (type: LeaderboardType) => void;
  setLeaderboardPeriod: (period: LeaderboardPeriod) => void;
  setLeaderboardCountry: (country?: string) => void;
  
  // Actions - Achievements
  setAchievements: (achievements: Achievement[]) => void;
  updateAchievement: (id: string, updates: Partial<Achievement>) => void;
  
  // Actions - Notifications
  addNotification: (notification: { type: 'badge' | 'achievement' | 'tier_up'; data: object }) => void;
  clearNotification: (index: number) => void;
  clearAllNotifications: () => void;
  
  // Actions - UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions - Async
  fetchPoints: () => Promise<void>;
  fetchBadges: () => Promise<void>;
  fetchLeaderboard: (params?: {
    type?: LeaderboardType;
    period?: LeaderboardPeriod;
    country?: string;
    limit?: number;
  }) => Promise<void>;
  fetchAchievements: () => Promise<void>;
  claimAchievement: (achievementId: string) => Promise<{
    success: boolean;
    pointsEarned?: number;
    badge?: Badge;
    newTier?: string;
  }>;
  
  // Actions - Reset
  reset: () => void;
}

// ===========================================
// Initial State
// ===========================================

const initialState: Omit<GamificationState, keyof ReturnType<() => GamificationState>> = {
  points: {
    total: 0,
    available: 0,
    pending: 0,
    expiring: 0,
    tier: 'bronze',
    history: [],
  },
  earnedBadges: [],
  availableBadges: [],
  badgeProgress: [],
  leaderboard: [],
  userRank: null,
  leaderboardType: 'points',
  leaderboardPeriod: 'weekly',
  leaderboardCountry: undefined,
  achievements: [],
  isLoading: false,
  error: null,
  pendingNotifications: [],
};

// ===========================================
// Tier Thresholds
// ===========================================

const TIER_THRESHOLDS: Record<string, number> = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 20000,
};

// ===========================================
// Store Implementation
// ===========================================

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Points Actions
      setPoints: (points) => {
        set({ points });
      },
      
      updatePoints: (updates) => {
        set(state => ({
          points: { ...state.points, ...updates },
        }));
      },
      
      addPointTransaction: (transaction) => {
        set(state => {
          const newHistory = [transaction, ...state.points.history].slice(0, 100);
          
          // Calculate new totals
          let available = state.points.available;
          if (transaction.type === 'earn') {
            available += transaction.amount;
          } else if (transaction.type === 'spend' || transaction.type === 'expire') {
            available = Math.max(0, available - transaction.amount);
          } else if (transaction.type === 'refund') {
            available += transaction.amount;
          }
          
          // Check for tier upgrade
          const currentTier = state.points.tier;
          const newTier = calculateTier(state.points.total + transaction.amount);
          
          if (newTier !== currentTier && transaction.type === 'earn') {
            get().addNotification({
              type: 'tier_up',
              data: { previousTier: currentTier, newTier },
            });
          }
          
          return {
            points: {
              ...state.points,
              available,
              total: state.points.total + (transaction.type === 'earn' ? transaction.amount : 0),
              tier: newTier,
              history: newHistory,
            },
          };
        });
      },
      
      // Badges Actions
      setEarnedBadges: (badges) => {
        set({ earnedBadges: badges });
      },
      
      setAvailableBadges: (badges) => {
        set({ availableBadges: badges });
      },
      
      setBadgeProgress: (progress) => {
        set({ badgeProgress: progress });
      },
      
      addEarnedBadge: (badge) => {
        set(state => {
          // Move from available to earned
          const newAvailable = state.availableBadges.filter(b => b.id !== badge.id);
          const newEarned = [...state.earnedBadges, badge];
          
          return {
            availableBadges: newAvailable,
            earnedBadges: newEarned,
          };
        });
        
        // Add notification
        get().addNotification({
          type: 'badge',
          data: badge,
        });
      },
      
      // Leaderboard Actions
      setLeaderboard: (entries) => {
        set({ leaderboard: entries });
      },
      
      setUserRank: (entry) => {
        set({ userRank: entry });
      },
      
      setLeaderboardType: (type) => {
        set({ leaderboardType: type });
      },
      
      setLeaderboardPeriod: (period) => {
        set({ leaderboardPeriod: period });
      },
      
      setLeaderboardCountry: (country) => {
        set({ leaderboardCountry: country });
      },
      
      // Achievements Actions
      setAchievements: (achievements) => {
        set({ achievements });
      },
      
      updateAchievement: (id, updates) => {
        set(state => ({
          achievements: state.achievements.map(a =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
      },
      
      // Notifications Actions
      addNotification: (notification) => {
        set(state => ({
          pendingNotifications: [...state.pendingNotifications, notification],
        }));
      },
      
      clearNotification: (index) => {
        set(state => ({
          pendingNotifications: state.pendingNotifications.filter((_, i) => i !== index),
        }));
      },
      
      clearAllNotifications: () => {
        set({ pendingNotifications: [] });
      },
      
      // UI Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      // Async Actions
      fetchPoints: async () => {
        const { setLoading, setError, setPoints } = get();
        setLoading(true);
        setError(null);
        
        try {
          const response = await fetch('/api/gamification/points');
          if (!response.ok) {
            throw new Error('Failed to fetch points');
          }
          
          const data = await response.json();
          setPoints(data.points);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      
      fetchBadges: async () => {
        const { setLoading, setError, setEarnedBadges, setAvailableBadges, setBadgeProgress } = get();
        setLoading(true);
        setError(null);
        
        try {
          const response = await fetch('/api/gamification/badges');
          if (!response.ok) {
            throw new Error('Failed to fetch badges');
          }
          
          const data = await response.json();
          setEarnedBadges(data.earned);
          setAvailableBadges(data.available);
          setBadgeProgress(data.progress);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      
      fetchLeaderboard: async (params = {}) => {
        const { 
          leaderboardType, 
          leaderboardPeriod, 
          leaderboardCountry,
          setLoading, 
          setError, 
          setLeaderboard, 
          setUserRank,
          setLeaderboardType,
          setLeaderboardPeriod,
          setLeaderboardCountry,
        } = get();
        
        const type = params.type || leaderboardType;
        const period = params.period || leaderboardPeriod;
        const country = params.country !== undefined ? params.country : leaderboardCountry;
        
        setLoading(true);
        setError(null);
        
        if (params.type) setLeaderboardType(params.type);
        if (params.period) setLeaderboardPeriod(params.period);
        if (params.country !== undefined) setLeaderboardCountry(params.country);
        
        try {
          const queryParams = new URLSearchParams({
            type,
            period,
            limit: String(params.limit || 50),
          });
          if (country) queryParams.set('country', country);
          
          const response = await fetch(`/api/gamification/leaderboard?${queryParams}`);
          if (!response.ok) {
            throw new Error('Failed to fetch leaderboard');
          }
          
          const data = await response.json();
          setLeaderboard(data.entries);
          setUserRank(data.userRank || null);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      
      fetchAchievements: async () => {
        const { setLoading, setError, setAchievements } = get();
        setLoading(true);
        setError(null);
        
        try {
          // Achievements are derived from badges with progress
          const response = await fetch('/api/gamification/badges');
          if (!response.ok) {
            throw new Error('Failed to fetch achievements');
          }
          
          const data = await response.json();
          
          // Convert progress to achievements format
          const achievements: Achievement[] = data.progress.map((p: BadgeProgress) => ({
            id: p.badgeId,
            name: p.badge.name,
            description: p.badge.description,
            icon: p.badge.icon,
            category: p.badge.category,
            requirement: p.required,
            currentProgress: p.current,
            isClaimed: false,
            canClaim: p.percentage >= 100,
            pointsReward: p.badge.pointsReward,
          }));
          
          setAchievements(achievements);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      
      claimAchievement: async (achievementId) => {
        const { setLoading, setError, updateAchievement, addEarnedBadge, addPointTransaction, updatePoints } = get();
        setLoading(true);
        setError(null);
        
        try {
          const response = await fetch('/api/gamification/achievements/claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ achievementId }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to claim achievement');
          }
          
          const data = await response.json();
          
          // Update achievement state
          updateAchievement(achievementId, { isClaimed: true, canClaim: false });
          
          // Add earned badge
          if (data.badge) {
            addEarnedBadge({
              ...data.badge,
              earnedAt: new Date().toISOString(),
            });
          }
          
          // Add point transaction
          if (data.pointsEarned > 0) {
            addPointTransaction({
              id: `claim_${achievementId}_${Date.now()}`,
              type: 'earn',
              amount: data.pointsEarned,
              source: 'achievement_claim',
              description: `Claimed: ${data.achievement.name}`,
              referenceId: achievementId,
              referenceType: 'badge',
              createdAt: new Date().toISOString(),
            });
          }
          
          // Update tier if changed
          if (data.newTier) {
            updatePoints({ tier: data.newTier });
          }
          
          return {
            success: true,
            pointsEarned: data.pointsEarned,
            badge: data.badge,
            newTier: data.newTier,
          };
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
          return { success: false };
        } finally {
          setLoading(false);
        }
      },
      
      // Reset
      reset: () => {
        set(initialState as any);
      },
    }),
    {
      name: 'zzik-gamification-storage',
      partialize: (state) => ({
        // Persist basic gamification data
        points: {
          total: state.points.total,
          available: state.points.available,
          tier: state.points.tier,
        },
        earnedBadges: state.earnedBadges.map(b => ({ id: b.id, name: b.name, earnedAt: b.earnedAt })),
      }),
    }
  )
);

// ===========================================
// Helper Functions
// ===========================================

function calculateTier(totalPoints: number): string {
  if (totalPoints >= TIER_THRESHOLDS.platinum) return 'platinum';
  if (totalPoints >= TIER_THRESHOLDS.gold) return 'gold';
  if (totalPoints >= TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}

// ===========================================
// Selectors
// ===========================================

export const selectTierProgress = (state: GamificationState) => {
  const { total, tier } = state.points;
  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(tier);
  const nextTier = tiers[currentIndex + 1];
  
  if (!nextTier) {
    return { current: total, required: total, percentage: 100, nextTier: null };
  }
  
  const currentThreshold = TIER_THRESHOLDS[tier];
  const nextThreshold = TIER_THRESHOLDS[nextTier];
  const progress = total - currentThreshold;
  const required = nextThreshold - currentThreshold;
  
  return {
    current: progress,
    required,
    percentage: Math.min(100, Math.round((progress / required) * 100)),
    nextTier,
  };
};

export const selectBadgesByCategory = (category: BadgeCategory) => (state: GamificationState) => ({
  earned: state.earnedBadges.filter(b => b.category === category),
  available: state.availableBadges.filter(b => b.category === category),
});

export const selectTopLeaders = (limit: number = 3) => (state: GamificationState) =>
  state.leaderboard.slice(0, limit);

export const selectClaimableAchievements = (state: GamificationState) =>
  state.achievements.filter(a => a.canClaim && !a.isClaimed);
