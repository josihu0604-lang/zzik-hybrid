-- ZZIK Hybrid Database Schema
-- Vector Dimension: 768 (Gemini Standard)

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  preferences_vector vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOURNEYS (Photo/Video Content)
-- ============================================
CREATE TABLE IF NOT EXISTS journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  content_type TEXT DEFAULT 'IMAGE' CHECK (content_type IN ('IMAGE', 'VIDEO')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,

  -- Gemini Analysis (768 dimensions)
  journey_vector vector(768),
  vibe_analysis JSONB,

  -- Location
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  place_name TEXT,

  -- Social
  likes_count INT DEFAULT 0,
  views_count INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector Index for Similarity Search
CREATE INDEX IF NOT EXISTS idx_journeys_vector
ON journeys USING ivfflat (journey_vector vector_cosine_ops)
WITH (lists = 100);

-- ============================================
-- STORES (Business)
-- ============================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEMBERS (User-Store N:M with Loyalty)
-- ============================================
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'CUSTOMER' CHECK (role IN ('OWNER', 'STAFF', 'CUSTOMER')),
  loyalty_index DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, store_id)
);

-- ============================================
-- CHECK-INS (Triple Verification)
-- ============================================
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,

  -- Triple Verification
  gps_verified BOOLEAN DEFAULT FALSE,
  qr_verified BOOLEAN DEFAULT FALSE,
  receipt_verified BOOLEAN DEFAULT FALSE,

  -- Scores
  verification_score DOUBLE PRECISION NOT NULL,

  -- Receipt Data
  receipt_amount INT,
  receipt_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LIVE OFFERS (Time-limited Deals)
-- ============================================
CREATE TABLE IF NOT EXISTS live_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_percent INT,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  radius_meters INT DEFAULT 200,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Find Similar Journeys (Vector Search)
CREATE OR REPLACE FUNCTION find_similar_journeys(
  query_embedding vector(768),
  match_count INT DEFAULT 5,
  threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  media_url TEXT,
  vibe_analysis JSONB,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.user_id,
    j.media_url,
    j.vibe_analysis,
    j.lat,
    j.lng,
    1 - (j.journey_vector <=> query_embedding) AS similarity
  FROM journeys j
  WHERE 1 - (j.journey_vector <=> query_embedding) > threshold
  ORDER BY j.journey_vector <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Get Nearby Active Offers
CREATE OR REPLACE FUNCTION get_nearby_offers(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  max_distance_meters INT DEFAULT 500
)
RETURNS TABLE (
  id UUID,
  store_id UUID,
  store_name TEXT,
  title TEXT,
  description TEXT,
  discount_percent INT,
  valid_until TIMESTAMPTZ,
  distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.store_id,
    s.name AS store_name,
    o.title,
    o.description,
    o.discount_percent,
    o.valid_until,
    (6371000 * acos(
      cos(radians(user_lat)) * cos(radians(s.lat)) *
      cos(radians(s.lng) - radians(user_lng)) +
      sin(radians(user_lat)) * sin(radians(s.lat))
    )) AS distance_meters
  FROM live_offers o
  JOIN stores s ON o.store_id = s.id
  WHERE o.is_active = TRUE
    AND o.valid_until > NOW()
    AND (6371000 * acos(
      cos(radians(user_lat)) * cos(radians(s.lat)) *
      cos(radians(s.lng) - radians(user_lng)) +
      sin(radians(user_lat)) * sin(radians(s.lat))
    )) <= max_distance_meters
  ORDER BY distance_meters;
END;
$$;
