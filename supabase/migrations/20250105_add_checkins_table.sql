-- ============================================================================
-- ZZIK Hybrid - Check-in (Triple Verification) Tables
-- Migration: 20250105_add_checkins_table.sql
-- ============================================================================

-- ============================================================================
-- POPUP_CHECKINS TABLE - Visit verification records
-- ============================================================================

CREATE TABLE IF NOT EXISTS popup_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  popup_id UUID NOT NULL REFERENCES popups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Verification Scores (Total: 100)
  gps_score INTEGER NOT NULL DEFAULT 0 CHECK (gps_score >= 0 AND gps_score <= 40),
  qr_score INTEGER NOT NULL DEFAULT 0 CHECK (qr_score >= 0 AND qr_score <= 40),
  receipt_score INTEGER NOT NULL DEFAULT 0 CHECK (receipt_score >= 0 AND receipt_score <= 20),
  total_score INTEGER NOT NULL DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),

  -- Verification Details
  gps_distance INTEGER, -- Distance in meters
  gps_accuracy VARCHAR(20), -- 'exact', 'close', 'near', 'far'
  qr_verified BOOLEAN DEFAULT FALSE,
  receipt_verified BOOLEAN DEFAULT FALSE,
  receipt_image_url TEXT,

  -- Location Data
  user_latitude DECIMAL(10, 8),
  user_longitude DECIMAL(11, 8),

  -- Status
  passed BOOLEAN NOT NULL DEFAULT FALSE, -- total_score >= 60
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent multiple checkins per user per popup
  CONSTRAINT unique_popup_checkin UNIQUE (popup_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_checkins_popup ON popup_checkins(popup_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user ON popup_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_passed ON popup_checkins(passed);
CREATE INDEX IF NOT EXISTS idx_checkins_verified_at ON popup_checkins(verified_at DESC);

-- ============================================================================
-- POPUP_QR_CODES TABLE - TOTP codes for popup verification
-- ============================================================================

CREATE TABLE IF NOT EXISTS popup_qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  popup_id UUID NOT NULL REFERENCES popups(id) ON DELETE CASCADE,
  secret_key VARCHAR(64) NOT NULL, -- Used for TOTP generation
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  CONSTRAINT unique_active_qr_per_popup UNIQUE (popup_id, is_active)
);

CREATE INDEX IF NOT EXISTS idx_qr_codes_popup ON popup_qr_codes(popup_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE popup_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE popup_qr_codes ENABLE ROW LEVEL SECURITY;

-- Checkins: Users can view their own
CREATE POLICY "Users can view own checkins"
  ON popup_checkins FOR SELECT
  USING (auth.uid() = user_id);

-- Checkins: Popup leaders can view all checkins for their popups
CREATE POLICY "Leaders can view popup checkins"
  ON popup_checkins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM popups
      WHERE popups.id = popup_checkins.popup_id
      AND popups.leader_id = auth.uid()
    )
  );

-- Checkins: Authenticated users can create their own checkin
CREATE POLICY "Users can checkin to popups"
  ON popup_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- QR Codes: Only leaders can view their popup's QR codes
CREATE POLICY "Leaders can view popup QR codes"
  ON popup_qr_codes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM popups
      WHERE popups.id = popup_qr_codes.popup_id
      AND popups.leader_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-calculate total_score and passed status
CREATE OR REPLACE FUNCTION calculate_checkin_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_score = NEW.gps_score + NEW.qr_score + NEW.receipt_score;
  NEW.passed = NEW.total_score >= 60;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER checkin_score_calculation
  BEFORE INSERT OR UPDATE ON popup_checkins
  FOR EACH ROW
  EXECUTE FUNCTION calculate_checkin_score();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE popup_checkins IS 'Triple Verification check-in records - GPS + QR + Receipt';
COMMENT ON TABLE popup_qr_codes IS 'TOTP secret keys for popup QR verification';
COMMENT ON COLUMN popup_checkins.passed IS 'Check-in passes if total_score >= 60';
COMMENT ON COLUMN popup_checkins.gps_accuracy IS 'exact (0-20m), close (20-50m), near (50-100m), far (100m+)';
