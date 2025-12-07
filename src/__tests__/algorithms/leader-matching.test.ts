/**
 * Leader Matching Algorithm Tests
 *
 * Tests for ZZIK's leader (influencer) matching system:
 * - Audience scoring
 * - Engagement scoring
 * - Category matching
 * - Performance evaluation
 */

import { describe, it, expect } from 'vitest';
import {
  calculateAudienceScore,
  calculateEngagementScore,
  calculateCategoryScore,
  calculatePerformanceScore,
  matchLeadersToCampaign,
  findBestLeader,
  getLeaderTier,
  getTierPricing,
  estimateCampaignCost,
  type Leader,
  type PopupCampaign,
} from '@/lib/algorithms/leader-matching';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const createMockLeader = (overrides: Partial<Leader> = {}): Leader => ({
  id: 'leader-1',
  nickname: 'TestLeader',
  categories: ['fashion'],
  followerCount: 50000,
  avgEngagementRate: 0.05,
  audienceDemo: {
    ageGroups: { '18-24': 0.4, '25-34': 0.35, '35-44': 0.15, '45+': 0.1 },
    genderRatio: { male: 0.3, female: 0.65, other: 0.05 },
    topLocations: ['성수', '강남', '홍대'],
    interests: { fashion: 0.5, beauty: 0.3, lifestyle: 0.2 },
  },
  performance: {
    totalCampaigns: 8,
    successRate: 0.75,
    avgParticipantsGenerated: 500,
    avgConversionRate: 0.015,
    lastCampaignDate: new Date().toISOString(),
  },
  ...overrides,
});

const createMockCampaign = (overrides: Partial<PopupCampaign> = {}): PopupCampaign => ({
  id: 'campaign-1',
  brandName: 'Test Brand',
  category: 'fashion',
  targetAudience: {
    ageGroups: { '18-24': 0.5, '25-34': 0.3, '35-44': 0.15, '45+': 0.05 },
    genderRatio: { male: 0.2, female: 0.75, other: 0.05 },
    topLocations: ['성수'],
    interests: { fashion: 0.6, beauty: 0.25, lifestyle: 0.15 },
  },
  goalParticipants: 100,
  location: '성수',
  priority: 'medium',
  ...overrides,
});

// ============================================================================
// AUDIENCE SCORING
// ============================================================================

describe('Leader Matching - Audience Score', () => {
  it('should return high score for matching demographics', () => {
    const leader = createMockLeader();
    const campaign = createMockCampaign();

    const score = calculateAudienceScore(leader, campaign);

    expect(score).toBeGreaterThan(0.5);
  });

  it('should return higher score for location match', () => {
    const leaderWithLocation = createMockLeader({
      audienceDemo: {
        ageGroups: { '18-24': 0.4, '25-34': 0.35, '35-44': 0.15, '45+': 0.1 },
        genderRatio: { male: 0.3, female: 0.65, other: 0.05 },
        topLocations: ['성수', '강남'],
        interests: { fashion: 0.5, beauty: 0.3, lifestyle: 0.2 },
      },
    });

    const leaderWithoutLocation = createMockLeader({
      audienceDemo: {
        ageGroups: { '18-24': 0.4, '25-34': 0.35, '35-44': 0.15, '45+': 0.1 },
        genderRatio: { male: 0.3, female: 0.65, other: 0.05 },
        topLocations: ['판교', '분당'],
        interests: { fashion: 0.5, beauty: 0.3, lifestyle: 0.2 },
      },
    });

    const campaign = createMockCampaign({ location: '성수' });

    const scoreWith = calculateAudienceScore(leaderWithLocation, campaign);
    const scoreWithout = calculateAudienceScore(leaderWithoutLocation, campaign);

    expect(scoreWith).toBeGreaterThan(scoreWithout);
  });

  it('should return low score for mismatched demographics', () => {
    const leader = createMockLeader({
      audienceDemo: {
        ageGroups: { '45+': 0.8, '35-44': 0.2 },
        genderRatio: { male: 0.8, female: 0.15, other: 0.05 },
        topLocations: ['외곽'],
        interests: { tech: 0.8, gaming: 0.2 },
      },
    });

    const campaign = createMockCampaign({
      targetAudience: {
        ageGroups: { '18-24': 0.8, '25-34': 0.2 },
        genderRatio: { male: 0.2, female: 0.75, other: 0.05 },
        topLocations: ['성수'],
        interests: { fashion: 0.8, beauty: 0.2 },
      },
    });

    const score = calculateAudienceScore(leader, campaign);

    expect(score).toBeLessThan(0.3);
  });
});

// ============================================================================
// ENGAGEMENT SCORING
// ============================================================================

