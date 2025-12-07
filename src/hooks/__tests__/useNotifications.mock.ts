/**
 * Mock for useNotifications hook
 * Used in component tests
 */

import { vi } from 'vitest';
import type { Notification, NotificationPriority } from '@/types/notification';

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const createMockUseNotifications = (
  overrides?: Partial<UseNotificationsReturn>
): UseNotificationsReturn => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  refreshNotifications: vi.fn(),
  ...overrides,
});

export const mockNotification = (overrides?: Partial<Notification>): Notification => ({
  id: '1',
  user_id: 'user123',
  type: 'popup_opened',
  title: 'Test Notification',
  message: 'Test message',
  read: false,
  created_at: new Date().toISOString(),
  priority: 'medium' as NotificationPriority,
  ...overrides,
});
