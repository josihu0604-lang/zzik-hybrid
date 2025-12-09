/**
 * ZZIK Leader System
 *
 * 리더오퍼 시스템 - 인플루언서가 팝업을 프로모션하고 수익을 받는 구조
 *
 * 비즈니스 모델:
 * - 리더가 리퍼럴 링크 공유 → 팔로워가 참여 → 팝업 방문 시 수익 발생
 * - 티어에 따라 수수료율 차등 적용
 */

// =============================================================================
// Types
// =============================================================================

/** 리더 티어 */
export type LeaderTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

/** 리더 정보 */
export interface Leader {
  id: string;
  userId: string;
  referralCode: string;
  tier: LeaderTier;
  totalReferrals: number;
  totalCheckins: number;
  totalEarnings: number;
  createdAt: Date;
}

/** 리퍼럴 기록 */
export interface Referral {
  id: string;
  leaderId: string;
  referredUserId: string;
  popupId: string;
  referralCode: string;
  checkedIn: boolean;
  earning: number;
  createdAt: Date;
}

/** 수익 기록 */
export interface Earning {
  id: string;
  leaderId: string;
  popupId: string;
  checkinId: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'paid';
  createdAt: Date;
}

/** 리더 통계 */
export interface LeaderStats {
  tier: LeaderTier;
  totalEarnings: number;
  thisMonthEarnings: number;
  totalReferrals: number;
  thisMonthReferrals: number;
  totalCheckins: number;
  thisMonthCheckins: number;
  commissionRate: number;
}

// =============================================================================
// Constants
// =============================================================================

/** 티어별 수수료율 (%) */
export const TIER_COMMISSION_RATES: Record<LeaderTier, number> = {
  Bronze: 10,
  Silver: 12,
  Gold: 15,
  Platinum: 20,
};

/** 티어별 최소 리퍼럴 수 */
export const TIER_THRESHOLDS: Record<LeaderTier, number> = {
  Bronze: 0,
  Silver: 50,
  Gold: 200,
  Platinum: 500,
};

/** 기본 체크인 수익 (원) */
export const BASE_CHECKIN_VALUE = 5000;

/** 티어별 색상 */
export const TIER_COLORS: Record<LeaderTier, string> = {
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  Platinum: '#e5e4e2',
};

// =============================================================================
// Referral Code Functions
// =============================================================================

/**
 * 리퍼럴 코드 생성
 *
 * userId를 기반으로 고유한 8자리 코드 생성
 * 형식: 대문자 + 숫자 (예: ZK8X4M2P)
 */
export function generateReferralCode(userId: string): string {
  // userId의 해시를 기반으로 코드 생성
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 혼동되는 문자 제외 (0,O,1,I)
  let code = '';

  for (let i = 0; i < 8; i++) {
    const index = Math.abs((hash >> (i * 4)) & 0x1f) % chars.length;
    code += chars[index];
  }

  return code;
}

/**
 * 리퍼럴 코드 검증
 *
 * 형식 검증 (8자리 대문자/숫자)
 */
export function isValidReferralCode(code: string): boolean {
  if (!code || code.length !== 8) return false;
  return /^[A-Z0-9]{8}$/.test(code);
}

/**
 * 리퍼럴 링크 생성
 */
export function generateReferralLink(referralCode: string, baseUrl: string = 'zzik.kr'): string {
  return `${baseUrl}/r/${referralCode}`;
}

// =============================================================================
// Tier Functions
// =============================================================================

/**
 * 리퍼럴 수에 따른 티어 계산
 */
export function getTierFromReferrals(referralCount: number): LeaderTier {
  if (referralCount >= TIER_THRESHOLDS.Platinum) return 'Platinum';
  if (referralCount >= TIER_THRESHOLDS.Gold) return 'Gold';
  if (referralCount >= TIER_THRESHOLDS.Silver) return 'Silver';
  return 'Bronze';
}

/**
 * 다음 티어까지 필요한 리퍼럴 수
 */
export function getReferralsToNextTier(currentReferrals: number): {
  nextTier: LeaderTier | null;
  remaining: number;
} {
  const currentTier = getTierFromReferrals(currentReferrals);

  const tierOrder: LeaderTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  const currentIndex = tierOrder.indexOf(currentTier);

  if (currentIndex >= tierOrder.length - 1) {
    return { nextTier: null, remaining: 0 };
  }

  const nextTier = tierOrder[currentIndex + 1];
  const remaining = TIER_THRESHOLDS[nextTier] - currentReferrals;

  return { nextTier, remaining };
}

/**
 * 티어 정보 조회
 */
export function getTierInfo(tier: LeaderTier): {
  name: string;
  color: string;
  commissionRate: number;
  minReferrals: number;
} {
  return {
    name: tier,
    color: TIER_COLORS[tier],
    commissionRate: TIER_COMMISSION_RATES[tier],
    minReferrals: TIER_THRESHOLDS[tier],
  };
}

// =============================================================================
// Commission Functions
// =============================================================================

/**
 * 수수료 계산
 *
 * 기본 체크인 가치 × 티어 수수료율
 */
