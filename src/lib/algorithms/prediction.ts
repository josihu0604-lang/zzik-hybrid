/**
 * ZZIK Participation Prediction Model
 *
 * Predicts popup funding success based on:
 * - Campaign momentum (daily new participants)
 * - Brand recognition
 * - Category performance
 * - Location attractiveness
 * - Time/seasonal factors
 *
 * Uses logistic regression-like scoring with feature engineering.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PredictionInput {
  popupId: string;
  brandName: string;
  category: string;
  location: string;
  currentParticipants: number;
  goalParticipants: number;
  daysRemaining: number;
  dailyMomentum: number[]; // Last 7 days of daily new participants
  hasLeader: boolean;
  leaderFollowerCount?: number;
  historicalCategorySuccess?: number; // 0-1
  brandPreviousCampaigns?: number;
  brandSuccessRate?: number;
}

export interface PredictionResult {
  popupId: string;
  successProbability: number;
  confidence: number;
  estimatedFinalParticipants: number;
  estimatedDaysToGoal: number | null;
  risk: 'low' | 'medium' | 'high';
  factors: PredictionFactor[];
  recommendations: string[];
}

export interface PredictionFactor {
  name: string;
  score: number; // -1 to 1 (negative = hurts, positive = helps)
  impact: 'high' | 'medium' | 'low';
  description: string;
}

// ============================================================================
// FEATURE WEIGHTS (learned from historical data - simulated)
// ============================================================================

const FEATURE_WEIGHTS = {
  momentum: 0.3,
  progress: 0.25,
  brand: 0.15,
  category: 0.1,
  location: 0.1,
  leader: 0.1,
} as const;

// Category historical success rates
const CATEGORY_BASE_RATES: Record<string, number> = {
  kpop: 0.85,
  fashion: 0.75,
  beauty: 0.72,
  food: 0.68,
  cafe: 0.65,
  culture: 0.6,
  lifestyle: 0.55,
  tech: 0.5,
};

// Location attractiveness scores
const LOCATION_SCORES: Record<string, number> = {
  성수: 0.9,
  강남: 0.85,
  홍대: 0.82,
  한남동: 0.8,
  압구정: 0.78,
  이태원: 0.75,
  용산: 0.72,
  익선동: 0.7,
  삼청동: 0.68,
  연남동: 0.65,
};

// ============================================================================
// CORE PREDICTION ALGORITHM
// ============================================================================

/**
 * Predict popup funding success
 */
