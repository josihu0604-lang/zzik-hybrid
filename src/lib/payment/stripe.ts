// src/lib/payment/stripe.ts

import Stripe from 'stripe';
import { TierType, Region } from '../global-pricing';

// Initialize Stripe
// NOTE: In production, ensure STRIPE_SECRET_KEY is set in environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-11-17.clover', // Using latest stable version
});

/**
 * Stripe Price ID Mapping
 * 
 * IMPORTANT: Replace placeholder values with real Price IDs from Stripe Dashboard
 * 
 * How to set up:
 * 1. Go to Stripe Dashboard > Products
 * 2. Create products for each tier (Silver, Gold, Platinum)
 * 3. Add prices for each region and billing period
 * 4. Copy the Price IDs (starting with price_) and update this mapping
 * 5. Or use environment variables for flexibility:
 *    - STRIPE_PRICE_SILVER_MONTHLY_KR=price_xxx
 *    - STRIPE_PRICE_GOLD_YEARLY_JP=price_yyy
 */
const STRIPE_PRICES: Record<string, string> = {
  // =========================================
  // B2C Tiers - KOREA (KRW)
  // =========================================
  // Monthly
  'silver_monthly_KR': process.env.STRIPE_PRICE_SILVER_MONTHLY_KR || 'price_silver_kr_monthly',
  'gold_monthly_KR': process.env.STRIPE_PRICE_GOLD_MONTHLY_KR || 'price_gold_kr_monthly',
  'platinum_monthly_KR': process.env.STRIPE_PRICE_PLATINUM_MONTHLY_KR || 'price_platinum_kr_monthly',
  // Yearly
  'silver_yearly_KR': process.env.STRIPE_PRICE_SILVER_YEARLY_KR || 'price_silver_kr_yearly',
  'gold_yearly_KR': process.env.STRIPE_PRICE_GOLD_YEARLY_KR || 'price_gold_kr_yearly',
  'platinum_yearly_KR': process.env.STRIPE_PRICE_PLATINUM_YEARLY_KR || 'price_platinum_kr_yearly',
  
  // =========================================
  // B2C Tiers - JAPAN (JPY)
  // =========================================
  // Monthly
  'silver_monthly_JP': process.env.STRIPE_PRICE_SILVER_MONTHLY_JP || 'price_silver_jp_monthly',
  'gold_monthly_JP': process.env.STRIPE_PRICE_GOLD_MONTHLY_JP || 'price_gold_jp_monthly',
  'platinum_monthly_JP': process.env.STRIPE_PRICE_PLATINUM_MONTHLY_JP || 'price_platinum_jp_monthly',
  // Yearly
  'silver_yearly_JP': process.env.STRIPE_PRICE_SILVER_YEARLY_JP || 'price_silver_jp_yearly',
  'gold_yearly_JP': process.env.STRIPE_PRICE_GOLD_YEARLY_JP || 'price_gold_jp_yearly',
  'platinum_yearly_JP': process.env.STRIPE_PRICE_PLATINUM_YEARLY_JP || 'price_platinum_jp_yearly',
  
  // =========================================
  // B2C Tiers - USA (USD)
  // =========================================
  // Monthly
  'silver_monthly_US': process.env.STRIPE_PRICE_SILVER_MONTHLY_US || 'price_silver_us_monthly',
  'gold_monthly_US': process.env.STRIPE_PRICE_GOLD_MONTHLY_US || 'price_gold_us_monthly',
  'platinum_monthly_US': process.env.STRIPE_PRICE_PLATINUM_MONTHLY_US || 'price_platinum_us_monthly',
  // Yearly
  'silver_yearly_US': process.env.STRIPE_PRICE_SILVER_YEARLY_US || 'price_silver_us_yearly',
  'gold_yearly_US': process.env.STRIPE_PRICE_GOLD_YEARLY_US || 'price_gold_us_yearly',
  'platinum_yearly_US': process.env.STRIPE_PRICE_PLATINUM_YEARLY_US || 'price_platinum_us_yearly',
  
  // =========================================
  // B2C Tiers - TAIWAN (TWD)
  // =========================================
  'silver_monthly_TW': process.env.STRIPE_PRICE_SILVER_MONTHLY_TW || 'price_silver_tw_monthly',
  'gold_monthly_TW': process.env.STRIPE_PRICE_GOLD_MONTHLY_TW || 'price_gold_tw_monthly',
  'platinum_monthly_TW': process.env.STRIPE_PRICE_PLATINUM_MONTHLY_TW || 'price_platinum_tw_monthly',
  'silver_yearly_TW': process.env.STRIPE_PRICE_SILVER_YEARLY_TW || 'price_silver_tw_yearly',
  'gold_yearly_TW': process.env.STRIPE_PRICE_GOLD_YEARLY_TW || 'price_gold_tw_yearly',
  'platinum_yearly_TW': process.env.STRIPE_PRICE_PLATINUM_YEARLY_TW || 'price_platinum_tw_yearly',
  
  // =========================================
  // B2C Tiers - THAILAND (THB)
  // =========================================
  'silver_monthly_TH': process.env.STRIPE_PRICE_SILVER_MONTHLY_TH || 'price_silver_th_monthly',
  'gold_monthly_TH': process.env.STRIPE_PRICE_GOLD_MONTHLY_TH || 'price_gold_th_monthly',
  'platinum_monthly_TH': process.env.STRIPE_PRICE_PLATINUM_MONTHLY_TH || 'price_platinum_th_monthly',
  'silver_yearly_TH': process.env.STRIPE_PRICE_SILVER_YEARLY_TH || 'price_silver_th_yearly',
  'gold_yearly_TH': process.env.STRIPE_PRICE_GOLD_YEARLY_TH || 'price_gold_th_yearly',
  'platinum_yearly_TH': process.env.STRIPE_PRICE_PLATINUM_YEARLY_TH || 'price_platinum_th_yearly',
  
  // =========================================
  // B2C Tiers - GLOBAL/SEA/EU (USD)
  // =========================================
  'silver_monthly_GLOBAL': process.env.STRIPE_PRICE_SILVER_MONTHLY_GLOBAL || 'price_silver_global_monthly',
  'gold_monthly_GLOBAL': process.env.STRIPE_PRICE_GOLD_MONTHLY_GLOBAL || 'price_gold_global_monthly',
  'platinum_monthly_GLOBAL': process.env.STRIPE_PRICE_PLATINUM_MONTHLY_GLOBAL || 'price_platinum_global_monthly',
  'silver_yearly_GLOBAL': process.env.STRIPE_PRICE_SILVER_YEARLY_GLOBAL || 'price_silver_global_yearly',
  'gold_yearly_GLOBAL': process.env.STRIPE_PRICE_GOLD_YEARLY_GLOBAL || 'price_gold_global_yearly',
  'platinum_yearly_GLOBAL': process.env.STRIPE_PRICE_PLATINUM_YEARLY_GLOBAL || 'price_platinum_global_yearly',
  
  // SEA uses GLOBAL pricing
  'silver_monthly_SEA': process.env.STRIPE_PRICE_SILVER_MONTHLY_GLOBAL || 'price_silver_global_monthly',
  'gold_monthly_SEA': process.env.STRIPE_PRICE_GOLD_MONTHLY_GLOBAL || 'price_gold_global_monthly',
  'platinum_monthly_SEA': process.env.STRIPE_PRICE_PLATINUM_MONTHLY_GLOBAL || 'price_platinum_global_monthly',
  
  // EU uses GLOBAL pricing with EUR
  'silver_monthly_EU': process.env.STRIPE_PRICE_SILVER_MONTHLY_EU || 'price_silver_eu_monthly',
  'gold_monthly_EU': process.env.STRIPE_PRICE_GOLD_MONTHLY_EU || 'price_gold_eu_monthly',
  'platinum_monthly_EU': process.env.STRIPE_PRICE_PLATINUM_MONTHLY_EU || 'price_platinum_eu_monthly',
  
  // CN uses GLOBAL pricing
  'silver_monthly_CN': process.env.STRIPE_PRICE_SILVER_MONTHLY_GLOBAL || 'price_silver_global_monthly',
  'gold_monthly_CN': process.env.STRIPE_PRICE_GOLD_MONTHLY_GLOBAL || 'price_gold_global_monthly',
  'platinum_monthly_CN': process.env.STRIPE_PRICE_PLATINUM_MONTHLY_GLOBAL || 'price_platinum_global_monthly',
};

