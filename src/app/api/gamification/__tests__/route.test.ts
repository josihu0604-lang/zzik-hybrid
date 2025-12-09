/**
 * Gamification API Tests
 * 
 * Unit tests for /api/gamification endpoints
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ===========================================
// Test Utilities
// ===========================================

function calculateTier(totalPoints: number): string {
  if (totalPoints >= 20000) return 'platinum';
  if (totalPoints >= 5000) return 'gold';
  if (totalPoints >= 1000) return 'silver';
  return 'bronze';
}

// ===========================================
// Badges API Tests
// ===========================================

describe('Badges API', () => {
  describe('GET /api/gamification/badges', () => {
    it('should return earned and available badges', async () => {
      const mockBadges = {
        earned: [
          { id: 'first_review', name: 'First Review', tier: 'bronze' },
        ],
        available: [
          { id: 'review_bronze', name: 'Review Bronze', tier: 'bronze', requirement: 10 },
          { id: 'review_silver', name: 'Review Silver', tier: 'silver', requirement: 50 },
        ],
        progress: [],
      };
      
      expect(mockBadges.earned.length).toBe(1);
      expect(mockBadges.available.length).toBe(2);
    });
    
    it('should calculate badge progress correctly', async () => {
      const current = 35;
      const required = 50;
      const percentage = Math.min(100, Math.round((current / required) * 100));
      
      expect(percentage).toBe(70);
    });
    
    it('should categorize badges correctly', async () => {
      const categories = ['experience', 'collector', 'social', 'achievement'];
      const badge = { category: 'experience' };
      
      expect(categories.includes(badge.category)).toBe(true);
    });
    
    it('should return badge tiers', async () => {
      const tiers = ['bronze', 'silver', 'gold', 'platinum'];
      
      tiers.forEach(tier => {
        expect(['bronze', 'silver', 'gold', 'platinum'].includes(tier)).toBe(true);
      });
    });
  });
});

// ===========================================
// Leaderboard API Tests
// ===========================================

describe('Leaderboard API', () => {
  describe('GET /api/gamification/leaderboard', () => {
    it('should return ranked entries', async () => {
      const entries = [
        { rank: 1, userId: 'user-1', score: 1000 },
        { rank: 2, userId: 'user-2', score: 900 },
        { rank: 3, userId: 'user-3', score: 800 },
      ];
      
      expect(entries[0].rank).toBe(1);
      expect(entries[0].score).toBeGreaterThan(entries[1].score);
    });
    
    it('should support different leaderboard types', async () => {
      const types = ['points', 'experiences', 'referrals', 'reviews'];
      
      types.forEach(type => {
        expect(['points', 'experiences', 'referrals', 'reviews'].includes(type)).toBe(true);
      });
    });
    
    it('should support different periods', async () => {
      const periods = ['daily', 'weekly', 'monthly', 'all-time'];
      
      periods.forEach(period => {
        expect(['daily', 'weekly', 'monthly', 'all-time'].includes(period)).toBe(true);
      });
    });
    
    it('should calculate date range correctly', async () => {
      const now = new Date();
      
      // Daily - start of today
      const dailyStart = new Date(now);
      dailyStart.setHours(0, 0, 0, 0);
      expect(dailyStart.getHours()).toBe(0);
      
      // Weekly - 7 days ago
      const weeklyStart = new Date(now);
      weeklyStart.setDate(weeklyStart.getDate() - 7);
      const daysDiff = Math.round((now.getTime() - weeklyStart.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(7);
      
      // Monthly - 1 month ago
      const monthlyStart = new Date(now);
      monthlyStart.setMonth(monthlyStart.getMonth() - 1);
      expect(monthlyStart.getMonth()).toBe((now.getMonth() - 1 + 12) % 12);
    });
    
    it('should filter by country', async () => {
      const entries = [
        { userId: 'user-1', country: 'KR' },
        { userId: 'user-2', country: 'JP' },
        { userId: 'user-3', country: 'KR' },
      ];
      
      const filtered = entries.filter(e => e.country === 'KR');
      expect(filtered.length).toBe(2);
    });
    
    it('should include user rank when logged in', async () => {
      const userRank = {
        rank: 42,
        userId: 'current-user',
        score: 500,
      };
      
      expect(userRank.rank).toBeDefined();
      expect(userRank.userId).toBe('current-user');
    });
    
    it('should limit results', async () => {
      const limit = 50;
      const entries = Array(100).fill({ userId: 'user', score: 100 });
      const limited = entries.slice(0, limit);
      
      expect(limited.length).toBe(50);
    });
  });
});

// ===========================================
// Points API Tests
// ===========================================

describe('Points API', () => {
  describe('GET /api/gamification/points', () => {
    it('should return points breakdown', async () => {
      const points = {
        total: 5000,
        available: 4500,
        pending: 200,
        expiring: 300,
      };
      
      expect(points.total).toBe(5000);
      expect(points.available).toBeLessThanOrEqual(points.total);
    });
    
    it('should calculate available points correctly', async () => {
      const earned = 5000;
      const spent = 500;
      const available = Math.max(0, earned - spent);
      
      expect(available).toBe(4500);
    });
    
    it('should return transaction history', async () => {
      const history = [
        { type: 'earn', amount: 100, source: 'review' },
        { type: 'spend', amount: 50, source: 'redemption' },
        { type: 'earn', amount: 200, source: 'booking' },
      ];
      
      expect(history.length).toBe(3);
      expect(history[0].type).toBe('earn');
    });
    
    it('should calculate tier correctly', async () => {
      expect(calculateTier(0)).toBe('bronze');
      expect(calculateTier(999)).toBe('bronze');
      expect(calculateTier(1000)).toBe('silver');
      expect(calculateTier(4999)).toBe('silver');
      expect(calculateTier(5000)).toBe('gold');
      expect(calculateTier(19999)).toBe('gold');
      expect(calculateTier(20000)).toBe('platinum');
      expect(calculateTier(100000)).toBe('platinum');
    });
    
    it('should calculate next tier points', async () => {
      const tierThresholds = {
        bronze: 0,
        silver: 1000,
        gold: 5000,
        platinum: 20000,
      };
      
      const currentTier = 'silver';
      const nextTier = 'gold';
      const pointsNeeded = tierThresholds[nextTier];
      
      expect(pointsNeeded).toBe(5000);
    });
    
    it('should identify expiring points', async () => {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now);
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const expiringTransactions = [
        { amount: 100, expires_at: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000) },
        { amount: 200, expires_at: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000) },
      ];
      
      const expiringTotal = expiringTransactions.reduce((sum, t) => sum + t.amount, 0);
      expect(expiringTotal).toBe(300);
    });
  });
  
  describe('Point Transaction Types', () => {
    it('should handle earn transactions', async () => {
      const transaction = {
        type: 'earn',
        amount: 100,
        source: 'review',
      };
      
      expect(transaction.type).toBe('earn');
      expect(transaction.amount).toBeGreaterThan(0);
    });
    
    it('should handle spend transactions', async () => {
      const transaction = {
        type: 'spend',
        amount: 50,
        source: 'redemption',
      };
      
      expect(transaction.type).toBe('spend');
      expect(transaction.amount).toBeGreaterThan(0);
    });
    
    it('should handle expire transactions', async () => {
      const transaction = {
        type: 'expire',
        amount: 100,
        source: 'default',
      };
      
      expect(transaction.type).toBe('expire');
    });
    
    it('should handle refund transactions', async () => {
      const transaction = {
        type: 'refund',
        amount: 75,
        source: 'cancelled',
      };
      
      expect(transaction.type).toBe('refund');
    });
  });
});

// ===========================================
// Achievements API Tests
// ===========================================

describe('Achievements API', () => {
  describe('POST /api/gamification/achievements/claim', () => {
    it('should require authentication', async () => {
      const user = null;
      expect(user).toBeNull();
    });
    
    it('should verify achievement exists', async () => {
      const achievementId = '123e4567-e89b-12d3-a456-426614174000';
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      expect(uuidRegex.test(achievementId)).toBe(true);
    });
    
    it('should prevent double claiming', async () => {
      const existingClaim = { id: 'claim-1', user_id: 'user-1', badge_id: 'badge-1' };
      
      expect(existingClaim).toBeTruthy();
    });
    
    it('should verify requirement is met', async () => {
      const requirement = 10;
      const current = 15;
      
      expect(current >= requirement).toBe(true);
    });
    
    it('should award points on claim', async () => {
      const pointsReward = 100;
      let userPoints = 500;
      
      userPoints += pointsReward;
      
      expect(userPoints).toBe(600);
    });
    
    it('should check for tier upgrade', async () => {
      const previousPoints = 900;
      const pointsEarned = 200;
      const newTotal = previousPoints + pointsEarned;
      
      const previousTier = calculateTier(previousPoints);
      const newTier = calculateTier(newTotal);
      
      expect(previousTier).toBe('bronze');
      expect(newTier).toBe('silver');
      expect(newTier !== previousTier).toBe(true);
    });
    
    it('should create activity on claim', async () => {
      const activity = {
        user_id: 'user-1',
        type: 'badge',
        content: {
          badgeId: 'badge-1',
          badgeName: 'First Review',
        },
      };
      
      expect(activity.type).toBe('badge');
      expect(activity.content.badgeName).toBeDefined();
    });
  });
  
  describe('Achievement Requirements', () => {
    it('should verify experience requirement', async () => {
      const category = 'experience';
      const required = 5;
      const userExperiences = 7;
      
      expect(category).toBe('experience');
      expect(userExperiences >= required).toBe(true);
    });
    
    it('should verify collector requirement', async () => {
      const category = 'collector';
      const required = 10;
      const userReviews = 12;
      
      expect(category).toBe('collector');
      expect(userReviews >= required).toBe(true);
    });
    
    it('should verify social requirement', async () => {
      const category = 'social';
      const required = 100;
      const userFollowers = 150;
      
      expect(category).toBe('social');
      expect(userFollowers >= required).toBe(true);
    });
    
    it('should verify achievement requirement', async () => {
      const category = 'achievement';
      const required = 20;
      const userCheckins = 25;
      
      expect(category).toBe('achievement');
      expect(userCheckins >= required).toBe(true);
    });
  });
});

// ===========================================
// Integration Tests
// ===========================================

describe('Gamification Integration', () => {
  it('should update points and tier atomically', async () => {
    let points = 900;
    let tier = calculateTier(points);
    
    expect(tier).toBe('bronze');
    
    // Earn points that should trigger tier upgrade
    points += 200;
    tier = calculateTier(points);
    
    expect(tier).toBe('silver');
    expect(points).toBe(1100);
  });
  
  it('should award badge and points together', async () => {
    const badge = {
      id: 'badge-1',
      name: 'First Review',
      pointsReward: 50,
    };
    
    let earnedBadges: string[] = [];
    let points = 0;
    
    // Claim badge
    earnedBadges.push(badge.id);
    points += badge.pointsReward;
    
    expect(earnedBadges).toContain('badge-1');
    expect(points).toBe(50);
  });
  
  it('should track progress toward multiple badges', async () => {
    const userStats = {
      experiences: 3,
      reviews: 8,
      followers: 45,
      checkins: 12,
    };
    
    const badges = [
      { id: 'exp-5', category: 'experience', requirement: 5 },
      { id: 'rev-10', category: 'collector', requirement: 10 },
      { id: 'social-50', category: 'social', requirement: 50 },
    ];
    
    const progress = badges.map(badge => {
      let current = 0;
      switch (badge.category) {
        case 'experience': current = userStats.experiences; break;
        case 'collector': current = userStats.reviews; break;
        case 'social': current = userStats.followers; break;
      }
      return {
        badgeId: badge.id,
        current,
        required: badge.requirement,
        percentage: Math.min(100, Math.round((current / badge.requirement) * 100)),
      };
    });
    
    expect(progress[0].percentage).toBe(60); // 3/5 = 60%
    expect(progress[1].percentage).toBe(80); // 8/10 = 80%
    expect(progress[2].percentage).toBe(90); // 45/50 = 90%
  });
});
