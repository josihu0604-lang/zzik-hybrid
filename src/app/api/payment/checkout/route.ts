// src/app/api/payment/checkout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/payment/stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { withIdempotency } from '@/lib/idempotency';

// Initialize Stripe server-side
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
});

export async function POST(request: NextRequest) {
  const idempotencyKey = request.headers.get('idempotency-key') || undefined;

  return withIdempotency(idempotencyKey, async () => {
    try {
      const cookieStore = await cookies();
      
      // Initialize Supabase Client (SSR)
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
          },
        }
      );

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const body = await request.json();
      const { mode = 'subscription' } = body;
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const userEmail = user.email || 'guest@example.com';

      // Handle One-Time Payment (K-Experience Booking)
      if (mode === 'payment') {
        const { title, amount, currency, experienceId, date, time, guests } = body;

        if (!title || !amount || !currency || !experienceId) {
          return NextResponse.json({ error: 'Missing required payment fields' }, { status: 400 });
        }

        // Create Stripe Session for one-time payment
        const session = await stripe.checkout.sessions.create({
          customer_email: userEmail,
          payment_method_types: ['card'], // Extend based on region if needed
          line_items: [
            {
              price_data: {
                currency: currency.toLowerCase(),
                product_data: {
                  name: title,
                  description: `${date} ${time} (${guests} guests)`,
                  metadata: {
                    experienceId,
                    date,
                    time,
                    guests
                  }
                },
                unit_amount: Math.round(amount * (['krw', 'jpy'].includes(currency.toLowerCase()) ? 1 : 100)), // Handle zero-decimal currencies
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=experience`,
          cancel_url: `${baseUrl}/payment/cancel`,
          metadata: {
            userId: user.id,
            type: 'experience_booking',
            experienceId,
            date,
            time,
            guests
          },
        }, {
          idempotencyKey: idempotencyKey ? `stripe-${idempotencyKey}` : undefined,
        });

        if (!session.url) {
          return NextResponse.json({ error: 'Failed to generate checkout URL' }, { status: 500 });
        }

        return NextResponse.json({ url: session.url });
      }

      // Handle Subscription (VIP Membership) - Existing Logic
      const { tier, region, period } = body;
      
      if (!tier || !region || !period) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
      
      const session = await createCheckoutSession(
        user.id,
        userEmail,
        tier,
        region,
        period,
        `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        `${baseUrl}/payment/cancel`
      );
      
      if (!session.url) {
        return NextResponse.json({ error: 'Failed to generate checkout URL' }, { status: 500 });
      }

      return NextResponse.json({ url: session.url });
    } catch (error) {
      console.error('Checkout error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  });
}