/**
 * Get Price ID with validation
 */
export function getPriceId(tier: TierType, period: 'monthly' | 'yearly', region: Region): string | null {
  if (tier === 'free') return null;
  const key = `${tier}_${period}_${region}`;
  return STRIPE_PRICES[key] || STRIPE_PRICES[`${tier}_${period}_GLOBAL`] || null;
}

/**
 * Validate if Price ID is a real Stripe price (not placeholder)
 */
export function isValidPriceId(priceId: string | null): boolean {
  if (!priceId) return false;
  // Real Stripe price IDs start with 'price_' followed by alphanumeric characters
  return /^price_[a-zA-Z0-9]{10,}$/.test(priceId);
}

// Create Checkout Session
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  tier: TierType,
  region: Region,
  period: 'monthly' | 'yearly',
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const priceKey = `${tier}_${period}_${region}`;
  const priceId = STRIPE_PRICES[priceKey];
  
  // For development fallback if price ID is missing
  const effectivePriceId = priceId || 'price_fallback_test_id';

  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    line_items: [
      {
        price: effectivePriceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      tier,
      region,
      period,
    },
    subscription_data: {
      metadata: {
        userId,
        tier,
        region,
      },
    },
    // Region-specific payment methods
    payment_method_types: getPaymentMethodsForRegion(region),
    // Automatic tax calculation (optional)
    automatic_tax: { enabled: true },
  });
  
  return session;
}

// Helper: Get payment methods by region
function getPaymentMethodsForRegion(region: Region): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] {
  const methodsMap: Record<Region, Stripe.Checkout.SessionCreateParams.PaymentMethodType[]> = {
    KR: ['card'],
    JP: ['card'],
    TW: ['card'],
    CN: ['card', 'alipay', 'wechat_pay'],
    TH: ['card', 'promptpay'],
    US: ['card'],
    EU: ['card', 'sepa_debit', 'ideal', 'bancontact'],
    SEA: ['card', 'grabpay'],
    GLOBAL: ['card'],
  };
  
  return methodsMap[region] || ['card'];
}

// Cancel Subscription
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

// Upgrade Subscription (Proration)
export async function upgradeSubscription(
  subscriptionId: string,
  newTier: TierType,
  region: Region
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const currentItem = subscription.items.data[0];
  const currentPeriod = currentItem.price.recurring?.interval === 'year' 
    ? 'yearly' 
    : 'monthly';
  
  const newPriceKey = `${newTier}_${currentPeriod}_${region}`;
  const newPriceId = STRIPE_PRICES[newPriceKey] || 'price_fallback_upgrade_id';
  
  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: currentItem.id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

// Create Customer Portal Session (Self-serve subscription management)
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
