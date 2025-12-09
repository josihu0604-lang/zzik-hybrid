/**
 * Notification Types
 *
 * Defines all notification types and data structures
 * for the ZZIK real-time notification system
 */

// ============================================
// Notification Types
// ============================================

/**
 * All possible notification types in ZZIK
 */
export type NotificationType =
  | 'participation_confirmed' // 참여 확정
  | 'popup_opened' // 팝업 오픈 확정
  | 'checkin_verified' // 체크인 인증됨
  | 'leader_earning' // 리더 수익 발생
  | 'tier_upgrade' // 티어 승급
  | 'goal_progress' // 목표 진행률 업데이트
  | 'deadline_reminder' // 마감 임박
  | 'new_popup' // 새로운 팝업
  | 'payout_requested' // 정산 요청됨
  | 'payout_confirmed' // 정산 확정됨
  | 'payout_processing' // 정산 처리중
  | 'payout_completed' // 정산 완료
  | 'payout_rejected'; // 정산 거절

/**
 * Notification priority levels
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Base notification interface
 */
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  priority: NotificationPriority;
  read: boolean;
  created_at: string;
  read_at?: string;
  expires_at?: string;
}

// ============================================
// Notification Data Types
// ============================================

/**
 * Base interface for notification data with index signature
 * This allows notification data to be used as Record<string, unknown>
 */
interface NotificationDataBase {
  [key: string]: unknown;
}

/**
 * Participation confirmed notification data
 */
export interface ParticipationConfirmedData extends NotificationDataBase {
  popup_id: string;
  popup_name: string;
  participation_id: string;
}

/**
 * Popup opened notification data
 */
export interface PopupOpenedData extends NotificationDataBase {
  popup_id: string;
  popup_name: string;
  address: string;
  opening_date: string;
  current_count: number;
  target_count: number;
}

/**
 * Check-in verified notification data
 */
export interface CheckinVerifiedData extends NotificationDataBase {
  popup_id: string;
  popup_name: string;
  checkin_id: string;
  points_earned: number;
  badge_earned?: string;
}

/**
 * Leader earning notification data
 */
export interface LeaderEarningData extends NotificationDataBase {
  popup_id: string;
  popup_name: string;
  earning_amount: number;
  referral_count: number;
  total_earnings: number;
}

/**
 * Tier upgrade notification data
 */
export interface TierUpgradeData extends NotificationDataBase {
  old_tier: string;
  new_tier: string;
  benefits: string[];
}

/**
 * Goal progress notification data
 */
export interface GoalProgressData extends NotificationDataBase {
  popup_id: string;
  popup_name: string;
  current_count: number;
  target_count: number;
  progress_percent: number;
}

/**
 * Deadline reminder notification data
 */
export interface DeadlineReminderData extends NotificationDataBase {
  popup_id: string;
  popup_name: string;
  deadline: string;
  hours_left: number;
}

/**
 * New popup notification data
 */
export interface NewPopupData extends NotificationDataBase {
  popup_id: string;
  popup_name: string;
  brand_name: string;
  category: string;
  target_count: number;
}

/**
 * Payout notification data
 */
export interface PayoutNotificationData extends NotificationDataBase {
  payout_id: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'paid' | 'rejected' | 'cancelled';
  reason?: string; // For rejected payouts
  estimated_date?: string; // Expected payment date
  paid_at?: string; // Actual payment date
}

// ============================================
// Type Guards
// ============================================

export function isParticipationConfirmedData(data: unknown): data is ParticipationConfirmedData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'popup_id' in data &&
    'popup_name' in data &&
    'participation_id' in data &&
    typeof (data as ParticipationConfirmedData).popup_id === 'string' &&
    typeof (data as ParticipationConfirmedData).popup_name === 'string' &&
    typeof (data as ParticipationConfirmedData).participation_id === 'string'
  );
}

export function isPopupOpenedData(data: unknown): data is PopupOpenedData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'popup_id' in data &&
    'popup_name' in data &&
    'address' in data &&
    'opening_date' in data &&
    typeof (data as PopupOpenedData).popup_id === 'string' &&
    typeof (data as PopupOpenedData).popup_name === 'string' &&
    typeof (data as PopupOpenedData).address === 'string' &&
    typeof (data as PopupOpenedData).opening_date === 'string'
  );
}

export function isCheckinVerifiedData(data: unknown): data is CheckinVerifiedData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'popup_id' in data &&
    'popup_name' in data &&
    'checkin_id' in data &&
    'points_earned' in data &&
    typeof (data as CheckinVerifiedData).popup_id === 'string' &&
    typeof (data as CheckinVerifiedData).popup_name === 'string' &&
    typeof (data as CheckinVerifiedData).checkin_id === 'string' &&
    typeof (data as CheckinVerifiedData).points_earned === 'number'
  );
}

export function isLeaderEarningData(data: unknown): data is LeaderEarningData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'popup_id' in data &&
    'popup_name' in data &&
    'earning_amount' in data &&
    'referral_count' in data &&
    typeof (data as LeaderEarningData).popup_id === 'string' &&
    typeof (data as LeaderEarningData).popup_name === 'string' &&
    typeof (data as LeaderEarningData).earning_amount === 'number' &&
    typeof (data as LeaderEarningData).referral_count === 'number'
  );
}

export function isTierUpgradeData(data: unknown): data is TierUpgradeData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'old_tier' in data &&
    'new_tier' in data &&
    'benefits' in data &&
    typeof (data as TierUpgradeData).old_tier === 'string' &&
    typeof (data as TierUpgradeData).new_tier === 'string' &&
    Array.isArray((data as TierUpgradeData).benefits)
  );
}

// ============================================
// Notification Preferences
// ============================================

export interface NotificationPreferences {
  user_id: string;
  push_enabled: boolean;
  in_app_enabled: boolean;
  email_enabled: boolean;

  // Type-specific preferences
  participation_confirmed: boolean;
  popup_opened: boolean;
  checkin_verified: boolean;
  leader_earning: boolean;
  tier_upgrade: boolean;
  goal_progress: boolean;
  deadline_reminder: boolean;
  new_popup: boolean;

  // Quiet hours
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string; // HH:MM format
  quiet_hours_end?: string; // HH:MM format

  updated_at: string;
}

export const defaultNotificationPreferences: Omit<
  NotificationPreferences,
  'user_id' | 'updated_at'
> = {
  push_enabled: true,
  in_app_enabled: true,
  email_enabled: false,

  participation_confirmed: true,
  popup_opened: true,
  checkin_verified: true,
  leader_earning: true,
  tier_upgrade: true,
  goal_progress: true,
  deadline_reminder: true,
  new_popup: true,

  quiet_hours_enabled: false,
};
