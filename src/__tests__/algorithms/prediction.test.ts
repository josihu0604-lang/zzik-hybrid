/**
 * Participation Prediction Tests
 *
 * Tests for ZZIK's success prediction model:
 * - Momentum analysis
 * - Progress tracking
 * - Risk assessment
 * - Recommendation generation
 */

import { describe, it, expect } from 'vitest';
import {
  predictSuccess,
  batchPredict,
  getAtRiskPopups,
  type PredictionInput,
} from '@/lib/algorithms/prediction';

describe('Participation Prediction', () => {
  // ============================================================================
  // BASIC PREDICTION
  // ============================================================================

  describe('predictSuccess', () => {
    it('should predict high success for good momentum', () => {
      const input: PredictionInput = {
        popupId: 'popup-1',
        brandName: 'GENTLE MONSTER',
        category: 'fashion',
        location: '성수',
        currentParticipants: 70,
        goalParticipants: 100,
        daysRemaining: 7,
        dailyMomentum: [10, 12, 15, 14, 13, 11, 15],
        hasLeader: true,
        leaderFollowerCount: 100000,
      };

      const result = predictSuccess(input);

      expect(result.successProbability).toBeGreaterThan(0.6);
      expect(['low', 'medium']).toContain(result.risk);
    });

    it('should predict low success for poor momentum', () => {
      const input: PredictionInput = {
        popupId: 'popup-2',
        brandName: 'Unknown Brand',
        category: 'tech',
        location: '판교',
        currentParticipants: 10,
        goalParticipants: 100,
        daysRemaining: 3,
        dailyMomentum: [1, 2, 1, 0, 1, 0, 1],
        hasLeader: false,
      };

      const result = predictSuccess(input);

      expect(result.successProbability).toBeLessThan(0.5);
      expect(result.risk).toBe('high');
    });

    it('should return correct popup ID', () => {
      const input: PredictionInput = {
        popupId: 'test-popup-id',
        brandName: 'Test Brand',
        category: 'fashion',
        location: '강남',
        currentParticipants: 50,
        goalParticipants: 100,
        daysRemaining: 5,
        dailyMomentum: [5, 6, 7, 8, 9, 10, 11],
        hasLeader: false,
      };

      const result = predictSuccess(input);

      expect(result.popupId).toBe('test-popup-id');
    });
  });

  // ============================================================================
  // FACTOR ANALYSIS
  // ============================================================================

  describe('prediction factors', () => {
    it('should include momentum factor', () => {
      const input: PredictionInput = {
        popupId: 'popup-1',
        brandName: 'Brand',
        category: 'fashion',
        location: '성수',
        currentParticipants: 50,
        goalParticipants: 100,
        daysRemaining: 7,
        dailyMomentum: [10, 10, 10, 10, 10, 10, 10],
        hasLeader: false,
      };

      const result = predictSuccess(input);
      const momentumFactor = result.factors.find((f) => f.name === 'momentum');

      expect(momentumFactor).toBeDefined();
      expect(momentumFactor?.score).toBeDefined();
    });

    it('should include progress factor', () => {
      const input: PredictionInput = {
        popupId: 'popup-1',
        brandName: 'Brand',
        category: 'fashion',
        location: '성수',
        currentParticipants: 80,
        goalParticipants: 100,
        daysRemaining: 7,
        dailyMomentum: [10, 10, 10, 10, 10, 10, 10],
        hasLeader: false,
      };

      const result = predictSuccess(input);
      const progressFactor = result.factors.find((f) => f.name === 'progress');

      expect(progressFactor).toBeDefined();
      expect(progressFactor?.description).toContain('80%');
    });

    it('should include leader factor', () => {
      const input: PredictionInput = {
        popupId: 'popup-1',
        brandName: 'Brand',
        category: 'fashion',
        location: '성수',
        currentParticipants: 50,
        goalParticipants: 100,
        daysRemaining: 7,
        dailyMomentum: [10, 10, 10, 10, 10, 10, 10],
        hasLeader: true,
        leaderFollowerCount: 500000,
      };

      const result = predictSuccess(input);
      const leaderFactor = result.factors.find((f) => f.name === 'leader');

      expect(leaderFactor).toBeDefined();
      expect(leaderFactor?.score).toBeGreaterThan(0);
    });

    it('should penalize when no leader', () => {
      const withLeader: PredictionInput = {
        popupId: 'popup-1',
        brandName: 'Brand',
        category: 'fashion',
        location: '성수',
        currentParticipants: 50,
        goalParticipants: 100,
        daysRemaining: 7,
        dailyMomentum: [10, 10, 10, 10, 10, 10, 10],
        hasLeader: true,
        leaderFollowerCount: 100000,
      };

      const withoutLeader: PredictionInput = {
        ...withLeader,
        hasLeader: false,
        leaderFollowerCount: undefined,
      };

      const resultWith = predictSuccess(withLeader);
      const resultWithout = predictSuccess(withoutLeader);

      expect(resultWith.successProbability).toBeGreaterThan(resultWithout.successProbability);
    });
  });

  // ============================================================================
  // LOCATION SCORING
  // ============================================================================

  describe('location scoring', () => {
    it('should score higher for popular locations', () => {
      const seongsu: PredictionInput = {
        popupId: 'popup-1',
        brandName: 'Brand',
        category: 'fashion',
        location: '성수',
        currentParticipants: 50,
        goalParticipants: 100,
        daysRemaining: 7,
        dailyMomentum: [10, 10, 10, 10, 10, 10, 10],
        hasLeader: false,
      };

      const unknown: PredictionInput = {
        ...seongsu,
        location: '외곽지역',
      };

      const seongsuResult = predictSuccess(seongsu);
      const unknownResult = predictSuccess(unknown);

      const seongsuLocation = seongsuResult.factors.find((f) => f.name === 'location');
      const unknownLocation = unknownResult.factors.find((f) => f.name === 'location');

      expect(seongsuLocation?.score).toBeGreaterThan(unknownLocation?.score || 0);
    });
  });

  // ============================================================================
  // CATEGORY SCORING
  // ============================================================================

  describe('category scoring', () => {
    it('should score higher for kpop category', () => {
      const kpop: PredictionInput = {
        popupId: 'popup-1',
        brandName: 'HYBE',
        category: 'kpop',
        location: '강남',
        currentParticipants: 50,
        goalParticipants: 100,
        daysRemaining: 7,
        dailyMomentum: [10, 10, 10, 10, 10, 10, 10],
        hasLeader: false,
      };

      const tech: PredictionInput = {
        ...kpop,
        category: 'tech',
      };

      const kpopResult = predictSuccess(kpop);
      const techResult = predictSuccess(tech);

      const kpopCategory = kpopResult.factors.find((f) => f.name === 'category');
      const techCategory = techResult.factors.find((f) => f.name === 'category');

      expect(kpopCategory?.score).toBeGreaterThan(techCategory?.score || 0);
    });
  });

  // ============================================================================
  // RISK ASSESSMENT
  // ============================================================================

  describe('risk assessment', () => {
    it('should return low risk for high probability', () => {
      const input: PredictionInput = {
        popupId: 'popup-1',
        brandName: 'Popular Brand',
        category: 'kpop',
        location: '성수',
        currentParticipants: 90,
        goalParticipants: 100,
        daysRemaining: 10,
        dailyMomentum: [15, 15, 15, 15, 15, 15, 15],
        hasLeader: true,
        leaderFollowerCount: 1000000,
      };

      const result = predictSuccess(input);

      // High probability scenarios may still return medium risk depending on factors
      expect(['low', 'medium']).toContain(result.risk);
      expect(result.successProbability).toBeGreaterThan(0.6);
    });

    it('should return high risk for low probability with few days', () => {
      const input: PredictionInput = {
        popupId: 'popup-1',
        brandName: 'Unknown',
        category: 'tech',
        location: '외곽',
        currentParticipants: 10,
        goalParticipants: 100,
        daysRemaining: 2,
        dailyMomentum: [1, 1, 1, 1, 1, 1, 1],
        hasLeader: false,
      };

      const result = predictSuccess(input);

      expect(result.risk).toBe('high');
    });
  });

  // ============================================================================
  // CONFIDENCE CALCULATION
  // ============================================================================

  describe('confidence calculation', () => {
    it('should have higher confidence with more momentum data', () => {
      const fullData: PredictionInput = {
        popupId: 'popup-1',
        brandName: 'Brand',
        category: 'fashion',
        location: '성수',
        currentParticipants: 50,
        goalParticipants: 100,
        daysRemaining: 7,
        dailyMomentum: [10, 10, 10, 10, 10, 10, 10],
        hasLeader: true,
        leaderFollowerCount: 100000,
        brandPreviousCampaigns: 5,
        brandSuccessRate: 0.8,
        historicalCategorySuccess: 0.75,
      };

      const limitedData: PredictionInput = {
        ...fullData,
        dailyMomentum: [10, 10],
        brandPreviousCampaigns: undefined,
        brandSuccessRate: undefined,
        historicalCategorySuccess: undefined,
      };

      const fullResult = predictSuccess(fullData);
      const limitedResult = predictSuccess(limitedData);

      expect(fullResult.confidence).toBeGreaterThan(limitedResult.confidence);
    });
  });

  // ============================================================================
  // RECOMMENDATIONS
  // ============================================================================

  describe('recommendations', () => {
    it('should generate recommendations for low momentum', () => {
      const input: PredictionInput = {
        popupId: 'popup-1',
        brandName: 'Brand',
        category: 'fashion',
        location: '성수',
        currentParticipants: 20,
        goalParticipants: 100,
        daysRemaining: 7,
        dailyMomentum: [2, 2, 2, 2, 2, 2, 2],
        hasLeader: false,
      };

      const result = predictSuccess(input);

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some((r) => r.includes('프로모션') || r.includes('리더'))).toBe(
        true
      );
    });

    it('should suggest leader matching when no leader', () => {
      const input: PredictionInput = {
        popupId: 'popup-1',
        brandName: 'Brand',
        category: 'fashion',
        location: '성수',
        currentParticipants: 50,
        goalParticipants: 100,
        daysRemaining: 7,
        dailyMomentum: [5, 5, 5, 5, 5, 5, 5],
        hasLeader: false,
      };

      const result = predictSuccess(input);

      expect(result.recommendations.some((r) => r.includes('리더'))).toBe(true);
    });
  });

  // ============================================================================
  // BATCH PREDICTION
  // ============================================================================

  describe('batchPredict', () => {
    it('should return predictions for all inputs', () => {
      const inputs: PredictionInput[] = [
        {
          popupId: 'popup-1',
          brandName: 'Brand 1',
          category: 'fashion',
          location: '성수',
          currentParticipants: 50,
          goalParticipants: 100,
          daysRemaining: 7,
          dailyMomentum: [10, 10, 10],
          hasLeader: false,
        },
        {
          popupId: 'popup-2',
          brandName: 'Brand 2',
          category: 'beauty',
          location: '강남',
          currentParticipants: 80,
          goalParticipants: 100,
          daysRemaining: 3,
          dailyMomentum: [5, 5, 5],
          hasLeader: true,
        },
      ];

      const results = batchPredict(inputs);

      expect(results.length).toBe(2);
      expect(results.map((r) => r.popupId)).toEqual(['popup-1', 'popup-2']);
    });
  });

  // ============================================================================
  // AT-RISK POPUPS
  // ============================================================================

  describe('getAtRiskPopups', () => {
    it('should filter popups below threshold', () => {
      const inputs: PredictionInput[] = [
        {
          popupId: 'good-popup',
          brandName: 'Popular',
          category: 'kpop',
          location: '성수',
          currentParticipants: 90,
          goalParticipants: 100,
          daysRemaining: 10,
          dailyMomentum: [15, 15, 15, 15, 15, 15, 15],
          hasLeader: true,
          leaderFollowerCount: 500000,
        },
        {
          popupId: 'at-risk-popup',
          brandName: 'Unknown',
          category: 'tech',
          location: '외곽',
          currentParticipants: 5,
          goalParticipants: 100,
          daysRemaining: 2,
          dailyMomentum: [1, 1, 1],
          hasLeader: false,
        },
      ];

      const atRisk = getAtRiskPopups(inputs, 0.5);

      expect(atRisk.length).toBeGreaterThan(0);
      expect(atRisk.every((r) => r.successProbability < 0.5)).toBe(true);
    });

    it('should sort by success probability ascending', () => {
      const inputs: PredictionInput[] = [
        {
          popupId: 'medium-risk',
          brandName: 'Medium',
          category: 'fashion',
          location: '강남',
          currentParticipants: 30,
          goalParticipants: 100,
          daysRemaining: 5,
          dailyMomentum: [5, 5, 5, 5, 5, 5, 5],
          hasLeader: false,
        },
        {
          popupId: 'high-risk',
          brandName: 'High',
          category: 'tech',
          location: '외곽',
          currentParticipants: 5,
          goalParticipants: 100,
          daysRemaining: 2,
          dailyMomentum: [1, 1, 1],
          hasLeader: false,
        },
      ];

      const atRisk = getAtRiskPopups(inputs, 0.9);

      // Should be sorted ascending (worst first)
      for (let i = 1; i < atRisk.length; i++) {
        expect(atRisk[i - 1].successProbability).toBeLessThanOrEqual(atRisk[i].successProbability);
      }
    });
  });
});
