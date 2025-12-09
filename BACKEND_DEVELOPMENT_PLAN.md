# ZZIK Backend Development Plan
## For GitHub Copilot Coding Agent

> K-POP VIP Experience Platform - Backend Architecture & Algorithm Enhancement

---

## 1. Project Overview

### Tech Stack
- **Runtime**: Node.js 20+ / Edge Runtime
- **Framework**: Next.js 15 App Router (API Routes)
- **Database**: Supabase PostgreSQL + Row Level Security
- **Auth**: Supabase Auth (Kakao, Google, Apple OAuth)
- **Storage**: Supabase Storage (images, receipts)
- **Cache**: Vercel KV / Upstash Redis
- **Queue**: Vercel Cron / Supabase Edge Functions
- **Payments**: Stripe / Local PSPs (PromptPay, GCash, etc.)

### Business Model
```
3-Way Marketplace:
├── Consumer: Book VIP experiences
├── Artist/Agency: List experiences, receive bookings
└── Leader: Refer users, earn 10% commission
```

---

## 2. Database Schema Enhancement

### 2.1 Core Tables (Supabase PostgreSQL)

```sql
-- ============================================
-- EXPERIENCES (VIP 체험 상품)
-- ============================================
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  artist_id UUID REFERENCES artists(id),
  title TEXT NOT NULL,
  description TEXT,
  type experience_type NOT NULL, -- 'hightough' | 'soundcheck' | 'backstage' | 'popup'

  -- Pricing (USD base, PPP adjusted per country)
  base_price_usd DECIMAL(10,2) NOT NULL,

  -- Capacity
  total_spots INTEGER NOT NULL,
  booked_spots INTEGER DEFAULT 0,

  -- Schedule
  event_date TIMESTAMPTZ NOT NULL,
  booking_deadline TIMESTAMPTZ NOT NULL,

  -- Location
  venue_name TEXT,
  venue_address TEXT,
  country_code CHAR(2) NOT NULL, -- ISO 3166-1 alpha-2
  city TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),

  -- Media
  cover_image_url TEXT,
  gallery_urls TEXT[],

  -- Status
  status experience_status DEFAULT 'draft', -- 'draft' | 'active' | 'soldout' | 'completed' | 'cancelled'

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Search optimization
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED
);

CREATE INDEX idx_experiences_search ON experiences USING GIN(search_vector);
CREATE INDEX idx_experiences_country ON experiences(country_code);
CREATE INDEX idx_experiences_type ON experiences(type);
CREATE INDEX idx_experiences_status ON experiences(status);
CREATE INDEX idx_experiences_date ON experiences(event_date);

-- ============================================
-- BOOKINGS (예약)
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,

  -- Pricing (at time of booking)
  price_amount DECIMAL(10,2) NOT NULL,
  price_currency CHAR(3) NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL, -- For analytics

  -- Referral tracking
  referrer_id UUID REFERENCES users(id),
  referral_code TEXT,

  -- Status
  status booking_status DEFAULT 'pending',
  -- 'pending' | 'confirmed' | 'paid' | 'checked_in' | 'completed' | 'cancelled' | 'refunded'

  -- Payment
  payment_intent_id TEXT,
  payment_method TEXT,
  paid_at TIMESTAMPTZ,

  -- Check-in
  checked_in_at TIMESTAMPTZ,
  checkin_method TEXT, -- 'qr' | 'gps' | 'nfc' | 'manual'
  checkin_latitude DECIMAL(10,8),
  checkin_longitude DECIMAL(11,8),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, experience_id)
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_experience ON bookings(experience_id);
CREATE INDEX idx_bookings_referrer ON bookings(referrer_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- ============================================
-- ARTISTS (아티스트/에이전시)
-- ============================================
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Profile
  name TEXT NOT NULL,
  name_ko TEXT,
  name_local TEXT,
  bio TEXT,
  profile_image_url TEXT,

  -- Agency
  agency_id UUID REFERENCES agencies(id),

  -- Social
  instagram_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,

  -- Stats (denormalized for performance)
  total_experiences INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEADERS (리더/인플루언서)
-- ============================================
CREATE TABLE leaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,

  -- Referral
  referral_code TEXT UNIQUE NOT NULL,

  -- Tier system
  tier leader_tier DEFAULT 'bronze', -- 'bronze' | 'silver' | 'gold' | 'platinum'
  commission_rate DECIMAL(4,2) DEFAULT 0.10, -- 10% default

  -- Stats
  total_referrals INTEGER DEFAULT 0,
  total_earnings_usd DECIMAL(12,2) DEFAULT 0,
  monthly_referrals INTEGER DEFAULT 0,

  -- Payout
  payout_method TEXT, -- 'bank' | 'paypal' | 'crypto'
  payout_details JSONB,
  pending_payout_usd DECIMAL(12,2) DEFAULT 0,

  -- Status
  status leader_status DEFAULT 'active',
  verified_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaders_referral_code ON leaders(referral_code);
CREATE INDEX idx_leaders_tier ON leaders(tier);

-- ============================================
-- LOCALIZED PRICES (국가별 가격)
-- ============================================
CREATE TABLE localized_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  country_code CHAR(2) NOT NULL,

  -- Price
  amount DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL,

  -- PPP factor applied
  ppp_factor DECIMAL(4,2),

  UNIQUE(experience_id, country_code)
);

CREATE INDEX idx_localized_prices_lookup ON localized_prices(experience_id, country_code);

-- ============================================
-- TRANSACTIONS (리더 수익)
-- ============================================
CREATE TABLE leader_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id UUID REFERENCES leaders(id),
  booking_id UUID REFERENCES bookings(id),

  -- Amount
  amount_usd DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(4,2) NOT NULL,

  -- Status
  status transaction_status DEFAULT 'pending', -- 'pending' | 'approved' | 'paid' | 'cancelled'

  -- Payout
  payout_id UUID REFERENCES payouts(id),
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE experience_type AS ENUM ('hightough', 'soundcheck', 'backstage', 'popup');
CREATE TYPE experience_status AS ENUM ('draft', 'active', 'soldout', 'completed', 'cancelled');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'paid', 'checked_in', 'completed', 'cancelled', 'refunded');
CREATE TYPE leader_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE leader_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE transaction_status AS ENUM ('pending', 'approved', 'paid', 'cancelled');
```

