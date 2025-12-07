-- ============================================================================
-- ZZIK Backend - VIP Experience Marketplace Initial Schema
-- Migration: 20240101000000_init_schema.sql
-- Based on: BACKEND_DEVELOPMENT_PLAN.md
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Create enums for type safety and data integrity
CREATE TYPE experience_type AS ENUM ('hightough', 'soundcheck', 'backstage', 'popup');
CREATE TYPE experience_status AS ENUM ('draft', 'active', 'soldout', 'completed', 'cancelled');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'paid', 'checked_in', 'completed', 'cancelled', 'refunded');
CREATE TYPE leader_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE leader_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE transaction_status AS ENUM ('pending', 'approved', 'paid', 'cancelled');

-- ============================================================================
-- PLACEHOLDER TABLES (Referenced but not defined in plan)
-- ============================================================================

-- Agencies table - placeholder for artist agency management
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payouts table - placeholder for payout management
-- Note: leader_payouts already exists in migration 20250108
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ARTISTS (아티스트/에이전시)
-- ============================================================================

CREATE TABLE IF NOT EXISTS artists (
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

CREATE INDEX IF NOT EXISTS idx_artists_agency ON artists(agency_id);
CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);

-- ============================================================================
-- EXPERIENCES (VIP 체험 상품)
-- ============================================================================

CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  artist_id UUID REFERENCES artists(id),
  title TEXT NOT NULL,
  description TEXT,
  type experience_type NOT NULL,

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
  status experience_status DEFAULT 'draft',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Search optimization
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED
);

CREATE INDEX IF NOT EXISTS idx_experiences_search ON experiences USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_experiences_country ON experiences(country_code);
CREATE INDEX IF NOT EXISTS idx_experiences_type ON experiences(type);
CREATE INDEX IF NOT EXISTS idx_experiences_status ON experiences(status);
CREATE INDEX IF NOT EXISTS idx_experiences_date ON experiences(event_date);
CREATE INDEX IF NOT EXISTS idx_experiences_artist ON experiences(artist_id);

-- ============================================================================
-- BOOKINGS (예약)
-- ============================================================================

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,

  -- Pricing (at time of booking)
  price_amount DECIMAL(10,2) NOT NULL,
  price_currency CHAR(3) NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL, -- For analytics

  -- Referral tracking
  referrer_id UUID REFERENCES auth.users(id),
  referral_code TEXT,

  -- Status
  status booking_status DEFAULT 'pending',

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

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_experience ON bookings(experience_id);
CREATE INDEX IF NOT EXISTS idx_bookings_referrer ON bookings(referrer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- ============================================================================
-- LEADERS (리더/인플루언서) - VIP Experience Version
-- Note: This is separate from the existing leaders table for popup system
-- ============================================================================

CREATE TABLE IF NOT EXISTS vip_leaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,

  -- Referral
  referral_code TEXT UNIQUE NOT NULL,

  -- Tier system
  tier leader_tier DEFAULT 'bronze',
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

CREATE INDEX IF NOT EXISTS idx_vip_leaders_referral_code ON vip_leaders(referral_code);
CREATE INDEX IF NOT EXISTS idx_vip_leaders_tier ON vip_leaders(tier);
CREATE INDEX IF NOT EXISTS idx_vip_leaders_user ON vip_leaders(user_id);

-- ============================================================================
-- LOCALIZED PRICES (국가별 가격)
-- ============================================================================

CREATE TABLE IF NOT EXISTS localized_prices (
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

CREATE INDEX IF NOT EXISTS idx_localized_prices_lookup ON localized_prices(experience_id, country_code);

-- ============================================================================
-- TRANSACTIONS (리더 수익)
-- ============================================================================

CREATE TABLE IF NOT EXISTS leader_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id UUID REFERENCES vip_leaders(id),
  booking_id UUID REFERENCES bookings(id),

  -- Amount
  amount_usd DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(4,2) NOT NULL,

  -- Status
  status transaction_status DEFAULT 'pending',

  -- Payout
  payout_id UUID REFERENCES payouts(id),
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leader_transactions_leader ON leader_transactions(leader_id);
CREATE INDEX IF NOT EXISTS idx_leader_transactions_booking ON leader_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_leader_transactions_status ON leader_transactions(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE leader_transactions ENABLE ROW LEVEL SECURITY;

-- Bookings: Users can only see their own bookings
CREATE POLICY "Users view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Bookings: Users can create bookings for themselves
CREATE POLICY "Users create own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Experiences: Public can view active experiences
CREATE POLICY "Public view active experiences" ON experiences
  FOR SELECT USING (status = 'active');

-- Leaders: Leaders can view their own stats
CREATE POLICY "Leaders view own data" ON vip_leaders
  FOR SELECT USING (auth.uid() = user_id);

-- Transactions: Leaders can view referral transactions
CREATE POLICY "Leaders view own transactions" ON leader_transactions
  FOR SELECT USING (
    leader_id IN (SELECT id FROM vip_leaders WHERE user_id = auth.uid())
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Atomic booking creation with referral tracking
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
    FROM vip_leaders l
    WHERE l.user_id = p_referrer_id;

    -- Update leader stats
    UPDATE vip_leaders
    SET total_referrals = total_referrals + 1,
        monthly_referrals = monthly_referrals + 1
    WHERE user_id = p_referrer_id;
  END IF;

  RETURN v_booking;
END;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE experiences IS 'VIP experience products (hightough, soundcheck, backstage, popup events)';
COMMENT ON TABLE bookings IS 'User bookings for VIP experiences with payment and check-in tracking';
COMMENT ON TABLE artists IS 'K-POP artists and groups offering VIP experiences';
COMMENT ON TABLE vip_leaders IS 'Leaders/influencers in the VIP experience referral program';
COMMENT ON TABLE leader_transactions IS 'Commission earnings for leaders from successful referrals';
COMMENT ON TABLE localized_prices IS 'PPP-adjusted prices per country for experiences';
COMMENT ON FUNCTION create_booking IS 'Atomically create booking, update spots, and process referral';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
