/**
 * No-Show Prediction Module
 *
 * Predicts and prevents no-show problems in popup events.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface NoShowPrediction {
  userId: string;
  popupId: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: NoShowFactor[];
  recommendations: string[];
}

export interface NoShowFactor {
  name: string;
  weight: number; // Contribution to risk
  value: number;
  description: string;
}

// ============================================================================
// NO-SHOW PREDICTION
// ============================================================================

/**
 * Predict no-show risk for a participant
 */
export function predictNoShowRisk(userHistory: {
  totalParticipations: number;
  noShowCount: number;
  lateArrivalCount: number;
  avgAdvanceBookingDays: number;
  lastMinuteBookingRate: number;
  distanceToVenue: number; // km
}): NoShowPrediction {
  const factors: NoShowFactor[] = [];

  // Factor 1: Historical no-show rate
  const noShowRate =
    userHistory.totalParticipations > 0
      ? userHistory.noShowCount / userHistory.totalParticipations
      : 0;
  factors.push({
    name: 'historical_noshow_rate',
    weight: 0.35,
    value: noShowRate,
    description: `과거 노쇼율: ${(noShowRate * 100).toFixed(1)}%`,
  });

  // Factor 2: Late arrival rate
  const lateRate =
    userHistory.totalParticipations > 0
      ? userHistory.lateArrivalCount / userHistory.totalParticipations
      : 0;
  factors.push({
    name: 'late_arrival_rate',
    weight: 0.15,
    value: lateRate,
    description: `지각률: ${(lateRate * 100).toFixed(1)}%`,
  });

  // Factor 3: Last-minute booking pattern
  factors.push({
    name: 'last_minute_booking',
    weight: 0.2,
    value: userHistory.lastMinuteBookingRate,
    description: `직전 예약률: ${(userHistory.lastMinuteBookingRate * 100).toFixed(1)}%`,
  });

  // Factor 4: Distance to venue
  const distanceRisk = Math.min(1, userHistory.distanceToVenue / 50); // Normalize to 50km
  factors.push({
    name: 'distance_risk',
    weight: 0.15,
    value: distanceRisk,
    description: `거리: ${userHistory.distanceToVenue}km`,
  });

  // Factor 5: Experience level (new users higher risk)
  const experienceRisk = Math.max(0, 1 - userHistory.totalParticipations / 10);
  factors.push({
    name: 'experience_level',
    weight: 0.15,
    value: experienceRisk,
    description: `참여 횟수: ${userHistory.totalParticipations}회`,
  });

  // Calculate weighted risk score
  const riskScore = factors.reduce(
    (score, factor) => score + factor.value * factor.weight * 100,
    0
  );

  // Determine risk level
  let riskLevel: NoShowPrediction['riskLevel'];
  if (riskScore <= 20) riskLevel = 'low';
  else if (riskScore <= 40) riskLevel = 'medium';
  else if (riskScore <= 60) riskLevel = 'high';
  else riskLevel = 'critical';

  // Generate recommendations
  const recommendations: string[] = [];
  if (riskScore >= 40) {
    recommendations.push('예약 확인 SMS 발송 권장');
  }
  if (riskScore >= 60) {
    recommendations.push('참여 보증금 요청 권장');
    recommendations.push('당일 리마인더 전화 권장');
  }
  if (userHistory.distanceToVenue > 30) {
    recommendations.push('교통편 안내 제공 권장');
  }

  return {
    userId: '', // Set by caller
    popupId: '', // Set by caller
    riskScore: Math.min(100, riskScore),
    riskLevel,
    factors,
    recommendations,
  };
}