### 2.2 Row Level Security (RLS)

```sql
-- Users can only see their own bookings
CREATE POLICY "Users view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create bookings for themselves
CREATE POLICY "Users create own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public can view active experiences
CREATE POLICY "Public view active experiences" ON experiences
  FOR SELECT USING (status = 'active');

-- Leaders can view their own stats
CREATE POLICY "Leaders view own data" ON leaders
  FOR SELECT USING (auth.uid() = user_id);

-- Leaders can view referral transactions
CREATE POLICY "Leaders view own transactions" ON leader_transactions
  FOR SELECT USING (
    leader_id IN (SELECT id FROM leaders WHERE user_id = auth.uid())
  );
```

---

## 3. API Endpoints Implementation

### 3.1 Experience APIs

```typescript
// File: src/app/api/experiences/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface ExperienceFilters {
  type?: 'hightough' | 'soundcheck' | 'backstage' | 'popup';
  country?: string;
  artistId?: string;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  search?: string;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  // Parse filters
  const filters: ExperienceFilters = {
    type: searchParams.get('type') as ExperienceFilters['type'],
    country: searchParams.get('country') || undefined,
    artistId: searchParams.get('artistId') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
    search: searchParams.get('search') || undefined,
  };

  // Pagination
  const page = Number(searchParams.get('page')) || 1;
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from('experiences')
    .select(`
      *,
      artist:artists(id, name, profile_image_url),
      localized_price:localized_prices!inner(amount, currency)
    `, { count: 'exact' })
    .eq('status', 'active')
    .order('event_date', { ascending: true });

  // Apply filters
  if (filters.type) {
    query = query.eq('type', filters.type);
  }
  if (filters.country) {
    query = query.eq('country_code', filters.country);
    query = query.eq('localized_prices.country_code', filters.country);
  }
  if (filters.artistId) {
    query = query.eq('artist_id', filters.artistId);
  }
  if (filters.dateFrom) {
    query = query.gte('event_date', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('event_date', filters.dateTo);
  }
  if (filters.search) {
    query = query.textSearch('search_vector', filters.search);
  }

  // Execute with pagination
  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    experiences: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}
```

### 3.2 Booking API with Referral Tracking

