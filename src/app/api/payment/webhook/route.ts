import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendPushNotifications } from '@/lib/push-notifications-server';
import { typedFrom } from '@/lib/supabase/typed-client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-11-17.clover' as any, // Typed as any to avoid version mismatch errors in this specific file if types aren't updated
  typescript: true,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      // If no secret, we might be in dev mode without CLI, but for security we should fail in prod.
      // For now, if no secret, we can't verify.
      if (!endpointSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not set');
      event = stripe.webhooks.constructEvent(body, sig as string, endpointSecret);
    } else {
      event = stripe.webhooks.constructEvent(body, sig as string, endpointSecret);
    }
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(supabase, paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(supabase, paymentIntentFailed);
      break;
    // Add other event types here (e.g., customer.subscription.created for VIP)
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);

  // 1. Update Booking Status
  const { error: bookingError } = await typedFrom(supabase, 'bookings')
    .update({
      status: 'confirmed',
      payment_status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('payment_intent_id', paymentIntent.id);

  if (bookingError) {
    console.error('Error updating booking:', bookingError);
  }

  // 2. Update Transaction Record (if exists)
  const { error: txError } = await typedFrom(supabase, 'payment_transactions')
    .update({
      status: 'completed',
      stripe_charge_id: paymentIntent.latest_charge as string,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (txError) {
      console.error('Error updating transaction:', txError);
  }
  
  // 3. Send Push Notification
  const userId = paymentIntent.metadata.userId;
  const experienceId = paymentIntent.metadata.experienceId;

  if (userId) {
     // Fetch experience title for the notification
    const { data: exp } = await typedFrom(supabase, 'experiences').select('title').eq('id', experienceId).single();
    const title = exp?.title || 'Experience';

    await sendPushNotifications({
        userIds: [userId],
        payload: {
            title: 'Payment Successful! 🎉',
            body: `Your booking for ${title} is confirmed.`,
            url: `/bookings/confirmed/${paymentIntent.id}`
        }
    });
  }
}

async function handlePaymentFailure(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);

  await typedFrom(supabase, 'bookings')
    .update({
      status: 'cancelled',
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('payment_intent_id', paymentIntent.id);
    
  await typedFrom(supabase, 'payment_transactions')
    .update({
      status: 'failed',
      error_message: paymentIntent.last_payment_error?.message || 'Payment failed',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);
}
