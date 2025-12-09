/**
 * Queue System Types
 * TypeScript definitions for ZZIK Wave 2 Queue Management
 * @module types/queue
 */

// ==============================================================================
// Enums
// ==============================================================================

/**
 * Queue entry status lifecycle
 */
export enum QueueEntryStatus {
  WAITING = 'waiting',     // Customer is waiting in queue
  CALLED = 'called',       // Customer has been called
  SEATED = 'seated',       // Customer is seated
  CANCELLED = 'cancelled', // Customer cancelled
  NO_SHOW = 'no_show',    // Customer didn't show up
  EXPIRED = 'expired',     // Queue entry expired
}

/**
 * Notification types for queue events
 */
export enum QueueNotificationType {
  JOINED = 'joined',                 // Successfully joined queue
  POSITION_UPDATE = 'position_update', // Position changed
  ALMOST_READY = 'almost_ready',     // Next in line (2-3 positions away)
  READY = 'ready',                   // Your turn now
  REMINDER = 'reminder',             // Reminder to be ready
  EXPIRED = 'expired',               // Entry expired
  CANCELLED = 'cancelled',           // Entry cancelled
}

/**
 * Notification delivery status
 */
export enum NotificationDeliveryStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  PENDING = 'pending',
}

/**
 * Seating preference options
 */
export enum SeatingPreference {
  WINDOW = 'window',
  BOOTH = 'booth',
  OUTDOOR = 'outdoor',
  BAR = 'bar',
  PRIVATE = 'private',
  NO_PREFERENCE = 'no_preference',
}

// ==============================================================================
// Database Table Types
// ==============================================================================

/**
 * Restaurant Queue Settings
 * Configuration for restaurant's queue system
 */
export interface RestaurantQueueSettings {
  id: string;
  restaurant_id: string;
  is_enabled: boolean;
  max_queue_size: number;
  avg_wait_per_party: number; // minutes
  auto_call_enabled: boolean;
  auto_call_interval: number; // minutes
  working_hours: WorkingHours;
  max_party_size: number;
  expiration_time: number; // minutes
  no_show_limit: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Working hours format (JSON in DB)
 */
export interface WorkingHours {
  [day: string]: DayHours | null; // mon, tue, wed, thu, fri, sat, sun
}

export interface DayHours {
  open: string;  // HH:MM format
  close: string; // HH:MM format
  breaks?: Array<{
    start: string;
    end: string;
  }>;
}

/**
 * Queue Entry
 * Individual customer entry in the queue
 */
export interface QueueEntry {
  id: string;
  restaurant_id: string;
  user_id: string | null;
  
  // Guest info (for non-auth users)
  guest_name: string | null;
  phone_number: string | null;
  email: string | null;
  
  // Queue details
  party_size: number;
  position: number;
  estimated_wait_minutes: number | null;
  estimated_seating_time: string | null; // ISO timestamp
  
  // Status
  status: QueueEntryStatus;
  
  // Preferences
  special_requests: string | null;
  seating_preference: SeatingPreference | null;
  
  // Notifications
  notification_enabled: boolean;
  notification_phone: string | null;
  notification_email: string | null;
  
  // Timestamps
  joined_at: string;
  called_at: string | null;
  seated_at: string | null;
  cancelled_at: string | null;
  no_show_at: string | null;
  expired_at: string | null;
  
  metadata: Record<string, unknown>;
}

/**
 * Queue History
 * Historical record for analytics
 */
export interface QueueHistory {
  id: string;
  queue_entry_id: string | null;
  restaurant_id: string;
  user_id: string | null;
  party_size: number;
  wait_duration_minutes: number | null;
  estimated_wait_minutes: number | null;
  actual_position: number | null;
  final_status: QueueEntryStatus;
  joined_at: string;
  completed_at: string;
  day_of_week: number; // 1-7
  hour_of_day: number; // 0-23
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Queue Notification
 * Notification tracking
 */
export interface QueueNotification {
  id: string;
  queue_entry_id: string;
  user_id: string | null;
  notification_type: QueueNotificationType;
  
  // Delivery channels
  sent_via_sms: boolean;
  sent_via_email: boolean;
  sent_via_push: boolean;
  sent_via_sse: boolean;
  
  delivery_status: NotificationDeliveryStatus;
  message_content: string | null;
  
  sent_at: string;
  delivered_at: string | null;
  