```typescript
// File: src/app/api/bookings/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getLocalizedPrice } from '@/lib/currency';
import { trackReferral } from '@/lib/referral';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { experienceId, countryCode, referralCode } = body;

  // Validate experience
  const { data: experience, error: expError } = await supabase
    .from('experiences')
    .select('*')
    .eq('id', experienceId)
    .eq('status', 'active')
    .single();

  if (expError || !experience) {
    return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
  }

  // Check availability
  if (experience.booked_spots >= experience.total_spots) {
    return NextResponse.json({ error: 'Experience is sold out' }, { status: 400 });
  }

  // Check deadline
  if (new Date(experience.booking_deadline) < new Date()) {
    return NextResponse.json({ error: 'Booking deadline passed' }, { status: 400 });
  }

  // Check duplicate booking
  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('user_id', user.id)
    .eq('experience_id', experienceId)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Already booked' }, { status: 400 });
  }

  // Get localized price
  const price = await getLocalizedPrice(experience.base_price_usd, countryCode);

  // Validate referral code
  let referrerId: string | null = null;
  if (referralCode) {
    const { data: leader } = await supabase
      .from('leaders')
      .select('user_id')
      .eq('referral_code', referralCode)
      .eq('status', 'active')
      .single();

    if (leader && leader.user_id !== user.id) {
      referrerId = leader.user_id;
    }
  }

  // Create booking (transaction)
  const { data: booking, error: bookingError } = await supabase.rpc('create_booking', {
    p_user_id: user.id,
    p_experience_id: experienceId,
    p_price_amount: price.amount,
    p_price_currency: price.currency,
    p_price_usd: price.usdEquivalent,
    p_referrer_id: referrerId,
    p_referral_code: referralCode,
  });

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  // Track referral asynchronously
  if (referrerId) {
    trackReferral(booking.id, referrerId).catch(console.error);
  }

  return NextResponse.json({ booking }, { status: 201 });
}
```

### 3.3 Database Function for Atomic Booking

```sql
-- File: supabase/migrations/create_booking_function.sql

CREATE OR REPLACE FUNCTION create_booking(
  p_user_id UUID,
  p_experience_id UUID,
  p_price_amount DECIMAL,
  p_price_currency CHAR(3),
  p_price_usd DECIMAL,
  p_referrer_id UUID DEFAULT NULL,
  p_referral_code TEXT DEFAULT NULL
)
RETURNS bookings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking bookings;
  v_spots_available INTEGER;
BEGIN
  -- Lock the experience row for update
  SELECT total_spots - booked_spots INTO v_spots_available
  FROM experiences
  WHERE id = p_experience_id
  FOR UPDATE;

  IF v_spots_available <= 0 THEN
    RAISE EXCEPTION 'No spots available';
  END IF;

  -- Create booking
  INSERT INTO bookings (
    user_id, experience_id, price_amount, price_currency, price_usd,
    referrer_id, referral_code, status
  )
  VALUES (
    p_user_id, p_experience_id, p_price_amount, p_price_currency, p_price_usd,
    p_referrer_id, p_referral_code, 'pending'
  )
  RETURNING * INTO v_booking;

  -- Update experience spots
  UPDATE experiences
  SET booked_spots = booked_spots + 1,
      status = CASE
        WHEN booked_spots + 1 >= total_spots THEN 'soldout'::experience_status
        ELSE status
      END
  WHERE id = p_experience_id;

  -- If referral, create leader transaction
  IF p_referrer_id IS NOT NULL THEN
    INSERT INTO leader_transactions (leader_id, booking_id, amount_usd, commission_rate)
    SELECT l.id, v_booking.id, p_price_usd * l.commission_rate, l.commission_rate
    FROM leaders l
    WHERE l.user_id = p_referrer_id;

    -- Update leader stats
    UPDATE leaders
    SET total_referrals = total_referrals + 1,
        monthly_referrals = monthly_referrals + 1
    WHERE user_id = p_referrer_id;
  END IF;

  RETURN v_booking;
END;
$$;
```

---

## 4. Algorithm Implementations

### 4.1 Dynamic Pricing Algorithm

