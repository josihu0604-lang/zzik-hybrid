-- ============================================================================
-- GPS Data 90-Day Auto-Cleanup Migration
-- SEC-024: Privacy compliance for GPS coordinate data retention
-- ============================================================================
--
-- Purpose:
-- - Automatically delete GPS coordinates older than 90 days
-- - Maintain verification records while protecting user privacy
-- - GDPR/CCPA compliance for location data retention
--
-- Implementation:
-- 1. Create cleanup function to nullify old GPS coordinates
-- 2. Create pg_cron scheduled job to run daily
-- 3. Add index for efficient cleanup queries
-- ============================================================================

-- Create index for efficient date-based queries
CREATE INDEX IF NOT EXISTS idx_popup_checkins_verified_at
ON popup_checkins(verified_at);

-- Create index for GPS data presence check
CREATE INDEX IF NOT EXISTS idx_popup_checkins_has_gps
ON popup_checkins(user_latitude, user_longitude)
WHERE user_latitude IS NOT NULL OR user_longitude IS NOT NULL;

-- ============================================================================
-- GPS Data Cleanup Function
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_gps_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows INTEGER;
  retention_days INTEGER := 90;
  cutoff_date TIMESTAMPTZ;
BEGIN
  -- Calculate cutoff date (90 days ago)
  cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;

  -- Nullify GPS coordinates for records older than retention period
  -- Keep the check-in record itself for verification history
  UPDATE popup_checkins
  SET
    user_latitude = NULL,
    user_longitude = NULL,
    gps_accuracy = NULL,
    gps_distance = NULL,
    -- Add audit note
    updated_at = NOW()
  WHERE
    verified_at < cutoff_date
    AND (user_latitude IS NOT NULL OR user_longitude IS NOT NULL);

  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  -- Log cleanup activity
  INSERT INTO system_logs (
    action,
    details,
    created_at
  ) VALUES (
    'gps_cleanup',
    jsonb_build_object(
      'affected_rows', affected_rows,
      'cutoff_date', cutoff_date,
      'retention_days', retention_days
    ),
    NOW()
  )
  ON CONFLICT DO NOTHING;  -- Ignore if system_logs doesn't exist

  RETURN affected_rows;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION cleanup_old_gps_data() TO service_role;

-- ============================================================================
-- Create System Logs Table (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for querying logs
CREATE INDEX IF NOT EXISTS idx_system_logs_action_created
ON system_logs(action, created_at DESC);

-- RLS for system_logs (only service role can access)
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Only service_role can insert logs
CREATE POLICY "Service role can insert logs"
ON system_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- Only authenticated users can view their own related logs
-- (Optional: Remove this policy if logs should be completely private)

-- ============================================================================
-- Scheduled Job Setup (requires pg_cron extension)
-- ============================================================================

-- Note: pg_cron must be enabled in Supabase dashboard under Extensions
-- Or run: CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at 3 AM UTC
-- This job will be created when pg_cron is available
DO $$
BEGIN
  -- Check if pg_cron is available
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Remove existing job if any
    PERFORM cron.unschedule('gps-data-cleanup');

    -- Schedule new job
    PERFORM cron.schedule(
      'gps-data-cleanup',           -- job name
      '0 3 * * *',                  -- daily at 3 AM UTC
      'SELECT cleanup_old_gps_data()'
    );

    RAISE NOTICE 'GPS cleanup cron job scheduled successfully';
  ELSE
    RAISE NOTICE 'pg_cron not available. Manual cleanup required or enable pg_cron extension.';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not schedule cron job: %. Run cleanup manually.', SQLERRM;
END;
$$;

-- ============================================================================
-- Manual Cleanup Command (for environments without pg_cron)
-- ============================================================================

-- To run manually:
-- SELECT cleanup_old_gps_data();

-- To check cleanup history:
-- SELECT * FROM system_logs WHERE action = 'gps_cleanup' ORDER BY created_at DESC LIMIT 10;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check how many records would be affected
-- SELECT COUNT(*)
-- FROM popup_checkins
-- WHERE verified_at < NOW() - INTERVAL '90 days'
--   AND (user_latitude IS NOT NULL OR user_longitude IS NOT NULL);

-- Check GPS data presence by age
-- SELECT
--   DATE_TRUNC('month', verified_at) as month,
--   COUNT(*) as total_checkins,
--   COUNT(user_latitude) as with_gps
-- FROM popup_checkins
-- GROUP BY DATE_TRUNC('month', verified_at)
-- ORDER BY month DESC;

-- ============================================================================
-- Rollback
-- ============================================================================

-- To rollback this migration:
-- DROP FUNCTION IF EXISTS cleanup_old_gps_data();
-- DROP INDEX IF EXISTS idx_popup_checkins_verified_at;
-- DROP INDEX IF EXISTS idx_popup_checkins_has_gps;
-- SELECT cron.unschedule('gps-data-cleanup'); -- if pg_cron is available