  metadata: Record<string, unknown>;
}

// ==============================================================================
// API Request/Response Types
// ==============================================================================

/**
 * Join Queue Request
 */
export interface JoinQueueRequest {
  restaurant_id: string;
  party_size: number;
  
  // Optional guest info
  guest_name?: string;
  phone_number?: string;
  email?: string;
  
  // Preferences
  special_requests?: string;
  seating_preference?: SeatingPreference;
  
  // Notification preferences
  notification_enabled?: boolean;
  notification_phone?: string;
  notification_email?: string;
}

/**
 * Join Queue Response
 */
export interface JoinQueueResponse {
  success: boolean;
  queue_entry: QueueEntry;
  estimated_wait_minutes: number;
  estimated_seating_time: string;
  current_queue_size: number;
  message?: string;
}

/**
 * Queue Status Request
 */
export interface QueueStatusRequest {
  queue_entry_id: string;
}

/**
 * Queue Status Response
 */
export interface QueueStatusResponse {
  success: boolean;
  queue_entry: QueueEntry;
  current_position: number;
  estimated_wait_minutes: number;
  estimated_seating_time: string;
  parties_ahead: number;
  is_ready: boolean;
}

/**
 * Leave Queue Request
 */
export interface LeaveQueueRequest {
  queue_entry_id: string;
  reason?: string;
}

/**
 * Leave Queue Response
 */
export interface LeaveQueueResponse {
  success: boolean;
  message: string;
}

/**
 * Call Next Customer Request (Restaurant side)
 */
export interface CallNextRequest {
  restaurant_id: string;
  count?: number; // Number of parties to call (default: 1)
}

/**
 * Call Next Customer Response
 */
export interface CallNextResponse {
  success: boolean;
  called_entries: QueueEntry[];
  remaining_queue_size: number;
}

/**
 * Mark as Seated Request
 */
export interface MarkSeatedRequest {
  queue_entry_id: string;
  actual_party_size?: number;
}

/**
 * Mark as Seated Response
 */
export interface MarkSeatedResponse {
  success: boolean;
  message: string;
}

/**
 * Mark as No Show Request
 */
export interface MarkNoShowRequest {
  queue_entry_id: string;
}

/**
 * Mark as No Show Response
 */
export interface MarkNoShowResponse {
  success: boolean;
  message: string;
  user_no_show_count?: number;
}

/**
 * Get Restaurant Queue Request
 */
export interface GetRestaurantQueueRequest {
  restaurant_id: string;
  status?: QueueEntryStatus[];
}

/**
 * Get Restaurant Queue Response
 */
export interface GetRestaurantQueueResponse {
  success: boolean;
  queue_entries: QueueEntry[];
  total_waiting: number;
  total_called: number;
  avg_wait_time: number;
  settings: RestaurantQueueSettings;
}

/**
 * Update Queue Settings Request
 */
export interface UpdateQueueSettingsRequest {
  restaurant_id: string;
  settings: Partial<Omit<RestaurantQueueSettings, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>>;
}

/**
 * Update Queue Settings Response
 */
export interface UpdateQueueSettingsResponse {
  success: boolean;
  settings: RestaurantQueueSettings;
}

// ==============================================================================
// SSE (Server-Sent Events) Types
// ==============================================================================

/**
 * Queue SSE Event Type
 */
export enum QueueSSEEventType {
  POSITION_UPDATE = 'position_update',
  STATUS_CHANGE = 'status_change',
  QUEUE_UPDATE = 'queue_update',
  CALLED = 'called',
  ALMOST_READY = 'almost_ready',
  EXPIRED = 'expired',
}

/**
 * Queue SSE Event
 */
export interface QueueSSEEvent {
  event_type: QueueSSEEventType;
  queue_entry_id: string;
  restaurant_id: string;
  data: {
    position?: number;
    status?: QueueEntryStatus;
    estimated_wait_minutes?: number;
    estimated_seating_time?: string;
    message?: string;
    [key: string]: unknown;
  };
  timestamp: string;
}

// ==============================================================================
// Analytics Types
// ==============================================================================

/**
 * Queue Analytics
 */
export interface QueueAnalytics {
  restaurant_id: string;
  date_range: {
    start: string;
    end: string;
  };
  
  // Summary statistics
  total_customers: number;
  total_parties: number;
  avg_party_size: number;
  avg_wait_time: number; // minutes
  median_wait_time: number;
  max_wait_time: number;
  
