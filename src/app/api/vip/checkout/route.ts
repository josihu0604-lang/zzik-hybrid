import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { typedFrom } from '@/lib/supabase/typed-client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-11-17.clover' as any,
  typescript: true,
});

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { priceId, tier } = await request.json();

    if (!priceId) {
       // Allow for "Free" tier upgrade without Stripe if strictly internal
       if (tier === 'Free') {
           // Logic to downgrade/reset would go here
           return NextResponse.json({ success: true, message: 'Downgraded to Free' });
       }
       return NextResponse.json({ error: 'Price ID required' }, { status: 400 });
    }

    // Create Stripe Checkout Session for Subscription
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: user.email || undefined,
      metadata: {
        userId: user.id,
        tier: tier,
        type: 'vip_subscription'
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://zzik-hybrid.vercel.app'}/vip/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://zzik-hybrid.vercel.app'}/vip`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });

  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
