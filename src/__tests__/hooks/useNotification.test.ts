/**
 * useNotification Hook Tests (TST-023)
 *
 * Tests for notification management hook:
 * - Adding notifications
 * - Read/unread state
 * - Priority sorting
 * - Notification deletion
 * - LocalStorage persistence
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useNotification,
  NOTIFICATION_CONFIG,
  type NotificationType,
} from '@/hooks/useNotification';

// ============================================================================
// SETUP & MOCKING
// ============================================================================

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  mockLocalStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================================
// BASIC FUNCTIONALITY
// ============================================================================

describe('useNotification - Initialization', () => {
  it('should initialize with empty notifications', () => {
    const { result } = renderHook(() => useNotification());

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.hasNotifications).toBe(false);
  });

  it('should load notifications from localStorage', () => {
    const existingNotifications = [
      {
        id: 'notif-1',
        type: 'participation' as NotificationType,
        priority: 'normal' as const,
        title: 'Test',
        message: 'Test message',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];

    mockLocalStorage.setItem('zzik_notifications', JSON.stringify(existingNotifications));

    const { result } = renderHook(() => useNotification());

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.unreadCount).toBe(1);
  });

  it('should handle corrupted localStorage data', () => {
    mockLocalStorage.setItem('zzik_notifications', 'invalid json');

    const { result } = renderHook(() => useNotification());

    expect(result.current.notifications).toEqual([]);
  });
});

// ============================================================================
// ADDING NOTIFICATIONS
// ============================================================================

describe('useNotification - Adding Notifications', () => {
  it('should add notification', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'New Participation',
        message: 'Someone joined your popup!',
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].title).toBe('New Participation');
  });

  it('should generate unique IDs', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test 1',
        message: 'Message 1',
      });

      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test 2',
        message: 'Message 2',
      });
    });

    const ids = result.current.notifications.map((n) => n.id);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('should set read to false by default', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test',
        message: 'Message',
      });
    });

    expect(result.current.notifications[0].read).toBe(false);
  });

  it('should include timestamp', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test',
        message: 'Message',
      });
    });

    expect(result.current.notifications[0].createdAt).toBeTruthy();
    expect(new Date(result.current.notifications[0].createdAt).getTime()).toBeGreaterThan(0);
  });

  it('should include optional fields', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'high',
        title: 'Test',
        message: 'Message',
        popupId: 'popup-123',
        link: '/popup/123',
        data: { customField: 'value' },
      });
    });

    const notification = result.current.notifications[0];
    expect(notification.popupId).toBe('popup-123');
    expect(notification.link).toBe('/popup/123');
    expect(notification.data).toEqual({ customField: 'value' });
  });
});

// ============================================================================
// PRIORITY SORTING
// ============================================================================

describe('useNotification - Priority Sorting', () => {
  it('should sort by priority (critical first)', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'low',
        title: 'Low',
        message: 'Low priority',
      });

      result.current.addNotification({
        type: 'confirmed',
        priority: 'critical',
        title: 'Critical',
        message: 'Critical priority',
      });

      result.current.addNotification({
        type: 'milestone',
        priority: 'high',
        title: 'High',
        message: 'High priority',
      });

      result.current.addNotification({
        type: 'checkin',
        priority: 'normal',
        title: 'Normal',
        message: 'Normal priority',
      });
    });

    const priorities = result.current.notifications.map((n) => n.priority);
    expect(priorities).toEqual(['critical', 'high', 'normal', 'low']);
  });

  it('should sort by timestamp within same priority', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'First',
        message: 'First message',
      });
    });

    // Small delay
    const start = Date.now();
    while (Date.now() - start < 10) {
      // Wait
    }

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Second',
        message: 'Second message',
      });
    });

    // Newer notifications should be first within same priority
    expect(result.current.notifications[0].title).toBe('Second');
    expect(result.current.notifications[1].title).toBe('First');
  });
});

// ============================================================================
// READ/UNREAD STATE
// ============================================================================

describe('useNotification - Read/Unread State', () => {
  it('should count unread notifications', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test 1',
        message: 'Message 1',
      });

      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test 2',
        message: 'Message 2',
      });
    });

    expect(result.current.unreadCount).toBe(2);
  });

  it('should mark notification as read', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test',
        message: 'Message',
      });
    });

    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.markAsRead(notificationId);
    });

    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should mark all as read', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test 1',
        message: 'Message 1',
      });

      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test 2',
        message: 'Message 2',
      });

      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test 3',
        message: 'Message 3',
      });
    });

    act(() => {
      result.current.markAllAsRead();
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.every((n) => n.read)).toBe(true);
  });

  it('should not affect read count when marking already read notification', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test',
        message: 'Message',
      });
    });

    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.markAsRead(notificationId);
      result.current.markAsRead(notificationId);
    });

    expect(result.current.unreadCount).toBe(0);
  });
});

// ============================================================================
// NOTIFICATION DELETION
// ============================================================================

describe('useNotification - Deletion', () => {
  it('should remove notification', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test',
        message: 'Message',
      });
    });

    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.removeNotification(notificationId);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('should remove specific notification from multiple', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test 1',
        message: 'Message 1',
      });

      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test 2',
        message: 'Message 2',
      });

      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test 3',
        message: 'Message 3',
      });
    });

    const secondId = result.current.notifications[1].id;

    act(() => {
      result.current.removeNotification(secondId);
    });

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications.find((n) => n.id === secondId)).toBeUndefined();
  });

  it('should clear all notifications', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test 1',
        message: 'Message 1',
      });

      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test 2',
        message: 'Message 2',
      });
    });

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.hasNotifications).toBe(false);
  });

  it('should update unread count when removing unread notification', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test',
        message: 'Message',
      });
    });

    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.removeNotification(notificationId);
    });

    expect(result.current.unreadCount).toBe(0);
  });
});

// ============================================================================
// LOCALSTORAGE PERSISTENCE
// ============================================================================

describe('useNotification - LocalStorage Persistence', () => {
  it('should save to localStorage when adding', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test',
        message: 'Message',
      });
    });

    const stored = mockLocalStorage.getItem('zzik_notifications');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
  });

  it('should save to localStorage when marking as read', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test',
        message: 'Message',
      });
    });

    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.markAsRead(notificationId);
    });

    const stored = mockLocalStorage.getItem('zzik_notifications');
    const parsed = JSON.parse(stored!);

    expect(parsed[0].read).toBe(true);
  });

  it('should save to localStorage when removing', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test 1',
        message: 'Message 1',
      });

      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test 2',
        message: 'Message 2',
      });
    });

    const firstId = result.current.notifications[0].id;

    act(() => {
      result.current.removeNotification(firstId);
    });

    const stored = mockLocalStorage.getItem('zzik_notifications');
    const parsed = JSON.parse(stored!);

    expect(parsed).toHaveLength(1);
  });

  it('should limit stored notifications to max', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.addNotification({
          type: 'participation',
          priority: 'normal',
          title: `Test ${i}`,
          message: `Message ${i}`,
        });
      }
    });

    const stored = mockLocalStorage.getItem('zzik_notifications');
    const parsed = JSON.parse(stored!);

    expect(parsed.length).toBeLessThanOrEqual(50);
  });

  it('should handle localStorage errors', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock mockLocalStorage.setItem to throw
    const originalSetItem = mockLocalStorage.setItem;
    mockLocalStorage.setItem = () => {
      throw new Error('Storage quota exceeded');
    };

    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        type: 'participation',
        priority: 'normal',
        title: 'Test',
        message: 'Message',
      });
    });

    expect(consoleError).toHaveBeenCalledWith(
      '[useNotification] Failed to save:',
      expect.any(Error)
    );

    // Restore
    mockLocalStorage.setItem = originalSetItem;
    consoleError.mockRestore();
  });
});

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

describe('Notification Type Configuration', () => {
  it('should have config for all notification types', () => {
    const types: NotificationType[] = [
      'participation',
      'milestone',
      'confirmed',
      'deadline',
      'checkin',
      'referral',
      'system',
    ];

    types.forEach((type) => {
      expect(NOTIFICATION_CONFIG[type]).toBeDefined();
      expect(NOTIFICATION_CONFIG[type].icon).toBeTruthy();
      expect(NOTIFICATION_CONFIG[type].color).toBeTruthy();
      expect(NOTIFICATION_CONFIG[type].label).toBeTruthy();
    });
  });

  it('should have correct brand colors', () => {
    expect(NOTIFICATION_CONFIG.participation.color).toBe('#FF6B5B');
    expect(NOTIFICATION_CONFIG.milestone.color).toBe('#FFD93D');
    expect(NOTIFICATION_CONFIG.confirmed.color).toBe('#22c55e');
  });
});
