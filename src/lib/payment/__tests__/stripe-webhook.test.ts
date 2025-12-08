
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../../app/api/payment/webhook/route';
import { NextRequest } from 'next/server';

// Mock imports
vi.mock('stripe', () => {
  const constructEvent = vi.fn();
  const Stripe = vi.fn(function() {
    return {
      webhooks: {
        constructEvent
      }
    };
  });
  // @ts-expect-error
  Stripe.constructEvent = constructEvent;
  return {
    default: Stripe
  };
});

vi.mock('../../vip-ticket', () => ({
  createVIPTicket: vi.fn().mockResolvedValue({ id: 'ticket_123' }),
  activateTicket: vi.fn().mockResolvedValue({ id: 'ticket_123', isActive: true }),
  deactivateUserTicket: vi.fn().mockResolvedValue(undefined),
  getTicketByStripeSubscription: vi.fn().mockResolvedValue({
    id: 'ticket_123',
    userId: 'user_123',
    tier: 'silver',
    region: 'KR'
  }),
  createTransaction: vi.fn().mockResolvedValue({ id: 'tx_123' }),
  updateTransactionStatus: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: (key: string) => {
      if (key === 'stripe-signature') return 'dummy_signature';
      return null;
    }
  })
}));

describe('Stripe Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process checkout.session.completed', async () => {
    // Setup specific mock for this test
    const stripeMock = (await import('stripe')).default;
    // @ts-expect-error
    stripeMock.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'sess_123',
          metadata: {
            userId: 'user_123',
            tier: 'gold',
            region: 'KR',
            period: 'monthly'
          },
          subscription: 'sub_123',
          customer: 'cus_123',
          amount_total: 19900,
          currency: 'krw',
          payment_intent: 'pi_123'
        }
      }
    });

    const req = new NextRequest('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: 'raw_body_content'
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ received: true });

    // Verify business logic calls
    const { createVIPTicket, activateTicket, createTransaction } = await import('../../vip-ticket');
    
    expect(createVIPTicket).toHaveBeenCalledWith('user_123', 'gold', 'KR', 'monthly');
    expect(activateTicket).toHaveBeenCalledWith('ticket_123', 'sub_123', 'cus_123');
    expect(createTransaction).toHaveBeenCalledWith(expect.objectContaining({
      ticketId: 'ticket_123',
      userId: 'user_123',
      amount: 199, // 19900 / 100
      status: 'completed',
      transactionType: 'subscription'
    }));
  });

  it('should handle customer.subscription.deleted', async () => {
    // Setup specific mock
    const stripeMock = (await import('stripe')).default;
    // @ts-expect-error
    stripeMock.constructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_123',
          metadata: {
            userId: 'user_123'
          }
        }
      }
    });

    const req = new NextRequest('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: 'raw_body'
    });

    await POST(req);

    const { deactivateUserTicket, createTransaction } = await import('../../vip-ticket');
    expect(deactivateUserTicket).toHaveBeenCalledWith('user_123');
    expect(createTransaction).toHaveBeenCalledWith(expect.objectContaining({
      transactionType: 'refund', // Logic says refund/cancellation
      description: 'Subscription cancelled'
    }));
  });
});