export function predictSuccess(input: PredictionInput): PredictionResult {
  const factors: PredictionFactor[] = [];

  // 1. Momentum Score
  const momentumScore = calculateMomentumScore(input.dailyMomentum, input.goalParticipants);
  factors.push({
    name: 'momentum',
    score: momentumScore,
    impact: Math.abs(momentumScore) > 0.5 ? 'high' : 'medium',
    description:
      momentumScore > 0
        ? `일일 참여 ${Math.round(average(input.dailyMomentum))}명 - 좋은 추세`
        : '참여 속도 저조',
  });

  // 2. Progress Score
  const progressScore = calculateProgressScore(
    input.currentParticipants,
    input.goalParticipants,
    input.daysRemaining
  );
  factors.push({
    name: 'progress',
    score: progressScore,
    impact: Math.abs(progressScore) > 0.5 ? 'high' : 'medium',
    description: `${Math.round((input.currentParticipants / input.goalParticipants) * 100)}% 달성`,
  });

  // 3. Brand Score
  const brandScore = calculateBrandScore(input.brandPreviousCampaigns, input.brandSuccessRate);
  factors.push({
    name: 'brand',
    score: brandScore,
    impact: Math.abs(brandScore) > 0.3 ? 'medium' : 'low',
    description: input.brandPreviousCampaigns
      ? `${input.brandName} - ${Math.round((input.brandSuccessRate || 0) * 100)}% 성공률`
      : `${input.brandName} - 첫 캠페인`,
  });

  // 4. Category Score
  const categoryBaseRate = CATEGORY_BASE_RATES[input.category] || 0.5;
  const categoryScore = (categoryBaseRate - 0.5) * 2; // Normalize to -1 to 1
  factors.push({
    name: 'category',
    score: categoryScore,
    impact: Math.abs(categoryScore) > 0.3 ? 'medium' : 'low',
    description: `${input.category} - 평균 ${Math.round(categoryBaseRate * 100)}% 성공률`,
  });

  // 5. Location Score
  const locationScore = calculateLocationScore(input.location);
  factors.push({
    name: 'location',
    score: locationScore,
    impact: Math.abs(locationScore) > 0.3 ? 'medium' : 'low',
    description: `${input.location} - ${locationScore > 0 ? '인기 지역' : '일반 지역'}`,
  });

  // 6. Leader Score
  const leaderScore = calculateLeaderScore(input.hasLeader, input.leaderFollowerCount);
  factors.push({
    name: 'leader',
    score: leaderScore,
    impact: leaderScore > 0.5 ? 'high' : leaderScore > 0 ? 'medium' : 'low',
    description: input.hasLeader
      ? `리더 참여 (${formatFollowers(input.leaderFollowerCount || 0)} 팔로워)`
      : '리더 미참여',
  });

  // Calculate weighted probability
  const weightedScore =
    momentumScore * FEATURE_WEIGHTS.momentum +
    progressScore * FEATURE_WEIGHTS.progress +
    brandScore * FEATURE_WEIGHTS.brand +
    categoryScore * FEATURE_WEIGHTS.category +
    locationScore * FEATURE_WEIGHTS.location +
    leaderScore * FEATURE_WEIGHTS.leader;

  // Convert to probability using sigmoid-like function
  const successProbability = sigmoid(weightedScore * 2);

  // Calculate confidence based on data quality
  const confidence = calculateConfidence(input);

  // Estimate final participants
  const estimatedFinal = estimateFinalParticipants(input);

  // Estimate days to goal
  const daysToGoal = estimateDaysToGoal(input);

  // Determine risk level
  const risk = getRiskLevel(successProbability, input.daysRemaining);

  // Generate recommendations
  const recommendations = generateRecommendations(factors, input);

  return {
    popupId: input.popupId,
    successProbability,
    confidence,
    estimatedFinalParticipants: estimatedFinal,
    estimatedDaysToGoal: daysToGoal,
    risk,
    factors,
    recommendations,
  };
}

// ============================================================================
// FEATURE CALCULATIONS
// ============================================================================

function calculateMomentumScore(dailyMomentum: number[], goalParticipants: number): number {
  if (dailyMomentum.length === 0) return 0;

  const avgMomentum = average(dailyMomentum);
  const recentMomentum = average(dailyMomentum.slice(-3)); // Last 3 days
  const trend =
    dailyMomentum.length >= 2
      ? (dailyMomentum[dailyMomentum.length - 1] - dailyMomentum[0]) /
        Math.max(dailyMomentum.length, 1)
      : 0;

  // Expected daily rate to meet goal in 14 days
  const expectedRate = goalParticipants / 14;

  // Score based on how momentum compares to expected
  const rateScore = (avgMomentum / expectedRate - 1) * 0.5;

  // Trend bonus/penalty
  const trendScore = trend > 0 ? 0.2 : -0.1;

  // Recent acceleration bonus
  const accelScore = recentMomentum > avgMomentum ? 0.1 : 0;

  return Math.max(-1, Math.min(1, rateScore + trendScore + accelScore));
}

function calculateProgressScore(current: number, goal: number, daysRemaining: number): number {
  const progressRate = current / goal;
  const totalDays = 14; // Assume 14-day campaigns
  const daysPassed = totalDays - daysRemaining;
  const expectedProgress = daysPassed / totalDays;

  // Ahead of schedule = positive, behind = negative
  const diff = progressRate - expectedProgress;

  return Math.max(-1, Math.min(1, diff * 3));
}

function calculateBrandScore(previousCampaigns?: number, successRate?: number): number {
  if (!previousCampaigns || previousCampaigns === 0) {
    return 0; // Neutral for new brands
  }

  const experienceBonus = Math.min(0.2, previousCampaigns * 0.02);
  const successBonus = successRate ? (successRate - 0.5) * 0.8 : 0;

  return Math.max(-0.5, Math.min(0.5, experienceBonus + successBonus));
}

