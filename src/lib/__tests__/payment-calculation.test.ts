import { describe, it, expect } from 'vitest';
import { getPriceId, isValidPriceId } from '../payment/stripe';

describe('Payment Calculation Logic', () => {
  it('should return correct price ID for KR/Monthly/Silver', () => {
    // Note: We are testing the fallback/env logic here
    const priceId = getPriceId('silver', 'monthly', 'KR');
    expect(priceId).toBeDefined();
    // It should be either the env var or the fallback 'price_silver_kr_monthly'
    // Since we didn't set env vars, we expect fallback
    expect(priceId).toBe('price_silver_kr_monthly');
  });

  it('should fallback to GLOBAL pricing for unsupported regions', () => {
    // CN falls back to GLOBAL in the map
    const priceId = getPriceId('gold', 'yearly', 'CN');
    expect(priceId).toBe('price_gold_global_yearly');
  });

  it('should return null for free tier', () => {
    const priceId = getPriceId('free', 'monthly', 'KR');
    expect(priceId).toBeNull();
  });

  it('should validate price ID format', () => {
    expect(isValidPriceId('price_1234567890abcdef')).toBe(true);
    expect(isValidPriceId('price_short')).toBe(false); // Too short
    expect(isValidPriceId('sku_123456')).toBe(false); // Wrong prefix
    expect(isValidPriceId(null)).toBe(false);
  });
});
