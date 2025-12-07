-- ZZIK Hybrid RLS (Row Level Security) Policies
-- 보안을 위한 행 수준 보안 정책
-- Created: 2025-01-03

-- ============================================
-- USERS TABLE
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 조회 가능
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 사용자는 자신의 데이터만 수정 가능
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 새 사용자 등록 (auth.uid와 일치해야 함)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- STORES TABLE (공개 읽기, 소유자만 수정)
-- ============================================
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 매장 정보 조회 가능
CREATE POLICY "Anyone can view stores"
  ON stores FOR SELECT
  USING (true);

-- 매장 소유자만 수정 가능
CREATE POLICY "Store owners can update own stores"
  ON stores FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 인증된 사용자만 매장 등록 가능
CREATE POLICY "Authenticated users can create stores"
  ON stores FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- 매장 소유자만 삭제 가능
CREATE POLICY "Store owners can delete own stores"
  ON stores FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================
-- CHECK_INS TABLE
-- ============================================
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 체크인만 조회 가능
CREATE POLICY "Users can view own check-ins"
  ON check_ins FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 체크인만 생성 가능
CREATE POLICY "Users can create own check-ins"
  ON check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 매장 소유자는 자신의 매장 체크인 조회 가능
CREATE POLICY "Store owners can view store check-ins"
  ON check_ins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = check_ins.store_id
      AND stores.owner_id = auth.uid()
    )
  );

-- ============================================
-- MEMBERS TABLE (User-Store 관계)
-- ============================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 멤버십 조회 가능
CREATE POLICY "Users can view own memberships"
  ON members FOR SELECT
  USING (auth.uid() = user_id);

-- 매장 소유자는 자신의 매장 멤버 조회 가능
CREATE POLICY "Store owners can view store members"
  ON members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = members.store_id
      AND stores.owner_id = auth.uid()
    )
  );

-- 사용자는 자신의 멤버십 생성 가능
CREATE POLICY "Users can create own memberships"
  ON members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 멤버십 수정 가능 (탈퇴 등)
CREATE POLICY "Users can update own memberships"
  ON members FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- JOURNEYS TABLE (여정/콘텐츠)
-- ============================================
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;

-- 공개 여정은 모든 사용자가 조회 가능 (is_public 컬럼이 있다면)
-- 현재 스키마에는 is_public이 없으므로 user_id 기반으로 설정
CREATE POLICY "Users can view own journeys"
  ON journeys FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 여정만 생성 가능
CREATE POLICY "Users can create own journeys"
  ON journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 여정만 수정 가능
CREATE POLICY "Users can update own journeys"
  ON journeys FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 여정만 삭제 가능
CREATE POLICY "Users can delete own journeys"
  ON journeys FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- LIVE_OFFERS TABLE (라이브 오퍼)
-- ============================================
ALTER TABLE live_offers ENABLE ROW LEVEL SECURITY;

-- 활성화된 오퍼는 모든 사용자가 조회 가능
CREATE POLICY "Anyone can view active offers"
  ON live_offers FOR SELECT
  USING (is_active = true AND valid_until > NOW());

-- 매장 소유자는 자신의 모든 오퍼 조회 가능
CREATE POLICY "Store owners can view all own offers"
  ON live_offers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = live_offers.store_id
      AND stores.owner_id = auth.uid()
    )
  );

-- 매장 소유자만 오퍼 생성 가능
CREATE POLICY "Store owners can create offers"
  ON live_offers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = live_offers.store_id
      AND stores.owner_id = auth.uid()
    )
  );

-- 매장 소유자만 오퍼 수정 가능
CREATE POLICY "Store owners can update offers"
  ON live_offers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = live_offers.store_id
      AND stores.owner_id = auth.uid()
    )
  );

-- 매장 소유자만 오퍼 삭제 가능
CREATE POLICY "Store owners can delete offers"
  ON live_offers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = live_offers.store_id
      AND stores.owner_id = auth.uid()
    )
  );

-- ============================================
-- SERVICE ROLE BYPASS
-- ============================================
-- 서비스 역할(백엔드)은 모든 테이블에 접근 가능
-- Supabase의 service_role key 사용 시 자동 적용됨

-- ============================================
-- INDEXES FOR RLS PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_store_id ON check_ins(store_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_store_id ON members(store_id);
CREATE INDEX IF NOT EXISTS idx_journeys_user_id ON journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_live_offers_store_id ON live_offers(store_id);
CREATE INDEX IF NOT EXISTS idx_live_offers_active ON live_offers(is_active, valid_until);
