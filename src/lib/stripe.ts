/**
 * Stripe Price ID Utilities
 * 
 * Maps experience types and countries to Stripe Price IDs
 * Price IDs are configured in environment variables
 * 
 * @server-only This module should only be used on the server side
 */

import 'server-only';
import { type CountryCode, type ExperienceType } from '@/lib/currency';

/**
 * Get Stripe Price ID for a specific country and experience type
 * 
 * Price IDs are stored as environment variables:
 * STRIPE_PRICE_[COUNTRY]_[TYPE]
 * 
 * Example: STRIPE_PRICE_TH_HIGHTOUGH=price_xxxxx
 */
export function getStripePriceId(
  country: CountryCode,
  experienceType: ExperienceType
): string | null {
  if (typeof process === 'undefined' || !process.env) {
    return null;
  }
  
  const envKey = `STRIPE_PRICE_${country}_${experienceType.toUpperCase()}`;
  
  // Try to get from environment
  const priceId = process.env[envKey];
  
  if (!priceId) {
    console.warn(`[Stripe] Missing price ID for ${country} ${experienceType}. Set ${envKey} in .env`);
    return null;
  }
  
  return priceId;
}

/**
 * Get all Stripe Price IDs for an experience type across all countries
 */
export function getAllPriceIdsForType(experienceType: ExperienceType): Record<CountryCode, string | null> {
  const countries: CountryCode[] = ['US', 'TH', 'ID', 'PH', 'KZ', 'TW', 'SG', 'MY', 'JP', 'KR', 'CN'];
  
  const priceIds: Record<CountryCode, string | null> = {} as any;
  
  for (const country of countries) {
    priceIds[country] = getStripePriceId(country, experienceType);
  }
  
  return priceIds;
}

/**
 * Validate that all required Stripe Price IDs are configured
 * Returns array of missing configurations
 */
export function validateStripePriceIds(): { country: CountryCode; type: ExperienceType }[] {
  const countries: CountryCode[] = ['US', 'TH', 'ID', 'PH', 'KZ', 'TW', 'SG', 'MY', 'JP', 'KR', 'CN'];
  const types: ExperienceType[] = ['popup', 'hightough', 'soundcheck', 'backstage'];
  
  const missing: { country: CountryCode; type: ExperienceType }[] = [];
  
  for (const country of countries) {
    for (const type of types) {
      const priceId = getStripePriceId(country, type);
      if (!priceId) {
        missing.push({ country, type });
      }
    }
  }
  
  return missing;
}

/**
 * Stripe configuration
 */
export const STRIPE_CONFIG = {
  publishableKey: typeof process !== 'undefined' && process.env ? (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '') : '',
  secretKey: typeof process !== 'undefined' && process.env ? (process.env.STRIPE_SECRET_KEY || '') : '',
  webhookSecret: typeof process !== 'undefined' && process.env ? (process.env.STRIPE_WEBHOOK_SECRET || '') : '',
  
  // Stripe Checkout settings
  mode: 'payment' as const,
  successUrl: '/k-experience/booking/success?session_id={CHECKOUT_SESSION_ID}',
  cancelUrl: '/k-experience/booking/cancel',
  
  // Supported payment methods
  paymentMethodTypes: ['card'],
  
  // Currency configuration
  // Stripe will handle currency conversion based on Price ID currency
};

/**
 * Check if Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  return !!(
    STRIPE_CONFIG.publishableKey &&
    STRIPE_CONFIG.secretKey &&
    STRIPE_CONFIG.webhookSecret
  );
}
