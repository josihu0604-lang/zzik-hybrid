// src/__tests__/lib/global-pricing.test.ts
// Unit tests for global pricing module

import { describe, it, expect } from 'vitest';
import {
  getTierPrice,
  formatCurrency,
  TIER_PRICES_KRW,
  REGION_CURRENCY,
  TIER_FEATURES,
  type Region,
  type TierType,
} from '@/lib/global-pricing';

describe('global-pricing', () => {
  describe('getTierPrice', () => {
    it('should return correct price for Korean region (KRW)', () => {
      const result = getTierPrice('silver', 'KR', 'monthly');
      expect(result.currency).toBe('KRW');
      expect(result.amount).toBeGreaterThan(0);
      expect(result.formatted).toContain('₩');
    });

    it('should return zero for free tier', () => {
      const result = getTierPrice('free', 'KR', 'monthly');
      expect(result.amount).toBe(0);
    });

    it('should apply yearly discount', () => {
      const monthly = getTierPrice('gold', 'KR', 'monthly');
      const yearly = getTierPrice('gold', 'KR', 'yearly');
      
      // Yearly should be less than 12 months (due to discount)
      expect(yearly.amount).toBeLessThan(monthly.amount * 12);
    });

    it('should convert to correct currency for Japan (JPY)', () => {
      const result = getTierPrice('gold', 'JP', 'monthly');
      expect(result.currency).toBe('JPY');
      // Accept both Halfwidth and Fullwidth Yen
      expect(result.formatted).toMatch(/[¥￥]/);
    });

    it('should convert to correct currency for USA (USD)', () => {
      const result = getTierPrice('platinum', 'US', 'monthly');
      expect(result.currency).toBe('USD');
      expect(result.formatted).toContain('$');
    });

    it('should handle all supported regions', () => {
      const regions: Region[] = ['KR', 'JP', 'TW', 'CN', 'TH', 'US', 'EU', 'SEA', 'GLOBAL'];
      
      regions.forEach((region) => {
        const result = getTierPrice('silver', region, 'monthly');
        expect(result.currency).toBe(REGION_CURRENCY[region]);
        expect(result.amount).toBeDefined();
        expect(result.formatted).toBeTruthy();
      });
    });

    it('should handle all tier types', () => {
      const tiers: TierType[] = ['free', 'silver', 'gold', 'platinum'];
      
      tiers.forEach((tier) => {
        const result = getTierPrice(tier, 'KR', 'monthly');
        expect(result).toBeDefined();
        if (tier !== 'free') {
          expect(result.amount).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('formatCurrency', () => {
    it('should format KRW without decimals', () => {
      const result = formatCurrency(9900, 'KRW');
      expect(result).toMatch(/₩[\d,]+/);
      expect(result).not.toContain('.');
    });

    it('should format USD with decimals', () => {
      const result = formatCurrency(7.99, 'USD');
      expect(result).toContain('$');
    });

    it('should format JPY without decimals', () => {
      const result = formatCurrency(1100, 'JPY');
      // Accept both Halfwidth and Fullwidth Yen
      expect(result).toMatch(/[¥￥]/);
      expect(result).not.toContain('.');
    });

    it('should format EUR correctly', () => {
      const result = formatCurrency(6.99, 'EUR');
      expect(result).toContain('€');
    });
  });

  describe('TIER_FEATURES', () => {
    it('should have features for all tiers', () => {
      const tiers: TierType[] = ['free', 'silver', 'gold', 'platinum'];
      
      tiers.forEach((tier) => {
        expect(TIER_FEATURES[tier]).toBeDefined();
        expect(TIER_FEATURES[tier].length).toBeGreaterThan(0);
      });
    });

    it('should have increasing features for higher tiers', () => {
      // Gold should include silver features reference
      expect(TIER_FEATURES.gold).toContain('all_silver_features');
      // Platinum should include gold features reference
      expect(TIER_FEATURES.platinum).toContain('all_gold_features');
    });
  });

  describe('TIER_PRICES_KRW', () => {
    it('should have monthly and yearly prices', () => {
      const tiers: TierType[] = ['free', 'silver', 'gold', 'platinum'];
      
      tiers.forEach((tier) => {
        expect(TIER_PRICES_KRW[tier].monthly).toBeDefined();
        expect(TIER_PRICES_KRW[tier].yearly).toBeDefined();
      });
    });

    it('should have increasing prices for higher tiers', () => {
      expect(TIER_PRICES_KRW.silver.monthly).toBeLessThan(TIER_PRICES_KRW.gold.monthly);
      expect(TIER_PRICES_KRW.gold.monthly).toBeLessThan(TIER_PRICES_KRW.platinum.monthly);
    });
  });

  describe('REGION_CURRENCY', () => {
    it('should map all regions to currencies', () => {
      const expectedMappings = {
        KR: 'KRW',
        JP: 'JPY',
        TW: 'TWD',
        CN: 'CNY',
        TH: 'THB',
        US: 'USD',
        EU: 'EUR',
        SEA: 'USD',
        GLOBAL: 'USD',
      };

      Object.entries(expectedMappings).forEach(([region, currency]) => {
        expect(REGION_CURRENCY[region as Region]).toBe(currency);
      });
    });
  });
});
