import { describe, it, expect, beforeEach } from 'vitest';
import { useGamificationStore } from '@/lib/stores/gamification-store';

/**
 * Gamification Store Unit Tests
 * Tests Zustand store for points, badges, leaderboard, and achievements
 */

describe('Gamification Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useGamificationStore.setState({
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
    });
  });

  describe('Points Management', () => {
    it('should initialize with zero points', () => {
      const state = useGamificationStore.getState();
      
      expect(state.points.total).toBe(0);
      expect(state.points.byCategory).toEqual({});
      expect(state.points.history).toEqual([]);
      expect(state.points.tier).toBe('bronze');
    });

    it('should add points', () => {
      const { addPoints } = useGamificationStore.getState();
      
      addPoints(100, 'review', 'Created first review');
      
      const state = useGamificationStore.getState();
      expect(state.points.total).toBe(100);
      expect(state.points.byCategory.review).toBe(100);
      expect(state.points.history).toHaveLength(1);
      expect(state.points.history[0].amount).toBe(100);
    });

    it('should accumulate points across categories', () => {
      const { addPoints } = useGamificationStore.getState();
      
      addPoints(100, 'review', 'Review 1');
      addPoints(50, 'checkin', 'Check-in 1');
      addPoints(200, 'review', 'Review 2');
      
      const state = useGamificationStore.getState();
      expect(state.points.total).toBe(350);
      expect(state.points.byCategory.review).toBe(300);
      expect(state.points.byCategory.checkin).toBe(50);
    });

    it('should track points history', () => {
      const { addPoints } = useGamificationStore.getState();
      
      addPoints(100, 'review', 'Review 1');
      addPoints(50, 'checkin', 'Check-in 1');
      
      const history = useGamificationStore.getState().points.history;
      
      expect(history).toHaveLength(2);
      expect(history[0].category).toBe('review');
      expect(history[1].category).toBe('checkin');
    });

    it('should update tier based on total points', () => {
      const { addPoints, updateTier } = useGamificationStore.getState();
      
      // Bronze: 0-999
      addPoints(500, 'review', 'Points');
      updateTier();
      expect(useGamificationStore.getState().points.tier).toBe('bronze');
      
      // Silver: 1000-4999
      addPoints(600, 'review', 'More points');
      updateTier();
      expect(useGamificationStore.getState().points.tier).toBe('silver');
      
      // Gold: 5000-9999
      addPoints(4500, 'review', 'Even more points');
      updateTier();
      expect(useGamificationStore.getState().points.tier).toBe('gold');
    });

    it('should calculate tier progress', () => {
      const { addPoints, updateTier } = useGamificationStore.getState();
      
      addPoints(500, 'review', 'Points');
      updateTier();
      
      const state = useGamificationStore.getState();
      // Bronze tier: 0-999, current: 500
      // Progress: (500 / 1000) * 100 = 50%
      expect(state.points.tierProgress).toBe(50);
    });

    it('should get points by category', () => {
      const { addPoints, getPointsByCategory } = useGamificationStore.getState();
      
      addPoints(100, 'review', 'Review');
      addPoints(50, 'checkin', 'Check-in');
      addPoints(200, 'referral', 'Referral');
      
      expect(getPointsByCategory('review')).toBe(100);
      expect(getPointsByCategory('checkin')).toBe(50);
      expect(getPointsByCategory('referral')).toBe(200);
      expect(getPointsByCategory('unknown')).toBe(0);
    });
  });

  describe('Badge Management', () => {
    const mockBadge = {
      id: 'badge-1',
      name: 'First Review',
      description: 'Write your first review',
      icon: '🌟',
      rarity: 'common' as const,
      category: 'review' as const,
      requirements: {
        type: 'review_count' as const,
        target: 1,
      },
    };

    it('should add earned badge', () => {
      const { earnBadge } = useGamificationStore.getState();
      
      earnBadge(mockBadge);
      
      const state = useGamificationStore.getState();
      expect(state.badges.earned).toHaveLength(1);
      expect(state.badges.earned[0].id).toBe('badge-1');
    });

    it('should not add duplicate badges', () => {
      const { earnBadge } = useGamificationStore.getState();
      
      earnBadge(mockBadge);
      earnBadge(mockBadge); // Try to earn again
      
      const state = useGamificationStore.getState();
      expect(state.badges.earned).toHaveLength(1);
    });

    it('should add available badges', () => {
      const { addAvailableBadge } = useGamificationStore.getState();
      
      addAvailableBadge(mockBadge);
      
      const state = useGamificationStore.getState();
      expect(state.badges.available).toHaveLength(1);
    });

    it('should update badge progress', () => {
      const { updateBadgeProgress } = useGamificationStore.getState();
      
      updateBadgeProgress('badge-1', 5, 10);
      
      const progress = useGamificationStore.getState().badges.progress['badge-1'];
      expect(progress.current).toBe(5);
      expect(progress.target).toBe(10);
      expect(progress.percentage).toBe(50);
    });

    it('should check if badge is earned', () => {
      const { earnBadge, isBadgeEarned } = useGamificationStore.getState();
      
      expect(isBadgeEarned('badge-1')).toBe(false);
      
      earnBadge(mockBadge);
      
      expect(isBadgeEarned('badge-1')).toBe(true);
    });

    it('should get badges by category', () => {
      const { earnBadge, getBadgesByCategory } = useGamificationStore.getState();
      
      const reviewBadge = { ...mockBadge, id: 'badge-1', category: 'review' as const };
      const socialBadge = { ...mockBadge, id: 'badge-2', category: 'social' as const };
      
      earnBadge(reviewBadge);
      earnBadge(socialBadge);
      
      const reviewBadges = getBadgesByCategory('review');
      expect(reviewBadges).toHaveLength(1);
      expect(reviewBadges[0].id).toBe('badge-1');
    });

    it('should get badges by rarity', () => {
      const { earnBadge, getBadgesByRarity } = useGamificationStore.getState();
      
      const commonBadge = { ...mockBadge, id: 'badge-1', rarity: 'common' as const };
      const rareBadge = { ...mockBadge, id: 'badge-2', rarity: 'rare' as const };
      const legendaryBadge = { ...mockBadge, id: 'badge-3', rarity: 'legendary' as const };
      
      earnBadge(commonBadge);
      earnBadge(rareBadge);
      earnBadge(legendaryBadge);
      
      const rareBadges = getBadgesByRarity('rare');
      expect(rareBadges).toHaveLength(1);
      expect(rareBadges[0].id).toBe('badge-2');
    });
  });

  describe('Leaderboard Management', () => {
    const mockEntries = [
      { rank: 1, userId: 'user-1', userName: 'User 1', points: 1000, avatar: '' },
      { rank: 2, userId: 'user-2', userName: 'User 2', points: 800, avatar: '' },
      { rank: 3, userId: 'user-3', userName: 'User 3', points: 600, avatar: '' },
    ];

    it('should set leaderboard entries', () => {
      const { setLeaderboard } = useGamificationStore.getState();
      
      setLeaderboard(mockEntries);
      
      const state = useGamificationStore.getState();
      expect(state.leaderboard.entries).toHaveLength(3);
      expect(state.leaderboard.entries[0].rank).toBe(1);
    });

    it('should set user rank', () => {
      const { setUserRank } = useGamificationStore.getState();
      
      setUserRank(10);
      
      const state = useGamificationStore.getState();
      expect(state.leaderboard.userRank).toBe(10);
    });

    it('should change leaderboard period', () => {
      const { setPeriod } = useGamificationStore.getState();
      
      setPeriod('weekly');
      expect(useGamificationStore.getState().leaderboard.period).toBe('weekly');
      
      setPeriod('monthly');
      expect(useGamificationStore.getState().leaderboard.period).toBe('monthly');
    });

    it('should get user position in leaderboard', () => {
      const { setLeaderboard, getUserPosition } = useGamificationStore.getState();
      
      setLeaderboard(mockEntries);
      
      const position = getUserPosition('user-2');
      expect(position).toBe(2);
      
      const notFound = getUserPosition('user-999');
      expect(notFound).toBeNull();
    });

    it('should get top N users', () => {
      const { setLeaderboard, getTopUsers } = useGamificationStore.getState();
      
      setLeaderboard(mockEntries);
      
      const top2 = getTopUsers(2);
      expect(top2).toHaveLength(2);
      expect(top2[0].userId).toBe('user-1');
      expect(top2[1].userId).toBe('user-2');
    });
  });

  describe('Achievement Management', () => {
    const mockAchievement = {
      id: 'achievement-1',
      name: 'Review Master',
      description: 'Write 50 reviews',
      points: 500,
      icon: '🏆',
      unlocked: false,
      progress: {
        current: 10,
        target: 50,
      },
    };

    it('should add achievement', () => {
      const { addAchievement } = useGamificationStore.getState();
      
      addAchievement(mockAchievement);
      
      const state = useGamificationStore.getState();
      expect(state.achievements).toHaveLength(1);
      expect(state.achievements[0].id).toBe('achievement-1');
    });

    it('should update achievement progress', () => {
      const { addAchievement, updateAchievementProgress } = useGamificationStore.getState();
      
      addAchievement(mockAchievement);
      updateAchievementProgress('achievement-1', 25);
      
      const achievement = useGamificationStore.getState().achievements[0];
      expect(achievement.progress.current).toBe(25);
    });

    it('should unlock achievement', () => {
      const { addAchievement, unlockAchievement } = useGamificationStore.getState();
      
      addAchievement(mockAchievement);
      unlockAchievement('achievement-1');
      
      const achievement = useGamificationStore.getState().achievements[0];
      expect(achievement.unlocked).toBe(true);
    });

    it('should get unlocked achievements', () => {
      const { addAchievement, unlockAchievement, getUnlockedAchievements } = useGamificationStore.getState();
      
      const achievement1 = { ...mockAchievement, id: 'a1' };
      const achievement2 = { ...mockAchievement, id: 'a2' };
      
      addAchievement(achievement1);
      addAchievement(achievement2);
      
      unlockAchievement('a1');
      
      const unlocked = getUnlockedAchievements();
      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('a1');
    });

    it('should get locked achievements', () => {
      const { addAchievement, unlockAchievement, getLockedAchievements } = useGamificationStore.getState();
      
      const achievement1 = { ...mockAchievement, id: 'a1' };
      const achievement2 = { ...mockAchievement, id: 'a2' };
      
      addAchievement(achievement1);
      addAchievement(achievement2);
      
      unlockAchievement('a1');
      
      const locked = getLockedAchievements();
      expect(locked).toHaveLength(1);
      expect(locked[0].id).toBe('a2');
    });
  });

  describe('Notifications', () => {
    it('should add notification', () => {
      const { addNotification } = useGamificationStore.getState();
      
      addNotification({
        id: 'notif-1',
        type: 'badge',
        title: 'New Badge!',
        message: 'You earned a badge',
        timestamp: new Date().toISOString(),
      });
      
      const state = useGamificationStore.getState();
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0].type).toBe('badge');
    });

    it('should remove notification', () => {
      const { addNotification, removeNotification } = useGamificationStore.getState();
      
      addNotification({
        id: 'notif-1',
        type: 'badge',
        title: 'New Badge!',
        message: 'You earned a badge',
        timestamp: new Date().toISOString(),
      });
      
      expect(useGamificationStore.getState().notifications).toHaveLength(1);
      
      removeNotification('notif-1');
      
      expect(useGamificationStore.getState().notifications).toHaveLength(0);
    });

    it('should clear all notifications', () => {
      const { addNotification, clearNotifications } = useGamificationStore.getState();
      
      addNotification({
        id: 'notif-1',
        type: 'badge',
        title: 'Badge 1',
        message: 'Badge earned',
        timestamp: new Date().toISOString(),
      });
      
      addNotification({
        id: 'notif-2',
        type: 'points',
        title: 'Points',
        message: 'Points earned',
        timestamp: new Date().toISOString(),
      });
      
      expect(useGamificationStore.getState().notifications).toHaveLength(2);
      
      clearNotifications();
      
      expect(useGamificationStore.getState().notifications).toHaveLength(0);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle earning badge and points together', () => {
      const { addPoints, earnBadge, addNotification } = useGamificationStore.getState();
      
      // User writes first review
      addPoints(100, 'review', 'First review');
      
      earnBadge({
        id: 'first-reviewer',
        name: 'First Reviewer',
        description: 'Write your first review',
        icon: '🌟',
        rarity: 'common',
        category: 'review',
        requirements: { type: 'review_count', target: 1 },
      });
      
      addNotification({
        id: 'notif-1',
        type: 'badge',
        title: 'New Badge!',
        message: 'You earned First Reviewer badge!',
        timestamp: new Date().toISOString(),
      });
      
      const state = useGamificationStore.getState();
      
      expect(state.points.total).toBe(100);
      expect(state.badges.earned).toHaveLength(1);
      expect(state.notifications).toHaveLength(1);
    });

    it('should handle tier progression with notifications', () => {
      const { addPoints, updateTier, addNotification } = useGamificationStore.getState();
      
      // Start at bronze
      expect(useGamificationStore.getState().points.tier).toBe('bronze');
      
      // Earn enough points for silver
      addPoints(1500, 'review', 'Multiple reviews');
      updateTier();
      
      addNotification({
        id: 'tier-up',
        type: 'tier',
        title: 'Tier Up!',
        message: 'You reached Silver tier!',
        timestamp: new Date().toISOString(),
      });
      
      const state = useGamificationStore.getState();
      
      expect(state.points.tier).toBe('silver');
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0].type).toBe('tier');
    });
  });
});