export function calculateCommission(tier: LeaderTier, checkinCount: number = 1): number {
  const rate = TIER_COMMISSION_RATES[tier] / 100;
  return Math.floor(BASE_CHECKIN_VALUE * rate * checkinCount);
}

/**
 * 예상 월 수익 계산
 */
export function estimateMonthlyEarnings(
  tier: LeaderTier,
  averageCheckinsPerReferral: number,
  expectedReferralsPerMonth: number
): number {
  const expectedCheckins = averageCheckinsPerReferral * expectedReferralsPerMonth;
  return calculateCommission(tier, expectedCheckins);
}

/**
 * 리더 수익 요약 생성
 */
export function createEarningsSummary(
  tier: LeaderTier,
  referrals: number,
  checkins: number
): {
  totalEarnings: number;
  perCheckin: number;
  tierBonus: string;
} {
  const perCheckin = calculateCommission(tier, 1);
  const totalEarnings = calculateCommission(tier, checkins);

  return {
    totalEarnings,
    perCheckin,
    tierBonus: `${TIER_COMMISSION_RATES[tier]}% (${tier})`,
  };
}

// =============================================================================
// Leader Registration
// =============================================================================

/**
 * 리더 등록 데이터 생성
 */
export function createLeaderData(userId: string): Omit<Leader, 'id' | 'createdAt'> {
  return {
    userId,
    referralCode: generateReferralCode(userId),
    tier: 'Bronze',
    totalReferrals: 0,
    totalCheckins: 0,
    totalEarnings: 0,
  };
}

/**
 * 리퍼럴 기록 데이터 생성
 */
export function createReferralData(
  leaderId: string,
  referredUserId: string,
  popupId: string,
  referralCode: string
): Omit<Referral, 'id' | 'createdAt'> {
  return {
    leaderId,
    referredUserId,
    popupId,
    referralCode,
    checkedIn: false,
    earning: 0,
  };
}

/**
 * 수익 기록 데이터 생성
 */
export function createEarningData(
  leaderId: string,
  popupId: string,
  checkinId: string,
  tier: LeaderTier
): Omit<Earning, 'id' | 'createdAt'> {
  return {
    leaderId,
    popupId,
    checkinId,
    amount: calculateCommission(tier, 1),
    status: 'pending',
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * 금액 포맷팅 (원화)
 */
export function formatCurrency(amount: number): string {
  return `₩${amount.toLocaleString('ko-KR')}`;
}

/**
 * 리더 대시보드 요약 데이터 생성
 */
export function createDashboardSummary(
  leader: Leader,
  thisMonthReferrals: number,
  thisMonthCheckins: number
): LeaderStats {
  const thisMonthEarnings = calculateCommission(leader.tier, thisMonthCheckins);

  return {
    tier: leader.tier,
    totalEarnings: leader.totalEarnings,
    thisMonthEarnings,
    totalReferrals: leader.totalReferrals,
    thisMonthReferrals,
    totalCheckins: leader.totalCheckins,
    thisMonthCheckins,
    commissionRate: TIER_COMMISSION_RATES[leader.tier],
  };
}

// =============================================================================
// Earnings Calculation (Extended)
// =============================================================================

/** 참여당 수익 (티어별) */
export const PARTICIPATION_EARNINGS: Record<LeaderTier, number> = {
  Bronze: 100,
  Silver: 150,
  Gold: 250,
  Platinum: 500,
};

/** 체크인당 수익 (티어별) */
export const CHECKIN_EARNINGS: Record<LeaderTier, number> = {
  Bronze: 500,
  Silver: 600,
  Gold: 750,
  Platinum: 1000,
};

/**
 * 참여당 수익 계산
 */
export function calculateParticipationEarning(tier: LeaderTier): number {
  return PARTICIPATION_EARNINGS[tier];
}

/**
 * 체크인당 수익 계산
 */
export function calculateCheckinEarning(tier: LeaderTier): number {
  return CHECKIN_EARNINGS[tier];
}

/**
 * 총 예상 수익 계산 (참여 + 체크인)
 * @param tier - 리더 티어
 * @param participations - 참여 수
 * @param checkins - 체크인 수
 */
export function calculateTotalEarnings(
  tier: LeaderTier,
  participations: number,
  checkins: number
): number {
  const participationEarnings = calculateParticipationEarning(tier) * participations;
  const checkinEarnings = calculateCheckinEarning(tier) * checkins;
  return participationEarnings + checkinEarnings;
}

/**
 * 전환율 계산 (체크인/참여)
 */
export function calculateConversionRate(participations: number, checkins: number): number {
  if (participations === 0) return 0;
  return Math.round((checkins / participations) * 100);
}

/**
 * 금액 축약 포맷팅 (만원 단위)
 */
export function formatCurrencyShort(amount: number): string {
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const remainder = amount % 10000;
    if (remainder === 0) {
      return `${man}만원`;
    }
    return `${man}.${Math.floor(remainder / 1000)}만원`;
  }
  return `${amount.toLocaleString('ko-KR')}원`;
}
