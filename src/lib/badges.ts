/**
 * ZZIK Badge System
 *
 * Gamification through achievement badges.
 * Badges are earned based on user activities.
 *
 * Categories:
 * - Participation: Popup participation milestones
 * - Check-in: Visit verification achievements
 * - Leader: Referral and influence achievements
 * - Special: Limited-time and event badges
 */

import { colors } from '@/lib/design-tokens';

// ============================================================================
// Types
// ============================================================================

export type BadgeCategory = 'participation' | 'checkin' | 'leader' | 'special';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeCriteria {
  /** Type of activity to track */
  type:
    | 'participation_count'
    | 'checkin_count'
    | 'perfect_checkin_count'
    | 'referral_count'
    | 'earnings_total'
    | 'consecutive_days'
    | 'early_adopter'
    | 'first_action'
    | 'special_event';
  /** Threshold value to earn the badge */
  threshold: number;
  /** Optional time window (in days) */
  timeWindow?: number;
  /** Optional event ID for special badges */
  eventId?: string;
}

export interface Badge {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  criteria: BadgeCriteria;
  /** Points awarded when earning this badge */
  points: number;
  /** Secret badge (hidden until earned) */
  secret?: boolean;
  /** Limited time availability */
  expiresAt?: Date;
}

export interface EarnedBadge extends Badge {
  earnedAt: Date;
  /** Progress towards earning (0-100) */
  progress?: number;
}

export interface UserBadges {
  earned: EarnedBadge[];
  inProgress: (Badge & { progress: number; current: number })[];
  locked: Badge[];
}

// ============================================================================
// Badge Definitions
// ============================================================================

