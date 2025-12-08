/**
 * Supabase Database Types
 * Auto-generated types for ZZIK Hybrid V2
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          nickname: string | null;
          avatar_url: string | null;
          profile_image: string | null;
          preferences_vector: number[] | null;
          wallet_address: string | null;
          vip_level: number;
          z_cash_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          nickname?: string | null;
          avatar_url?: string | null;
          profile_image?: string | null;
          preferences_vector?: number[] | null;
          wallet_address?: string | null;
          vip_level?: number;
          z_cash_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          nickname?: string | null;
          avatar_url?: string | null;
          profile_image?: string | null;
          preferences_vector?: number[] | null;
          wallet_address?: string | null;
          vip_level?: number;
          z_cash_balance?: number;
          updated_at?: string;
        };
      };
      stores: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          latitude: number;
          longitude: number;
          address: string;
          phone: string | null;
          qr_code: string;
          geofence_radius: number;
          owner_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          latitude: number;
          longitude: number;
          address: string;
          phone?: string | null;
          qr_code: string;
          geofence_radius?: number;
          owner_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          category?: string;
          latitude?: number;
          longitude?: number;
          address?: string;
          phone?: string | null;
          qr_code?: string;
          geofence_radius?: number;
          owner_id?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      check_ins: {
        Row: {
          id: string;
          user_id: string;
          store_id: string;
          gps_verified: boolean;
          gps_distance: number | null;
          gps_accuracy: number | null;
          qr_verified: boolean;
          receipt_verified: boolean;
          receipt_text: string | null;
          total_score: number;
          passed: boolean;
          user_lat: number | null;
          user_lng: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          store_id: string;
          gps_verified?: boolean;
          gps_distance?: number | null;
          gps_accuracy?: number | null;
          qr_verified?: boolean;
          receipt_verified?: boolean;
          receipt_text?: string | null;
          total_score?: number;
          passed?: boolean;
          user_lat?: number | null;
          user_lng?: number | null;
          created_at?: string;
        };
        Update: {
          gps_verified?: boolean;
          gps_distance?: number | null;
          gps_accuracy?: number | null;
          qr_verified?: boolean;
          receipt_verified?: boolean;
          receipt_text?: string | null;
          total_score?: number;
          passed?: boolean;
        };
      };
      members: {
        Row: {
          id: string;
          user_id: string;
          store_id: string;
          loyalty_index: number;
          loyalty_segment: 'VIP' | 'REGULAR' | 'NEW' | 'CHURNED';
          total_visits: number;
          total_spend: number;
          avg_verification_score: number;
          last_visit_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          store_id: string;
          loyalty_index?: number;
          loyalty_segment?: 'VIP' | 'REGULAR' | 'NEW' | 'CHURNED';
          total_visits?: number;
          total_spend?: number;
          avg_verification_score?: number;
          last_visit_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          loyalty_index?: number;
          loyalty_segment?: 'VIP' | 'REGULAR' | 'NEW' | 'CHURNED';
          total_visits?: number;
          total_spend?: number;
          avg_verification_score?: number;
          last_visit_at?: string | null;
          updated_at?: string;
        };
      };
      journeys: {
        Row: {
          id: string;
          user_id: string;
          store_id: string | null;
          check_in_id: string | null;
          photo_url: string | null;
          video_url: string | null;
          caption: string | null;
          vibe_analysis: Json | null;
          vibe_vector: number[] | null;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          store_id?: string | null;
          check_in_id?: string | null;
          photo_url?: string | null;
          video_url?: string | null;
          caption?: string | null;
          vibe_analysis?: Json | null;
          vibe_vector?: number[] | null;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          photo_url?: string | null;
          video_url?: string | null;
          caption?: string | null;
          vibe_analysis?: Json | null;
          vibe_vector?: number[] | null;
          is_public?: boolean;
        };
      };
      live_offers: {
        Row: {
          id: string;
          store_id: string;
          title: string;
          description: string | null;
          discount_type: 'PERCENT' | 'FIXED' | 'FREEBIE';
          discount_value: number;
          min_loyalty_segment: 'VIP' | 'REGULAR' | 'NEW' | 'CHURNED' | null;
          starts_at: string;
          expires_at: string;
          max_claims: number | null;
          current_claims: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          title: string;
          description?: string | null;
          discount_type: 'PERCENT' | 'FIXED' | 'FREEBIE';
          discount_value: number;
          min_loyalty_segment?: 'VIP' | 'REGULAR' | 'NEW' | 'CHURNED' | null;
          starts_at: string;
          expires_at: string;
          max_claims?: number | null;
          current_claims?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          discount_type?: 'PERCENT' | 'FIXED' | 'FREEBIE';
          discount_value?: number;
          min_loyalty_segment?: 'VIP' | 'REGULAR' | 'NEW' | 'CHURNED' | null;
          starts_at?: string;
          expires_at?: string;
          max_claims?: number | null;
          current_claims?: number;
          is_active?: boolean;
        };
      };
      popups: {
        Row: {
          id: string;
          brand_name: string;
          title: string;
          description: string | null;
          location: string;
          latitude: number | null;
          longitude: number | null;
          category: string;
          image_url: string | null;
          goal_participants: number;
          current_participants: number;
          status: 'funding' | 'confirmed' | 'completed' | 'cancelled';
          starts_at: string | null;
          ends_at: string | null;
          deadline_at: string;
          leader_id: string | null;
          store_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brand_name: string;
          title: string;
          description?: string | null;
          location: string;
          latitude?: number | null;
          longitude?: number | null;
          category: string;
          image_url?: string | null;
          goal_participants: number;
          current_participants?: number;
          status?: 'funding' | 'confirmed' | 'completed' | 'cancelled';
          starts_at?: string | null;
          ends_at?: string | null;
          deadline_at: string;
          leader_id?: string | null;
          store_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          brand_name?: string;
          title?: string;
          description?: string | null;
          location?: string;
          latitude?: number | null;
          longitude?: number | null;
          category?: string;
          image_url?: string | null;
          goal_participants?: number;
          current_participants?: number;
          status?: 'funding' | 'confirmed' | 'completed' | 'cancelled';
          starts_at?: string | null;
          ends_at?: string | null;
          deadline_at?: string;
          leader_id?: string | null;
          store_id?: string | null;
          updated_at?: string;
        };
      };
      popup_participations: {
        Row: {
          id: string;
          popup_id: string;
          user_id: string;
          referral_code: string | null;
          referred_by: string | null;
          is_guest: boolean;
          participated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          popup_id: string;
          user_id: string;
          referral_code?: string | null;
          referred_by?: string | null;
          is_guest?: boolean;
          participated_at?: string;
          created_at?: string;
        };
        Update: {
          referral_code?: string | null;
          referred_by?: string | null;
          is_guest?: boolean;
        };
      };
      popup_checkins: {
        Row: {
          id: string;
          popup_id: string;
          user_id: string;
          gps_score: number;
          qr_score: number;
          receipt_score: number;
          total_score: number;
          gps_distance: number | null;
          gps_accuracy: number | null;
          qr_verified: boolean;
          receipt_verified: boolean;
          user_latitude: number | null;
          user_longitude: number | null;
          passed: boolean;
          verified_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          popup_id: string;
          user_id: string;
          gps_score?: number;
          qr_score?: number;
          receipt_score?: number;
          total_score?: number;
          gps_distance?: number | null;
          gps_accuracy?: number | null;
          qr_verified?: boolean;
          receipt_verified?: boolean;
          user_latitude?: number | null;
          user_longitude?: number | null;
          passed?: boolean;
          verified_at?: string;
          created_at?: string;
        };
        Update: {
          gps_score?: number;
          qr_score?: number;
          receipt_score?: number;
          total_score?: number;
          gps_distance?: number | null;
          gps_accuracy?: number | null;
          qr_verified?: boolean;
          receipt_verified?: boolean;
          user_latitude?: number | null;
          user_longitude?: number | null;
          passed?: boolean;
          verified_at?: string;
        };
      };
      leaders: {
        Row: {
          id: string;
          user_id: string;
          referral_code: string;
          tier: string;
          total_referrals: number;
          total_checkins: number;
          total_earnings: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          referral_code: string;
          tier?: string;
          total_referrals?: number;
          total_checkins?: number;
          total_earnings?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          referral_code?: string;
          tier?: string;
          total_referrals?: number;
          total_checkins?: number;
          total_earnings?: number;
          updated_at?: string;
        };
      };
      leader_referrals: {
        Row: {
          id: string;
          leader_id: string;
          referred_user_id: string;
          popup_id: string;
          referral_code: string;
          participation_id: string | null;
          checkin_id: string | null;
          checked_in: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          leader_id: string;
          referred_user_id: string;
          popup_id: string;
          referral_code: string;
          participation_id?: string | null;
          checkin_id?: string | null;
          checked_in?: boolean;
          created_at?: string;
        };
        Update: {
          participation_id?: string | null;
          checkin_id?: string | null;
          checked_in?: boolean;
        };
      };
      leader_earnings: {
        Row: {
          id: string;
          leader_id: string;
          referral_id: string | null;
          popup_id: string | null;
          checkin_id: string | null;
          amount: number;
          tier_at_earning: string;
          status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
          source: string;
          created_at: string;
          confirmed_at: string | null;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          leader_id: string;
          referral_id?: string | null;
          popup_id?: string | null;
          checkin_id?: string | null;
          amount: number;
          tier_at_earning?: string;
          status?: 'pending' | 'confirmed' | 'paid' | 'cancelled';
          source?: string;
          created_at?: string;
          confirmed_at?: string | null;
          paid_at?: string | null;
        };
        Update: {
          amount?: number;
          status?: 'pending' | 'confirmed' | 'paid' | 'cancelled';
          source?: string;
          confirmed_at?: string | null;
          paid_at?: string | null;
        };
      };
      leader_payouts: {
        Row: {
          id: string;
          leader_id: string;
          amount: number;
          fee: number;
          net_amount: number;
          status: 'pending' | 'confirmed' | 'processing' | 'paid' | 'rejected' | 'cancelled';
          bank_name: string | null;
          account_number: string | null;
          account_holder: string | null;
          earnings_count: number;
          earnings_period_start: string | null;
          earnings_period_end: string | null;
          reject_reason: string | null;
          cancel_reason: string | null;
          admin_notes: string | null;
          processed_by: string | null;
          transaction_id: string | null;
          requested_at: string;
          confirmed_at: string | null;
          processing_at: string | null;
          paid_at: string | null;
          rejected_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          leader_id: string;
          amount: number;
          fee?: number;
          net_amount?: number;
          status?: 'pending' | 'confirmed' | 'processing' | 'paid' | 'rejected' | 'cancelled';
          bank_name?: string | null;
          account_number?: string | null;
          account_holder?: string | null;
          earnings_count?: number;
          earnings_period_start?: string | null;
          earnings_period_end?: string | null;
          reject_reason?: string | null;
          cancel_reason?: string | null;
          admin_notes?: string | null;
          processed_by?: string | null;
          transaction_id?: string | null;
          requested_at?: string;
          confirmed_at?: string | null;
          processing_at?: string | null;
          paid_at?: string | null;
          rejected_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          fee?: number;
          net_amount?: number;
          status?: 'pending' | 'confirmed' | 'processing' | 'paid' | 'rejected' | 'cancelled';
          bank_name?: string | null;
          account_number?: string | null;
          account_holder?: string | null;
          earnings_count?: number;
          reject_reason?: string | null;
          cancel_reason?: string | null;
          admin_notes?: string | null;
          processed_by?: string | null;
          transaction_id?: string | null;
          confirmed_at?: string | null;
          processing_at?: string | null;
          paid_at?: string | null;
          rejected_at?: string | null;
          cancelled_at?: string | null;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          data: Json;
          priority: NotificationPriority;
          read: boolean;
          read_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          data?: Json;
          priority?: NotificationPriority;
          read?: boolean;
          read_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: NotificationType;
          title?: string;
          message?: string;
          data?: Json;
          priority?: NotificationPriority;
          read?: boolean;
          read_at?: string | null;
          expires_at?: string | null;
          updated_at?: string;
        };
      };
      notification_preferences: {
        Row: {
          user_id: string;
          push_enabled: boolean;
          in_app_enabled: boolean;
          email_enabled: boolean;
          participation_confirmed: boolean;
          popup_opened: boolean;
          checkin_verified: boolean;
          leader_earning: boolean;
          tier_upgrade: boolean;
          goal_progress: boolean;
          deadline_reminder: boolean;
          new_popup: boolean;
          quiet_hours_enabled: boolean;
          quiet_hours_start: string | null;
          quiet_hours_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          push_enabled?: boolean;
          in_app_enabled?: boolean;
          email_enabled?: boolean;
          participation_confirmed?: boolean;
          popup_opened?: boolean;
          checkin_verified?: boolean;
          leader_earning?: boolean;
          tier_upgrade?: boolean;
          goal_progress?: boolean;
          deadline_reminder?: boolean;
          new_popup?: boolean;
          quiet_hours_enabled?: boolean;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          push_enabled?: boolean;
          in_app_enabled?: boolean;
          email_enabled?: boolean;
          participation_confirmed?: boolean;
          popup_opened?: boolean;
          checkin_verified?: boolean;
          leader_earning?: boolean;
          tier_upgrade?: boolean;
          goal_progress?: boolean;
          deadline_reminder?: boolean;
          new_popup?: boolean;
          quiet_hours_enabled?: boolean;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          updated_at?: string;
        };
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh_key: string;
          auth_key: string;
          subscribed_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh_key: string;
          auth_key: string;
          subscribed_at?: string;
          updated_at?: string;
        };
        Update: {
          endpoint?: string;
          p256dh_key?: string;
          auth_key?: string;
          updated_at?: string;
        };
      };
      popup_qr_codes: {
        Row: {
          id: string;
          popup_id: string;
          secret_key: string;
          is_active: boolean;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          popup_id: string;
          secret_key: string;
          is_active?: boolean;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          secret_key?: string;
          is_active?: boolean;
          expires_at?: string | null;
        };
      };
      vibe_cards: {
        Row: {
          id: string;
          user_id: string;
          popup_id: string | null;
          token_id: string | null;
          image_url: string;
          metadata: Json | null;
          is_minted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          popup_id?: string | null;
          token_id?: string | null;
          image_url: string;
          metadata?: Json | null;
          is_minted?: boolean;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          popup_id?: string | null;
          token_id?: string | null;
          image_url?: string;
          metadata?: Json | null;
          is_minted?: boolean;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: string;
          status: string;
          tx_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: string;
          status: string;
          tx_hash?: string | null;
          created_at?: string;
        };
        Update: {
          amount?: number;
          type?: string;
          status?: string;
          tx_hash?: string | null;
        };
      };
    };
    Views: {
      mv_popup_statistics: {
        Row: {
          popup_id: string;
          brand_name: string;
          category: string;
          status: string;
          goal_participants: number;
          current_participants: number;
          progress_percent: number;
          unique_participants: number;
          unique_checkins: number;
          passed_checkins: number;
          conversion_rate: number;
          created_at: string;
          deadline_at: string;
        };
      };
    };
    Functions: {
      match_stores_by_vibe: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
        };
        Returns: {
          id: string;
          name: string;
          similarity: number;
        }[];
      };
      get_popup_with_participation: {
        Args: {
          p_popup_id: string;
          p_user_id?: string | null;
        };
        Returns: {
          popup_data: Json;
          is_participating: boolean;
          has_checked_in: boolean;
          checkin_passed: boolean;
        }[];
      };
      get_user_popup_summary: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          total_participations: number;
          total_checkins: number;
          passed_checkins: number;
          active_popups: number;
        }[];
      };
      get_leader_dashboard: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          leader_data: Json;
          this_month_referrals: number;
          this_month_earnings: number;
          this_month_checkins: number;
          top_campaigns: Json;
        }[];
      };
      get_active_popups: {
        Args: {
          p_category?: string | null;
          p_status?: string;
          p_limit?: number;
          p_cursor?: string | null;
        };
        Returns: {
          id: string;
          brand_name: string;
          title: string;
          description: string | null;
          location: string;
          category: string;
          image_url: string | null;
          goal_participants: number;
          current_participants: number;
          status: string;
          deadline_at: string;
          created_at: string;
          progress_percent: number;
        }[];
      };
      get_unread_notification_count: {
        Args: {
          p_user_id: string;
        };
        Returns: number;
      };
      mark_notifications_read: {
        Args: {
          p_user_id: string;
          p_notification_ids?: string[] | null;
        };
        Returns: number;
      };
      increment_leader_checkins: {
        Args: {
          p_leader_id: string;
        };
        Returns: void;
      };
      cleanup_expired_notifications_v2: {
        Args: Record<string, never>;
        Returns: number;
      };
      cleanup_old_notifications: {
        Args: {
          p_days_old?: number;
        };
        Returns: number;
      };
      refresh_popup_statistics: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: {
      loyalty_segment: 'VIP' | 'REGULAR' | 'NEW' | 'CHURNED';
      discount_type: 'PERCENT' | 'FIXED' | 'FREEBIE';
      notification_type:
        | 'participation_confirmed'
        | 'popup_opened'
        | 'checkin_verified'
        | 'leader_earning'
        | 'tier_upgrade'
        | 'goal_progress'
        | 'deadline_reminder'
        | 'new_popup';
      notification_priority: 'low' | 'medium' | 'high' | 'urgent';
      leader_tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
      leader_earning_status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
    };
  };
}

// Notification types
export type NotificationType =
  | 'participation_confirmed'
  | 'popup_opened'
  | 'checkin_verified'
  | 'leader_earning'
  | 'tier_upgrade'
  | 'goal_progress'
  | 'deadline_reminder'
  | 'new_popup';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// Leader types
export type LeaderTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export type LeaderEarningStatus = 'pending' | 'confirmed' | 'paid' | 'cancelled';

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Updatable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Convenience exports for all tables
export type User = Tables<'users'>;
export type Store = Tables<'stores'>;
export type CheckIn = Tables<'check_ins'>;
export type Member = Tables<'members'>;
export type Journey = Tables<'journeys'>;
export type LiveOffer = Tables<'live_offers'>;
export type Popup = Tables<'popups'>;
export type PopupParticipation = Tables<'popup_participations'>;
export type PopupCheckin = Tables<'popup_checkins'>;
export type Leader = Tables<'leaders'>;
export type LeaderReferral = Tables<'leader_referrals'>;
export type LeaderEarning = Tables<'leader_earnings'>;
export type LeaderPayout = Tables<'leader_payouts'>;
export type Notification = Tables<'notifications'>;
export type NotificationPreferences = Tables<'notification_preferences'>;
export type PushSubscription = Tables<'push_subscriptions'>;
export type PopupQrCode = Tables<'popup_qr_codes'>;

// ============================================================================
// Supabase Query Response Types
// ============================================================================

/**
 * Generic Supabase query response
 */
