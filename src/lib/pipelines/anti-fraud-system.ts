/**
 * ZZIK Anti-Fraud & Trust System
 *
 * Solves key problems in traditional influencer group-buying:
 *
 * 1. 과대 광고 (Over-Promising) → content-compliance.ts
 * 2. 취소/환불 분쟁 (Cancellation Disputes)
 * 3. 가격 거품 (Price Inflation) → price-fairness.ts
 * 4. 노쇼 문제 (No-Show Problem) → noshow-prediction.ts
 * 5. 신뢰도 문제 (Trust Issues)
 * 6. 정산 분쟁 (Settlement Disputes)
 */

// ============================================================================
// RE-EXPORTS FROM MODULES
// ============================================================================

export {
  checkContentCompliance,
  type ContentComplianceCheck,
  type ComplianceResult,
  type ComplianceRule,
} from './content-compliance';

export {
  checkPriceFairness,
  type PriceFairnessCheck,
  type PriceComparison,
} from './price-fairness';

export { predictNoShowRisk, type NoShowPrediction, type NoShowFactor } from './noshow-prediction';

// ============================================================================
// TYPES
// ============================================================================

export interface TrustScore {
  overall: number; // 0-100
  components: {
    reliability: number; // 약속 이행률
    transparency: number; // 정보 투명성
    satisfaction: number; // 참여자 만족도
    fairness: number; // 가격 공정성
  };
  history: TrustEvent[];
  tier: TrustTier;
}

export type TrustTier = 'unverified' | 'verified' | 'trusted' | 'elite';

export interface TrustEvent {
  timestamp: string;
  type: 'positive' | 'negative' | 'neutral';
  category: TrustCategory;
  description: string;
  impact: number; // -10 to +10
}

export type TrustCategory =
  | 'completion' // 펀딩 완료
  | 'cancellation' // 취소
  | 'noshow' // 노쇼
  | 'review' // 리뷰
  | 'dispute' // 분쟁
  | 'verification'; // 인증

// ============================================================================
// PROBLEM 2: 취소/환불 분쟁 방지 (Cancellation Prevention)
// ============================================================================

export interface CancellationPolicy {
  popupId: string;
  rules: CancellationRule[];
  refundPolicy: RefundPolicy;
  createdAt: string;
}

export interface CancellationRule {
  daysBeforeEvent: number;
  penaltyRate: number; // 0-1
  refundRate: number; // 0-1
  description: string;
}

export interface RefundPolicy {
  fullRefundBefore: number; // days before event
  partialRefundBefore: number;
  noRefundAfter: number;
  exceptions: string[];
}

/**
 * Generate standard cancellation policy
 */
export function generateCancellationPolicy(
  popupId: string,
  _eventDate: string
): CancellationPolicy {
  return {
    popupId,
    rules: [
      {
        daysBeforeEvent: 7,
        penaltyRate: 0,
        refundRate: 1.0,
        description: '이벤트 7일 전까지 100% 환불',
      },
      {
        daysBeforeEvent: 3,
        penaltyRate: 0.3,
        refundRate: 0.7,
        description: '이벤트 3~7일 전 70% 환불',
      },
      {
        daysBeforeEvent: 1,
        penaltyRate: 0.5,
        refundRate: 0.5,
        description: '이벤트 1~3일 전 50% 환불',
      },
      {
        daysBeforeEvent: 0,
        penaltyRate: 1.0,
        refundRate: 0,
        description: '이벤트 당일 환불 불가',
      },
    ],
    refundPolicy: {
      fullRefundBefore: 7,
      partialRefundBefore: 1,
      noRefundAfter: 0,
      exceptions: ['천재지변', '브랜드 측 취소', '플랫폼 서비스 장애', '참여자 질병 (진단서 필요)'],
    },
    createdAt: new Date().toISOString(),
  };
}

/**
 * Calculate refund amount based on policy
 */
export function calculateRefund(
  policy: CancellationPolicy,
  eventDate: string,
  cancellationDate: string,
  originalAmount: number
): { refundAmount: number; penaltyAmount: number; rule: CancellationRule } {
  const eventTime = new Date(eventDate).getTime();
  const cancelTime = new Date(cancellationDate).getTime();
  const daysUntilEvent = Math.floor((eventTime - cancelTime) / (1000 * 60 * 60 * 24));

  // Find applicable rule
  const applicableRule =
    policy.rules
      .sort((a, b) => b.daysBeforeEvent - a.daysBeforeEvent)
      .find((rule) => daysUntilEvent >= rule.daysBeforeEvent) ||
    policy.rules[policy.rules.length - 1];

  return {
    refundAmount: Math.round(originalAmount * applicableRule.refundRate),
    penaltyAmount: Math.round(originalAmount * applicableRule.penaltyRate),
    rule: applicableRule,
  };
}

// ============================================================================
// TRUST SYSTEM
// ============================================================================

/**
 * Calculate trust score for a leader
 */
