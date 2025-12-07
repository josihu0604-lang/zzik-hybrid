-- ============================================================================
-- ZZIK Hybrid - Leader Payout System
-- Migration: 20250108_add_leader_payouts.sql
-- ============================================================================

-- ============================================================================
-- LEADER_PAYOUTS TABLE - Payout requests and history
-- ============================================================================

CREATE TABLE IF NOT EXISTS leader_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  leader_id UUID NOT NULL REFERENCES leaders(id) ON DELETE CASCADE,

  -- Payout details
  amount INTEGER NOT NULL CHECK (amount >= 10000), -- Minimum 10,000 won
  fee INTEGER NOT NULL DEFAULT 0, -- Transaction fee (0% initially)
  net_amount INTEGER GENERATED ALWAYS AS (amount - fee) STORED,

  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'processing', 'paid', 'rejected', 'cancelled')),

  -- Bank information (encrypted in production)
  bank_name VARCHAR(50),
  account_number VARCHAR(50), -- Masked: ****1234
  account_holder VARCHAR(50),

  -- Related earnings (snapshot at request time)
  earnings_count INTEGER NOT NULL DEFAULT 0, -- Number of earnings included
  earnings_period_start TIMESTAMPTZ,
  earnings_period_end TIMESTAMPTZ,

  -- Status reasons
  reject_reason TEXT,
  cancel_reason TEXT,

  -- Admin notes
  admin_notes TEXT,
  processed_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Timestamps
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  processing_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- External references
  transaction_id VARCHAR(100), -- Payment gateway reference

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_payouts_leader ON leader_payouts(leader_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON leader_payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_requested ON leader_payouts(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_payouts_paid ON leader_payouts(paid_at DESC) WHERE status = 'paid';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE leader_payouts ENABLE ROW LEVEL SECURITY;

-- Leaders can view their own payouts
CREATE POLICY "Leaders can view own payouts"
  ON leader_payouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leaders
      WHERE leaders.id = leader_payouts.leader_id
      AND leaders.user_id = auth.uid()
    )
  );

-- Leaders can create their own payout requests
CREATE POLICY "Leaders can request own payouts"
  ON leader_payouts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leaders
      WHERE leaders.id = leader_payouts.leader_id
      AND leaders.user_id = auth.uid()
    )
  );

-- Leaders can cancel their own pending requests
CREATE POLICY "Leaders can cancel own pending payouts"
  ON leader_payouts FOR UPDATE
  USING (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM leaders
      WHERE leaders.id = leader_payouts.leader_id
      AND leaders.user_id = auth.uid()
    )
  )
  WITH CHECK (
    status = 'cancelled' AND
    EXISTS (
      SELECT 1 FROM leaders
      WHERE leaders.id = leader_payouts.leader_id
      AND leaders.user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update leader_payouts.updated_at
CREATE OR REPLACE FUNCTION update_payout_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payout_updated_at
  BEFORE UPDATE ON leader_payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_payout_timestamp();

-- ============================================================================
-- FUNCTION: Process payout request
-- Updates leader_earnings status when payout is confirmed
-- ============================================================================

CREATE OR REPLACE FUNCTION process_payout_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- When payout moves to 'confirmed', mark related earnings
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    NEW.confirmed_at = NOW();

    -- Update earnings status to 'paid' for the included earnings
    UPDATE leader_earnings
    SET status = 'paid', paid_at = NOW()
    WHERE leader_id = NEW.leader_id
      AND status = 'confirmed'
      AND created_at >= COALESCE(NEW.earnings_period_start, '1970-01-01')
      AND created_at <= COALESCE(NEW.earnings_period_end, NOW());
  END IF;

  -- Track status timestamps
  IF NEW.status = 'processing' AND OLD.status = 'confirmed' THEN
    NEW.processing_at = NOW();
  END IF;

  IF NEW.status = 'paid' AND OLD.status = 'processing' THEN
    NEW.paid_at = NOW();
  END IF;

  IF NEW.status = 'rejected' AND OLD.status IN ('pending', 'confirmed') THEN
    NEW.rejected_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payout_status_change
  BEFORE UPDATE ON leader_payouts
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION process_payout_confirmation();

-- ============================================================================
-- FUNCTION: Get leader payout summary
-- ============================================================================

CREATE OR REPLACE FUNCTION get_leader_payout_summary(p_leader_id UUID)
RETURNS TABLE (
  pending_amount INTEGER,
  confirmed_amount INTEGER,
  processing_amount INTEGER,
  paid_total INTEGER,
  payable_amount INTEGER,
  last_payout_date TIMESTAMPTZ,
  next_payout_date DATE,
  min_payout_amount INTEGER,
  can_request_payout BOOLEAN
) AS $$
DECLARE
  v_payable INTEGER;
  v_pending_payouts INTEGER;
  v_min_amount INTEGER := 10000;
BEGIN
  -- Calculate payable earnings (confirmed but not yet paid)
  SELECT COALESCE(SUM(amount), 0)
  INTO v_payable
  FROM leader_earnings
  WHERE leader_id = p_leader_id
    AND status = 'confirmed';

  -- Check for existing pending payout requests
  SELECT COALESCE(SUM(amount), 0)
  INTO v_pending_payouts
  FROM leader_payouts
  WHERE leader_id = p_leader_id
    AND status IN ('pending', 'confirmed', 'processing');

  RETURN QUERY
  SELECT
    -- Pending payouts amount
    COALESCE((
      SELECT SUM(amount)::INTEGER
      FROM leader_payouts
      WHERE leader_id = p_leader_id AND status = 'pending'
    ), 0),

    -- Confirmed payouts amount
    COALESCE((
      SELECT SUM(amount)::INTEGER
      FROM leader_payouts
      WHERE leader_id = p_leader_id AND status = 'confirmed'
    ), 0),

    -- Processing payouts amount
    COALESCE((
      SELECT SUM(amount)::INTEGER
      FROM leader_payouts
      WHERE leader_id = p_leader_id AND status = 'processing'
    ), 0),

    -- Total paid amount
    COALESCE((
      SELECT SUM(amount)::INTEGER
      FROM leader_payouts
      WHERE leader_id = p_leader_id AND status = 'paid'
    ), 0),

    -- Payable amount (confirmed earnings minus pending payouts)
    GREATEST(v_payable - v_pending_payouts, 0),

    -- Last payout date
    (
      SELECT paid_at
      FROM leader_payouts
      WHERE leader_id = p_leader_id AND status = 'paid'
      ORDER BY paid_at DESC
      LIMIT 1
    ),

    -- Next payout date (Thursday)
    (
      SELECT CASE
        WHEN EXTRACT(DOW FROM CURRENT_DATE) < 4 THEN
          (CURRENT_DATE + (4 - EXTRACT(DOW FROM CURRENT_DATE))::INTEGER)
        ELSE
          (CURRENT_DATE + (11 - EXTRACT(DOW FROM CURRENT_DATE))::INTEGER)
      END
    )::DATE,

    -- Minimum payout amount
    v_min_amount,

    -- Can request payout
    (GREATEST(v_payable - v_pending_payouts, 0) >= v_min_amount);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE leader_payouts IS 'Leader payout requests and payment history';
COMMENT ON COLUMN leader_payouts.status IS 'pending: awaiting review, confirmed: approved for payment, processing: payment in progress, paid: completed, rejected: denied, cancelled: cancelled by leader';
COMMENT ON COLUMN leader_payouts.net_amount IS 'Amount after fees (auto-calculated)';
COMMENT ON FUNCTION get_leader_payout_summary IS 'Get summary of leader payout status and eligibility';
