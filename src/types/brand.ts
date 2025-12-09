/**
 * Brand Dashboard Type Definitions
 *
 * Types for B2B brand dashboard and campaign management
 */

/**
 * Campaign status enum
 */
export type CampaignStatus =
  | 'draft'
  | 'funding'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'cancelled';

/**
 * Brand profile
 */
export interface Brand {
  id: string;
  user_id: string;
  brand_name: string;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  contact_email: string;
  contact_phone: string | null;
  business_registration_number: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Campaign data for brand dashboard
 */
export interface BrandCampaign {
  id: string;
  brand_id: string;
  popup_id: string;
  // Popup details
  title: string;
  description: string | null;
  image_url: string | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  category: string;
  // Goals
  goal_participants: number;
  current_participants: number;
  // Dates
  deadline_at: string;
  starts_at: string | null;
  ends_at: string | null;
  // Status
  status: CampaignStatus;
  // Stats (computed)
  progress_percent: number;
  total_checkins: number;
  conversion_rate: number;
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Campaign creation form data
 */
export interface CampaignFormData {
  title: string;
  description: string;
  image_url?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  category: string;
  goal_participants: number;
  deadline_at: string;
  starts_at?: string;
  ends_at?: string;
}

/**
 * Campaign stats response
 */
export interface CampaignStats {
  campaign_id: string;
  // Overview
  total_participants: number;
  goal_participants: number;
  progress_percent: number;
  // Check-ins
  total_checkins: number;
  passed_checkins: number;
  conversion_rate: number;
  // Time series
  daily_participants: DailyStats[];
  daily_checkins: DailyStats[];
  // Breakdown
  verification_breakdown: VerificationBreakdown;
}

/**
 * Daily statistics
 */
export interface DailyStats {
  date: string;
  count: number;
}

/**
 * Verification method breakdown
 */
export interface VerificationBreakdown {
  gps_verified: number;
  qr_verified: number;
  receipt_verified: number;
  multi_verified: number;
}

/**
 * Brand dashboard summary
 */
export interface BrandDashboardSummary {
  // Active campaigns
  active_campaigns: number;
  total_campaigns: number;
  // Participation
  total_participants: number;
  total_checkins: number;
  // Performance
  avg_conversion_rate: number;
  total_reach: number;
  // Recent activity
  recent_campaigns: BrandCampaign[];
}

/**
 * Campaign list response
 */
export interface CampaignListResponse {
  campaigns: BrandCampaign[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

/**
 * Campaign API request body
 */
export interface CreateCampaignRequest {
  title: string;
  description?: string;
  image_url?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  category: string;
  goal_participants: number;
  deadline_at: string;
  starts_at?: string;
  ends_at?: string;
}

/**
 * Campaign API response
 */
export interface CampaignResponse {
  success: boolean;
  data?: BrandCampaign;
  error?: string;
}

/**
 * Stats API response
 */
export interface StatsResponse {
  success: boolean;
  data?: CampaignStats;
  error?: string;
}
