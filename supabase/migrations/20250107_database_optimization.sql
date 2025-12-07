-- ============================================================================
-- ZZIK Hybrid - Database Optimization Migration
-- Migration: 20250107_database_optimization.sql
--
-- This migration optimizes database performance and security:
-- 1. Missing indexes for frequently queried columns
-- 2. Composite indexes for common query patterns
-- 3. Partial indexes for filtered queries
-- 4. RLS policy gaps addressed
-- 5. Query optimization functions
-- ============================================================================

-- ============================================================================
-- SECTION 1: MISSING INDEXES
-- ============================================================================

-- 1.1 users table - missing indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- 1.2 popups table - additional indexes for common queries
CREATE INDEX IF NOT EXISTS idx_popups_store_id ON popups(store_id);
CREATE INDEX IF NOT EXISTS idx_popups_brand_name ON popups(brand_name);
CREATE INDEX IF NOT EXISTS idx_popups_updated_at ON popups(updated_at DESC);

-- Partial index for active funding popups (most common query)
CREATE INDEX IF NOT EXISTS idx_popups_active_funding ON popups(deadline_at, current_participants)
  WHERE status = 'funding';

-- Partial index for confirmed popups (map view)
CREATE INDEX IF NOT EXISTS idx_popups_confirmed_location ON popups(latitude, longitude)
  WHERE status = 'confirmed';

-- 1.3 popup_participations - composite index for lookup
CREATE INDEX IF NOT EXISTS idx_participations_user_popup ON popup_participations(user_id, popup_id);
CREATE INDEX IF NOT EXISTS idx_participations_created_at ON popup_participations(participated_at DESC);

-- 1.4 popup_checkins - composite indexes
CREATE INDEX IF NOT EXISTS idx_checkins_user_popup ON popup_checkins(user_id, popup_id);
CREATE INDEX IF NOT EXISTS idx_checkins_popup_passed ON popup_checkins(popup_id, passed);

-- 1.5 notifications - optimize for common queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority) WHERE priority IN ('high', 'urgent');

-- 1.6 leader_referrals - optimize for leader dashboard
CREATE INDEX IF NOT EXISTS idx_referrals_leader_created ON leader_referrals(leader_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_checkin_status ON leader_referrals(leader_id, checked_in);

-- 1.7 leader_earnings - optimize for aggregation queries
CREATE INDEX IF NOT EXISTS idx_earnings_leader_created ON leader_earnings(leader_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_earnings_leader_status ON leader_earnings(leader_id, status);

-- 1.8 push_subscriptions - optimize for batch notification sending
CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON push_subscriptions(endpoint);

-- ============================================================================
-- SECTION 2: RLS POLICY ENHANCEMENTS
-- ============================================================================

-- 2.1 notifications - missing INSERT policy for system notifications
-- (Current policy allows any insert, but we should add service role bypass)
-- Already has: "System can insert notifications" WITH CHECK (true)

-- 2.2 popup_checkins - Add policy for users to update their own checkins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'popup_checkins'
    AND policyname = 'Users can update own checkins'
  ) THEN
    CREATE POLICY "Users can update own checkins"
      ON popup_checkins FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 2.3 leader_earnings - Add system insert policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'leader_earnings'
    AND policyname = 'System can create earnings'
  ) THEN
    CREATE POLICY "System can create earnings"
      ON leader_earnings FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- 2.4 leader_referrals - Add update policy for marking checkins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'leader_referrals'
    AND policyname = 'System can update referrals'
  ) THEN
    CREATE POLICY "System can update referrals"
      ON leader_referrals FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 2.5 popups - Add delete policy for leaders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'popups'
    AND policyname = 'Leaders can delete own popups'
  ) THEN
    CREATE POLICY "Leaders can delete own popups"
      ON popups FOR DELETE
      USING (auth.uid() = leader_id);
  END IF;
END $$;

-- ============================================================================
-- SECTION 3: QUERY OPTIMIZATION FUNCTIONS
-- ============================================================================

