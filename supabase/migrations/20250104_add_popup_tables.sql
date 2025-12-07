-- ============================================================================
-- ZZIK Hybrid - Popup Crowdfunding Tables
-- Migration: 20250104_add_popup_tables.sql
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- POPUPS TABLE - Crowdfunding campaigns
-- ============================================================================

CREATE TABLE IF NOT EXISTS popups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_name VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  category VARCHAR(50) NOT NULL,
  image_url TEXT,
  goal_participants INTEGER NOT NULL DEFAULT 100,
  current_participants INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'funding'
    CHECK (status IN ('funding', 'confirmed', 'completed', 'cancelled')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  deadline_at TIMESTAMPTZ NOT NULL,
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_popups_status ON popups(status);
CREATE INDEX IF NOT EXISTS idx_popups_category ON popups(category);
CREATE INDEX IF NOT EXISTS idx_popups_deadline ON popups(deadline_at);
CREATE INDEX IF NOT EXISTS idx_popups_leader ON popups(leader_id);
CREATE INDEX IF NOT EXISTS idx_popups_location ON popups(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_popups_created ON popups(created_at DESC);

-- Composite index for filtering
CREATE INDEX IF NOT EXISTS idx_popups_status_category ON popups(status, category);

-- ============================================================================
-- POPUP_PARTICIPATIONS TABLE - User participation records
-- ============================================================================

CREATE TABLE IF NOT EXISTS popup_participations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  popup_id UUID NOT NULL REFERENCES popups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20),
  referred_by UUID REFERENCES users(id) ON DELETE SET NULL,
  participated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique participation per popup
  CONSTRAINT unique_popup_participation UNIQUE (popup_id, user_id)
);

-- Indexes for queries
CREATE INDEX IF NOT EXISTS idx_participations_popup ON popup_participations(popup_id);
CREATE INDEX IF NOT EXISTS idx_participations_user ON popup_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_participations_referral ON popup_participations(referral_code);
CREATE INDEX IF NOT EXISTS idx_participations_referred_by ON popup_participations(referred_by);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE popups ENABLE ROW LEVEL SECURITY;
ALTER TABLE popup_participations ENABLE ROW LEVEL SECURITY;

-- Popups: Anyone can read
CREATE POLICY "Anyone can view popups"
  ON popups FOR SELECT
  USING (true);

-- Popups: Only admins/leaders can create
CREATE POLICY "Leaders can create popups"
  ON popups FOR INSERT
  WITH CHECK (
    auth.uid() = leader_id OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email LIKE '%@zzik.app')
  );

-- Popups: Leaders can update their own
CREATE POLICY "Leaders can update own popups"
  ON popups FOR UPDATE
  USING (auth.uid() = leader_id);

-- Participations: Users can view their own
CREATE POLICY "Users can view own participations"
  ON popup_participations FOR SELECT
  USING (auth.uid() = user_id);

-- Participations: Popup leaders can view all participations
CREATE POLICY "Leaders can view popup participations"
  ON popup_participations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM popups
      WHERE popups.id = popup_participations.popup_id
      AND popups.leader_id = auth.uid()
    )
  );

-- Participations: Authenticated users can participate
CREATE POLICY "Users can participate in popups"
  ON popup_participations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_popup_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER popup_updated_at
  BEFORE UPDATE ON popups
  FOR EACH ROW
  EXECUTE FUNCTION update_popup_timestamp();

-- Auto-confirm popup when goal reached
CREATE OR REPLACE FUNCTION check_popup_goal()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_participants >= NEW.goal_participants AND NEW.status = 'funding' THEN
    NEW.status = 'confirmed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER popup_goal_check
  BEFORE UPDATE ON popups
  FOR EACH ROW
  EXECUTE FUNCTION check_popup_goal();

-- ============================================================================
-- SEED DATA (for development)
-- ============================================================================

-- Insert sample popups
INSERT INTO popups (brand_name, title, description, location, category, goal_participants, current_participants, status, deadline_at)
VALUES
  ('GENTLE MONSTER', '성수동 한정판 선글라스 팝업', '2025 신상 선글라스 선공개', '성수동', 'fashion', 100, 72, 'funding', NOW() + INTERVAL '3 days'),
  ('ADER ERROR', '2025 S/S 컬렉션 프리뷰', '스트릿 패션의 새로운 정의', '한남동', 'fashion', 200, 156, 'funding', NOW() + INTERVAL '7 days'),
  ('TAMBURINS', '신규 향수 라인 체험존', '시그니처 향의 비밀', '압구정', 'beauty', 100, 89, 'funding', NOW() + INTERVAL '2 days'),
  ('HYBE', 'BTS 10주년 특별 전시', '아미와 함께하는 여정', '용산', 'kpop', 500, 500, 'confirmed', NOW() - INTERVAL '1 day'),
  ('CAFE ONION', '한옥 카페 특별 이벤트', '전통과 현대의 만남', '익선동', 'cafe', 50, 35, 'funding', NOW() + INTERVAL '5 days'),
  ('YG PLUS', 'BLACKPINK 굿즈 팝업', '블링크 전용 한정판', '홍대', 'kpop', 300, 280, 'funding', NOW() + INTERVAL '1 day'),
  ('OLIVE YOUNG', 'K-Beauty 체험존', '인기 아이템 체험', '강남', 'beauty', 150, 120, 'funding', NOW() + INTERVAL '4 days'),
  ('MUSINSA', '스트릿 컬처 팝업', '힙한 브랜드 총집합', '성수', 'fashion', 200, 200, 'confirmed', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE popups IS 'Popup crowdfunding campaigns - users participate to unlock popup events';
COMMENT ON TABLE popup_participations IS 'Records of user participation in popup campaigns';
COMMENT ON COLUMN popups.status IS 'funding: accepting participants, confirmed: goal reached, completed: event ended, cancelled: cancelled';
COMMENT ON COLUMN popups.leader_id IS 'Influencer/leader who created or promotes this popup';
