// src/app/api/payment/webhook/route.ts
// Stripe Webhook Handler - Processes payment events and manages VIP tickets

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { 
  createVIPTicket, 
  activateTicket, 
  deactivateUserTicket,
  getTicketByStripeSubscription,
  createTransaction,
  updateTransactionStatus
} from '@/lib/vip-ticket';
import { TierType, Region, REGION_CURRENCY, Currency } from '@/lib/global-pricing';

// Initialize Stripe with latest stable API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-11-17.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

// Disable body parsing for raw body access
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');
  
  if (!signature) {
    console.error('[Webhook] Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Webhook] Signature verification failed:', errorMessage);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  console.log(`[Webhook] Processing event: ${event.type} (${event.id})`);
  
  try {
    switch (event.type) {
      // Checkout completed - create and activate VIP ticket
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }
      
      // Subscription updated - handle upgrades/downgrades
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }
      
      // Subscription cancelled
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancel(subscription);
        break;
      }
      
      // Payment failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
      
      // Payment succeeded (for renewals)
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }
      
      // Payment intent events for tracking
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }
      
      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Webhook] Error processing ${event.type}:`, errorMessage);
    // Return 200 to prevent Stripe from retrying
    // Log the error for investigation
    return NextResponse.json({ received: true, error: errorMessage });
  }
}

// =============================================================================
// Event Handlers
// =============================================================================

/**
 * Handle successful checkout - Create and activate VIP ticket
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  if (!session.metadata) {
    console.warn('[Webhook] Checkout session missing metadata');
    return;
  }

  const { userId, tier, region, period } = session.metadata;
  
  if (!userId || !tier || !region || !period) {
    console.error('[Webhook] Missing required metadata fields', session.metadata);
    return;
  }
  
  try {
    // Create the VIP ticket
    const ticket = await createVIPTicket(
      userId, 
      tier as TierType, 
      region as Region, 
      period as 'monthly' | 'yearly'
    );
    
    // Activate the ticket with Stripe subscription info
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;
    
    await activateTicket(ticket.id, subscriptionId, customerId);
    
    // Create transaction record
    const amount = session.amount_total ? session.amount_total / 100 : 0;
    const currency = (session.currency?.toUpperCase() || 'USD') as Currency;
    
    await createTransaction({
      ticketId: ticket.id,
      userId,
      amount,
      currency,
      status: 'completed',
      transactionType: 'subscription',
      stripePaymentIntentId: session.payment_intent as string,
      description: `VIP ${tier} subscription (${period})`,
      metadata: { sessionId: session.id },
      completedAt: new Date(),
    });
    
    console.log(`[Webhook] VIP Ticket activated: ${ticket.id} for User: ${userId}, Tier: ${tier}`);
  } catch (error) {
    console.error('[Webhook] Failed to process checkout:', error);
    throw error;
  }
}

/**
 * Handle subscription updates (upgrades/downgrades)
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  const { userId, tier, region } = subscription.metadata;
  
  if (!userId) {
    console.warn('[Webhook] Subscription missing userId in metadata');
    return;
  }
  
  // Get existing ticket
  const existingTicket = await getTicketByStripeSubscription(subscriptionId);
  
  if (!existingTicket) {
    console.warn(`[Webhook] No ticket found for subscription: ${subscriptionId}`);
    return;
  }
  
  // Check if tier changed
  if (tier && tier !== existingTicket.tier) {
    // Log tier change
    await createTransaction({
      ticketId: existingTicket.id,
      userId,
      amount: 0, // Proration handled by Stripe
      currency: REGION_CURRENCY[existingTicket.region],
      status: 'completed',
      transactionType: 'upgrade',
      description: `Tier change: ${existingTicket.tier} -> ${tier}`,
      metadata: { subscriptionId, previousTier: existingTicket.tier, newTier: tier },
      completedAt: new Date(),
    });
  }
  
  console.log(`[Webhook] Subscription updated for user: ${userId}, Status: ${subscription.status}`);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancel(subscription: Stripe.Subscription) {
  const { userId } = subscription.metadata;
  const subscriptionId = subscription.id;
  
  if (!userId) {
    console.warn('[Webhook] Cancelled subscription missing userId');
    return;
  }
  
  // Deactivate the user's ticket
  await deactivateUserTicket(userId);
  
  // Get ticket for transaction record
  const ticket = await getTicketByStripeSubscription(subscriptionId);
  
  if (ticket) {
    await createTransaction({
      ticketId: ticket.id,
      userId,
      amount: 0,
      currency: REGION_CURRENCY[ticket.region],
      status: 'completed',
      transactionType: 'refund',
      description: 'Subscription cancelled',
      metadata: { subscriptionId, cancelledAt: new Date().toISOString() },
      completedAt: new Date(),
    });
  }
  
  console.log(`[Webhook] Subscription cancelled for user: ${userId}`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  // Use type assertion for invoice object which may have subscription in newer Stripe versions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceAny = invoice as any;
  const subscriptionId: string | undefined = typeof invoiceAny.subscription === 'string' 
    ? invoiceAny.subscription 
    : invoiceAny.subscription?.id;
  
  // Get ticket by subscription
  const ticket = subscriptionId 
    ? await getTicketByStripeSubscription(subscriptionId)
    : null;
  
  if (ticket) {
    await createTransaction({
      ticketId: ticket.id,
      userId: ticket.userId,
      amount: (invoice.amount_due || 0) / 100,
      currency: (invoice.currency?.toUpperCase() || 'USD') as Currency,
      status: 'failed',
      transactionType: 'renewal',
      stripeInvoiceId: invoice.id,
      description: 'Payment failed',
      errorMessage: invoice.last_finalization_error?.message || 'Payment failed',
      metadata: { invoiceId: invoice.id },
    });
    
    // TODO: Send notification to user about failed payment
    // await sendPaymentFailedNotification(ticket.userId, invoice);
  }
  
  console.log(`[Webhook] Payment failed for customer: ${customerId}, Invoice: ${invoice.id}`);
}

/**
 * Handle successful payment (renewals)
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Use type assertion for invoice object which may have subscription in newer Stripe versions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceAny = invoice as any;
  const subscriptionId: string | undefined = typeof invoiceAny.subscription === 'string' 
    ? invoiceAny.subscription 
    : invoiceAny.subscription?.id;
  
  if (!subscriptionId) return;
  
  const ticket = await getTicketByStripeSubscription(subscriptionId);
  
  if (ticket) {
    await createTransaction({
      ticketId: ticket.id,
      userId: ticket.userId,
      amount: (invoice.amount_paid || 0) / 100,
      currency: (invoice.currency?.toUpperCase() || 'USD') as Currency,
      status: 'completed',
      transactionType: 'renewal',
      stripeInvoiceId: invoice.id,
      description: 'Subscription renewal',
      metadata: { invoiceId: invoice.id },
      completedAt: new Date(),
    });
    
    console.log(`[Webhook] Payment succeeded for ticket: ${ticket.id}`);
  }
}

/**
 * Handle payment intent succeeded
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { userId, ticketId } = paymentIntent.metadata;
  
  if (ticketId) {
    await updateTransactionStatus(ticketId, 'completed');
  }
  
  console.log(`[Webhook] Payment intent succeeded: ${paymentIntent.id}, User: ${userId || 'unknown'}`);
}

/**
 * Handle payment intent failed
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { userId, ticketId } = paymentIntent.metadata;
  const errorMessage = paymentIntent.last_payment_error?.message || 'Payment failed';
  
  if (ticketId) {
    await updateTransactionStatus(ticketId, 'failed', errorMessage);
  }
  
  console.log(`[Webhook] Payment intent failed: ${paymentIntent.id}, Error: ${errorMessage}`);
}