export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
  count?: number | null;
  status: number;
  statusText: string;
}

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

/**
 * User profile from users table
 */
export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  profile_image: string | null;
  created_at: string;
}

/**
 * Popup participation with joined popup data
 */
export interface ParticipationWithPopup {
  id: string;
  popup_id: string;
  created_at: string;
  popups: {
    id: string;
    brand_name: string;
    title: string;
    status: string;
    current_participants: number;
    goal_participants: number;
  };
}

/**
 * Popup checkin with joined popup data
 */
export interface CheckinWithPopup {
  id: string;
  popup_id: string;
  total_score: number;
  gps_score: number;
  qr_score: number;
  passed: boolean;
  verified_at: string;
  popups: {
    brand_name: string;
    title: string;
  };
}

/**
 * Leader referral with popup data (joined query result)
 */
export interface LeaderReferralWithPopup {
  popup_id: string;
  checked_in: boolean;
  popups: {
    brand_name: string;
    title: string;
    status: string;
  } | null;
}

// ============================================================================
// Optimized Query Result Types
// ============================================================================

/**
 * Result from get_popup_with_participation function
 */
export interface PopupWithParticipationResult {
  popup_data: Popup;
  is_participating: boolean;
  has_checked_in: boolean;
  checkin_passed: boolean;
}