export const BADGE_DEFINITIONS: Record<string, Badge> = {
  // ===== Participation Badges =====
  first_participation: {
    id: 'first_participation',
    name: '첫 참여',
    nameEn: 'First Step',
    description: '첫 번째 팝업에 참여했습니다',
    descriptionEn: 'Participated in your first popup',
    icon: '🎯',
    category: 'participation',
    rarity: 'common',
    criteria: { type: 'participation_count', threshold: 1 },
    points: 10,
  },
  popup_explorer: {
    id: 'popup_explorer',
    name: '팝업 탐험가',
    nameEn: 'Popup Explorer',
    description: '10개의 팝업에 참여했습니다',
    descriptionEn: 'Participated in 10 popups',
    icon: '🧭',
    category: 'participation',
    rarity: 'rare',
    criteria: { type: 'participation_count', threshold: 10 },
    points: 50,
  },
  popup_enthusiast: {
    id: 'popup_enthusiast',
    name: '팝업 애호가',
    nameEn: 'Popup Enthusiast',
    description: '50개의 팝업에 참여했습니다',
    descriptionEn: 'Participated in 50 popups',
    icon: '🔥',
    category: 'participation',
    rarity: 'epic',
    criteria: { type: 'participation_count', threshold: 50 },
    points: 200,
  },
  popup_master: {
    id: 'popup_master',
    name: '팝업 마스터',
    nameEn: 'Popup Master',
    description: '100개의 팝업에 참여했습니다',
    descriptionEn: 'Participated in 100 popups',
    icon: '👑',
    category: 'participation',
    rarity: 'legendary',
    criteria: { type: 'participation_count', threshold: 100 },
    points: 500,
  },

  // ===== Check-in Badges =====
  first_checkin: {
    id: 'first_checkin',
    name: '첫 찍음',
    nameEn: 'First Check-in',
    description: '첫 번째 방문 인증을 완료했습니다',
    descriptionEn: 'Completed your first check-in',
    icon: '✅',
    category: 'checkin',
    rarity: 'common',
    criteria: { type: 'checkin_count', threshold: 1 },
    points: 15,
  },
  verified_visitor: {
    id: 'verified_visitor',
    name: '인증된 방문자',
    nameEn: 'Verified Visitor',
    description: '10번의 방문 인증을 완료했습니다',
    descriptionEn: 'Completed 10 check-ins',
    icon: '🏃',
    category: 'checkin',
    rarity: 'rare',
    criteria: { type: 'checkin_count', threshold: 10 },
    points: 75,
  },
  verified_master: {
    id: 'verified_master',
    name: '인증 마스터',
    nameEn: 'Verification Master',
    description: '100점 만점 체크인을 10회 달성했습니다',
    descriptionEn: 'Achieved 10 perfect score check-ins',
    icon: '💯',
    category: 'checkin',
    rarity: 'epic',
    criteria: { type: 'perfect_checkin_count', threshold: 10 },
    points: 300,
  },
  popup_hunter: {
    id: 'popup_hunter',
    name: '팝업 헌터',
    nameEn: 'Popup Hunter',
    description: '50번의 방문 인증을 완료했습니다',
    descriptionEn: 'Completed 50 check-ins',
    icon: '🎪',
    category: 'checkin',
    rarity: 'epic',
    criteria: { type: 'checkin_count', threshold: 50 },
    points: 250,
  },

  // ===== Leader Badges =====
  leader_starter: {
    id: 'leader_starter',
    name: '리더 시작',
    nameEn: 'Leader Starter',
    description: '리더오퍼에 등록했습니다',
    descriptionEn: 'Registered as a leader',
    icon: '🌟',
    category: 'leader',
    rarity: 'rare',
    criteria: { type: 'first_action', threshold: 1 },
    points: 30,
  },
  first_referral: {
    id: 'first_referral',
    name: '첫 추천',
    nameEn: 'First Referral',
    description: '첫 번째 추천인을 유치했습니다',
    descriptionEn: 'Got your first referral',
    icon: '🤝',
    category: 'leader',
    rarity: 'rare',
    criteria: { type: 'referral_count', threshold: 1 },
    points: 25,
  },
  influencer: {
    id: 'influencer',
    name: '인플루언서',
    nameEn: 'Influencer',
    description: '50명의 추천인을 유치했습니다',
    descriptionEn: 'Got 50 referrals',
    icon: '📢',
    category: 'leader',
    rarity: 'epic',
    criteria: { type: 'referral_count', threshold: 50 },
    points: 200,
  },
  top_leader: {
    id: 'top_leader',
    name: '탑 리더',
    nameEn: 'Top Leader',
    description: '200명의 추천인을 유치했습니다',
    descriptionEn: 'Got 200 referrals',
    icon: '🏆',
    category: 'leader',
    rarity: 'legendary',
    criteria: { type: 'referral_count', threshold: 200 },
    points: 500,
  },
  earnings_milestone: {
    id: 'earnings_milestone',
    name: '수익 1만원 달성',
    nameEn: 'First 10K Earnings',
    description: '리더오퍼 수익 10,000원을 달성했습니다',
    descriptionEn: 'Earned 10,000 KRW from referrals',
    icon: '💰',
    category: 'leader',
    rarity: 'epic',
    criteria: { type: 'earnings_total', threshold: 10000 },
    points: 150,
  },

  // ===== Special Badges =====
  early_adopter: {
    id: 'early_adopter',
    name: '얼리어답터',
    nameEn: 'Early Adopter',
    description: 'ZZIK 초기 사용자입니다',
    descriptionEn: 'Early ZZIK user',
    icon: '🚀',
    category: 'special',
    rarity: 'legendary',
    criteria: { type: 'early_adopter', threshold: 1 },
    points: 100,
    secret: true,
  },
  streak_7: {
    id: 'streak_7',
    name: '7일 연속',
    nameEn: '7-Day Streak',
    description: '7일 연속으로 앱을 사용했습니다',
    descriptionEn: 'Used the app for 7 consecutive days',
    icon: '🔥',
    category: 'special',
    rarity: 'rare',
    criteria: { type: 'consecutive_days', threshold: 7 },
    points: 70,
  },
  streak_30: {
    id: 'streak_30',
    name: '30일 연속',
    nameEn: '30-Day Streak',
    description: '30일 연속으로 앱을 사용했습니다',
    descriptionEn: 'Used the app for 30 consecutive days',
    icon: '⚡',
    category: 'special',
    rarity: 'epic',
    criteria: { type: 'consecutive_days', threshold: 30 },
    points: 300,
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all badges by category
 */
export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return Object.values(BADGE_DEFINITIONS).filter((b) => b.category === category);
}

/**
 * Get all badges by rarity
 */
export function getBadgesByRarity(rarity: BadgeRarity): Badge[] {
  return Object.values(BADGE_DEFINITIONS).filter((b) => b.rarity === rarity);
}

/**
 * Get badge by ID
 */
export function getBadgeById(id: string): Badge | undefined {
  return BADGE_DEFINITIONS[id];
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: BadgeRarity): string {
  switch (rarity) {
    case 'common':
      return colors.text.secondary;
    case 'rare':
      return colors.info;
    case 'epic':
      return colors.flame[500];
    case 'legendary':
      return colors.spark[500];
  }
}

/**
 * Get rarity label
 */
export function getRarityLabel(rarity: BadgeRarity): string {
  switch (rarity) {
    case 'common':
      return '일반';
    case 'rare':
      return '레어';
    case 'epic':
      return '에픽';
    case 'legendary':
      return '전설';
  }
}

/**
 * Calculate progress towards a badge
 */
export function calculateBadgeProgress(badge: Badge, currentValue: number): number {
  const progress = (currentValue / badge.criteria.threshold) * 100;
  return Math.min(Math.round(progress), 100);
}

/**
 * Check if badge criteria is met
 */
export function isBadgeEarned(badge: Badge, currentValue: number): boolean {
  return currentValue >= badge.criteria.threshold;
}

// ============================================================================
// User Stats Interface (for badge calculation)
// ============================================================================

export interface UserStats {
  participationCount: number;
  checkinCount: number;
  perfectCheckinCount: number;
  referralCount: number;
  earningsTotal: number;
  consecutiveDays: number;
  registeredAt: Date;
  isLeader: boolean;
}

/**
 * Calculate user's badge status based on stats
 */
export function calculateUserBadges(stats: UserStats): UserBadges {
  const earned: EarnedBadge[] = [];
  const inProgress: (Badge & { progress: number; current: number })[] = [];
  const locked: Badge[] = [];

  const earlyAdopterCutoff = new Date('2025-03-01');

  for (const badge of Object.values(BADGE_DEFINITIONS)) {
    let currentValue = 0;
    let isEarned = false;

    switch (badge.criteria.type) {
      case 'participation_count':
        currentValue = stats.participationCount;
        break;
      case 'checkin_count':
        currentValue = stats.checkinCount;
        break;
      case 'perfect_checkin_count':
        currentValue = stats.perfectCheckinCount;
        break;
      case 'referral_count':
        currentValue = stats.referralCount;
        break;
      case 'earnings_total':
        currentValue = stats.earningsTotal;
        break;
      case 'consecutive_days':
        currentValue = stats.consecutiveDays;
        break;
      case 'early_adopter':
        isEarned = stats.registeredAt < earlyAdopterCutoff;
        currentValue = isEarned ? 1 : 0;
        break;
      case 'first_action':
        // For leader_starter badge
        if (badge.id === 'leader_starter') {
          isEarned = stats.isLeader;
          currentValue = isEarned ? 1 : 0;
        }
        break;
    }

    if (badge.criteria.type !== 'early_adopter' && badge.criteria.type !== 'first_action') {
      isEarned = currentValue >= badge.criteria.threshold;
    }

    if (isEarned) {
      earned.push({
        ...badge,
        earnedAt: new Date(), // This would come from DB in real implementation
        progress: 100,
      });
    } else if (badge.secret) {
      locked.push(badge);
    } else {
      const progress = calculateBadgeProgress(badge, currentValue);
      if (progress > 0) {
        inProgress.push({ ...badge, progress, current: currentValue });
      } else {
        locked.push(badge);
      }
    }
  }

  // Sort by points (highest first) for earned
  earned.sort((a, b) => b.points - a.points);

  // Sort by progress (highest first) for in progress
  inProgress.sort((a, b) => b.progress - a.progress);

  return { earned, inProgress, locked };
}

/**
 * Get total points from earned badges
 */
export function getTotalBadgePoints(earnedBadges: EarnedBadge[]): number {
  return earnedBadges.reduce((sum, badge) => sum + badge.points, 0);
}

export default BADGE_DEFINITIONS;