function calculateLocationScore(location: string): number {
  // Check for known locations
  for (const [loc, score] of Object.entries(LOCATION_SCORES)) {
    if (location.includes(loc)) {
      return (score - 0.5) * 2; // Normalize to -1 to 1
    }
  }
  return 0; // Unknown location = neutral
}

function calculateLeaderScore(hasLeader: boolean, followerCount?: number): number {
  if (!hasLeader) return -0.2;

  if (!followerCount) return 0.3;

  // Logarithmic scale for followers
  const followerScore = Math.min(1, Math.log10(followerCount + 1) / 6);

  return 0.3 + followerScore * 0.7;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calculateConfidence(input: PredictionInput): number {
  let confidence = 0.5; // Base confidence

  // More momentum data = higher confidence
  if (input.dailyMomentum.length >= 7) confidence += 0.2;
  else if (input.dailyMomentum.length >= 3) confidence += 0.1;

  // Brand history = higher confidence
  if (input.brandPreviousCampaigns && input.brandPreviousCampaigns >= 3) confidence += 0.1;

  // Category historical data = higher confidence
  if (input.historicalCategorySuccess !== undefined) confidence += 0.1;

  // Leader data = higher confidence
  if (input.hasLeader) confidence += 0.1;

  return Math.min(0.95, confidence);
}

function estimateFinalParticipants(input: PredictionInput): number {
  const avgDaily =
    input.dailyMomentum.length > 0
      ? average(input.dailyMomentum)
      : input.currentParticipants / Math.max(1, 14 - input.daysRemaining);

  return Math.round(input.currentParticipants + avgDaily * input.daysRemaining);
}

function estimateDaysToGoal(input: PredictionInput): number | null {
  const remaining = input.goalParticipants - input.currentParticipants;
  if (remaining <= 0) return 0;

  const avgDaily = input.dailyMomentum.length > 0 ? average(input.dailyMomentum) : 0;

  if (avgDaily <= 0) return null;

  const daysNeeded = Math.ceil(remaining / avgDaily);
  return daysNeeded > input.daysRemaining ? null : daysNeeded;
}

function getRiskLevel(probability: number, daysRemaining: number): 'low' | 'medium' | 'high' {
  if (probability >= 0.8) return 'low';
  if (probability >= 0.5 && daysRemaining >= 5) return 'medium';
  if (probability >= 0.3 && daysRemaining >= 7) return 'medium';
  return 'high';
}

function generateRecommendations(factors: PredictionFactor[], input: PredictionInput): string[] {
  const recommendations: string[] = [];

  // Momentum-based recommendations
  const momentumFactor = factors.find((f) => f.name === 'momentum');
  if (momentumFactor && momentumFactor.score < 0) {
    recommendations.push('SNS 프로모션을 강화하여 참여율을 높이세요');
    if (!input.hasLeader) {
      recommendations.push('인플루언서 파트너십을 고려해보세요');
    }
  }

  // Progress-based recommendations
  const progressFactor = factors.find((f) => f.name === 'progress');
  if (progressFactor && progressFactor.score < -0.3 && input.daysRemaining <= 5) {
    recommendations.push('마감 임박 이벤트로 긴급성을 강조하세요');
    recommendations.push('FOMO 마케팅 메시지를 활용하세요');
  }

  // Leader-based recommendations
  if (!input.hasLeader && input.daysRemaining >= 5) {
    recommendations.push('리더 매칭으로 도달률을 높이세요');
  }

  // Category-specific recommendations
  if (input.category === 'kpop') {
    recommendations.push('팬덤 커뮤니티에 적극 홍보하세요');
  } else if (input.category === 'fashion' || input.category === 'beauty') {
    recommendations.push('인스타그램 스토리 광고를 활용하세요');
  }

  return recommendations.slice(0, 3); // Max 3 recommendations
}

function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

// ============================================================================
// BATCH PREDICTION
// ============================================================================

export function batchPredict(inputs: PredictionInput[]): PredictionResult[] {
  return inputs.map(predictSuccess);
}

/**
 * Get at-risk popups that need attention
 */
export function getAtRiskPopups(
  inputs: PredictionInput[],
  threshold: number = 0.5
): PredictionResult[] {
  return batchPredict(inputs)
    .filter((r) => r.successProbability < threshold)
    .sort((a, b) => a.successProbability - b.successProbability);
}