```typescript
// File: src/lib/pricing/dynamic-pricing.ts

interface PricingFactors {
  basePrice: number;
  countryCode: string;
  experienceType: string;
  daysUntilEvent: number;
  spotsRemaining: number;
  totalSpots: number;
  artistPopularity: number; // 0-100
  demandScore: number; // Real-time demand
}

interface PricingResult {
  finalPrice: number;
  currency: string;
  breakdown: {
    base: number;
    pppAdjustment: number;
    urgencyMultiplier: number;
    demandMultiplier: number;
    discount: number;
  };
}

// PPP Index by country (100 = US baseline)
const PPP_INDEX: Record<string, number> = {
  US: 100, TH: 60, ID: 45, PH: 50, KZ: 40,
  TW: 85, SG: 110, MY: 55, JP: 105, KR: 90, CN: 55,
};

// Exchange rates (to USD)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1, THB: 35, IDR: 15800, PHP: 56, KZT: 450,
  TWD: 31, SGD: 1.35, MYR: 4.5, JPY: 146, KRW: 1330, CNY: 7.25,
};

const COUNTRY_CURRENCY: Record<string, string> = {
  US: 'USD', TH: 'THB', ID: 'IDR', PH: 'PHP', KZ: 'KZT',
  TW: 'TWD', SG: 'SGD', MY: 'MYR', JP: 'JPY', KR: 'KRW', CN: 'CNY',
};

export function calculateDynamicPrice(factors: PricingFactors): PricingResult {
  const {
    basePrice,
    countryCode,
    daysUntilEvent,
    spotsRemaining,
    totalSpots,
    demandScore,
  } = factors;

  // 1. PPP Adjustment (lower price for lower purchasing power)
  const pppFactor = (PPP_INDEX[countryCode] || 100) / 100;
  const pppAdjustedPrice = basePrice * pppFactor;

  // 2. Urgency Multiplier (price increases as event approaches)
  let urgencyMultiplier = 1.0;
  if (daysUntilEvent <= 3) {
    urgencyMultiplier = 1.15; // +15% for last 3 days
  } else if (daysUntilEvent <= 7) {
    urgencyMultiplier = 1.08; // +8% for last week
  }

  // 3. Scarcity Multiplier (price increases as spots decrease)
  const fillRate = 1 - (spotsRemaining / totalSpots);
  let scarcityMultiplier = 1.0;
  if (fillRate >= 0.9) {
    scarcityMultiplier = 1.20; // +20% when 90%+ full
  } else if (fillRate >= 0.75) {
    scarcityMultiplier = 1.10; // +10% when 75%+ full
  }

  // 4. Demand Multiplier (based on real-time interest)
  const demandMultiplier = 1 + (demandScore / 100) * 0.15; // Max +15%

  // 5. Calculate final USD price
  const finalUSD = pppAdjustedPrice * urgencyMultiplier * scarcityMultiplier * demandMultiplier;

  // 6. Convert to local currency
  const currency = COUNTRY_CURRENCY[countryCode] || 'USD';
  const exchangeRate = EXCHANGE_RATES[currency] || 1;
  const finalPrice = Math.round(finalUSD * exchangeRate);

  return {
    finalPrice,
    currency,
    breakdown: {
      base: basePrice,
      pppAdjustment: pppFactor,
      urgencyMultiplier,
      demandMultiplier: scarcityMultiplier * demandMultiplier,
      discount: 0,
    },
  };
}
```

### 4.2 Leader Tier Algorithm

