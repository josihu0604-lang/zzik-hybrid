/**
 * Queue Components Barrel Export
 * Phase 5 - UI Dashboard Components
 */

// Real-time Display Components
export { LiveQueueDisplay } from './LiveQueueDisplay';
export { QueuePositionTracker, CompactPositionTracker } from './QueuePositionTracker';
export { RealtimePositionDisplay } from './RealtimePositionDisplay';

// Notification Components
export {
  QueueNotifications,
  QueueNotificationBadge,
  QueueNotificationToast,
} from './QueueNotifications';

// Dashboard & Management Components
export { QueueDashboard } from './QueueDashboard';
export { QueueTicket } from './QueueTicket';
export { WaitlistManager } from './WaitlistManager';
export { 
  QueueAnalyticsDashboard, 
  generateMockAnalyticsData 
} from './QueueAnalyticsDashboard';
