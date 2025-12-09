import Stripe from 'stripe';
import { TierType, TIER_PRICES_KRW, EXCHANGE_RATES } from '../lib/global-pricing';

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEY is missing in environment variables');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-01-27.acacia' as any,
});

// Define pricing tiers for Stripe product creation
const PRICING_TIERS: Record<Exclude<TierType, 'free'>, {
  name: string;
  price: { KRW: number; USD: number; JPY: number };
  features: string[];
}> = {
  silver: {
    name: 'Silver',
    price: {
      KRW: TIER_PRICES_KRW.silver.monthly,
      USD: Math.round(TIER_PRICES_KRW.silver.monthly * EXCHANGE_RATES.USD * 100) / 100,
      JPY: Math.round(TIER_PRICES_KRW.silver.monthly * EXCHANGE_RATES.JPY),
    },
    features: ['Unlimited verifications', 'Ad-free experience', 'Priority notifications'],
  },
  gold: {
    name: 'Gold',
    price: {
      KRW: TIER_PRICES_KRW.gold.monthly,
      USD: Math.round(TIER_PRICES_KRW.gold.monthly * EXCHANGE_RATES.USD * 100) / 100,
      JPY: Math.round(TIER_PRICES_KRW.gold.monthly * EXCHANGE_RATES.JPY),
    },
    features: ['All Silver features', 'VIP 24h early access', 'Fanmeeting priority 2x'],
  },
  platinum: {
    name: 'Platinum',
    price: {
      KRW: TIER_PRICES_KRW.platinum.monthly,
      USD: Math.round(TIER_PRICES_KRW.platinum.monthly * EXCHANGE_RATES.USD * 100) / 100,
      JPY: Math.round(TIER_PRICES_KRW.platinum.monthly * EXCHANGE_RATES.JPY),
    },
    features: ['All Gold features', 'VIP 48h early access', 'Concierge service'],
  },
};

async function seedProducts() {
  console.log('🚀 Starting Stripe Product Seeding...');

  for (const tierKey of Object.keys(PRICING_TIERS) as Array<Exclude<TierType, 'free'>>) {
    const tier = PRICING_TIERS[tierKey];
    
    // 1. Create Product
    console.log(`Creating product for: ${tier.name}`);
    
    const product = await stripe.products.create({
      name: `ZZIK VIP - ${tier.name}`,
      description: `ZZIK Global VIP Membership (${tier.name})`,
      metadata: {
        tier_level: tierKey
      }
    });

    console.log(`✅ Product Created: ${product.name} (${product.id})`);

    // 2. Create Prices (KRW, USD, JPY)
    // KRW
    await stripe.prices.create({
      product: product.id,
      unit_amount: tier.price.KRW,
      currency: 'krw',
      recurring: { interval: 'month' },
      metadata: { region: 'KR' }
    });
    console.log(`   - Created KRW Price: ₩${tier.price.KRW.toLocaleString()}`);

    // USD
    await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(tier.price.USD * 100), // cents
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { region: 'GLOBAL' }
    });
    console.log(`   - Created USD Price: $${tier.price.USD}`);

    // JPY
    await stripe.prices.create({
      product: product.id,
      unit_amount: tier.price.JPY,
      currency: 'jpy',
      recurring: { interval: 'month' },
      metadata: { region: 'JP' }
    });
    console.log(`   - Created JPY Price: ¥${tier.price.JPY.toLocaleString()}`);
  }

  console.log('\n✨ All products and prices seeded successfully!');
  console.log('IMPORTANT: Please copy the Price IDs from your Stripe Dashboard to src/lib/global-pricing.ts mapped by region/currency.');
}

seedProducts().catch((err) => {
  console.error('❌ Error seeding products:', err);
  process.exit(1);
});
