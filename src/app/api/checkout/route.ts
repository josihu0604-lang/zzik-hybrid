import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { typedFrom } from '@/lib/supabase/typed-client';
import { sendPushNotifications } from '@/lib/push-notifications-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-11-17.clover', // Using a recent API version
  typescript: true,
});

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { experienceId } = await request.json();

    if (!experienceId) {
       return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }

    // Fetch experience details
    const { data: experience, error: expError } = await typedFrom(supabase, 'experiences')
      .select('*')
      .eq('id', experienceId)
      .single();

    if (expError || !experience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(experience.price * 100), // Convert to cents/smallest unit
      currency: experience.currency ? experience.currency.toLowerCase() : 'usd',
      metadata: {
        experienceId: experience.id,
        userId: user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create Booking record (pending)
    const { error: bookingError } = await typedFrom(supabase, 'bookings')
      .insert({
        experience_id: experience.id,
        user_id: user.id,
        status: 'pending',
        payment_status: 'pending',
        payment_intent_id: paymentIntent.id,
        amount_paid: 0,
        created_at: new Date().toISOString(),
      });

    if (bookingError) {
      console.error('Booking creation failed:', bookingError);
      return NextResponse.json({ error: 'Failed to create booking record' }, { status: 500 });
    }

    // Send Push Notification (Async, don't block response)
    (async () => {
      try {
        await sendPushNotifications({
          userIds: [user.id],
          payload: {
            title: 'Booking Initiated',
            body: `Booking for ${experience.title} has been initiated. Complete payment to confirm.`,
            url: `/bookings/${paymentIntent.id}`,
          }
        });
      } catch (pushError) {
        console.error('Failed to send push notification:', pushError);
      }
    })();

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
