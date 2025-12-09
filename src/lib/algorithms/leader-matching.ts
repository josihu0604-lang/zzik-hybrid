/**
 * ZZIK Leader Matching Algorithm
 *
 * Matches popup campaigns with optimal influencers (leaders)
 * based on audience fit, engagement history, and category expertise.
 *
 * Formula: Match = Audience(40%) + Engagement(30%) + Category(20%) + Performance(10%)
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Leader {
  id: string;
  nickname: string;
  categories: string[]; // expertise categories
  followerCount: number;
  avgEngagementRate: number; // 0-1
  audienceDemo: AudienceDemographics;
  performance: LeaderPerformance;
  location?: string;
}

export interface AudienceDemographics {
  ageGroups: Record<string, number>; // '18-24': 0.4, '25-34': 0.3, etc.
  genderRatio: { male: number; female: number; other: number };
  topLocations: string[];
  interests: Record<string, number>; // category -> weight
}

export interface LeaderPerformance {
  totalCampaigns: number;
  successRate: number; // % of campaigns that reached goal
  avgParticipantsGenerated: number;
  avgConversionRate: number; // % of followers who participated
  lastCampaignDate?: string;
}

export interface PopupCampaign {
  id: string;
  brandName: string;
  category: string;
  targetAudience: AudienceDemographics;
  goalParticipants: number;
  budget?: number;
  location: string;
  priority: 'low' | 'medium' | 'high';
}

export interface LeaderMatchResult {
  leaderId: string;
  leaderName: string;
  matchScore: number;
  breakdown: {
    audience: number;
    engagement: number;
    category: number;
    performance: number;
  };
  estimatedParticipants: number;
  estimatedCost?: number;
  reasons: string[];
}

// ============================================================================
// WEIGHTS
// ============================================================================

const WEIGHTS = {
  audience: 0.4,
  engagement: 0.3,
  category: 0.2,
  performance: 0.1,
} as const;

// ============================================================================
// CORE ALGORITHMS
// ============================================================================

/**
 * Calculate audience fit score
 * Based on demographic overlap and interest alignment
 */
export function calculateAudienceScore(leader: Leader, campaign: PopupCampaign): number {
  // Age group overlap
  const ageOverlap = Object.entries(campaign.targetAudience.ageGroups).reduce(
    (score, [ageGroup, targetWeight]) => {
      const leaderWeight = leader.audienceDemo.ageGroups[ageGroup] || 0;
      return score + Math.min(targetWeight, leaderWeight);
    },
    0
  );

  // Interest alignment
  const interestScore = Object.entries(campaign.targetAudience.interests).reduce(
    (score, [interest, weight]) => {
      const leaderInterest = leader.audienceDemo.interests[interest] || 0;
      return score + Math.min(weight, leaderInterest);
    },
    0
  );

  // Normalize scores
  const totalTargetAge = Object.values(campaign.targetAudience.ageGroups).reduce(
    (a, b) => a + b,
    0
  );
  const totalTargetInterest = Object.values(campaign.targetAudience.interests).reduce(
    (a, b) => a + b,
    0
  );

  const normalizedAge = totalTargetAge > 0 ? ageOverlap / totalTargetAge : 0;
  const normalizedInterest = totalTargetInterest > 0 ? interestScore / totalTargetInterest : 0;

  // Location match
  const locationMatch = leader.audienceDemo.topLocations.some((loc) =>
    campaign.location.toLowerCase().includes(loc.toLowerCase())
  )
    ? 0.2
    : 0;

  return normalizedAge * 0.4 + normalizedInterest * 0.4 + locationMatch * 0.2;
}

/**
 * Calculate engagement score
 * Based on engagement rate and reach
 */
export function calculateEngagementScore(leader: Leader): number {
  // Engagement rate score (10%+ is excellent)
  const engagementScore = Math.min(1, leader.avgEngagementRate / 0.1);

  // Reach score (logarithmic scale - 1M followers = max)
  const reachScore = Math.min(1, Math.log10(leader.followerCount + 1) / 6);

  // Balance between quality (engagement) and quantity (reach)
  return engagementScore * 0.7 + reachScore * 0.3;
}

/**
 * Calculate category expertise score
 * Based on category match and specialization
 */
export function calculateCategoryScore(leader: Leader, campaign: PopupCampaign): number {
  // Direct category match
  const directMatch = leader.categories.includes(campaign.category);
  if (directMatch) return 1.0;

  // Related category match
  const relatedCategories: Record<string, string[]> = {
    fashion: ['beauty', 'lifestyle'],
    beauty: ['fashion', 'lifestyle'],
    kpop: ['culture', 'lifestyle', 'entertainment'],
    food: ['cafe', 'lifestyle', 'travel'],
    cafe: ['food', 'lifestyle'],
    culture: ['kpop', 'lifestyle', 'art'],
    tech: ['lifestyle', 'gaming'],
  };

  const related = relatedCategories[campaign.category] || [];
  const hasRelated = leader.categories.some((cat) => related.includes(cat));
  if (hasRelated) return 0.6;

  // General lifestyle match
  if (leader.categories.includes('lifestyle')) return 0.3;

  return 0.1;
}

/**
 * Calculate performance score
 * Based on historical campaign success
 */
