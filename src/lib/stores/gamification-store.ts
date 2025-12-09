import { create } from 'zustand';
import { 
  GamificationCategory, 
  Tier, 
  PointHistory, 
  Badge, 
  BadgeProgress, 
  Achievement, 
  LeaderboardEntry, 
  LeaderboardPeriod,
  Notification 
} from '@/types/gamification';

interface GamificationState {
  points: {
    total: number;
    byCategory: Record<string, number>;
    history: PointHistory[];
    tier: Tier;
    tierProgress: number;
  };
  badges: {
    earned: Badge[];
    available: Badge[];
    progress: Record<string, BadgeProgress>;
  };
  leaderboard: {
    entries: LeaderboardEntry[];
    userRank: number | null;
    period: LeaderboardPeriod;
  };
  achievements: Achievement[];
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addPoints: (amount: number, category: GamificationCategory, reason: string) => void;
  updateTier: () => void;
  getPointsByCategory: (category: GamificationCategory | string) => number;
  
  earnBadge: (badge: Badge) => void;
  addAvailableBadge: (badge: Badge) => void;
  updateBadgeProgress: (badgeId: string, current: number, target: number) => void;
  isBadgeEarned: (badgeId: string) => boolean;
  getBadgesByCategory: (category: GamificationCategory) => Badge[];
  getBadgesByRarity: (rarity: string) => Badge[];

  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  setUserRank: (rank: number) => void;
  setPeriod: (period: LeaderboardPeriod) => void;
  getUserPosition: (userId: string) => number | null;
  getTopUsers: (limit: number) => LeaderboardEntry[];

  addAchievement: (achievement: Achievement) => void;
  updateAchievementProgress: (achievementId: string, current: number) => void;
  unlockAchievement: (achievementId: string) => void;
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];

  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const TIER_THRESHOLDS: Record<Tier, number> = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 20000,
  diamond: 50000
};

export const useGamificationStore = create<GamificationState>((set, get) => ({
  points: {
    total: 0,
    byCategory: {},
    history: [],
    tier: 'bronze',
    tierProgress: 0,
  },
  badges: {
    earned: [],
    available: [],
    progress: {},
  },
  leaderboard: {
    entries: [],
    userRank: null,
    period: 'all-time',
  },
  achievements: [],
  notifications: [],
  isLoading: false,
  error: null,

  // --- Points ---
  addPoints: (amount, category, reason) => set((state) => {
    const newTotal = state.points.total + amount;
    const currentCategoryTotal = state.points.byCategory[category] || 0;
    
    return {
      points: {
        ...state.points,
        total: newTotal,
        byCategory: {
          ...state.points.byCategory,
          [category]: currentCategoryTotal + amount
        },
        history: [
          ...state.points.history,
          {
            id: Math.random().toString(36).substring(7),
            amount,
            category,
            reason,
            timestamp: new Date().toISOString()
          }
        ]
      }
    };
  }),

  updateTier: () => set((state) => {
    const total = state.points.total;
    let newTier: Tier = 'bronze';
    let nextThreshold = 1000;
    let prevThreshold = 0;

    if (total >= TIER_THRESHOLDS.diamond) {
      newTier = 'diamond';
      prevThreshold = TIER_THRESHOLDS.diamond;
      nextThreshold = TIER_THRESHOLDS.diamond * 2; // Cap
    } else if (total >= TIER_THRESHOLDS.platinum) {
      newTier = 'platinum';
      prevThreshold = TIER_THRESHOLDS.platinum;
      nextThreshold = TIER_THRESHOLDS.diamond;
    } else if (total >= TIER_THRESHOLDS.gold) {
      newTier = 'gold';
      prevThreshold = TIER_THRESHOLDS.gold;
      nextThreshold = TIER_THRESHOLDS.platinum;
    } else if (total >= TIER_THRESHOLDS.silver) {
      newTier = 'silver';
      prevThreshold = TIER_THRESHOLDS.silver;
      nextThreshold = TIER_THRESHOLDS.gold;
    }

    const progress = Math.min(100, Math.floor(((total - prevThreshold) / (nextThreshold - prevThreshold)) * 100));

    return {
      points: {
        ...state.points,
        tier: newTier,
        tierProgress: progress
      }
    };
  }),

  getPointsByCategory: (category) => get().points.byCategory[category] || 0,

  // --- Badges ---
  earnBadge: (badge) => set((state) => {
    if (state.badges.earned.some(b => b.id === badge.id)) return state;
    return {
      badges: {
        ...state.badges,
        earned: [...state.badges.earned, { ...badge, earnedAt: new Date().toISOString() }]
      }
    };
  }),

  addAvailableBadge: (badge) => set((state) => ({
    badges: {
      ...state.badges,
      available: [...state.badges.available, badge]
    }
  })),

  updateBadgeProgress: (badgeId, current, target) => set((state) => ({
    badges: {
      ...state.badges,
      progress: {
        ...state.badges.progress,
        [badgeId]: {
          current,
          target,
          percentage: Math.min(100, Math.floor((current / target) * 100))
        }
      }
    }
  })),

  isBadgeEarned: (badgeId) => get().badges.earned.some(b => b.id === badgeId),

  getBadgesByCategory: (category) => get().badges.earned.filter(b => b.category === category),

  getBadgesByRarity: (rarity) => get().badges.earned.filter(b => b.rarity === rarity),

  // --- Leaderboard ---
  setLeaderboard: (entries) => set((state) => ({
    leaderboard: {
      ...state.leaderboard,
      entries
    }
  })),

  setUserRank: (rank) => set((state) => ({
    leaderboard: {
      ...state.leaderboard,
      userRank: rank
    }
  })),

  setPeriod: (period) => set((state) => ({
    leaderboard: {
      ...state.leaderboard,
      period
    }
  })),

  getUserPosition: (userId) => {
    const entry = get().leaderboard.entries.find(e => e.userId === userId);
    return entry ? entry.rank : null;
  },

  getTopUsers: (limit) => get().leaderboard.entries.slice(0, limit),

  // --- Achievements ---
  addAchievement: (achievement) => set((state) => ({
    achievements: [...state.achievements, achievement]
  })),

  updateAchievementProgress: (achievementId, current) => set((state) => ({
    achievements: state.achievements.map(a => 
      a.id === achievementId 
        ? { ...a, progress: { ...a.progress, current } }
        : a
    )
  })),

  unlockAchievement: (achievementId) => set((state) => ({
    achievements: state.achievements.map(a => 
      a.id === achievementId 
        ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
        : a
    )
  })),

  getUnlockedAchievements: () => get().achievements.filter(a => a.unlocked),

  getLockedAchievements: () => get().achievements.filter(a => !a.unlocked),

  // --- Notifications ---
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  clearNotifications: () => set({ notifications: [] })

}));