/**
 * Result from get_user_popup_summary function
 */
export interface UserPopupSummary {
  total_participations: number;
  total_checkins: number;
  passed_checkins: number;
  active_popups: number;
}

/**
 * Campaign stats for leader dashboard
 */
export interface LeaderCampaignStats {
  popup_id: string;
  brand_name: string;
  title: string;
  referrals: number;
  checkins: number;
  status: string;
}

/**
 * Result from get_leader_dashboard function
 */
export interface LeaderDashboardResult {
  leader_data: Leader;
  this_month_referrals: number;
  this_month_earnings: number;
  this_month_checkins: number;
  top_campaigns: LeaderCampaignStats[];
}

/**
 * Active popup with progress percent (from get_active_popups)
 */
export interface ActivePopup {
  id: string;
  brand_name: string;
  title: string;
  description: string | null;
  location: string;
  category: string;
  image_url: string | null;
  goal_participants: number;
  current_participants: number;
  status: string;
  deadline_at: string;
  created_at: string;
  progress_percent: number;
}

/**
 * Materialized view row for popup statistics
 */
export interface PopupStatistics {
  popup_id: string;
  brand_name: string;
  category: string;
  status: string;
  goal_participants: number;
  current_participants: number;
  progress_percent: number;
  unique_participants: number;
  unique_checkins: number;
  passed_checkins: number;
  conversion_rate: number;
  created_at: string;
  deadline_at: string;
}
