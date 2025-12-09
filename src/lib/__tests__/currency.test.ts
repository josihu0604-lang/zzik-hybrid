
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  convertCurrency, 
  fetchExchangeRates 
} from '../currency';

// Mock fetch
global.fetch = vi.fn();

describe('Currency Module', () => {
  describe('convertCurrency', () => {
    beforeEach(() => {
      // Reset internal cache if possible, or just rely on default behavior
      // Since we can't easily reset the module-level variable without reloading module,
      // we assume default EXCHANGE_RATES are used initially.
    });

    it('should return same amount if from and to currencies are same', () => {
      expect(convertCurrency(100, 'USD', 'USD')).toBe(100);
    });

    it('should convert USD to KRW correctly based on default rates', () => {
      // Default: 1 KRW = 0.00075 USD
      // 1 USD = 1 / 0.00075 = 1333.33... KRW
      // 10 USD = 13333.33... KRW
      
      const result = convertCurrency(10, 'USD', 'KRW');
      // 10 / 0.00075 * 1
      expect(result).toBeCloseTo(13333.33, 1);
    });

    it('should convert KRW to JPY correctly based on default rates', () => {
      // Default: 1 KRW = 0.11 JPY
      // 1000 KRW = 110 JPY
      
      const result = convertCurrency(1000, 'KRW', 'JPY');
      // 1000 / 1 * 0.11
      expect(result).toBeCloseTo(110, 1);
    });
  });

  describe('fetchExchangeRates', () => {
    it('should fetch rates from API and update cache', async () => {
      const mockRates = {
        KRW: 1,
        USD: 0.0008, // Changed rate
        JPY: 0.12
      };
      
      (global.fetch as any).mockResolvedValue({
        json: () => Promise.resolve({ rates: mockRates })
      });

      const rates = await fetchExchangeRates();
      
      expect(global.fetch).toHaveBeenCalledWith('/api/exchange-rates');
      expect(rates.USD).toBe(0.0008);
    });

    it('should return cached rates if called immediately again', async () => {
      (global.fetch as any).mockClear(); // Clear previous calls
      
      await fetchExchangeRates();
      
      // Should use cache, so fetch shouldn't be called
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
