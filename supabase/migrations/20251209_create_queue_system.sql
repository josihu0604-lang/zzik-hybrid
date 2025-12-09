-- ==============================================================================
-- ZZIK Wave 2 - Queue System Migration
-- Version: 1.0
-- Date: 2025-12-09
-- Description: Creates tables and functions for real-time restaurant queue
--              management with SSE support and DB persistence.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. Queue Entry Status Enum
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE queue_entry_status AS ENUM (
    'waiting',    -- In queue, waiting for turn
    'called',     -- Called to be seated
    'seated',     -- Successfully seated
    'cancelled',  -- User cancelled
    'no_show',    -- Called but didn't show up
    'expired'     -- Time limit exceeded
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 2. Restaurant Queue Settings Table
-- ==============================================================================
-- Configuration for each restaurant's queue system

CREATE TABLE IF NOT EXISTS public.restaurant_queue_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Reference to stores table
  restaurant_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  
  -- Queue Configuration
  is_enabled BOOLEAN DEFAULT true,
  max_queue_size INTEGER DEFAULT 100 CHECK (max_queue_size > 0 AND max_queue_size <= 500),
  avg_wait_per_party INTEGER DEFAULT 15 CHECK (avg_wait_per_party > 0), -- minutes
  
  -- Auto-call settings
  auto_call_enabled BOOLEAN DEFAULT false,
  auto_call_interval INTEGER DEFAULT 5, -- minutes between auto-calls
  
  -- Working hours (JSON format: { "mon": {"open": "09:00", "close": "22:00"}, ... })
  working_hours JSONB DEFAULT '{}',
  
  -- Maximum party size
  max_party_size INTEGER DEFAULT 20 CHECK (max_party_size > 0 AND max_party_size <= 50),
  
  -- Wait time before expiration (minutes)
  expiration_time INTEGER DEFAULT 30 CHECK (expiration_time > 0),
  
  -- No-show tolerance (number of no-shows before blocking)
  no_show_limit INTEGER DEFAULT 3 CHECK (no_show_limit >= 0),
  
  -- Metadata for custom settings
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one setting per restaurant
  CONSTRAINT unique_restaurant_queue_setting UNIQUE (restaurant_id)
);

-- ==============================================================================
-- 3. Queue Entries Table
-- ==============================================================================
-- Active queue entries for customers waiting

CREATE TABLE IF NOT EXISTS public.queue_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  restaurant_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Guest information (for non-authenticated users)
  guest_name TEXT,
  phone_number TEXT,
  email TEXT,
  
  -- Queue Details
  party_size INTEGER NOT NULL CHECK (party_size > 0 AND party_size <= 50),
  position INTEGER NOT NULL CHECK (position > 0),
  
  -- Wait time estimates
  estimated_wait_minutes INTEGER,
  estimated_seating_time TIMESTAMPTZ,
  
  -- Status tracking
  status queue_entry_status DEFAULT 'waiting',
  
  -- Special requests
  special_requests TEXT,
  seating_preference TEXT, -- e.g., "window", "booth", "outdoor"
  
  -- Notification preferences
  notification_enabled BOOLEAN DEFAULT true,
  notification_phone TEXT,
  notification_email TEXT,
  
  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  called_at TIMESTAMPTZ,
  seated_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  no_show_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Constraints
  CHECK (
    (user_id IS NOT NULL) OR 
    (guest_name IS NOT NULL AND phone_number IS NOT NULL)
  ),
  
  -- Unique active entry per user/guest at same restaurant
  CONSTRAINT unique_active_queue_entry EXCLUDE USING btree (
    restaurant_id WITH =,
    COALESCE(user_id, 'guest'::text::uuid) WITH =
  ) WHERE (status IN ('waiting', 'called'))
);

-- ==============================================================================
-- 4. Queue History Table
-- ==============================================================================
-- Historical queue data for analytics and reporting

CREATE TABLE IF NOT EXISTS public.queue_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  queue_entry_id UUID REFERENCES public.queue_entries(id) ON DELETE SET NULL,
  restaurant_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Queue Statistics
  party_size INTEGER NOT NULL,
  wait_duration_minutes INTEGER,
  estimated_wait_minutes INTEGER,
  actual_position INTEGER,
  
  -- Final outcome
  final_status queue_entry_status NOT NULL,
  
  -- Timing data
  joined_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  
  -- Day of week (1=Monday, 7=Sunday)
  day_of_week INTEGER CHECK (day_of_week >= 1 AND day_of_week <= 7),
  hour_of_day INTEGER CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. Queue Notifications Table
