-- ==============================================================================
-- ZZIK Global Pivot - Database Migration
-- Version: 1.0
-- Date: 2025-12-08
-- Description: Creates tables for VIP tickets, payments, user preferences, 
--              and K-experiences to support the global pivot strategy.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for location-based queries (optional, for K-experiences)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- ==============================================================================
-- 1. VIP Tickets Table
-- ==============================================================================
-- Stores VIP membership information for users

CREATE TABLE IF NOT EXISTS public.vip_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tier Information
  tier VARCHAR(20) NOT NULL DEFAULT 'free' 
    CHECK (tier IN ('free', 'silver', 'gold', 'platinum')),
  
  -- Regional Settings
  region VARCHAR(10) NOT NULL DEFAULT 'GLOBAL'
    CHECK (region IN ('KR', 'JP', 'TW', 'CN', 'TH', 'US', 'EU', 'SEA', 'GLOBAL')),
  
  -- Subscription Period
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT FALSE,
  auto_renew BOOLEAN DEFAULT TRUE,
  
  -- Stripe Integration
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Indexes for vip_tickets
CREATE INDEX IF NOT EXISTS idx_vip_tickets_user_id ON public.vip_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_tickets_stripe_customer ON public.vip_tickets(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_vip_tickets_stripe_subscription ON public.vip_tickets(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_vip_tickets_tier ON public.vip_tickets(tier);
CREATE INDEX IF NOT EXISTS idx_vip_tickets_is_active ON public.vip_tickets(is_active);
CREATE INDEX IF NOT EXISTS idx_vip_tickets_end_date ON public.vip_tickets(end_date);

-- Unique constraint: one active ticket per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_vip_tickets_user_active 
  ON public.vip_tickets(user_id) 
  WHERE is_active = TRUE;

-- ==============================================================================
-- 2. Payment Transactions Table
-- ==============================================================================
-- Stores payment transaction history

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  ticket_id UUID REFERENCES public.vip_tickets(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction Details
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD'
    CHECK (currency IN ('KRW', 'JPY', 'TWD', 'CNY', 'THB', 'USD', 'EUR', 'SGD')),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  
  -- Transaction Type
  transaction_type VARCHAR(30) NOT NULL DEFAULT 'subscription'
    CHECK (transaction_type IN ('subscription', 'upgrade', 'renewal', 'refund', 'one_time')),
  
  -- Stripe Integration
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  stripe_invoice_id VARCHAR(255),
  
  -- Additional Info
  description TEXT,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for payment_transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_ticket_id ON public.payment_transactions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_pi ON public.payment_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);

-- ==============================================================================
-- 3. User Preferences Table
-- ==============================================================================
-- Stores user's regional and language preferences

CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Regional Settings
  region VARCHAR(10) DEFAULT 'GLOBAL'
    CHECK (region IN ('KR', 'JP', 'TW', 'CN', 'TH', 'US', 'EU', 'SEA', 'GLOBAL')),
  locale VARCHAR(10) DEFAULT 'en'
    CHECK (locale IN ('ko', 'en', 'ja', 'zh-TW', 'zh-CN', 'th')),
  currency VARCHAR(3) DEFAULT 'USD'
    CHECK (currency IN ('KRW', 'JPY', 'TWD', 'CNY', 'THB', 'USD', 'EUR', 'SGD')),
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Notification Preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  
  -- Display Preferences
  theme VARCHAR(10) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. K-Experiences Table
-- ==============================================================================
-- Stores K-Experience locations and events

CREATE TABLE IF NOT EXISTS public.k_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Category
  category VARCHAR(20) NOT NULL 
    CHECK (category IN ('kpop', 'kdrama', 'kbeauty', 'kfood', 'kfashion')),
  
  -- Multilingual Content (JSONB)
  title JSONB NOT NULL DEFAULT '{}',        -- {"ko": "...", "en": "...", "ja": "..."}
  description JSONB NOT NULL DEFAULT '{}',  -- {"ko": "...", "en": "...", "ja": "..."}
  
  -- Location
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  address JSONB DEFAULT '{}',  -- {"ko": "...", "en": "...", "country": "KR", "city": "Seoul"}
  
  -- Media
  cover_image TEXT,
  images TEXT[] DEFAULT '{}',
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  related_content JSONB DEFAULT '{}',  -- {"drama_id": "...", "artist_id": "..."}
  
  -- Stats
  verification_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  
  -- Flags
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Event Dates (for pop-ups, concerts, etc.)
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  -- Partner/Owner
  partner_id UUID,  -- Reference to partner account if applicable
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for k_experiences
CREATE INDEX IF NOT EXISTS idx_k_experiences_category ON public.k_experiences(category);
CREATE INDEX IF NOT EXISTS idx_k_experiences_is_featured ON public.k_experiences(is_featured);
CREATE INDEX IF NOT EXISTS idx_k_experiences_is_active ON public.k_experiences(is_active);
CREATE INDEX IF NOT EXISTS idx_k_experiences_rating ON public.k_experiences(rating DESC);
CREATE INDEX IF NOT EXISTS idx_k_experiences_verification_count ON public.k_experiences(verification_count DESC);
CREATE INDEX IF NOT EXISTS idx_k_experiences_created_at ON public.k_experiences(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_k_experiences_start_date ON public.k_experiences(start_date);

-- GIN index for JSONB title search
CREATE INDEX IF NOT EXISTS idx_k_experiences_title ON public.k_experiences USING GIN (title);

-- GIN index for tags array
CREATE INDEX IF NOT EXISTS idx_k_experiences_tags ON public.k_experiences USING GIN (tags);

-- ==============================================================================
-- 5. Experience Verifications Table
-- ==============================================================================
-- Links users to experiences they've verified

CREATE TABLE IF NOT EXISTS public.experience_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id UUID NOT NULL REFERENCES public.k_experiences(id) ON DELETE CASCADE,
  
  -- Verification Method
  verification_method VARCHAR(20) NOT NULL DEFAULT 'gps'
    CHECK (verification_method IN ('gps', 'qr', 'receipt', 'manual')),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'verified'
    CHECK (status IN ('pending', 'verified', 'rejected')),
  
  -- Verification Data
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  verification_data JSONB DEFAULT '{}',  -- QR data, receipt info, etc.
  
  -- User Content
  rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
  review TEXT,
  photos TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- Indexes for experience_verifications
CREATE INDEX IF NOT EXISTS idx_experience_verifications_user_id ON public.experience_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_experience_verifications_experience_id ON public.experience_verifications(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_verifications_created_at ON public.experience_verifications(created_at DESC);

-- Unique constraint: one verification per user per experience
CREATE UNIQUE INDEX IF NOT EXISTS idx_experience_verifications_unique 
  ON public.experience_verifications(user_id, experience_id);

-- ==============================================================================
-- 6. Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.vip_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.k_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_verifications ENABLE ROW LEVEL SECURITY;

-- VIP Tickets Policies
CREATE POLICY "Users can view own tickets"
  ON public.vip_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all tickets"
  ON public.vip_tickets FOR ALL
  USING (auth.role() = 'service_role');

-- Payment Transactions Policies
CREATE POLICY "Users can view own transactions"
  ON public.payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all transactions"
  ON public.payment_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- User Preferences Policies
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- K-Experiences Policies (public read, admin write)
CREATE POLICY "Anyone can view active experiences"
  ON public.k_experiences FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Service role can manage experiences"
  ON public.k_experiences FOR ALL
  USING (auth.role() = 'service_role');

-- Experience Verifications Policies
CREATE POLICY "Users can view own verifications"
  ON public.experience_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create verifications"
  ON public.experience_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage verifications"
  ON public.experience_verifications FOR ALL
  USING (auth.role() = 'service_role');

-- ==============================================================================
-- 7. Triggers for updated_at timestamps
-- ==============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_vip_tickets_updated_at ON public.vip_tickets;
CREATE TRIGGER update_vip_tickets_updated_at
  BEFORE UPDATE ON public.vip_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON public.payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_k_experiences_updated_at ON public.k_experiences;
CREATE TRIGGER update_k_experiences_updated_at
  BEFORE UPDATE ON public.k_experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- 8. Trigger to update experience verification count
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.update_experience_verification_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.k_experiences 
    SET verification_count = verification_count + 1
    WHERE id = NEW.experience_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.k_experiences 
    SET verification_count = verification_count - 1
    WHERE id = OLD.experience_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_verification_count ON public.experience_verifications;
CREATE TRIGGER update_verification_count
  AFTER INSERT OR DELETE ON public.experience_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_experience_verification_count();

-- ==============================================================================
-- 9. Sample Data (Development Only)
-- ==============================================================================
-- Uncomment to insert sample K-experiences for testing

/*
INSERT INTO public.k_experiences (category, title, description, location_lat, location_lng, address, is_featured, is_active) VALUES
  (
    'kpop',
    '{"ko": "BTS 팝업스토어 도쿄", "en": "BTS Pop-up Store Tokyo", "ja": "BTS ポップアップストア東京"}',
    '{"ko": "방탄소년단 공식 팝업스토어입니다.", "en": "Official BTS pop-up store.", "ja": "公式BTSポップアップストア"}',
    35.6595,
    139.7004,
    '{"ko": "도쿄 시부야", "en": "Shibuya, Tokyo", "ja": "東京渋谷", "country": "JP", "city": "Tokyo"}',
    TRUE,
    TRUE
  ),
  (
    'kdrama',
    '{"ko": "도깨비 촬영지 - 강릉", "en": "Goblin Filming Location - Gangneung", "ja": "トッケビ撮影地 - 江陵"}',
    '{"ko": "드라마 도깨비의 유명한 촬영지입니다.", "en": "Famous filming location from the drama Goblin.", "ja": "ドラマ「トッケビ」の有名な撮影地"}',
    37.7556,
    128.8961,
    '{"ko": "강원도 강릉시", "en": "Gangneung, Gangwon", "country": "KR", "city": "Gangneung"}',
    TRUE,
    TRUE
  ),
  (
    'kbeauty',
    '{"ko": "올리브영 명동 플래그십", "en": "Olive Young Myeongdong Flagship", "ja": "オリーブヤング明洞フラッグシップ"}',
    '{"ko": "한국 최대 K-뷰티 매장입니다.", "en": "Korea''s largest K-Beauty store.", "ja": "韓国最大のKビューティーストア"}',
    37.5636,
    126.9826,
    '{"ko": "서울 명동", "en": "Myeongdong, Seoul", "ja": "ソウル明洞", "country": "KR", "city": "Seoul"}',
    FALSE,
    TRUE
  );
*/

-- ==============================================================================
-- Migration Complete
-- ==============================================================================
-- Run verification:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