describe('Leader Matching - Engagement Score', () => {
  it('should return high score for high engagement rate', () => {
    const leader = createMockLeader({
      avgEngagementRate: 0.1, // 10% engagement
      followerCount: 100000,
    });

    const score = calculateEngagementScore(leader);

    expect(score).toBeGreaterThan(0.7);
  });

  it('should return low score for low engagement rate', () => {
    const leader = createMockLeader({
      avgEngagementRate: 0.01, // 1% engagement
      followerCount: 10000,
    });

    const score = calculateEngagementScore(leader);

    expect(score).toBeLessThan(0.5);
  });

  it('should balance engagement rate and reach', () => {
    const microInfluencer = createMockLeader({
      avgEngagementRate: 0.12,
      followerCount: 5000,
    });

    const macroInfluencer = createMockLeader({
      avgEngagementRate: 0.03,
      followerCount: 500000,
    });

    const microScore = calculateEngagementScore(microInfluencer);
    const macroScore = calculateEngagementScore(macroInfluencer);

    // Both should have reasonable scores due to trade-off
    expect(microScore).toBeGreaterThan(0.5);
    expect(macroScore).toBeGreaterThan(0.4);
  });
});

// ============================================================================
// CATEGORY SCORING
// ============================================================================

describe('Leader Matching - Category Score', () => {
  it('should return 1.0 for direct category match', () => {
    const leader = createMockLeader({ categories: ['fashion', 'beauty'] });
    const campaign = createMockCampaign({ category: 'fashion' });

    const score = calculateCategoryScore(leader, campaign);

    expect(score).toBe(1.0);
  });

  it('should return 0.6 for related category', () => {
    const leader = createMockLeader({ categories: ['beauty', 'lifestyle'] });
    const campaign = createMockCampaign({ category: 'fashion' });

    const score = calculateCategoryScore(leader, campaign);

    expect(score).toBe(0.6);
  });

  it('should return 0.6 for lifestyle generalist with related category', () => {
    // Fashion has 'lifestyle' as a related category, so lifestyle leaders get 0.6
    const leaderWithLifestyle = createMockLeader({ categories: ['lifestyle'] });
    const fashionCampaign = createMockCampaign({ category: 'fashion' });

    const score = calculateCategoryScore(leaderWithLifestyle, fashionCampaign);

    // Since lifestyle is in fashion's related categories, returns 0.6
    expect(score).toBe(0.6);
  });

  it('should return 0.1 for unrelated category', () => {
    const leader = createMockLeader({ categories: ['gaming'] });
    const campaign = createMockCampaign({ category: 'beauty' });

    const score = calculateCategoryScore(leader, campaign);

    expect(score).toBe(0.1);
  });

  it('should handle kpop category relations', () => {
    const leader = createMockLeader({ categories: ['kpop', 'entertainment'] });
    const campaign = createMockCampaign({ category: 'kpop' });

    const score = calculateCategoryScore(leader, campaign);

    expect(score).toBe(1.0);
  });
});

// ============================================================================
// PERFORMANCE SCORING
// ============================================================================

describe('Leader Matching - Performance Score', () => {
  it('should return high score for experienced successful leader', () => {
    const leader = createMockLeader({
      performance: {
        totalCampaigns: 20,
        successRate: 0.9,
        avgParticipantsGenerated: 1000,
        avgConversionRate: 0.025,
        lastCampaignDate: new Date().toISOString(),
      },
    });

    const score = calculatePerformanceScore(leader);

    expect(score).toBeGreaterThan(0.8);
  });

  it('should return lower score for new leader', () => {
    const leader = createMockLeader({
      performance: {
        totalCampaigns: 2,
        successRate: 0.5,
        avgParticipantsGenerated: 100,
        avgConversionRate: 0.01,
        lastCampaignDate: new Date().toISOString(),
      },
    });

    const score = calculatePerformanceScore(leader);

    expect(score).toBeLessThan(0.6);
  });

  it('should apply recency penalty for inactive leaders', () => {
    const activeLeader = createMockLeader({
      performance: {
        totalCampaigns: 10,
        successRate: 0.8,
        avgParticipantsGenerated: 500,
        avgConversionRate: 0.02,
        lastCampaignDate: new Date().toISOString(),
      },
    });

    const inactiveLeader = createMockLeader({
      performance: {
        totalCampaigns: 10,
        successRate: 0.8,
        avgParticipantsGenerated: 500,
        avgConversionRate: 0.02,
        lastCampaignDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
      },
    });

    const activeScore = calculatePerformanceScore(activeLeader);
    const inactiveScore = calculatePerformanceScore(inactiveLeader);

    expect(activeScore).toBeGreaterThan(inactiveScore);
  });
});

// ============================================================================
// FULL MATCHING
// ============================================================================