export function calculateTrustScore(
  history: TrustEvent[],
  metrics: {
    completionRate: number; // 0-1
    avgSatisfaction: number; // 0-5
    disputeRate: number; // 0-1
    verificationLevel: number; // 0-3
  }
): TrustScore {
  // Base score from metrics
  const reliabilityScore = metrics.completionRate * 100;
  const satisfactionScore = (metrics.avgSatisfaction / 5) * 100;
  const fairnessScore = (1 - metrics.disputeRate) * 100;
  const transparencyScore = (metrics.verificationLevel / 3) * 100;

  // Apply history modifiers
  const recentEvents = history.filter((e) => {
    const eventDate = new Date(e.timestamp);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return eventDate > threeMonthsAgo;
  });

  const historyModifier = recentEvents.reduce((mod, event) => mod + event.impact, 0);

  const overallBase =
    reliabilityScore * 0.35 +
    satisfactionScore * 0.3 +
    fairnessScore * 0.2 +
    transparencyScore * 0.15;

  const overall = Math.max(0, Math.min(100, overallBase + historyModifier));

  // Determine tier
  let tier: TrustTier;
  if (overall >= 90 && metrics.verificationLevel >= 3) tier = 'elite';
  else if (overall >= 70 && metrics.verificationLevel >= 2) tier = 'trusted';
  else if (metrics.verificationLevel >= 1) tier = 'verified';
  else tier = 'unverified';

  return {
    overall,
    components: {
      reliability: reliabilityScore,
      transparency: transparencyScore,
      satisfaction: satisfactionScore,
      fairness: fairnessScore,
    },
    history,
    tier,
  };
}

// ============================================================================
// PROBLEM 6: 정산 분쟁 방지 (Settlement Dispute Prevention)
// ============================================================================

export interface SettlementAudit {
  id: string;
  popupId: string;
  status: 'pending' | 'verified' | 'disputed' | 'resolved';

  // Verification steps
  salesVerification: {
    reported: number;
    verified: number;
    discrepancy: number;
    evidence: string[];
  };

  attendanceVerification: {
    expected: number;
    verified: number;
    method: 'qr' | 'gps' | 'manual' | 'mixed';
  };

  leaderContributionVerification: {
    claimedReferrals: number;
    verifiedReferrals: number;
    trackingMethod: string;
  };

  finalApproval: {
    leaderApproved: boolean;
    brandApproved: boolean;
    platformApproved: boolean;
    approvedAt?: string;
  };
}

/**
 * Generate settlement audit report
 */
export function generateSettlementAudit(
  popupId: string,
  salesData: {
    reported: number;
    transactionLogs: { amount: number; verified: boolean }[];
  },
  attendanceData: {
    expected: number;
    verified: number;
    method: SettlementAudit['attendanceVerification']['method'];
  },
  referralData: {
    claimed: number;
    tracked: number;
  }
): SettlementAudit {
  // Verify sales
  const verifiedSales = salesData.transactionLogs
    .filter((t) => t.verified)
    .reduce((sum, t) => sum + t.amount, 0);

  const salesDiscrepancy = Math.abs(salesData.reported - verifiedSales);

  // Generate audit
  return {
    id: `audit-${popupId}-${Date.now()}`,
    popupId,
    status: salesDiscrepancy < salesData.reported * 0.05 ? 'pending' : 'disputed',

    salesVerification: {
      reported: salesData.reported,
      verified: verifiedSales,
      discrepancy: salesDiscrepancy,
      evidence: [`총 ${salesData.transactionLogs.length}건 거래 확인`],
    },

    attendanceVerification: {
      expected: attendanceData.expected,
      verified: attendanceData.verified,
      method: attendanceData.method,
    },

    leaderContributionVerification: {
      claimedReferrals: referralData.claimed,
      verifiedReferrals: referralData.tracked,
      trackingMethod: 'referral_link',
    },

    finalApproval: {
      leaderApproved: false,
      brandApproved: false,
      platformApproved: false,
    },
  };
}

// ============================================================================
// SUMMARY: ZZIK vs Traditional Group Buying
// ============================================================================

/**
 * ZZIK's systematic solutions to group buying problems:
 *
 * | Problem | Traditional | ZZIK Solution |
 * |---------|-------------|---------------|
 * | 과대 광고 | 자유 게시 | AI 컴플라이언스 체크 |
 * | 취소/환불 | 분쟁 다발 | 명확한 정책 + 자동 정산 |
 * | 가격 거품 | 불투명 | 시장가 비교 + 공정성 점수 |
 * | 노쇼 | 손실 감수 | 예측 + 보증금 + 리마인더 |
 * | 신뢰도 | 주관적 | 정량적 신뢰 점수 + 티어 |
 * | 정산 분쟁 | 사후 조정 | 실시간 감사 + 3자 승인 |
 */
export const ZZIK_ADVANTAGES = {
  transparency: '모든 과정 투명 공개',
  fairness: '알고리즘 기반 공정 평가',
  accountability: '리더 책임 시스템',
  protection: '참여자 보호 정책',
  efficiency: '자동화된 정산',
  trust: '검증된 신뢰 체계',
} as const;
