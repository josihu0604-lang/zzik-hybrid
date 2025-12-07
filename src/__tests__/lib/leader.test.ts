import { describe, it, expect } from 'vitest';
import {
  generateReferralCode,
  isValidReferralCode,
  generateReferralLink,
  getTierFromReferrals,
  getReferralsToNextTier,
  getTierInfo,
  calculateCommission,
  estimateMonthlyEarnings,
  createEarningsSummary,
  createLeaderData,
  createReferralData,
  createEarningData,
  formatCurrency,
  createDashboardSummary,
  TIER_COMMISSION_RATES,
  TIER_THRESHOLDS,
  BASE_CHECKIN_VALUE,
  type Leader,
} from '@/lib/leader';

describe('leader.ts', () => {
  // =============================================================================
  // Referral Code Generation Tests
  // =============================================================================
  describe('generateReferralCode', () => {
    it('should generate 8-character code', () => {
      const code = generateReferralCode('user-123');
      expect(code).toHaveLength(8);
    });

    it('should generate code with only uppercase letters and numbers', () => {
      const code = generateReferralCode('user-456');
      expect(code).toMatch(/^[A-Z0-9]{8}$/);
    });

    it('should generate consistent code for same userId', () => {
      const userId = 'test-user-123';
      const code1 = generateReferralCode(userId);
      const code2 = generateReferralCode(userId);
      expect(code1).toBe(code2);
    });

    it('should generate different codes for different userIds', () => {
      const code1 = generateReferralCode('user-1');
      const code2 = generateReferralCode('user-2');
      expect(code1).not.toBe(code2);
    });

    it('should not contain confusing characters (0, O, 1, I)', () => {
      const code = generateReferralCode('test-user');
      expect(code).not.toMatch(/[0O1I]/);
    });

    it('should handle empty userId gracefully', () => {
      const code = generateReferralCode('');
      expect(code).toHaveLength(8);
      expect(code).toMatch(/^[A-Z0-9]{8}$/);
    });
  });

  // =============================================================================
  // Referral Code Validation Tests
  // =============================================================================
  describe('isValidReferralCode', () => {
    it('should accept valid 8-character code', () => {
      expect(isValidReferralCode('ABC12345')).toBe(true);
      expect(isValidReferralCode('ZZIK8XYZ')).toBe(true);
    });

    it('should reject code with wrong length', () => {
      expect(isValidReferralCode('ABC123')).toBe(false);
      expect(isValidReferralCode('ABC123456')).toBe(false);
    });

    it('should reject code with lowercase letters', () => {
      expect(isValidReferralCode('abc12345')).toBe(false);
      expect(isValidReferralCode('AbC12345')).toBe(false);
    });

    it('should reject code with special characters', () => {
      expect(isValidReferralCode('ABC-1234')).toBe(false);
      expect(isValidReferralCode('ABC_1234')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidReferralCode('')).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(isValidReferralCode(null as unknown as string)).toBe(false);
      expect(isValidReferralCode(undefined as unknown as string)).toBe(false);
    });
  });

  // =============================================================================
  // Referral Link Generation Tests
  // =============================================================================
  describe('generateReferralLink', () => {
    it('should generate link with default base URL', () => {
      const link = generateReferralLink('ABC12345');
      expect(link).toBe('zzik.kr/r/ABC12345');
    });

    it('should generate link with custom base URL', () => {
      const link = generateReferralLink('ABC12345', 'https://zzik.kr');
      expect(link).toBe('https://zzik.kr/r/ABC12345');
    });

    it('should handle base URL without protocol', () => {
      const link = generateReferralLink('XYZ78901', 'zzik.kr');
      expect(link).toBe('zzik.kr/r/XYZ78901');
    });
  });

  // =============================================================================
  // Tier Calculation Tests
  // =============================================================================
  describe('getTierFromReferrals', () => {
    it('should return Bronze for 0-49 referrals', () => {
      expect(getTierFromReferrals(0)).toBe('Bronze');
      expect(getTierFromReferrals(25)).toBe('Bronze');
      expect(getTierFromReferrals(49)).toBe('Bronze');
    });

    it('should return Silver for 50-199 referrals', () => {
      expect(getTierFromReferrals(50)).toBe('Silver');
      expect(getTierFromReferrals(100)).toBe('Silver');
      expect(getTierFromReferrals(199)).toBe('Silver');
    });

    it('should return Gold for 200-499 referrals', () => {
      expect(getTierFromReferrals(200)).toBe('Gold');
      expect(getTierFromReferrals(350)).toBe('Gold');
      expect(getTierFromReferrals(499)).toBe('Gold');
    });

    it('should return Platinum for 500+ referrals', () => {
      expect(getTierFromReferrals(500)).toBe('Platinum');
      expect(getTierFromReferrals(1000)).toBe('Platinum');
      expect(getTierFromReferrals(5000)).toBe('Platinum');
    });
  });

  describe('getReferralsToNextTier', () => {
    it('should calculate remaining referrals to Silver', () => {
      const result = getReferralsToNextTier(30);
      expect(result.nextTier).toBe('Silver');
      expect(result.remaining).toBe(20); // 50 - 30
    });

    it('should calculate remaining referrals to Gold', () => {
      const result = getReferralsToNextTier(150);
      expect(result.nextTier).toBe('Gold');
      expect(result.remaining).toBe(50); // 200 - 150
    });

    it('should calculate remaining referrals to Platinum', () => {
      const result = getReferralsToNextTier(450);
      expect(result.nextTier).toBe('Platinum');
      expect(result.remaining).toBe(50); // 500 - 450
    });

    it('should return null for Platinum tier (max tier)', () => {
      const result = getReferralsToNextTier(500);
      expect(result.nextTier).toBe(null);
      expect(result.remaining).toBe(0);
    });

    it('should handle edge case at exact threshold', () => {
      const result = getReferralsToNextTier(50);
      expect(result.nextTier).toBe('Gold');
      expect(result.remaining).toBe(150); // 200 - 50
    });
  });

  describe('getTierInfo', () => {
    it('should return correct info for Bronze', () => {
      const info = getTierInfo('Bronze');
      expect(info.name).toBe('Bronze');
      expect(info.commissionRate).toBe(10);
      expect(info.minReferrals).toBe(0);
      expect(info.color).toBe('#cd7f32');
    });

    it('should return correct info for Silver', () => {
      const info = getTierInfo('Silver');
      expect(info.name).toBe('Silver');
      expect(info.commissionRate).toBe(12);
      expect(info.minReferrals).toBe(50);
    });

    it('should return correct info for Gold', () => {
      const info = getTierInfo('Gold');
      expect(info.name).toBe('Gold');
      expect(info.commissionRate).toBe(15);
      expect(info.minReferrals).toBe(200);
    });

    it('should return correct info for Platinum', () => {
      const info = getTierInfo('Platinum');
      expect(info.name).toBe('Platinum');
      expect(info.commissionRate).toBe(20);
      expect(info.minReferrals).toBe(500);
    });
  });

  // =============================================================================
  // Commission Calculation Tests
  // =============================================================================
  describe('calculateCommission', () => {
    it('should calculate Bronze commission correctly', () => {
      const commission = calculateCommission('Bronze', 1);
      expect(commission).toBe(500); // 5000 * 0.10 = 500
    });

    it('should calculate Silver commission correctly', () => {
      const commission = calculateCommission('Silver', 1);
      expect(commission).toBe(600); // 5000 * 0.12 = 600
    });

    it('should calculate Gold commission correctly', () => {
      const commission = calculateCommission('Gold', 1);
      expect(commission).toBe(750); // 5000 * 0.15 = 750
    });

    it('should calculate Platinum commission correctly', () => {
      const commission = calculateCommission('Platinum', 1);
      expect(commission).toBe(1000); // 5000 * 0.20 = 1000
    });

    it('should multiply by checkin count', () => {
      const commission = calculateCommission('Gold', 10);
      expect(commission).toBe(7500); // 750 * 10
    });

    it('should handle zero checkins', () => {
      const commission = calculateCommission('Bronze', 0);
      expect(commission).toBe(0);
    });

    it('should floor the result (no decimals)', () => {
      // This test ensures we always get integer values
      const commission = calculateCommission('Bronze', 3);
      expect(commission).toBe(1500); // Should be integer
      expect(Number.isInteger(commission)).toBe(true);
    });
  });

  // =============================================================================
  // Monthly Earnings Estimation Tests
  // =============================================================================
  describe('estimateMonthlyEarnings', () => {
    it('should estimate Bronze monthly earnings', () => {
      const earnings = estimateMonthlyEarnings('Bronze', 2, 10);
      // 10 referrals * 2 checkins/referral = 20 checkins
      // 20 * 500 (Bronze per checkin) = 10,000
      expect(earnings).toBe(10000);
    });

    it('should estimate Platinum monthly earnings', () => {
      const earnings = estimateMonthlyEarnings('Platinum', 3, 50);
      // 50 referrals * 3 checkins = 150 checkins
      // 150 * 1000 (Platinum per checkin) = 150,000
      expect(earnings).toBe(150000);
    });

    it('should handle zero expected referrals', () => {
      const earnings = estimateMonthlyEarnings('Gold', 2, 0);
      expect(earnings).toBe(0);
    });

    it('should handle fractional average checkins', () => {
      const earnings = estimateMonthlyEarnings('Silver', 2.5, 10);
      // 10 * 2.5 = 25 checkins
      // 25 * 600 = 15,000
      expect(earnings).toBe(15000);
    });
  });

  // =============================================================================
  // Earnings Summary Tests
  // =============================================================================
  describe('createEarningsSummary', () => {
    it('should create summary for Bronze tier', () => {
      const summary = createEarningsSummary('Bronze', 30, 60);
      expect(summary.perCheckin).toBe(500);
      expect(summary.totalEarnings).toBe(30000); // 60 * 500
      expect(summary.tierBonus).toBe('10% (Bronze)');
    });

    it('should create summary for Platinum tier', () => {
      const summary = createEarningsSummary('Platinum', 600, 1200);
      expect(summary.perCheckin).toBe(1000);
      expect(summary.totalEarnings).toBe(1200000); // 1200 * 1000
      expect(summary.tierBonus).toBe('20% (Platinum)');
    });

    it('should handle zero checkins', () => {
      const summary = createEarningsSummary('Gold', 100, 0);
      expect(summary.totalEarnings).toBe(0);
      expect(summary.perCheckin).toBe(750);
    });
  });

  // =============================================================================
  // Data Creation Tests
  // =============================================================================
  describe('createLeaderData', () => {
    it('should create valid leader data', () => {
      const data = createLeaderData('user-123');
      expect(data.userId).toBe('user-123');
      expect(data.referralCode).toMatch(/^[A-Z0-9]{8}$/);
      expect(data.tier).toBe('Bronze');
      expect(data.totalReferrals).toBe(0);
      expect(data.totalCheckins).toBe(0);
      expect(data.totalEarnings).toBe(0);
    });

    it('should generate consistent referral code for same userId', () => {
      const data1 = createLeaderData('consistent-user');
      const data2 = createLeaderData('consistent-user');
      expect(data1.referralCode).toBe(data2.referralCode);
    });
  });

  describe('createReferralData', () => {
    it('should create valid referral data', () => {
      const data = createReferralData('leader-1', 'user-1', 'popup-1', 'ABC12345');
      expect(data.leaderId).toBe('leader-1');
      expect(data.referredUserId).toBe('user-1');
      expect(data.popupId).toBe('popup-1');
      expect(data.referralCode).toBe('ABC12345');
      expect(data.checkedIn).toBe(false);
      expect(data.earning).toBe(0);
    });
  });

  describe('createEarningData', () => {
    it('should create earning data for Bronze', () => {
      const data = createEarningData('leader-1', 'popup-1', 'checkin-1', 'Bronze');
      expect(data.leaderId).toBe('leader-1');
      expect(data.popupId).toBe('popup-1');
      expect(data.checkinId).toBe('checkin-1');
      expect(data.amount).toBe(500); // Bronze commission
      expect(data.status).toBe('pending');
    });

    it('should create earning data for Platinum', () => {
      const data = createEarningData('leader-2', 'popup-2', 'checkin-2', 'Platinum');
      expect(data.amount).toBe(1000); // Platinum commission
    });
  });

  // =============================================================================
  // Utility Function Tests
  // =============================================================================
  describe('formatCurrency', () => {
    it('should format Korean won correctly', () => {
      expect(formatCurrency(1000)).toBe('₩1,000');
      expect(formatCurrency(50000)).toBe('₩50,000');
      expect(formatCurrency(1000000)).toBe('₩1,000,000');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('₩0');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-5000)).toBe('₩-5,000');
    });

    it('should handle decimal numbers', () => {
      expect(formatCurrency(1234.56)).toBe('₩1,234.56');
    });
  });

  describe('createDashboardSummary', () => {
    it('should create complete dashboard summary', () => {
      const leader: Leader = {
        id: 'leader-1',
        userId: 'user-1',
        referralCode: 'ABC12345',
        tier: 'Gold',
        totalReferrals: 250,
        totalCheckins: 500,
        totalEarnings: 375000,
        createdAt: new Date(),
      };

      const summary = createDashboardSummary(leader, 20, 40);

      expect(summary.tier).toBe('Gold');
      expect(summary.totalEarnings).toBe(375000);
      expect(summary.thisMonthEarnings).toBe(30000); // 40 * 750 (Gold rate)
      expect(summary.totalReferrals).toBe(250);
      expect(summary.thisMonthReferrals).toBe(20);
      expect(summary.totalCheckins).toBe(500);
      expect(summary.thisMonthCheckins).toBe(40);
      expect(summary.commissionRate).toBe(15); // Gold rate
    });

    it('should handle zero monthly stats', () => {
      const leader: Leader = {
        id: 'leader-2',
        userId: 'user-2',
        referralCode: 'XYZ67890',
        tier: 'Bronze',
        totalReferrals: 10,
        totalCheckins: 20,
        totalEarnings: 10000,
        createdAt: new Date(),
      };

      const summary = createDashboardSummary(leader, 0, 0);

      expect(summary.thisMonthEarnings).toBe(0);
      expect(summary.thisMonthReferrals).toBe(0);
      expect(summary.thisMonthCheckins).toBe(0);
    });
  });

  // =============================================================================
  // Constants Validation Tests
  // =============================================================================
  describe('Constants', () => {
    it('should have correct tier commission rates', () => {
      expect(TIER_COMMISSION_RATES.Bronze).toBe(10);
      expect(TIER_COMMISSION_RATES.Silver).toBe(12);
      expect(TIER_COMMISSION_RATES.Gold).toBe(15);
      expect(TIER_COMMISSION_RATES.Platinum).toBe(20);
    });

    it('should have correct tier thresholds', () => {
      expect(TIER_THRESHOLDS.Bronze).toBe(0);
      expect(TIER_THRESHOLDS.Silver).toBe(50);
      expect(TIER_THRESHOLDS.Gold).toBe(200);
      expect(TIER_THRESHOLDS.Platinum).toBe(500);
    });

    it('should have correct base checkin value', () => {
      expect(BASE_CHECKIN_VALUE).toBe(5000);
    });

    it('should have ascending commission rates', () => {
      expect(TIER_COMMISSION_RATES.Bronze).toBeLessThan(TIER_COMMISSION_RATES.Silver);
      expect(TIER_COMMISSION_RATES.Silver).toBeLessThan(TIER_COMMISSION_RATES.Gold);
      expect(TIER_COMMISSION_RATES.Gold).toBeLessThan(TIER_COMMISSION_RATES.Platinum);
    });
  });
});