  // Completion rates
  seated_count: number;
  cancelled_count: number;
  no_show_count: number;
  expired_count: number;
  
  seated_rate: number; // percentage
  no_show_rate: number;
  
  // Time distribution
  busiest_hours: Array<{
    hour: number;
    count: number;
    avg_wait: number;
  }>;
  
  busiest_days: Array<{
    day: number; // 1-7
    count: number;
    avg_wait: number;
  }>;
  
  // Peak times
  peak_queue_size: number;
  peak_wait_time: number;
}

/**
 * Wait Time Prediction
 */
export interface WaitTimePrediction {
  restaurant_id: string;
  party_size: number;
  current_time: string;
  
  // Predictions
  estimated_wait_minutes: number;
  confidence_level: number; // 0-1
  
  // Context
  current_queue_size: number;
  historical_avg_wait: number;
  day_of_week: number;
  hour_of_day: number;
}

// ==============================================================================
// UI Component Props Types
// ==============================================================================

/**
 * Queue Ticket Props
 */
export interface QueueTicketProps {
  queueEntry: QueueEntry;
  onRefresh?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}

/**
 * Queue Dashboard Props
 */
export interface QueueDashboardProps {
  restaurantId: string;
  onCallNext?: (entries: QueueEntry[]) => void;
  onMarkSeated?: (entryId: string) => void;
  onMarkNoShow?: (entryId: string) => void;
}

/**
 * Queue List Props
 */
export interface QueueListProps {
  entries: QueueEntry[];
  restaurantId: string;
  isOwner: boolean;
  onEntryAction?: (entryId: string, action: string) => void;
}

/**
 * Wait Time Display Props
 */
export interface WaitTimeDisplayProps {
  estimatedMinutes: number;
  position: number;
  showDetails?: boolean;
  compact?: boolean;
}

// ==============================================================================
// Utility Types
// ==============================================================================

/**
 * Queue Entry with Restaurant Info
 */
export interface QueueEntryWithRestaurant extends QueueEntry {
  restaurant: {
    id: string;
    name: string;
    address: string;
    phone: string | null;
  };
}

/**
 * Queue Statistics
 */
export interface QueueStatistics {
  total_waiting: number;
  total_called: number;
  total_seated_today: number;
  avg_wait_time: number;
  current_wait_time: number;
  queue_trend: 'increasing' | 'stable' | 'decreasing';
}

/**
 * Type guards
 */
export function isQueueEntry(obj: unknown): obj is QueueEntry {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'restaurant_id' in obj &&
    'party_size' in obj &&
    'position' in obj &&
    'status' in obj
  );
}

export function isValidQueueStatus(status: string): status is QueueEntryStatus {
  return Object.values(QueueEntryStatus).includes(status as QueueEntryStatus);
}

/**
 * Constants
 */
export const QUEUE_CONSTANTS = {
  MIN_PARTY_SIZE: 1,
  MAX_PARTY_SIZE: 20,
  DEFAULT_MAX_QUEUE_SIZE: 100,
  DEFAULT_AVG_WAIT_PER_PARTY: 15, // minutes
  DEFAULT_EXPIRATION_TIME: 30, // minutes
  DEFAULT_NO_SHOW_LIMIT: 3,
  ALMOST_READY_THRESHOLD: 3, // positions away
  SSE_RECONNECT_INTERVAL: 5000, // ms
  POSITION_UPDATE_INTERVAL: 30000, // ms
} as const;

/**
 * Helper functions
 */
export function calculateEstimatedWaitTime(
  position: number,
  avgWaitPerParty: number = QUEUE_CONSTANTS.DEFAULT_AVG_WAIT_PER_PARTY
): number {
  return Math.max(0, (position - 1) * avgWaitPerParty);
}

export function formatWaitTime(minutes: number): string {
  if (minutes < 5) return 'Less than 5 minutes';
  if (minutes < 60) return `${minutes} minutes`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  return `${hours}h ${mins}m`;
}

export function isQueueEntryActive(entry: QueueEntry): boolean {
  return entry.status === QueueEntryStatus.WAITING || entry.status === QueueEntryStatus.CALLED;
}

export function isQueueEntryComplete(entry: QueueEntry): boolean {
  return [
    QueueEntryStatus.SEATED,
    QueueEntryStatus.CANCELLED,
    QueueEntryStatus.NO_SHOW,
    QueueEntryStatus.EXPIRED,
  ].includes(entry.status);
}
