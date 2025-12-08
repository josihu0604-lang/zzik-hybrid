import { describe, it, expect } from 'vitest';

// Mock Next.js request/response
const mockRequest = (url: string, options?: { headers?: Record<string, string> }) => {
  return new Request(url, {
    headers: options?.headers || {},
  });
};

describe('API: /api/exchange-rates', () => {
  it('should return all exchange rates', async () => {
    const request = mockRequest('http://localhost:3000/api/exchange-rates');
    
    // Import the route handler
    const { GET } = await import('@/app/api/exchange-rates/route');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('rates');
    expect(data).toHaveProperty('currencies');
    expect(data).toHaveProperty('base', 'USD');
    expect(data).toHaveProperty('updatedAt');
    
    // Verify rates structure
    expect(data.rates).toHaveProperty('USD', 1);
    expect(data.rates).toHaveProperty('THB');
    expect(data.rates).toHaveProperty('IDR');
    
    // Verify currencies structure
    expect(data.currencies.USD).toHaveProperty('code', 'USD');
    expect(data.currencies.USD).toHaveProperty('symbol', '$');
    expect(data.currencies.THB).toHaveProperty('code', 'THB');
    expect(data.currencies.THB).toHaveProperty('symbol', '฿');
  });

  it('should return specific currency rate', async () => {
    const request = mockRequest('http://localhost:3000/api/exchange-rates?currency=THB');
    
    const { GET } = await import('@/app/api/exchange-rates/route');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('currency', 'THB');
    expect(data).toHaveProperty('rate');
    expect(data).toHaveProperty('config');
    expect(data).toHaveProperty('base', 'USD');
    
    expect(data.config).toHaveProperty('code', 'THB');
    expect(data.config).toHaveProperty('symbol', '฿');
  });

  it('should return 400 for invalid currency', async () => {
    const request = mockRequest('http://localhost:3000/api/exchange-rates?currency=XXX');
    
    const { GET } = await import('@/app/api/exchange-rates/route');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error', 'Invalid currency code');
  });
});

describe('API: /api/geo-detect', () => {
  it('should detect country from Vercel header', async () => {
    const request = mockRequest('http://localhost:3000/api/geo-detect', {
      headers: { 'x-vercel-ip-country': 'TH' }
    });
    
    const { GET } = await import('@/app/api/geo-detect/route');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('countryCode', 'TH');
    expect(data).toHaveProperty('country');
    expect(data).toHaveProperty('detectionMethod', 'vercel-geo');
    
    expect(data.country).toHaveProperty('code', 'TH');
    expect(data.country).toHaveProperty('currency', 'THB');
  });

  it('should detect country from Cloudflare header', async () => {
    const request = mockRequest('http://localhost:3000/api/geo-detect', {
      headers: { 'cf-ipcountry': 'ID' }
    });
    
    const { GET } = await import('@/app/api/geo-detect/route');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('countryCode', 'ID');
    expect(data).toHaveProperty('detectionMethod', 'cloudflare');
  });

  it('should detect country from Accept-Language header', async () => {
    const request = mockRequest('http://localhost:3000/api/geo-detect', {
      headers: { 'accept-language': 'th-TH,th;q=0.9' }
    });
    
    const { GET } = await import('@/app/api/geo-detect/route');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('countryCode', 'TH');
    expect(data).toHaveProperty('detectionMethod', 'language');
  });

  it('should fallback to US for undetectable requests', async () => {
    const request = mockRequest('http://localhost:3000/api/geo-detect');
    
    const { GET } = await import('@/app/api/geo-detect/route');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('countryCode', 'US');
    expect(data).toHaveProperty('detectionMethod', 'default');
  });
});

describe('API: /api/pricing/tiers', () => {
  it('should return pricing for all countries and types', async () => {
    const request = mockRequest('http://localhost:3000/api/pricing/tiers');
    
    const { GET } = await import('@/app/api/pricing/tiers/route');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('baseUSD');
    expect(data).toHaveProperty('pricing');
    
    // Verify base prices
    expect(data.baseUSD).toHaveProperty('popup', 5);
    expect(data.baseUSD).toHaveProperty('hightough', 150);
    expect(data.baseUSD).toHaveProperty('soundcheck', 300);
    expect(data.baseUSD).toHaveProperty('backstage', 1500);
    
    // Verify pricing matrix structure
    expect(data.pricing).toHaveProperty('TH');
    expect(data.pricing.TH).toHaveProperty('hightough');
    expect(data.pricing.TH.hightough).toHaveProperty('amount');
    expect(data.pricing.TH.hightough).toHaveProperty('currency', 'THB');
    expect(data.pricing.TH.hightough).toHaveProperty('formatted');
  });

  it('should return pricing for specific country', async () => {
    const request = mockRequest('http://localhost:3000/api/pricing/tiers?country=TH');
    
    const { GET } = await import('@/app/api/pricing/tiers/route');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('pricing');
    expect(Object.keys(data.pricing)).toHaveLength(1);
    expect(data.pricing).toHaveProperty('TH');
  });

  it('should return pricing for specific type', async () => {
    const request = mockRequest('http://localhost:3000/api/pricing/tiers?type=hightough');
    
    const { GET } = await import('@/app/api/pricing/tiers/route');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('pricing');
    
    // All countries should only have hightough pricing
    Object.values(data.pricing).forEach((countryPricing: any) => {
      expect(Object.keys(countryPricing)).toHaveLength(1);
      expect(countryPricing).toHaveProperty('hightough');
    });
  });

  it('should return simplified response for specific country+type', async () => {
    const request = mockRequest('http://localhost:3000/api/pricing/tiers?country=TH&type=hightough');
    
    const { GET } = await import('@/app/api/pricing/tiers/route');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('country', 'TH');
    expect(data).toHaveProperty('type', 'hightough');
    expect(data).toHaveProperty('baseUSD', 150);
    expect(data).toHaveProperty('price');
    
    expect(data.price).toHaveProperty('amount');
    expect(data.price).toHaveProperty('currency', 'THB');
    expect(data.price).toHaveProperty('formatted');
  });

  it('should return 400 for invalid country', async () => {
    const request = mockRequest('http://localhost:3000/api/pricing/tiers?country=XX');
    
    const { GET } = await import('@/app/api/pricing/tiers/route');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error', 'Invalid country code');
  });

  it('should return 400 for invalid type', async () => {
    const request = mockRequest('http://localhost:3000/api/pricing/tiers?type=invalid');
    
    const { GET } = await import('@/app/api/pricing/tiers/route');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error', 'Invalid experience type');
  });

  it('should apply PPP adjustment correctly', async () => {
    const request = mockRequest('http://localhost:3000/api/pricing/tiers?country=TH&type=hightough');
    
    const { GET } = await import('@/app/api/pricing/tiers/route');
    const response = await GET(request as any);
    const data = await response.json();

    // Hightough base: $150 → PPP (60%): $90 → THB (35): ฿3,150
    expect(data.price.amount).toBe(3150);
    expect(data.price.currency).toBe('THB');
  });

  it('should handle all experience types correctly', async () => {
    const types = ['popup', 'hightough', 'soundcheck', 'backstage'];
    
    for (const type of types) {
      const request = mockRequest(`http://localhost:3000/api/pricing/tiers?country=US&type=${type}`);
      
      const { GET } = await import('@/app/api/pricing/tiers/route');
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.type).toBe(type);
      expect(data.price.currency).toBe('USD');
    }
  });
});