```typescript
// File: src/lib/leader/tier-calculator.ts

export type LeaderTier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface LeaderStats {
  totalReferrals: number;
  monthlyReferrals: number;
  totalEarningsUSD: number;
  accountAgeDays: number;
  conversionRate: number; // referral clicks to bookings
}

interface TierConfig {
  tier: LeaderTier;
  minReferrals: number;
  minMonthlyReferrals: number;
  minEarnings: number;
  commissionRate: number;
  benefits: string[];
}

const TIER_CONFIG: TierConfig[] = [
  {
    tier: 'platinum',
    minReferrals: 500,
    minMonthlyReferrals: 50,
    minEarnings: 10000,
    commissionRate: 0.15, // 15%
    benefits: ['Priority support', 'Custom referral page', 'Early access', 'Exclusive events'],
  },
  {
    tier: 'gold',
    minReferrals: 100,
    minMonthlyReferrals: 20,
    minEarnings: 2000,
    commissionRate: 0.12, // 12%
    benefits: ['Priority support', 'Custom referral page', 'Early access'],
  },
  {
    tier: 'silver',
    minReferrals: 25,
    minMonthlyReferrals: 5,
    minEarnings: 500,
    commissionRate: 0.11, // 11%
    benefits: ['Custom referral page'],
  },
  {
    tier: 'bronze',
    minReferrals: 0,
    minMonthlyReferrals: 0,
    minEarnings: 0,
    commissionRate: 0.10, // 10%
    benefits: [],
  },
];

export function calculateLeaderTier(stats: LeaderStats): {
  currentTier: LeaderTier;
  nextTier: LeaderTier | null;
  progress: number;
  commissionRate: number;
} {
  // Find highest qualifying tier
  let currentTierConfig = TIER_CONFIG[TIER_CONFIG.length - 1]; // Bronze default

  for (const config of TIER_CONFIG) {
    if (
      stats.totalReferrals >= config.minReferrals &&
      stats.monthlyReferrals >= config.minMonthlyReferrals &&
      stats.totalEarningsUSD >= config.minEarnings
    ) {
      currentTierConfig = config;
      break;
    }
  }

  // Find next tier
  const currentIndex = TIER_CONFIG.findIndex(t => t.tier === currentTierConfig.tier);
  const nextTierConfig = currentIndex > 0 ? TIER_CONFIG[currentIndex - 1] : null;

  // Calculate progress to next tier
  let progress = 100;
  if (nextTierConfig) {
    const referralProgress = (stats.totalReferrals / nextTierConfig.minReferrals) * 100;
    const monthlyProgress = (stats.monthlyReferrals / nextTierConfig.minMonthlyReferrals) * 100;
    const earningsProgress = (stats.totalEarningsUSD / nextTierConfig.minEarnings) * 100;
    progress = Math.min(referralProgress, monthlyProgress, earningsProgress);
  }

  return {
    currentTier: currentTierConfig.tier,
    nextTier: nextTierConfig?.tier || null,
    progress: Math.min(progress, 99), // Cap at 99 until actually promoted
    commissionRate: currentTierConfig.commissionRate,
  };
}

// Monthly tier recalculation (Cron job)
export async function recalculateAllLeaderTiers(supabase: SupabaseClient) {
  const { data: leaders } = await supabase
    .from('leaders')
    .select('*, users(created_at)');

  for (const leader of leaders || []) {
    const stats: LeaderStats = {
      totalReferrals: leader.total_referrals,
      monthlyReferrals: leader.monthly_referrals,
      totalEarningsUSD: leader.total_earnings_usd,
      accountAgeDays: Math.floor(
        (Date.now() - new Date(leader.users.created_at).getTime()) / (1000 * 60 * 60 * 24)
      ),
      conversionRate: 0, // Calculate separately
    };

    const { currentTier, commissionRate } = calculateLeaderTier(stats);

    // Update if tier changed
    if (leader.tier !== currentTier) {
      await supabase
        .from('leaders')
        .update({ tier: currentTier, commission_rate: commissionRate })
        .eq('id', leader.id);

      // Send notification
      await sendTierChangeNotification(leader.user_id, leader.tier, currentTier);
    }
  }

  // Reset monthly referrals at month end
  await supabase
    .from('leaders')
    .update({ monthly_referrals: 0 });
}
```

### 4.3 Recommendation Algorithm

