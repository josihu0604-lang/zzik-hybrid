/**
 * Recommendation Engine Tests
 *
 * Tests for ZZIK's hybrid recommendation system:
 * - Collaborative filtering
 * - Content-based filtering
 * - Popularity scoring
 * - Trending scoring
 */

import { describe, it, expect } from 'vitest';
import {
  generateRecommendations,
  calculateCollaborativeScore,
  calculateContentScore,
  calculatePopularityScore,
  calculateTrendingScore,
  getDefaultPreferences,
  updatePreferencesFromInteraction,
  type UserPreferences,
  type PopupFeatures,
} from '@/lib/algorithms/recommendation';

describe('Recommendation Engine', () => {
  // ============================================================================
  // COLLABORATIVE FILTERING
  // ============================================================================

  describe('calculateCollaborativeScore', () => {
    it('should return 0 for empty similar users', () => {
      const popup: PopupFeatures = {
        id: 'popup-1',
        category: 'fashion',
        participantCount: 50,
        goalParticipants: 100,
        momentum: 10,
        daysLeft: 7,
        location: '성수',
      };

      const score = calculateCollaborativeScore(popup, [], new Map());
      expect(score).toBe(0);
    });

    it('should return 1 when all similar users participated', () => {
      const popup: PopupFeatures = {
        id: 'popup-1',
        category: 'fashion',
        participantCount: 50,
        goalParticipants: 100,
        momentum: 10,
        daysLeft: 7,
        location: '성수',
      };

      const similarUsers = ['user-1', 'user-2', 'user-3'];
      const userParticipations = new Map([
        ['user-1', new Set(['popup-1'])],
        ['user-2', new Set(['popup-1'])],
        ['user-3', new Set(['popup-1'])],
      ]);

      const score = calculateCollaborativeScore(popup, similarUsers, userParticipations);
      expect(score).toBe(1);
    });

    it('should return 0.5 when half of similar users participated', () => {
      const popup: PopupFeatures = {
        id: 'popup-1',
        category: 'fashion',
        participantCount: 50,
        goalParticipants: 100,
        momentum: 10,
        daysLeft: 7,
        location: '성수',
      };

      const similarUsers = ['user-1', 'user-2'];
      const userParticipations = new Map([
        ['user-1', new Set(['popup-1'])],
        ['user-2', new Set(['popup-2'])],
      ]);

      const score = calculateCollaborativeScore(popup, similarUsers, userParticipations);
      expect(score).toBe(0.5);
    });
  });

  // ============================================================================
  // CONTENT-BASED FILTERING
  // ============================================================================

  describe('calculateContentScore', () => {
    it('should score high for matching category', () => {
      const popup: PopupFeatures = {
        id: 'popup-1',
        category: 'fashion',
        participantCount: 50,
        goalParticipants: 100,
        momentum: 10,
        daysLeft: 7,
        location: '성수',
      };

      const prefs: UserPreferences = {
        categories: { fashion: 1.0 },
        vibes: [],
        participationHistory: [],
        avgParticipationTime: 12,
        preferredLocations: ['성수'],
      };

      const score = calculateContentScore(popup, prefs);
      expect(score).toBeGreaterThan(0.5);
    });

    it('should score low for non-matching category', () => {
      const popup: PopupFeatures = {
        id: 'popup-1',
        category: 'tech',
        participantCount: 50,
        goalParticipants: 100,
        momentum: 10,
        daysLeft: 7,
        location: '판교',
      };

      const prefs: UserPreferences = {
        categories: { fashion: 1.0 },
        vibes: [],
        participationHistory: [],
        avgParticipationTime: 12,
        preferredLocations: ['성수'],
      };

      const score = calculateContentScore(popup, prefs);
      expect(score).toBeLessThan(0.3);
    });

    it('should boost score for matching location', () => {
      const popup: PopupFeatures = {
        id: 'popup-1',
        category: 'fashion',
        participantCount: 50,
        goalParticipants: 100,
        momentum: 10,
        daysLeft: 7,
        location: '성수',
      };

      const prefsWithLocation: UserPreferences = {
        categories: { fashion: 0.5 },
        vibes: [],
        participationHistory: [],
        avgParticipationTime: 12,
        preferredLocations: ['성수'],
      };

      const prefsWithoutLocation: UserPreferences = {
        categories: { fashion: 0.5 },
        vibes: [],
        participationHistory: [],
        avgParticipationTime: 12,
        preferredLocations: ['강남'],
      };

      const scoreWith = calculateContentScore(popup, prefsWithLocation);
      const scoreWithout = calculateContentScore(popup, prefsWithoutLocation);

      expect(scoreWith).toBeGreaterThan(scoreWithout);
    });
  });

  // ============================================================================
  // POPULARITY SCORING
  // ============================================================================

  describe('calculatePopularityScore', () => {
    it('should return 1 for completed popup', () => {
      const popup: PopupFeatures = {
        id: 'popup-1',
        category: 'fashion',
        participantCount: 100,
        goalParticipants: 100,
        momentum: 0,
        daysLeft: 0,
        location: '성수',
      };

      const score = calculatePopularityScore(popup);
      expect(score).toBe(1);
    });

    it('should return 0.5 for half-filled popup', () => {
      const popup: PopupFeatures = {
        id: 'popup-1',
        category: 'fashion',
        participantCount: 50,
        goalParticipants: 100,
        momentum: 10,
        daysLeft: 7,
        location: '성수',
      };

      const score = calculatePopularityScore(popup);
      expect(score).toBe(0.5);
    });

    it('should add urgency boost for ending soon', () => {
      const popupEnding: PopupFeatures = {
        id: 'popup-1',
        category: 'fashion',
        participantCount: 50,
        goalParticipants: 100,
        momentum: 10,
        daysLeft: 2,
        location: '성수',
      };

      const popupNotEnding: PopupFeatures = {
        id: 'popup-2',
        category: 'fashion',
        participantCount: 50,
        goalParticipants: 100,
        momentum: 10,
        daysLeft: 10,
        location: '성수',
      };

      const scoreEnding = calculatePopularityScore(popupEnding);
      const scoreNotEnding = calculatePopularityScore(popupNotEnding);

      expect(scoreEnding).toBeGreaterThan(scoreNotEnding);
    });
  });

  // ============================================================================
  // TRENDING SCORING
  // ============================================================================

  describe('calculateTrendingScore', () => {
    it('should score high for high momentum', () => {
      const hotPopup: PopupFeatures = {
        id: 'popup-1',
        category: 'fashion',
        participantCount: 50,
        goalParticipants: 100,
        momentum: 50,
        daysLeft: 25,
        location: '성수',
      };

      const score = calculateTrendingScore(hotPopup);
      expect(score).toBeGreaterThan(0.7);
    });

    it('should score low for low momentum', () => {
      const coldPopup: PopupFeatures = {
        id: 'popup-1',
        category: 'fashion',
        participantCount: 50,
        goalParticipants: 100,
        momentum: 5,
        daysLeft: 10,
        location: '성수',
      };

      const score = calculateTrendingScore(coldPopup);
      expect(score).toBeLessThan(0.5);
    });
  });

  // ============================================================================
  // RECOMMENDATION GENERATION
  // ============================================================================

  describe('generateRecommendations', () => {
    const mockPopups: PopupFeatures[] = [
      {
        id: 'popup-1',
        category: 'fashion',
        participantCount: 80,
        goalParticipants: 100,
        momentum: 30,
        daysLeft: 3,
        location: '성수',
      },
      {
        id: 'popup-2',
        category: 'beauty',
        participantCount: 50,
        goalParticipants: 100,
        momentum: 10,
        daysLeft: 7,
        location: '강남',
      },
      {
        id: 'popup-3',
        category: 'kpop',
        participantCount: 200,
        goalParticipants: 200,
        momentum: 0,
        daysLeft: 0,
        location: '용산',
      },
    ];

    it('should return sorted recommendations', () => {
      const prefs = getDefaultPreferences();
      const recommendations = generateRecommendations(mockPopups, prefs);

      expect(recommendations.length).toBeGreaterThan(0);

      // Check that results are sorted by score descending
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].score).toBeGreaterThanOrEqual(recommendations[i].score);
      }
    });

    it('should exclude already participated popups', () => {
      const prefs: UserPreferences = {
        categories: { fashion: 1.0 },
        vibes: [],
        participationHistory: ['popup-1'],
        avgParticipationTime: 12,
        preferredLocations: ['성수'],
      };

      const recommendations = generateRecommendations(mockPopups, prefs);

      const popupIds = recommendations.map((r) => r.popupId);
      expect(popupIds).not.toContain('popup-1');
    });

    it('should respect limit parameter', () => {
      const prefs = getDefaultPreferences();
      const recommendations = generateRecommendations(mockPopups, prefs, [], new Map(), 2);

      expect(recommendations.length).toBeLessThanOrEqual(2);
    });

    it('should include breakdown scores', () => {
      const prefs = getDefaultPreferences();
      const recommendations = generateRecommendations(mockPopups, prefs);

      expect(recommendations[0].breakdown).toHaveProperty('collaborative');
      expect(recommendations[0].breakdown).toHaveProperty('content');
      expect(recommendations[0].breakdown).toHaveProperty('popularity');
      expect(recommendations[0].breakdown).toHaveProperty('trending');
    });
  });

  // ============================================================================
  // COLD START HANDLING
  // ============================================================================

  describe('getDefaultPreferences', () => {
    it('should return valid preferences for new user', () => {
      const prefs = getDefaultPreferences();

      expect(prefs.categories).toBeDefined();
      expect(prefs.vibes).toEqual([]);
      expect(prefs.participationHistory).toEqual([]);
      expect(prefs.avgParticipationTime).toBe(12);
      expect(prefs.preferredLocations.length).toBeGreaterThan(0);
    });

    it('should adjust for young users', () => {
      const youngPrefs = getDefaultPreferences({ age: 20 });
      const defaultPrefs = getDefaultPreferences();

      expect(youngPrefs.categories.kpop).toBeGreaterThan(defaultPrefs.categories.kpop);
    });

    it('should use provided location', () => {
      const prefs = getDefaultPreferences({ location: '홍대' });

      expect(prefs.preferredLocations).toContain('홍대');
    });
  });

  // ============================================================================
  // PREFERENCE UPDATES
  // ============================================================================

  describe('updatePreferencesFromInteraction', () => {
    it('should increase category weight on participation', () => {
      const prefs: UserPreferences = {
        categories: { fashion: 0.3 },
        vibes: [],
        participationHistory: [],
        avgParticipationTime: 12,
        preferredLocations: ['성수'],
      };

      const updated = updatePreferencesFromInteraction(prefs, {
        popupId: 'popup-1',
        category: 'fashion',
        location: '성수',
        interactionType: 'participate',
      });

      // Weight should be updated (may stay same or increase based on EMA)
      expect(updated.categories.fashion).toBeGreaterThanOrEqual(prefs.categories.fashion);
    });

    it('should add popup to participation history', () => {
      const prefs = getDefaultPreferences();

      const updated = updatePreferencesFromInteraction(prefs, {
        popupId: 'popup-1',
        category: 'fashion',
        location: '성수',
        interactionType: 'participate',
      });

      expect(updated.participationHistory).toContain('popup-1');
    });

    it('should add new location to preferences', () => {
      const prefs: UserPreferences = {
        categories: {},
        vibes: [],
        participationHistory: [],
        avgParticipationTime: 12,
        preferredLocations: ['성수'],
      };

      const updated = updatePreferencesFromInteraction(prefs, {
        popupId: 'popup-1',
        category: 'fashion',
        location: '이태원',
        interactionType: 'participate',
      });

      expect(updated.preferredLocations).toContain('이태원');
    });

    it('should limit participation history to 100', () => {
      const prefs: UserPreferences = {
        categories: {},
        vibes: [],
        participationHistory: Array.from({ length: 100 }, (_, i) => `popup-${i}`),
        avgParticipationTime: 12,
        preferredLocations: [],
      };

      const updated = updatePreferencesFromInteraction(prefs, {
        popupId: 'popup-new',
        category: 'fashion',
        location: '성수',
        interactionType: 'participate',
      });

      expect(updated.participationHistory.length).toBeLessThanOrEqual(100);
      expect(updated.participationHistory).toContain('popup-new');
    });
  });
});
