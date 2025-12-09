// src/app/api/payment/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    // Skip verification if using placeholder key
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      return NextResponse.json({
        success: true,
        order: {
          tier: 'gold',
          email: 'demo@example.com',
          status: 'complete',
        },
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed', status: session.payment_status },
        { status: 400 }
      );
    }

    // Extract tier from metadata
    const tier = session.metadata?.tier || 'unknown';
    const customerEmail = session.customer_email || 
      (session.customer as Stripe.Customer)?.email || 
      'unknown';

    return NextResponse.json({
      success: true,
      order: {
        tier,
        email: customerEmail,
        status: session.status,
        subscriptionId: (session.subscription as Stripe.Subscription)?.id,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
