import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  convertFromUSD,
  convertToUSD,
  convertCurrency,
  applyPPPAdjustment,
  getLocalizedPrice,
  getAllLocalizedPrices,
  getExperiencePrice,
  detectCountry,
  EXCHANGE_RATES,
  CURRENCIES,
  PPP_INDEX,
  EXPERIENCE_BASE_PRICES_USD,
  type CurrencyCode,
  type CountryCode,
  type ExperienceType,
} from '@/lib/currency';

describe('currency.ts - Global Pricing System', () => {
  describe('formatPrice', () => {
    it('should format USD correctly', () => {
      expect(formatPrice(100, 'USD')).toBe('$100.00');
    });

    it('should format THB without decimals', () => {
      expect(formatPrice(3500, 'THB')).toBe('฿3,500');
    });

    it('should format IDR without decimals', () => {
      expect(formatPrice(1580000, 'IDR')).toBe('Rp1,580,000');
    });

    it('should format with compact notation', () => {
      expect(formatPrice(1500000, 'IDR', { compact: true })).toBe('Rp1.5M');
      expect(formatPrice(5000, 'THB', { compact: true })).toBe('฿5K');
    });

    it('should show currency code when requested', () => {
      expect(formatPrice(100, 'USD', { showCode: true })).toBe('$100.00 USD');
    });
  });

  describe('convertFromUSD', () => {
    it('should convert USD to THB', () => {
      const result = convertFromUSD(100, 'THB');
      expect(result).toBe(3500); // 100 * 35
    });

    it('should convert USD to IDR', () => {
      const result = convertFromUSD(100, 'IDR');
      expect(result).toBe(1580000); // 100 * 15800
    });

    it('should convert USD to SGD with decimals', () => {
      const result = convertFromUSD(100, 'SGD');
      expect(result).toBe(135); // 100 * 1.35
    });

    it('should return same value for USD', () => {
      const result = convertFromUSD(100, 'USD');
      expect(result).toBe(100);
    });
  });

  describe('convertToUSD', () => {
    it('should convert THB to USD', () => {
      const result = convertToUSD(3500, 'THB');
      expect(result).toBe(100); // 3500 / 35
    });

    it('should convert IDR to USD', () => {
      const result = convertToUSD(1580000, 'IDR');
      expect(result).toBe(100); // 1580000 / 15800
    });
  });

  describe('convertCurrency', () => {
    it('should convert between non-USD currencies', () => {
      const result = convertCurrency(3500, 'THB', 'IDR');
      // 3500 THB → 100 USD → 1,580,000 IDR
      expect(result).toBe(1580000);
    });

    it('should return same value for same currency', () => {
      const result = convertCurrency(100, 'USD', 'USD');
      expect(result).toBe(100);
    });
  });

  describe('applyPPPAdjustment', () => {
    it('should apply PPP discount for Thailand', () => {
      const result = applyPPPAdjustment(100, 'TH');
      expect(result).toBe(60); // 100 * 0.6
    });

    it('should apply PPP discount for Indonesia', () => {
      const result = applyPPPAdjustment(100, 'ID');
      expect(result).toBe(45); // 100 * 0.45
    });

    it('should not discount for USA', () => {
      const result = applyPPPAdjustment(100, 'US');
      expect(result).toBe(100); // 100 * 1.0
    });

    it('should apply PPP premium for Singapore', () => {
      const result = applyPPPAdjustment(100, 'SG');
      expect(result).toBe(110); // 100 * 1.1
    });
  });

  describe('getLocalizedPrice', () => {
    it('should calculate localized price for Thailand', () => {
      const result = getLocalizedPrice(100, 'TH');
      
      // 100 USD → 60 USD (PPP) → 2,100 THB
      expect(result.amount).toBe(2100);
      expect(result.currency).toBe('THB');
      expect(result.formatted).toBe('฿2,100');
    });

    it('should calculate localized price for Indonesia', () => {
      const result = getLocalizedPrice(100, 'ID');
      
      // 100 USD → 45 USD (PPP) → 711,000 IDR
      expect(result.amount).toBe(711000);
      expect(result.currency).toBe('IDR');
      expect(result.formatted).toBe('Rp711,000');
    });

    it('should calculate localized price for USA (no PPP)', () => {
      const result = getLocalizedPrice(100, 'US');
      
      expect(result.amount).toBe(100);
      expect(result.currency).toBe('USD');
      expect(result.formatted).toBe('$100.00');
    });

    it('should calculate localized price for Singapore (premium)', () => {
      const result = getLocalizedPrice(100, 'SG');
      
      // 100 USD → 110 USD (PPP) → 148.5 SGD
      expect(result.amount).toBe(148.5);
      expect(result.currency).toBe('SGD');
    });
  });

  describe('getAllLocalizedPrices', () => {
    it('should return prices for all countries', () => {
      const result = getAllLocalizedPrices(100);
      
      expect(result).toHaveProperty('TH');
      expect(result).toHaveProperty('ID');
      expect(result).toHaveProperty('US');
      expect(result).toHaveProperty('SG');
      
      expect(result.TH.amount).toBe(2100);
      expect(result.ID.amount).toBe(711000);
      expect(result.US.amount).toBe(100);
    });
  });

  describe('getExperiencePrice', () => {
    it('should calculate Hightough price for Thailand', () => {
      const result = getExperiencePrice('hightough', 'TH');
      
      // Base: $150 → PPP: $90 → THB: 3,150
      expect(result.amount).toBe(3150);
      expect(result.currency).toBe('THB');
      expect(result.formatted).toBe('฿3,150');
    });

    it('should calculate Soundcheck price for Indonesia', () => {
      const result = getExperiencePrice('soundcheck', 'ID');
      
      // Base: $300 → PPP: $135 → IDR: 2,133,000
      expect(result.amount).toBe(2133000);
      expect(result.currency).toBe('IDR');
    });

    it('should calculate Backstage price for USA', () => {
      const result = getExperiencePrice('backstage', 'US');
      
      // Base: $1500 → PPP: $1500 → USD: 1500
      expect(result.amount).toBe(1500);
      expect(result.currency).toBe('USD');
      expect(result.formatted).toBe('$1,500.00');
    });

    it('should calculate Popup price for all tiers', () => {
      const th = getExperiencePrice('popup', 'TH');
      const us = getExperiencePrice('popup', 'US');
      
      // Thailand: $5 → $3 → ฿105
      expect(th.amount).toBe(105);
      
      // USA: $5 → $5 → $5.00
      expect(us.amount).toBe(5);
    });
  });

  describe('Constants Validation', () => {
    it('should have all required currency codes', () => {
      const requiredCurrencies: CurrencyCode[] = [
        'USD', 'THB', 'IDR', 'PHP', 'KZT',
        'TWD', 'SGD', 'MYR', 'JPY', 'KRW', 'CNY'
      ];
      
      requiredCurrencies.forEach(code => {
        expect(CURRENCIES).toHaveProperty(code);
        expect(EXCHANGE_RATES).toHaveProperty(code);
      });
    });

    it('should have all required country codes', () => {
      const requiredCountries: CountryCode[] = [
        'US', 'TH', 'ID', 'PH', 'KZ',
        'TW', 'SG', 'MY', 'JP', 'KR', 'CN'
      ];
      
      requiredCountries.forEach(code => {
        expect(PPP_INDEX).toHaveProperty(code);
      });
    });

    it('should have all experience types', () => {
      const requiredTypes: ExperienceType[] = [
        'popup', 'hightough', 'soundcheck', 'backstage'
      ];
      
      requiredTypes.forEach(type => {
        expect(EXPERIENCE_BASE_PRICES_USD).toHaveProperty(type);
      });
    });

    it('should have valid exchange rates', () => {
      Object.entries(EXCHANGE_RATES).forEach(([code, rate]) => {
        expect(rate).toBeGreaterThan(0);
      });
    });

    it('should have valid PPP indices', () => {
      Object.entries(PPP_INDEX).forEach(([code, ppp]) => {
        expect(ppp).toBeGreaterThan(0);
        expect(ppp).toBeLessThanOrEqual(150); // Reasonable range
      });
    });
  });

  describe('Tier Pricing Validation', () => {
    it('Tier 1A countries should get significant discounts', () => {
      const th = getLocalizedPrice(100, 'TH');
      const id = getLocalizedPrice(100, 'ID');
      const ph = getLocalizedPrice(100, 'PH');
      
      // All should be less than $100 equivalent
      expect(convertToUSD(th.amount, th.currency)).toBeLessThan(100);
      expect(convertToUSD(id.amount, id.currency)).toBeLessThan(100);
      expect(convertToUSD(ph.amount, ph.currency)).toBeLessThan(100);
    });

    it('Tier 3 countries should pay full or premium price', () => {
      const us = getLocalizedPrice(100, 'US');
      const jp = getLocalizedPrice(100, 'JP');
      
      // Should be at or above $100 equivalent
      expect(convertToUSD(us.amount, us.currency)).toBeGreaterThanOrEqual(100);
      expect(convertToUSD(jp.amount, jp.currency)).toBeGreaterThanOrEqual(100);
    });
  });
});