-- ==============================================================================
-- Track notifications sent to customers

CREATE TABLE IF NOT EXISTS public.queue_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  queue_entry_id UUID NOT NULL REFERENCES public.queue_entries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Notification details
  notification_type VARCHAR(50) NOT NULL CHECK (
    notification_type IN ('joined', 'position_update', 'almost_ready', 'ready', 'reminder', 'expired', 'cancelled')
  ),
  
  -- Channels used
  sent_via_sms BOOLEAN DEFAULT false,
  sent_via_email BOOLEAN DEFAULT false,
  sent_via_push BOOLEAN DEFAULT false,
  sent_via_sse BOOLEAN DEFAULT false,
  
  -- Status
  delivery_status VARCHAR(20) DEFAULT 'sent' CHECK (
    delivery_status IN ('sent', 'delivered', 'failed', 'pending')
  ),
  
  -- Message content
  message_content TEXT,
  
  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- ==============================================================================
-- 6. Indexes for Performance
-- ==============================================================================

-- restaurant_queue_settings indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_queue_settings_restaurant 
  ON public.restaurant_queue_settings(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_queue_settings_enabled 
  ON public.restaurant_queue_settings(is_enabled);

-- queue_entries indexes
CREATE INDEX IF NOT EXISTS idx_queue_entries_restaurant_status 
  ON public.queue_entries(restaurant_id, status) 
  WHERE status IN ('waiting', 'called');
CREATE INDEX IF NOT EXISTS idx_queue_entries_user 
  ON public.queue_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_queue_entries_phone 
  ON public.queue_entries(phone_number) 
  WHERE phone_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_queue_entries_joined_at 
  ON public.queue_entries(joined_at);
CREATE INDEX IF NOT EXISTS idx_queue_entries_position 
  ON public.queue_entries(restaurant_id, position) 
  WHERE status = 'waiting';

-- queue_history indexes
CREATE INDEX IF NOT EXISTS idx_queue_history_restaurant_created 
  ON public.queue_history(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_queue_history_user 
  ON public.queue_history(user_id);
CREATE INDEX IF NOT EXISTS idx_queue_history_date_analysis 
  ON public.queue_history(restaurant_id, day_of_week, hour_of_day);

-- queue_notifications indexes
CREATE INDEX IF NOT EXISTS idx_queue_notifications_entry 
  ON public.queue_notifications(queue_entry_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_queue_notifications_user 
  ON public.queue_notifications(user_id);

-- ==============================================================================
-- 7. Functions for Queue Management
-- ==============================================================================

-- Function: Get current queue position for a restaurant
CREATE OR REPLACE FUNCTION get_queue_position(
  p_restaurant_id UUID,
  p_entry_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_position INTEGER;
BEGIN
  SELECT position INTO v_position
  FROM public.queue_entries
  WHERE id = p_entry_id 
    AND restaurant_id = p_restaurant_id
    AND status IN ('waiting', 'called');
  
  RETURN COALESCE(v_position, 0);
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate estimated wait time
CREATE OR REPLACE FUNCTION calculate_wait_time(
  p_restaurant_id UUID,
  p_position INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_avg_wait INTEGER;
  v_estimated_wait INTEGER;
BEGIN
  -- Get average wait time per party from settings
  SELECT avg_wait_per_party INTO v_avg_wait
  FROM public.restaurant_queue_settings
  WHERE restaurant_id = p_restaurant_id;
  
  -- Default to 15 minutes if not set
  v_avg_wait := COALESCE(v_avg_wait, 15);
  
  -- Calculate estimated wait time
  v_estimated_wait := (p_position - 1) * v_avg_wait;
  
  RETURN GREATEST(v_estimated_wait, 0);
END;
$$ LANGUAGE plpgsql;

-- Function: Archive completed queue entry to history
CREATE OR REPLACE FUNCTION archive_queue_entry() RETURNS TRIGGER AS $$
BEGIN
  -- Only archive when status changes to a final state
  IF NEW.status IN ('seated', 'cancelled', 'no_show', 'expired') 
     AND OLD.status NOT IN ('seated', 'cancelled', 'no_show', 'expired') THEN
    
    INSERT INTO public.queue_history (
      queue_entry_id,
      restaurant_id,
      user_id,
      party_size,
      wait_duration_minutes,
      estimated_wait_minutes,
      actual_position,
      final_status,
      joined_at,
      completed_at,
      day_of_week,
      hour_of_day,
      metadata
    ) VALUES (
      NEW.id,
      NEW.restaurant_id,
      NEW.user_id,
      NEW.party_size,
      EXTRACT(EPOCH FROM (NOW() - NEW.joined_at)) / 60,
      NEW.estimated_wait_minutes,
      NEW.position,
      NEW.status,
      NEW.joined_at,
      NOW(),
      EXTRACT(DOW FROM NEW.joined_at),
      EXTRACT(HOUR FROM NEW.joined_at),
      NEW.metadata
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update queue positions after removal
CREATE OR REPLACE FUNCTION reorder_queue_positions() RETURNS TRIGGER AS $$
BEGIN
  -- When a queue entry status changes from waiting, reorder remaining entries
  IF OLD.status = 'waiting' AND NEW.status != 'waiting' THEN
    UPDATE public.queue_entries
    SET position = position - 1,
        updated_at = NOW()
    WHERE restaurant_id = NEW.restaurant_id
      AND status = 'waiting'
      AND position > OLD.position;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 8. Triggers
-- ==============================================================================

-- Trigger: Archive to history
DROP TRIGGER IF EXISTS trigger_archive_queue_entry ON public.queue_entries;
CREATE TRIGGER trigger_archive_queue_entry
  AFTER UPDATE ON public.queue_entries
  FOR EACH ROW
  EXECUTE FUNCTION archive_queue_entry();

-- Trigger: Reorder positions
DROP TRIGGER IF EXISTS trigger_reorder_queue_positions ON public.queue_entries;
CREATE TRIGGER trigger_reorder_queue_positions
  AFTER UPDATE ON public.queue_entries
  FOR EACH ROW
  EXECUTE FUNCTION reorder_queue_positions();

-- Trigger: Update timestamps for restaurant_queue_settings
DROP TRIGGER IF EXISTS trigger_update_restaurant_queue_settings_updated_at ON public.restaurant_queue_settings;
CREATE TRIGGER trigger_update_restaurant_queue_settings_updated_at
  BEFORE UPDATE ON public.restaurant_queue_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 9. Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.restaurant_queue_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_notifications ENABLE ROW LEVEL SECURITY;

-- restaurant_queue_settings policies
CREATE POLICY "Anyone can view queue settings"
  ON public.restaurant_queue_settings FOR SELECT
  USING (true);

CREATE POLICY "Restaurant owners can manage queue settings"
  ON public.restaurant_queue_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = restaurant_id
        AND stores.owner_id = auth.uid()
    )
  );

-- queue_entries policies
CREATE POLICY "Users can view queue entries for restaurants"
  ON public.queue_entries FOR SELECT
  USING (
    (user_id = auth.uid()) OR
    (status IN ('waiting', 'called')) OR
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = restaurant_id
        AND stores.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can join queue"
  ON public.queue_entries FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id) OR
    (user_id IS NULL AND guest_name IS NOT NULL)
  );

CREATE POLICY "Users can update their own queue entry"
  ON public.queue_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Restaurant owners can manage queue entries"
  ON public.queue_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = restaurant_id
        AND stores.owner_id = auth.uid()
    )
  );

-- queue_history policies
CREATE POLICY "Users can view their own queue history"
  ON public.queue_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Restaurant owners can view queue history"
  ON public.queue_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = restaurant_id
        AND stores.owner_id = auth.uid()
    )
  );

-- queue_notifications policies
CREATE POLICY "Users can view their own notifications"
  ON public.queue_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.queue_notifications FOR INSERT
  WITH CHECK (true);

-- ==============================================================================
-- 10. Sample Data (Optional - for testing)
-- ==============================================================================

-- Insert default queue settings for existing restaurants
-- INSERT INTO public.restaurant_queue_settings (restaurant_id, is_enabled)
-- SELECT id, true FROM public.stores
-- WHERE id NOT IN (SELECT restaurant_id FROM public.restaurant_queue_settings);

-- ==============================================================================
-- Migration Complete
-- ==============================================================================

COMMENT ON TABLE public.restaurant_queue_settings IS 'Queue system configuration for each restaurant';
COMMENT ON TABLE public.queue_entries IS 'Active queue entries for customers waiting';
COMMENT ON TABLE public.queue_history IS 'Historical queue data for analytics';
COMMENT ON TABLE public.queue_notifications IS 'Queue notification tracking';