```typescript
// File: src/lib/recommendations/engine.ts

interface UserProfile {
  userId: string;
  country: string;
  favoriteArtists: string[];
  bookingHistory: string[];
  viewHistory: string[];
  priceRange: { min: number; max: number };
}

interface Experience {
  id: string;
  artistId: string;
  type: string;
  countryCode: string;
  basePrice: number;
  eventDate: Date;
  popularity: number;
}

interface RecommendationScore {
  experienceId: string;
  score: number;
  reasons: string[];
}

export function calculateRecommendationScore(
  user: UserProfile,
  experience: Experience,
  allExperiences: Experience[]
): RecommendationScore {
  let score = 0;
  const reasons: string[] = [];

  // 1. Artist Affinity (40% weight)
  if (user.favoriteArtists.includes(experience.artistId)) {
    score += 40;
    reasons.push('Favorite artist');
  } else {
    // Check if user booked same artist before
    const artistBookings = user.bookingHistory.filter(
      bookingId => allExperiences.find(e => e.id === bookingId)?.artistId === experience.artistId
    );
    if (artistBookings.length > 0) {
      score += 25;
      reasons.push('Previously booked artist');
    }
  }

  // 2. Location Match (20% weight)
  if (experience.countryCode === user.country) {
    score += 20;
    reasons.push('In your country');
  } else {
    // Nearby countries get partial credit
    const nearbyCountries = getNearbyCountries(user.country);
    if (nearbyCountries.includes(experience.countryCode)) {
      score += 10;
      reasons.push('Nearby location');
    }
  }

  // 3. Experience Type Preference (15% weight)
  const userTypePreference = calculateTypePreference(user.bookingHistory, allExperiences);
  if (userTypePreference[experience.type]) {
    score += userTypePreference[experience.type] * 15;
    reasons.push(`Matches your ${experience.type} preference`);
  }

  // 4. Price Match (15% weight)
  const localPrice = calculateLocalPrice(experience.basePrice, user.country);
  if (localPrice >= user.priceRange.min && localPrice <= user.priceRange.max) {
    score += 15;
    reasons.push('Within budget');
  } else if (localPrice < user.priceRange.min) {
    score += 10; // Still relevant, just cheaper
  }

  // 5. Popularity Boost (10% weight)
  score += (experience.popularity / 100) * 10;
  if (experience.popularity > 80) {
    reasons.push('Trending');
  }

  // 6. Urgency Boost (bonus)
  const daysUntilEvent = Math.ceil(
    (experience.eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntilEvent <= 7 && daysUntilEvent > 0) {
    score += 5;
    reasons.push('Happening soon');
  }

  return {
    experienceId: experience.id,
    score: Math.min(score, 100),
    reasons,
  };
}

// Get personalized recommendations
export async function getRecommendations(
  userId: string,
  limit: number = 10,
  supabase: SupabaseClient
): Promise<RecommendationScore[]> {
  // Get user profile
  const { data: user } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // Get active experiences
  const { data: experiences } = await supabase
    .from('experiences')
    .select('*')
    .eq('status', 'active')
    .gte('event_date', new Date().toISOString());

  // Calculate scores
  const scores = experiences?.map(exp =>
    calculateRecommendationScore(user, exp, experiences)
  ) || [];

  // Sort by score and return top N
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
```

### 4.4 Check-in Verification Algorithm

