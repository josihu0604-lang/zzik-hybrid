
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../checkout/route';
import { NextRequest } from 'next/server';

// Mock Dependencies

// 1. Mock Stripe
const { mockSessionsCreate } = vi.hoisted(() => {
  return { mockSessionsCreate: vi.fn() };
});

vi.mock('stripe', () => {
  return {
    default: class MockStripe {
      checkout = {
        sessions: {
          create: mockSessionsCreate,
        },
      };
    },
  };
});

// 2. Mock Supabase
const mockGetUser = vi.fn();
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

// 3. Mock Next.js headers
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
  }),
}));

// 4. Mock existing payment lib
vi.mock('@/lib/payment/stripe', () => ({
  createCheckoutSession: vi.fn(),
}));

describe('Booking Checkout API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-key';
  });

  it('should create a checkout session for a one-time booking', async () => {
    // Setup Mocks
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user_123', email: 'test@example.com' } },
    });

    mockSessionsCreate.mockResolvedValue({
      url: 'https://checkout.stripe.com/test-booking',
      id: 'cs_test_booking_123',
    });

    // Create Request
    const body = {
      mode: 'payment',
      title: 'K-Pop Dance Class',
      amount: 50000,
      currency: 'KRW',
      experienceId: 'exp_123',
      date: '2025-05-20',
      time: '14:00',
      guests: 2,
    };

    const req = new NextRequest('http://localhost:3000/api/payment/checkout', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    // Execute
    const res = await POST(req);
    const data = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(data.url).toBe('https://checkout.stripe.com/test-booking');

    // Verify Stripe Call
    expect(mockSessionsCreate).toHaveBeenCalledWith(expect.objectContaining({
      customer_email: 'test@example.com',
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'krw',
            product_data: {
              name: 'K-Pop Dance Class',
              description: '2025-05-20 14:00 (2 guests)',
              metadata: {
                experienceId: 'exp_123',
                date: '2025-05-20',
                time: '14:00',
                guests: 2
              }
            },
            unit_amount: 50000, // KRW is zero-decimal logic in our code? 
            // Wait, logic says: Math.round(amount * (['krw', 'jpy'].includes(currency.toLowerCase()) ? 1 : 100))
            // So 50000 * 1 = 50000. Correct.
          },
          quantity: 1,
        },
      ],
      metadata: expect.objectContaining({
        type: 'experience_booking',
        experienceId: 'exp_123',
        userId: 'user_123'
      })
    }));
  });

  it('should return 400 if required booking fields are missing', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user_123', email: 'test@example.com' } },
    });

    const body = {
      mode: 'payment',
      // Missing title, amount, etc.
      experienceId: 'exp_123',
    };

    const req = new NextRequest('http://localhost:3000/api/payment/checkout', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Missing required payment fields');
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    const req = new NextRequest('http://localhost:3000/api/payment/checkout', {
      method: 'POST',
      body: JSON.stringify({ mode: 'payment' }),
    });

    const res = await POST(req);
    
    expect(res.status).toBe(401);
  });
});
