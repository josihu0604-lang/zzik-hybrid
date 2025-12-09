// src/__tests__/api/exchange-rates.test.ts
// API tests for /api/exchange-rates endpoint

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/exchange-rates/route';

describe('/api/exchange-rates', () => {
  describe('GET', () => {
    it('should return exchange rates with USD as default base', async () => {
      const request = new NextRequest('http://localhost:3000/api/exchange-rates');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.base).toBe('USD');
      expect(data.data.rates).toBeDefined();
      expect(typeof data.data.rates.KRW).toBe('number');
    });

    it('should return rates for all supported currencies', async () => {
      const request = new NextRequest('http://localhost:3000/api/exchange-rates');
      const response = await GET(request);
      const data = await response.json();

      const expectedCurrencies = ['KRW', 'JPY', 'TWD', 'CNY', 'THB', 'USD', 'EUR', 'SGD'];
      expectedCurrencies.forEach((currency) => {
        expect(data.data.rates[currency]).toBeDefined();
      });
    });

    it('should include timestamp', async () => {
      const request = new NextRequest('http://localhost:3000/api/exchange-rates');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.timestamp).toBeDefined();
    });

    it('should indicate data source', async () => {
      const request = new NextRequest('http://localhost:3000/api/exchange-rates');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.source).toBeDefined();
      expect(['openexchangerates', 'static', 'fallback']).toContain(data.data.source);
    });

    it('should filter currencies when specified', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/exchange-rates?currencies=USD,JPY'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.rates.USD).toBeDefined();
      expect(data.data.rates.JPY).toBeDefined();
    });
  });

  describe('POST - Currency conversion', () => {
    it('should convert between currencies', async () => {
      const request = new NextRequest('http://localhost:3000/api/exchange-rates', {
        method: 'POST',
        body: JSON.stringify({
          from: 'USD',
          to: 'KRW',
          amount: 100,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.from).toBe('USD');
      expect(data.data.to).toBe('KRW');
      expect(data.data.originalAmount).toBe(100);
      expect(data.data.convertedAmount).toBeGreaterThan(0);
      expect(data.data.rate).toBeGreaterThan(0);
    });

    it('should return error for invalid currency', async () => {
      const request = new NextRequest('http://localhost:3000/api/exchange-rates', {
        method: 'POST',
        body: JSON.stringify({
          from: 'INVALID',
          to: 'KRW',
          amount: 100,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(response.status).toBe(400);
    });

    it('should return error for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/exchange-rates', {
        method: 'POST',
        body: JSON.stringify({
          from: 'USD',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
    });

    it('should handle same currency conversion', async () => {
      const request = new NextRequest('http://localhost:3000/api/exchange-rates', {
        method: 'POST',
        body: JSON.stringify({
          from: 'USD',
          to: 'USD',
          amount: 100,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.convertedAmount).toBe(100);
      expect(data.data.rate).toBe(1);
    });
  });
});