```typescript
// File: src/lib/checkin/verification.ts

interface CheckinAttempt {
  bookingId: string;
  userId: string;
  method: 'qr' | 'gps' | 'nfc';
  latitude?: number;
  longitude?: number;
  qrCode?: string;
  nfcData?: string;
  deviceFingerprint: string;
  timestamp: Date;
}

interface VerificationResult {
  success: boolean;
  method: string;
  confidence: number; // 0-100
  reason?: string;
}

// Haversine formula for distance calculation
function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

export async function verifyCheckin(
  attempt: CheckinAttempt,
  supabase: SupabaseClient
): Promise<VerificationResult> {
  // Get booking and experience details
  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      experience:experiences(
        venue_latitude,
        venue_longitude,
        event_date,
        qr_secret
      )
    `)
    .eq('id', attempt.bookingId)
    .eq('user_id', attempt.userId)
    .single();

  if (!booking) {
    return { success: false, method: attempt.method, confidence: 0, reason: 'Booking not found' };
  }

  // Check if already checked in
  if (booking.checked_in_at) {
    return { success: false, method: attempt.method, confidence: 0, reason: 'Already checked in' };
  }

  // Check event timing (allow 2 hours before to 4 hours after)
  const eventTime = new Date(booking.experience.event_date).getTime();
  const now = attempt.timestamp.getTime();
  const twoHoursBefore = eventTime - 2 * 60 * 60 * 1000;
  const fourHoursAfter = eventTime + 4 * 60 * 60 * 1000;

  if (now < twoHoursBefore || now > fourHoursAfter) {
    return { success: false, method: attempt.method, confidence: 0, reason: 'Outside check-in window' };
  }

  let confidence = 0;

  // Method-specific verification
  switch (attempt.method) {
    case 'qr':
      // Verify QR code signature
      const expectedQR = generateQRCode(booking.id, booking.experience.qr_secret);
      if (attempt.qrCode === expectedQR) {
        confidence = 95;
      } else {
        return { success: false, method: 'qr', confidence: 0, reason: 'Invalid QR code' };
      }
      break;

    case 'gps':
      if (!attempt.latitude || !attempt.longitude) {
        return { success: false, method: 'gps', confidence: 0, reason: 'Location required' };
      }

      const distance = calculateDistance(
        attempt.latitude, attempt.longitude,
        booking.experience.venue_latitude,
        booking.experience.venue_longitude
      );

      // Distance-based confidence
      if (distance <= 50) {
        confidence = 90; // Within 50m
      } else if (distance <= 100) {
        confidence = 75; // Within 100m
      } else if (distance <= 200) {
        confidence = 50; // Within 200m (marginal)
      } else {
        return { success: false, method: 'gps', confidence: 0, reason: `Too far from venue (${Math.round(distance)}m)` };
      }
      break;

    case 'nfc':
      // Verify NFC tag signature
      const validNFC = await verifyNFCSignature(attempt.nfcData, booking.experience.id);
      if (validNFC) {
        confidence = 98;
      } else {
        return { success: false, method: 'nfc', confidence: 0, reason: 'Invalid NFC tag' };
      }
      break;
  }

  // Fraud detection: Check device fingerprint for multiple accounts
  const { count: deviceUsageCount } = await supabase
    .from('checkin_logs')
    .select('*', { count: 'exact' })
    .eq('device_fingerprint', attempt.deviceFingerprint)
    .neq('user_id', attempt.userId)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if ((deviceUsageCount || 0) > 0) {
    confidence = Math.max(confidence - 20, 0);
    // Flag for review but don't block
  }

  // Success threshold
  if (confidence >= 50) {
    // Record successful check-in
    await supabase
      .from('bookings')
      .update({
        checked_in_at: attempt.timestamp.toISOString(),
        checkin_method: attempt.method,
        checkin_latitude: attempt.latitude,
        checkin_longitude: attempt.longitude,
        status: 'checked_in',
      })
      .eq('id', attempt.bookingId);

    // Log for analytics
    await supabase
      .from('checkin_logs')
      .insert({
        booking_id: attempt.bookingId,
        user_id: attempt.userId,
        method: attempt.method,
        confidence,
        device_fingerprint: attempt.deviceFingerprint,
        latitude: attempt.latitude,
        longitude: attempt.longitude,
      });

    return { success: true, method: attempt.method, confidence };
  }

  return { success: false, method: attempt.method, confidence, reason: 'Verification failed' };
}
```

---

## 5. Cron Jobs & Background Tasks

### 5.1 Scheduled Tasks

```typescript
// File: src/app/api/cron/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Vercel Cron: runs every hour
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const results: Record<string, string> = {};

  // Task 1: Update experience status (soldout/completed)
  const { error: statusError } = await supabase.rpc('update_experience_statuses');
  results['experience_status'] = statusError ? 'failed' : 'success';

  // Task 2: Send reminder notifications (24h before event)
  const { error: reminderError } = await supabase.rpc('send_event_reminders');
  results['reminders'] = reminderError ? 'failed' : 'success';

  // Task 3: Calculate trending scores
  const { error: trendingError } = await supabase.rpc('calculate_trending_scores');
  results['trending'] = trendingError ? 'failed' : 'success';

  // Task 4: Process pending payouts (daily)
  const hour = new Date().getUTCHours();
  if (hour === 0) { // Run at midnight UTC
    const { error: payoutError } = await supabase.rpc('process_pending_payouts');
    results['payouts'] = payoutError ? 'failed' : 'success';
  }

  // Task 5: Reset monthly leader stats (1st of month)
  const date = new Date();
  if (date.getDate() === 1 && hour === 0) {
    const { error: resetError } = await supabase.rpc('reset_monthly_leader_stats');
    results['leader_reset'] = resetError ? 'failed' : 'success';
  }

  return NextResponse.json({ results, timestamp: new Date().toISOString() });
}
```

### 5.2 Database Functions for Cron

```sql
-- Update experience statuses
CREATE OR REPLACE FUNCTION update_experience_statuses()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Mark as completed after event date + 1 day
  UPDATE experiences
  SET status = 'completed'
  WHERE status IN ('active', 'soldout')
    AND event_date < NOW() - INTERVAL '1 day';

  -- Mark as soldout when full
  UPDATE experiences
  SET status = 'soldout'
  WHERE status = 'active'
    AND booked_spots >= total_spots;
END;
$$;

