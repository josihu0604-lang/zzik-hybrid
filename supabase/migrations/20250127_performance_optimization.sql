
-- Migration: Performance Optimization (Indexes & Materialized Views)
-- Date: 2025-01-27
-- Author: Ultra Scale Agent

-- 1. Covering Index for Check-ins
-- Allows index-only scans for high-frequency dashboard queries
-- This avoids hitting the heap (table) for most leader dashboard stats
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_popup_checkins_leader_covering
ON popup_checkins (popup_id, user_id) 
INCLUDE (total_score, passed, verified_at);

-- 2. Index for Referral Tracking
-- Optimizes Leader Dashboard "This Month Referrals" query
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leader_referrals_date
ON leader_referrals (leader_id, created_at);

-- 3. Materialized View for Leader Stats (Daily Aggregation)
-- Tier 1 Strategy: Pre-compute stats instead of counting rows on the fly.
-- This view should be refreshed periodically (e.g., cron job every hour).
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.leader_daily_stats AS
SELECT 
  leader_id, 
  date_trunc('day', created_at) as stat_date, 
  count(*) as referral_count,
  count(case when checked_in then 1 end) as checkin_count
FROM leader_referrals
GROUP BY 1, 2;

-- Index for querying the MV
CREATE UNIQUE INDEX IF NOT EXISTS idx_leader_daily_stats_lookup
ON analytics.leader_daily_stats (leader_id, stat_date);

-- 4. Function to Refresh Stats (to be called by cron/admin)
CREATE OR REPLACE FUNCTION analytics.refresh_leader_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.leader_daily_stats;
END;
$$ LANGUAGE plpgsql;

-- 5. Partitioning Preparation (Schema Only)
-- We cannot partition existing 'popup_checkins' without downtime/migration.
-- Creating 'popup_checkins_v2' as a partitioned table for future migration.
CREATE TABLE IF NOT EXISTS public.popup_checkins_v2 (
  id uuid default gen_random_uuid(),
  popup_id uuid not null,
  user_id uuid not null,
  total_score int not null,
  verified_at timestamptz not null default now(),
  -- ... other columns ...
  primary key (id, verified_at)
) PARTITION BY RANGE (verified_at);

-- Create partition for current month
CREATE TABLE IF NOT EXISTS public.popup_checkins_y2025m01
PARTITION OF public.popup_checkins_v2
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE IF NOT EXISTS public.popup_checkins_y2025m02
PARTITION OF public.popup_checkins_v2
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
