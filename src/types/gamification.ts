export type GamificationCategory = 'review' | 'checkin' | 'social' | 'referral' | 'unknown';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all-time';

export interface PointHistory {
  id: string;
  amount: number;
  category: GamificationCategory;
  reason: string;
  timestamp: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: GamificationCategory;
  requirements: {
    type: string;
    target: number;
  };
  earnedAt?: string;
}

export interface BadgeProgress {
  current: number;
  target: number;
  percentage: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: string;
  unlocked: boolean;
  progress: {
    current: number;
    target: number;
  };
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  points: number;
  avatar?: string;
  change?: number; // Rank change
}

export interface Notification {
  id: string;
  type: 'badge' | 'points' | 'tier' | 'achievement' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
  data?: any;
}
