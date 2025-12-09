-- ============================================
-- ZZIK Notifications System
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Notifications Table
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  priority TEXT NOT NULL DEFAULT 'medium',
  read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT notifications_type_check CHECK (
    type IN (
      'participation_confirmed',
      'popup_opened',
      'checkin_verified',
      'leader_earning',
      'tier_upgrade',
      'goal_progress',
      'deadline_reminder',
      'new_popup'
    )
  ),
  CONSTRAINT notifications_priority_check CHECK (
    priority IN ('low', 'medium', 'high', 'urgent')
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- Notification Preferences Table
-- ============================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT false,

  -- Type-specific preferences
  participation_confirmed BOOLEAN NOT NULL DEFAULT true,
  popup_opened BOOLEAN NOT NULL DEFAULT true,
  checkin_verified BOOLEAN NOT NULL DEFAULT true,
  leader_earning BOOLEAN NOT NULL DEFAULT true,
  tier_upgrade BOOLEAN NOT NULL DEFAULT true,
  goal_progress BOOLEAN NOT NULL DEFAULT true,
  deadline_reminder BOOLEAN NOT NULL DEFAULT true,
  new_popup BOOLEAN NOT NULL DEFAULT true,

  -- Quiet hours
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Notification preferences policies
CREATE POLICY "Users can view own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Functions
-- ============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create notification preferences for new users
CREATE OR REPLACE FUNCTION create_notification_preferences_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Note: This trigger would be on auth.users table (if accessible)
-- If not, preferences can be created on first use

-- ============================================
-- Cleanup Function (Delete Expired Notifications)
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ language 'plpgsql';

-- ============================================
-- Realtime Configuration
-- ============================================

-- Enable Realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Uncomment to insert sample notifications for testing
/*
INSERT INTO notifications (user_id, type, title, message, data, priority) VALUES
  (
    'sample-user-id',
    'popup_opened',
    '팝업 오픈 확정!',
    'K-뷰티 팝업이 오픈 확정되었습니다.',
    '{"popup_id": "sample-popup-id", "popup_name": "K-뷰티 팝업"}'::jsonb,
    'high'
  ),
  (
    'sample-user-id',
    'checkin_verified',
    '찍음 완료!',
    'K-뷰티 팝업 방문 인증! 100P 적립',
    '{"popup_id": "sample-popup-id", "points_earned": 100}'::jsonb,
    'medium'
  );
*/

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE notifications IS 'User notifications with real-time updates';
COMMENT ON TABLE notification_preferences IS 'User notification preferences and settings';
COMMENT ON COLUMN notifications.type IS 'Notification type: participation_confirmed, popup_opened, etc.';
COMMENT ON COLUMN notifications.priority IS 'Notification priority: low, medium, high, urgent';
COMMENT ON COLUMN notifications.data IS 'Additional notification data as JSON';
COMMENT ON COLUMN notifications.expires_at IS 'Optional expiration timestamp for time-sensitive notifications';