describe('Leader Matching - Full Matching', () => {
  it('should return sorted matches by score', () => {
    const leaders: Leader[] = [
      createMockLeader({ id: 'leader-1', nickname: 'Low Match', categories: ['tech'] }),
      createMockLeader({ id: 'leader-2', nickname: 'High Match', categories: ['fashion'] }),
      createMockLeader({ id: 'leader-3', nickname: 'Medium Match', categories: ['beauty'] }),
    ];

    const campaign = createMockCampaign({ category: 'fashion' });
    const matches = matchLeadersToCampaign(campaign, leaders);

    expect(matches.length).toBe(3);
    expect(matches[0].leaderName).toBe('High Match');
    expect(matches[0].matchScore).toBeGreaterThan(matches[1].matchScore);
    expect(matches[1].matchScore).toBeGreaterThan(matches[2].matchScore);
  });

  it('should respect limit parameter', () => {
    const leaders: Leader[] = Array.from({ length: 10 }, (_, i) =>
      createMockLeader({ id: `leader-${i}`, nickname: `Leader ${i}` })
    );

    const campaign = createMockCampaign();
    const matches = matchLeadersToCampaign(campaign, leaders, 3);

    expect(matches.length).toBe(3);
  });

  it('should include score breakdown', () => {
    const leader = createMockLeader();
    const campaign = createMockCampaign();
    const matches = matchLeadersToCampaign(campaign, [leader]);

    expect(matches[0].breakdown).toHaveProperty('audience');
    expect(matches[0].breakdown).toHaveProperty('engagement');
    expect(matches[0].breakdown).toHaveProperty('category');
    expect(matches[0].breakdown).toHaveProperty('performance');
  });

  it('should estimate participants', () => {
    const leader = createMockLeader({
      followerCount: 100000,
      performance: {
        totalCampaigns: 10,
        successRate: 0.8,
        avgParticipantsGenerated: 500,
        avgConversionRate: 0.02,
        lastCampaignDate: new Date().toISOString(),
      },
    });

    const campaign = createMockCampaign();
    const matches = matchLeadersToCampaign(campaign, [leader]);

    expect(matches[0].estimatedParticipants).toBeGreaterThan(0);
  });

  it('should generate match reasons', () => {
    const leader = createMockLeader({
      categories: ['fashion'],
      avgEngagementRate: 0.12,
      followerCount: 150000,
      performance: {
        totalCampaigns: 15,
        successRate: 0.85,
        avgParticipantsGenerated: 800,
        avgConversionRate: 0.02,
        lastCampaignDate: new Date().toISOString(),
      },
    });

    const campaign = createMockCampaign({ category: 'fashion' });
    const matches = matchLeadersToCampaign(campaign, [leader]);

    expect(matches[0].reasons.length).toBeGreaterThan(0);
    expect(matches[0].reasons.some((r) => r.includes('fashion'))).toBe(true);
  });
});

// ============================================================================
// FIND BEST LEADER
// ============================================================================

describe('Leader Matching - Find Best Leader', () => {
  it('should return best matching leader', () => {
    const leaders = [
      createMockLeader({ id: 'leader-1', nickname: 'Low', categories: ['tech'] }),
      createMockLeader({ id: 'leader-2', nickname: 'Best', categories: ['fashion'] }),
    ];

    const campaign = createMockCampaign({ category: 'fashion' });
    const best = findBestLeader(campaign, leaders);

    expect(best).not.toBeNull();
    expect(best?.leaderName).toBe('Best');
  });

  it('should return null for empty leaders array', () => {
    const campaign = createMockCampaign();
    const best = findBestLeader(campaign, []);

    expect(best).toBeNull();
  });
});

// ============================================================================
// LEADER TIER SYSTEM
// ============================================================================

describe('Leader Matching - Tier System', () => {
  it('should classify leaders into correct tiers', () => {
    expect(getLeaderTier(500)).toBe('nano');
    expect(getLeaderTier(5000)).toBe('micro');
    expect(getLeaderTier(50000)).toBe('mid');
    expect(getLeaderTier(500000)).toBe('macro');
    expect(getLeaderTier(5000000)).toBe('mega');
  });

  it('should return tier pricing', () => {
    const nanoPricing = getTierPricing('nano');
    const megaPricing = getTierPricing('mega');

    expect(nanoPricing.min).toBeLessThan(megaPricing.min);
    expect(nanoPricing.max).toBeLessThan(megaPricing.max);
  });

  it('should estimate campaign cost', () => {
    const leader = createMockLeader({ followerCount: 100000 }); // macro
    const campaign = createMockCampaign({ priority: 'medium' });

    const cost = estimateCampaignCost(leader, campaign);

    expect(cost.estimated).toBeGreaterThan(0);
    expect(cost.range.min).toBeLessThan(cost.range.max);
    expect(cost.estimated).toBeGreaterThanOrEqual(cost.range.min);
    expect(cost.estimated).toBeLessThanOrEqual(cost.range.max);
  });

  it('should apply priority multiplier to cost', () => {
    const leader = createMockLeader({ followerCount: 50000 });

    const lowPriorityCost = estimateCampaignCost(leader, createMockCampaign({ priority: 'low' }));
    const highPriorityCost = estimateCampaignCost(leader, createMockCampaign({ priority: 'high' }));

    expect(highPriorityCost.estimated).toBeGreaterThan(lowPriorityCost.estimated);
  });

  it('should apply category premium for fashion/beauty', () => {
    const leader = createMockLeader({ followerCount: 50000 });

    const fashionCost = estimateCampaignCost(leader, createMockCampaign({ category: 'fashion' }));
    const techCost = estimateCampaignCost(leader, createMockCampaign({ category: 'tech' }));

    expect(fashionCost.estimated).toBeGreaterThan(techCost.estimated);
  });
});