-- 3.1 Optimized function to get popup with participation status
CREATE OR REPLACE FUNCTION get_popup_with_participation(
  p_popup_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  popup_data JSONB,
  is_participating BOOLEAN,
  has_checked_in BOOLEAN,
  checkin_passed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_jsonb(p.*) AS popup_data,
    CASE WHEN pp.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_participating,
    CASE WHEN pc.id IS NOT NULL THEN TRUE ELSE FALSE END AS has_checked_in,
    COALESCE(pc.passed, FALSE) AS checkin_passed
  FROM popups p
  LEFT JOIN popup_participations pp ON pp.popup_id = p.id AND pp.user_id = p_user_id
  LEFT JOIN popup_checkins pc ON pc.popup_id = p.id AND pc.user_id = p_user_id
  WHERE p.id = p_popup_id;
END;
$$;

-- 3.2 Optimized function to get user's popup summary
CREATE OR REPLACE FUNCTION get_user_popup_summary(
  p_user_id UUID
)
RETURNS TABLE (
  total_participations BIGINT,
  total_checkins BIGINT,
  passed_checkins BIGINT,
  active_popups BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM popup_participations WHERE user_id = p_user_id) AS total_participations,
    (SELECT COUNT(*) FROM popup_checkins WHERE user_id = p_user_id) AS total_checkins,
    (SELECT COUNT(*) FROM popup_checkins WHERE user_id = p_user_id AND passed = true) AS passed_checkins,
    (SELECT COUNT(DISTINCT pp.popup_id)
     FROM popup_participations pp
     JOIN popups p ON p.id = pp.popup_id
     WHERE pp.user_id = p_user_id
     AND p.status IN ('funding', 'confirmed')) AS active_popups;
END;
$$;

-- 3.3 Optimized function to get leader dashboard stats
CREATE OR REPLACE FUNCTION get_leader_dashboard(
  p_user_id UUID
)
RETURNS TABLE (
  leader_data JSONB,
  this_month_referrals BIGINT,
  this_month_earnings BIGINT,
  this_month_checkins BIGINT,
  top_campaigns JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_leader_id UUID;
  v_month_start TIMESTAMPTZ;
BEGIN
  -- Get leader ID
  SELECT id INTO v_leader_id FROM leaders WHERE user_id = p_user_id;

  IF v_leader_id IS NULL THEN
    RETURN;
  END IF;

  -- Calculate month start
  v_month_start := date_trunc('month', CURRENT_TIMESTAMP);

  RETURN QUERY
  SELECT
    -- Leader basic data
    (SELECT to_jsonb(l.*) FROM leaders l WHERE l.id = v_leader_id) AS leader_data,

    -- This month's referrals
    (SELECT COUNT(*)
     FROM leader_referrals
     WHERE leader_id = v_leader_id
     AND created_at >= v_month_start) AS this_month_referrals,

    -- This month's earnings
    (SELECT COALESCE(SUM(amount), 0)
     FROM leader_earnings
     WHERE leader_id = v_leader_id
     AND created_at >= v_month_start) AS this_month_earnings,

    -- This month's checkins
    (SELECT COUNT(*)
     FROM leader_referrals
     WHERE leader_id = v_leader_id
     AND checked_in = true
     AND created_at >= v_month_start) AS this_month_checkins,

    -- Top campaigns (aggregated)
    (SELECT COALESCE(jsonb_agg(campaign_data), '[]'::jsonb)
     FROM (
       SELECT jsonb_build_object(
         'popup_id', lr.popup_id,
         'brand_name', p.brand_name,
         'title', p.title,
         'referrals', COUNT(*),
         'checkins', COUNT(*) FILTER (WHERE lr.checked_in = true),
         'status', p.status
       ) AS campaign_data
       FROM leader_referrals lr
       JOIN popups p ON p.id = lr.popup_id
       WHERE lr.leader_id = v_leader_id
       GROUP BY lr.popup_id, p.brand_name, p.title, p.status
       ORDER BY COUNT(*) DESC
       LIMIT 10
     ) top_campaigns) AS top_campaigns;
END;
$$;

-- 3.4 Increment leader checkins safely (with RPC)
CREATE OR REPLACE FUNCTION increment_leader_checkins(
  p_leader_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE leaders
  SET total_checkins = total_checkins + 1,
      updated_at = NOW()
  WHERE id = p_leader_id;
END;
$$;

-- 3.5 Get active popups with efficient pagination
CREATE OR REPLACE FUNCTION get_active_popups(
  p_category TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'funding',
  p_limit INT DEFAULT 20,
  p_cursor TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  brand_name VARCHAR,
  title VARCHAR,
  description TEXT,
  location VARCHAR,
  category VARCHAR,
  image_url TEXT,
  goal_participants INT,
  current_participants INT,
  status VARCHAR,
  deadline_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  progress_percent NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.brand_name,
    p.title,
    p.description,
    p.location,
    p.category,
    p.image_url,
    p.goal_participants,
    p.current_participants,
    p.status,
    p.deadline_at,
    p.created_at,
    ROUND((p.current_participants::NUMERIC / NULLIF(p.goal_participants, 0)) * 100, 1) AS progress_percent
  FROM popups p
  WHERE
    (p_status IS NULL OR p.status = p_status)
    AND (p_category IS NULL OR p_category = 'all' OR p.category = p_category)
    AND (p_cursor IS NULL OR p.created_at < p_cursor)
  ORDER BY p.created_at DESC
  LIMIT p_limit;
END;
$$;

-- 3.6 Get unread notification count efficiently
CREATE OR REPLACE FUNCTION get_unread_notification_count(
  p_user_id UUID
)
RETURNS INT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INT
  FROM notifications
  WHERE user_id = p_user_id
  AND read = false
  AND (expires_at IS NULL OR expires_at > NOW());
$$;

-- 3.7 Batch mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_user_id UUID,
  p_notification_ids UUID[] DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_count INT;
BEGIN
  IF p_notification_ids IS NULL THEN
    -- Mark all as read
    UPDATE notifications
    SET read = true, read_at = NOW(), updated_at = NOW()
    WHERE user_id = p_user_id AND read = false;
  ELSE
    -- Mark specific notifications as read
    UPDATE notifications
    SET read = true, read_at = NOW(), updated_at = NOW()
    WHERE user_id = p_user_id
    AND id = ANY(p_notification_ids)
    AND read = false;
  END IF;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$;

-- ============================================================================
-- SECTION 4: MATERIALIZED VIEW FOR ANALYTICS (Optional)
-- ============================================================================

-- 4.1 Popup statistics materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_popup_statistics AS
SELECT
  p.id AS popup_id,
  p.brand_name,
  p.category,
  p.status,
  p.goal_participants,
  p.current_participants,
  ROUND((p.current_participants::NUMERIC / NULLIF(p.goal_participants, 0)) * 100, 1) AS progress_percent,
  COUNT(DISTINCT pp.user_id) AS unique_participants,
  COUNT(DISTINCT pc.user_id) AS unique_checkins,
  COUNT(DISTINCT pc.user_id) FILTER (WHERE pc.passed = true) AS passed_checkins,
  ROUND(
    (COUNT(DISTINCT pc.user_id) FILTER (WHERE pc.passed = true)::NUMERIC /
     NULLIF(COUNT(DISTINCT pp.user_id), 0)) * 100, 1
  ) AS conversion_rate,
  p.created_at,
  p.deadline_at
FROM popups p
LEFT JOIN popup_participations pp ON pp.popup_id = p.id
LEFT JOIN popup_checkins pc ON pc.popup_id = p.id
GROUP BY p.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_popup_stats_id ON mv_popup_statistics(popup_id);
CREATE INDEX IF NOT EXISTS idx_mv_popup_stats_category ON mv_popup_statistics(category);
CREATE INDEX IF NOT EXISTS idx_mv_popup_stats_status ON mv_popup_statistics(status);

-- 4.2 Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_popup_statistics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_popup_statistics;
END;
$$;

-- ============================================================================
-- SECTION 5: CLEANUP OLD DATA (Maintenance)
-- ============================================================================

-- 5.1 Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications_v2()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW();

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- 5.2 Function to clean up old read notifications (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications(
  p_days_old INT DEFAULT 90
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  DELETE FROM notifications
  WHERE read = true
    AND read_at < NOW() - (p_days_old || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- ============================================================================
-- SECTION 6: PERFORMANCE IMPROVEMENTS
-- ============================================================================

-- 6.1 Add missing foreign key indexes (critical for JOIN performance)
CREATE INDEX IF NOT EXISTS idx_popups_leader_id_fk ON popups(leader_id);

-- 6.2 Add index for popup deadline queries (time-sensitive operations)
CREATE INDEX IF NOT EXISTS idx_popups_deadline_status ON popups(deadline_at, status);

-- 6.3 Add GIN index for JSONB search on notifications data
CREATE INDEX IF NOT EXISTS idx_notifications_data_gin ON notifications USING GIN(data);

-- 6.4 Add GIN index for vibe_analysis search (if using pgvector)
-- Already exists: idx_journeys_vector for vector search

-- ============================================================================
-- SECTION 7: TABLE STATISTICS UPDATE
-- ============================================================================

-- Update table statistics for better query planning
ANALYZE users;
ANALYZE popups;
ANALYZE popup_participations;
ANALYZE popup_checkins;
ANALYZE leaders;
ANALYZE leader_referrals;
ANALYZE leader_earnings;
ANALYZE notifications;
ANALYZE push_subscriptions;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION get_popup_with_participation IS 'Get popup details with user participation status in single query - prevents N+1';
COMMENT ON FUNCTION get_user_popup_summary IS 'Get user popup summary stats efficiently';
COMMENT ON FUNCTION get_leader_dashboard IS 'Get all leader dashboard data in single optimized query';
COMMENT ON FUNCTION get_active_popups IS 'Cursor-based pagination for active popups';
COMMENT ON FUNCTION get_unread_notification_count IS 'Efficient unread notification count';
COMMENT ON FUNCTION mark_notifications_read IS 'Batch mark notifications as read';
COMMENT ON MATERIALIZED VIEW mv_popup_statistics IS 'Pre-computed popup statistics for analytics dashboard';
