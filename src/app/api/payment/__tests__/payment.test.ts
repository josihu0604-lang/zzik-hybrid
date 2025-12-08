
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as checkoutPOST } from '../checkout/route';
import { NextRequest } from 'next/server';

// Mock Supabase
const mockGetUser = vi.fn();
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getUser: mockGetUser
    }
  })
}));

// Mock Next.js cookies
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: () => ({ value: 'dummy-token' })
  })
}));

// Mock Stripe Lib
vi.mock('@/lib/payment/stripe', () => ({
  createCheckoutSession: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' })
}));

describe('Payment Checkout API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a checkout session for authenticated user', async () => {
    // Setup Mock User
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'test-user-id', email: 'test@example.com' }
      },
      error: null
    });

    const body = {
      tier: 'gold',
      region: 'GLOBAL',
      period: 'monthly'
    };

    const request = new NextRequest('http://localhost:3000/api/payment/checkout', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    const response = await checkoutPOST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.url).toBe('https://checkout.stripe.com/test');
  });

  it('should return 401 if not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: 'Auth error'
    });

    const body = { tier: 'gold', region: 'GLOBAL', period: 'monthly' };
    const request = new NextRequest('http://localhost:3000/api/payment/checkout', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    const response = await checkoutPOST(request);
    
    expect(response.status).toBe(401);
  });
});
