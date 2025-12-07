-- ============================================================================
-- ZZIK Hybrid - Leader System Tables
-- Migration: 20250106_add_leader_tables.sql
-- ============================================================================

-- ============================================================================
-- LEADERS TABLE - Leader profiles
-- ============================================================================

CREATE TABLE IF NOT EXISTS leaders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code VARCHAR(8) NOT NULL UNIQUE,
  tier VARCHAR(20) NOT NULL DEFAULT 'Bronze'
    CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  total_referrals INTEGER NOT NULL DEFAULT 0,
  total_checkins INTEGER NOT NULL DEFAULT 0,
  total_earnings INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One leader per user
  CONSTRAINT unique_leader_user UNIQUE (user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leaders_user ON leaders(user_id);
CREATE INDEX IF NOT EXISTS idx_leaders_referral_code ON leaders(referral_code);
CREATE INDEX IF NOT EXISTS idx_leaders_tier ON leaders(tier);
CREATE INDEX IF NOT EXISTS idx_leaders_active ON leaders(is_active);

-- ============================================================================
-- LEADER_REFERRALS TABLE - Track referral relationships
-- ============================================================================

CREATE TABLE IF NOT EXISTS leader_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  leader_id UUID NOT NULL REFERENCES leaders(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  popup_id UUID REFERENCES popups(id) ON DELETE SET NULL,
  referral_code VARCHAR(8) NOT NULL,
  participation_id UUID REFERENCES popup_participations(id) ON DELETE SET NULL,
  checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  checkin_id UUID REFERENCES popup_checkins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate referrals for same user to same popup
  CONSTRAINT unique_referral_per_popup UNIQUE (referred_user_id, popup_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_leader ON leader_referrals(leader_id);
CREATE INDEX IF NOT EXISTS idx_referrals_user ON leader_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_popup ON leader_referrals(popup_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON leader_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_created ON leader_referrals(created_at DESC);

-- ============================================================================
-- LEADER_EARNINGS TABLE - Track earnings per checkin
-- ============================================================================

CREATE TABLE IF NOT EXISTS leader_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  leader_id UUID NOT NULL REFERENCES leaders(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES leader_referrals(id) ON DELETE SET NULL,
  popup_id UUID REFERENCES popups(id) ON DELETE SET NULL,
  checkin_id UUID REFERENCES popup_checkins(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  tier_at_earning VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_earnings_leader ON leader_earnings(leader_id);
CREATE INDEX IF NOT EXISTS idx_earnings_popup ON leader_earnings(popup_id);
CREATE INDEX IF NOT EXISTS idx_earnings_status ON leader_earnings(status);
CREATE INDEX IF NOT EXISTS idx_earnings_created ON leader_earnings(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE leader_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE leader_earnings ENABLE ROW LEVEL SECURITY;

-- Leaders: Users can view their own leader profile
CREATE POLICY "Users can view own leader profile"
  ON leaders FOR SELECT
  USING (auth.uid() = user_id);

-- Leaders: Users can create their own leader profile
CREATE POLICY "Users can create own leader profile"
  ON leaders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Leaders: Users can update their own leader profile
CREATE POLICY "Users can update own leader profile"
  ON leaders FOR UPDATE
  USING (auth.uid() = user_id);

-- Referrals: Leaders can view referrals they created
CREATE POLICY "Leaders can view own referrals"
  ON leader_referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leaders
      WHERE leaders.id = leader_referrals.leader_id
      AND leaders.user_id = auth.uid()
    )
  );

-- Referrals: System can create referrals (via service role)
CREATE POLICY "System can create referrals"
  ON leader_referrals FOR INSERT
  WITH CHECK (true);

-- Earnings: Leaders can view their own earnings
CREATE POLICY "Leaders can view own earnings"
  ON leader_earnings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leaders
      WHERE leaders.id = leader_earnings.leader_id
      AND leaders.user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update leaders.updated_at
CREATE OR REPLACE FUNCTION update_leader_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leader_updated_at
  BEFORE UPDATE ON leaders
  FOR EACH ROW
  EXECUTE FUNCTION update_leader_timestamp();

-- Auto-update leader tier based on referrals
CREATE OR REPLACE FUNCTION update_leader_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_referrals >= 500 THEN
    NEW.tier = 'Platinum';
  ELSIF NEW.total_referrals >= 200 THEN
    NEW.tier = 'Gold';
  ELSIF NEW.total_referrals >= 50 THEN
    NEW.tier = 'Silver';
  ELSE
    NEW.tier = 'Bronze';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leader_tier_update
  BEFORE UPDATE ON leaders
  FOR EACH ROW
  WHEN (OLD.total_referrals IS DISTINCT FROM NEW.total_referrals)
  EXECUTE FUNCTION update_leader_tier();

-- Function to process referral on checkin
CREATE OR REPLACE FUNCTION process_referral_checkin()
RETURNS TRIGGER AS $$
DECLARE
  v_leader_id UUID;
  v_referral_id UUID;
  v_tier VARCHAR(20);
  v_commission INTEGER;
BEGIN
  -- Only process if checkin passed
  IF NOT NEW.passed THEN
    RETURN NEW;
  END IF;

  -- Find referral for this user and popup
  SELECT lr.id, lr.leader_id, l.tier
  INTO v_referral_id, v_leader_id, v_tier
  FROM leader_referrals lr
  JOIN leaders l ON l.id = lr.leader_id
  WHERE lr.referred_user_id = NEW.user_id
  AND lr.popup_id = NEW.popup_id
  AND lr.checked_in = FALSE;

  IF v_referral_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate commission based on tier
  v_commission := CASE v_tier
    WHEN 'Platinum' THEN 1000
    WHEN 'Gold' THEN 750
    WHEN 'Silver' THEN 600
    ELSE 500
  END;

  -- Mark referral as checked in
  UPDATE leader_referrals
  SET checked_in = TRUE, checkin_id = NEW.id
  WHERE id = v_referral_id;

  -- Create earning record
  INSERT INTO leader_earnings (leader_id, referral_id, popup_id, checkin_id, amount, tier_at_earning, status)
  VALUES (v_leader_id, v_referral_id, NEW.popup_id, NEW.id, v_commission, v_tier, 'pending');

  -- Update leader stats
  UPDATE leaders
  SET total_checkins = total_checkins + 1,
      total_earnings = total_earnings + v_commission
  WHERE id = v_leader_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER checkin_referral_processing
  AFTER INSERT OR UPDATE ON popup_checkins
  FOR EACH ROW
  WHEN (NEW.passed = TRUE)
  EXECUTE FUNCTION process_referral_checkin();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE leaders IS 'Leader (influencer) profiles for referral program';
COMMENT ON TABLE leader_referrals IS 'Track which users were referred by which leaders';
COMMENT ON TABLE leader_earnings IS 'Leader earnings from successful referral checkins';
COMMENT ON COLUMN leaders.tier IS 'Bronze (0-49), Silver (50-199), Gold (200-499), Platinum (500+)';
COMMENT ON COLUMN leader_earnings.status IS 'pending: awaiting confirmation, confirmed: ready for payout, paid: paid out';