-- Send event reminders
CREATE OR REPLACE FUNCTION send_event_reminders()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, body, data)
  SELECT
    b.user_id,
    'reminder',
    'Event Tomorrow!',
    'Your ' || e.title || ' experience is tomorrow. Don''t forget to check in!',
    jsonb_build_object('experience_id', e.id, 'booking_id', b.id)
  FROM bookings b
  JOIN experiences e ON e.id = b.experience_id
  WHERE b.status IN ('confirmed', 'paid')
    AND e.event_date BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
    AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.user_id = b.user_id
        AND n.data->>'booking_id' = b.id::text
        AND n.type = 'reminder'
    );
END;
$$;

-- Calculate trending scores
CREATE OR REPLACE FUNCTION calculate_trending_scores()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  WITH recent_stats AS (
    SELECT
      experience_id,
      COUNT(*) as bookings_24h,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as bookings_1h
    FROM bookings
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY experience_id
  )
  UPDATE experiences e
  SET popularity = COALESCE(
    (rs.bookings_24h * 2 + rs.bookings_1h * 10) / GREATEST(total_spots, 1) * 100,
    0
  )
  FROM recent_stats rs
  WHERE e.id = rs.experience_id;
END;
$$;
```

---

## 6. Testing Strategy

### 6.1 Unit Tests

```typescript
// File: src/__tests__/lib/pricing.test.ts

import { calculateDynamicPrice } from '@/lib/pricing/dynamic-pricing';

describe('Dynamic Pricing', () => {
  it('applies PPP adjustment for Thailand', () => {
    const result = calculateDynamicPrice({
      basePrice: 100,
      countryCode: 'TH',
      experienceType: 'hightough',
      daysUntilEvent: 30,
      spotsRemaining: 50,
      totalSpots: 100,
      artistPopularity: 50,
      demandScore: 50,
    });

    expect(result.currency).toBe('THB');
    expect(result.breakdown.pppAdjustment).toBe(0.6);
    expect(result.finalPrice).toBeLessThan(100 * 35); // Less than direct conversion
  });

  it('increases price for urgency', () => {
    const normalPrice = calculateDynamicPrice({
      basePrice: 100,
      countryCode: 'US',
      experienceType: 'hightough',
      daysUntilEvent: 30,
      spotsRemaining: 50,
      totalSpots: 100,
      artistPopularity: 50,
      demandScore: 50,
    });

    const urgentPrice = calculateDynamicPrice({
      basePrice: 100,
      countryCode: 'US',
      experienceType: 'hightough',
      daysUntilEvent: 2, // Urgent!
      spotsRemaining: 50,
      totalSpots: 100,
      artistPopularity: 50,
      demandScore: 50,
    });

    expect(urgentPrice.finalPrice).toBeGreaterThan(normalPrice.finalPrice);
    expect(urgentPrice.breakdown.urgencyMultiplier).toBe(1.15);
  });
});
```

### 6.2 Integration Tests

```typescript
// File: src/__tests__/api/bookings.test.ts

import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/bookings/route';

describe('Bookings API', () => {
  it('creates booking with referral tracking', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        experienceId: 'test-experience-id',
        countryCode: 'TH',
        referralCode: 'LEADER123',
      },
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.booking).toBeDefined();
    expect(data.booking.referrer_id).toBeDefined();
  });

  it('rejects booking for sold out experience', async () => {
    // ... test implementation
  });

  it('rejects duplicate booking', async () => {
    // ... test implementation
  });
});
```

---

## 7. Deployment Checklist

```markdown
### Pre-deployment
- [ ] All migrations applied to Supabase
- [ ] RLS policies tested
- [ ] Environment variables set in Vercel
- [ ] API rate limiting configured
- [ ] Error tracking (Sentry) configured

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SENTRY_DSN=
```

### Post-deployment
- [ ] Verify cron jobs running
- [ ] Test booking flow end-to-end
- [ ] Test check-in verification
- [ ] Monitor error rates
- [ ] Set up alerts for failures
```

---

## 8. Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time (p95) | < 200ms | - |
| Database Query Time (p95) | < 50ms | - |
| Booking Transaction Time | < 500ms | - |
| Check-in Verification | < 300ms | - |
| Recommendations Generation | < 100ms | - |

---

*Document Version: 1.0*
*Last Updated: 2024-12-07*
*For: GitHub Copilot Coding Agent*
