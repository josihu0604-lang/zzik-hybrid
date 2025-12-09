// src/__tests__/api/pricing-tiers.test.ts
// API tests for /api/pricing/tiers endpoint

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/pricing/tiers/route';

describe('/api/pricing/tiers', () => {
  describe('GET', () => {
    it('should return tiers for default region (GLOBAL)', async () => {
      const request = new NextRequest('http://localhost:3000/api/pricing/tiers');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.region).toBe('GLOBAL');
      expect(data.data.tiers).toHaveLength(4); // free, silver, gold, platinum
    });

    it('should return tiers for specific region', async () => {
      const request = new NextRequest('http://localhost:3000/api/pricing/tiers?region=KR');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.region).toBe('KR');
      expect(data.data.currency).toBe('KRW');
    });

    it('should return localized tier names', async () => {
      const request = new NextRequest('http://localhost:3000/api/pricing/tiers?region=KR&locale=ko');
      const response = await GET(request);
      const data = await response.json();

      const silverTier = data.data.tiers.find((t: any) => t.id === 'silver');
      expect(silverTier.name).toBe('실버'); // Korean
    });

    it('should return English tier names by default', async () => {
      const request = new NextRequest('http://localhost:3000/api/pricing/tiers');
      const response = await GET(request);
      const data = await response.json();

      const silverTier = data.data.tiers.find((t: any) => t.id === 'silver');
      expect(silverTier.name).toBe('Silver');
    });

    it('should include pricing for monthly and yearly', async () => {
      const request = new NextRequest('http://localhost:3000/api/pricing/tiers?region=US');
      const response = await GET(request);
      const data = await response.json();

      const goldTier = data.data.tiers.find((t: any) => t.id === 'gold');
      expect(goldTier.pricing.monthly).toBeDefined();
      expect(goldTier.pricing.yearly).toBeDefined();
      expect(goldTier.pricing.yearly.savingsPercent).toBeGreaterThan(0);
    });

    it('should include features for each tier', async () => {
      const request = new NextRequest('http://localhost:3000/api/pricing/tiers');
      const response = await GET(request);
      const data = await response.json();

      data.data.tiers.forEach((tier: any) => {
        expect(tier.features).toBeDefined();
        expect(Array.isArray(tier.features)).toBe(true);
        expect(tier.features.length).toBeGreaterThan(0);
      });
    });

    it('should mark gold tier as recommended', async () => {
      const request = new NextRequest('http://localhost:3000/api/pricing/tiers');
      const response = await GET(request);
      const data = await response.json();

      const goldTier = data.data.tiers.find((t: any) => t.id === 'gold');
      expect(goldTier.recommended).toBe(true);
    });

    it('should handle invalid region gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/pricing/tiers?region=INVALID');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.region).toBe('GLOBAL'); // Falls back to GLOBAL
    });
  });

  describe('POST - Compare pricing', () => {
    it('should compare pricing across regions', async () => {
      const request = new NextRequest('http://localhost:3000/api/pricing/tiers', {
        method: 'POST',
        body: JSON.stringify({
          tier: 'gold',
          regions: ['KR', 'JP', 'US'],
          period: 'monthly',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.tier).toBe('gold');
      expect(data.data.comparison).toHaveLength(3);
    });

    it('should return error for invalid tier', async () => {
      const request = new NextRequest('http://localhost:3000/api/pricing/tiers', {
        method: 'POST',
        body: JSON.stringify({
          tier: 'diamond', // Invalid tier
          regions: ['KR'],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid tier');
    });

    it('should default to all regions if not specified', async () => {
      const request = new NextRequest('http://localhost:3000/api/pricing/tiers', {
        method: 'POST',
        body: JSON.stringify({
          tier: 'silver',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.comparison.length).toBeGreaterThan(0);
    });
  });
});