export function calculatePerformanceScore(leader: Leader): number {
  const perf = leader.performance;

  // Success rate (target: 80%+)
  const successScore = Math.min(1, perf.successRate / 0.8);

  // Experience (10+ campaigns = experienced)
  const experienceScore = Math.min(1, perf.totalCampaigns / 10);

  // Conversion rate (2%+ is good)
  const conversionScore = Math.min(1, perf.avgConversionRate / 0.02);

  // Recency penalty (no campaign in 30 days = penalty)
  let recencyScore = 1;
  if (perf.lastCampaignDate) {
    const daysSinceLast = Math.floor(
      (Date.now() - new Date(perf.lastCampaignDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    recencyScore = daysSinceLast > 30 ? 0.8 : 1;
  }

  return successScore * 0.4 + experienceScore * 0.2 + conversionScore * 0.3 + recencyScore * 0.1;
}

/**
 * Match leaders to a popup campaign
 */
export function matchLeadersToCampaign(
  campaign: PopupCampaign,
  leaders: Leader[],
  limit: number = 5
): LeaderMatchResult[] {
  const results: LeaderMatchResult[] = [];

  for (const leader of leaders) {
    const audience = calculateAudienceScore(leader, campaign);
    const engagement = calculateEngagementScore(leader);
    const category = calculateCategoryScore(leader, campaign);
    const performance = calculatePerformanceScore(leader);

    const score =
      audience * WEIGHTS.audience +
      engagement * WEIGHTS.engagement +
      category * WEIGHTS.category +
      performance * WEIGHTS.performance;

    // Estimate participants based on conversion
    const estimatedParticipants = Math.round(
      (leader.followerCount * leader.performance.avgConversionRate * (audience + category)) / 2
    );

    results.push({
      leaderId: leader.id,
      leaderName: leader.nickname,
      matchScore: score,
      breakdown: { audience, engagement, category, performance },
      estimatedParticipants,
      reasons: generateMatchReasons(leader, campaign, {
        audience,
        engagement,
        category,
        performance,
      }),
    });
  }

  // Sort by score descending
  results.sort((a, b) => b.matchScore - a.matchScore);

  return results.slice(0, limit);
}

/**
 * Find optimal leader for quick matching
 */
export function findBestLeader(
  campaign: PopupCampaign,
  leaders: Leader[]
): LeaderMatchResult | null {
  const matches = matchLeadersToCampaign(campaign, leaders, 1);
  return matches[0] || null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateMatchReasons(
  leader: Leader,
  campaign: PopupCampaign,
  scores: { audience: number; engagement: number; category: number; performance: number }
): string[] {
  const reasons: string[] = [];

  if (scores.category >= 0.8) {
    reasons.push(`${campaign.category} 전문 인플루언서`);
  }

  if (scores.audience >= 0.7) {
    reasons.push('타겟 오디언스와 높은 일치');
  }

  if (scores.engagement >= 0.8) {
    reasons.push(`평균 ${(leader.avgEngagementRate * 100).toFixed(1)}% 참여율`);
  }

  if (leader.performance.successRate >= 0.8) {
    reasons.push(`${Math.round(leader.performance.successRate * 100)}% 캠페인 성공률`);
  }

  if (leader.followerCount >= 100000) {
    reasons.push(`${formatFollowers(leader.followerCount)} 팔로워`);
  }

  return reasons.length > 0 ? reasons : ['매칭 리더'];
}

function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

// ============================================================================
// LEADER TIER SYSTEM
// ============================================================================

export type LeaderTier = 'nano' | 'micro' | 'mid' | 'macro' | 'mega';

export function getLeaderTier(followerCount: number): LeaderTier {
  if (followerCount >= 1000000) return 'mega';
  if (followerCount >= 100000) return 'macro';
  if (followerCount >= 10000) return 'mid';
  if (followerCount >= 1000) return 'micro';
  return 'nano';
}

export function getTierPricing(tier: LeaderTier): { min: number; max: number } {
  const pricing: Record<LeaderTier, { min: number; max: number }> = {
    nano: { min: 50000, max: 200000 },
    micro: { min: 200000, max: 500000 },
    mid: { min: 500000, max: 2000000 },
    macro: { min: 2000000, max: 10000000 },
    mega: { min: 10000000, max: 50000000 },
  };
  return pricing[tier];
}

export function estimateCampaignCost(
  leader: Leader,
  campaign: PopupCampaign
): { estimated: number; range: { min: number; max: number } } {
  const tier = getLeaderTier(leader.followerCount);
  const pricing = getTierPricing(tier);

  // Adjust based on campaign priority
  const priorityMultiplier = {
    low: 0.8,
    medium: 1.0,
    high: 1.3,
  }[campaign.priority];

  // Category premium (fashion/beauty costs more)
  const categoryMultiplier = ['fashion', 'beauty'].includes(campaign.category) ? 1.2 : 1.0;

  const multiplier = priorityMultiplier * categoryMultiplier;

  return {
    estimated: Math.round(((pricing.min + pricing.max) / 2) * multiplier),
    range: {
      min: Math.round(pricing.min * multiplier),
      max: Math.round(pricing.max * multiplier),
    },
  };
}
