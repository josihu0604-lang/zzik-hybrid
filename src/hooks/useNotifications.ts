/**
 * useNotifications Hook
 *
 * Real-time notification management using Supabase Realtime
 * Subscribes to postgres_changes for instant notification updates
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Notification } from '@/types/notification';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notifications';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

interface UseNotificationsOptions {
  limit?: number;
  includeRead?: boolean;
}

/**
 * Hook for managing user notifications with real-time updates
 */
export function useNotifications(
  userId: string | null,
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { limit = 50, includeRead = true } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const supabase = getSupabaseClient();
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Filter by read status if specified
      if (!includeRead) {
        query = query.eq('read', false);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      const typedData = (data || []) as Notification[];
      setNotifications(typedData);

      // Count unread notifications
      const unread = typedData.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      logger.error(
        'useNotifications fetch error',
        err instanceof Error ? err : new Error(String(err))
      );
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, limit, includeRead]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) {
      return;
    }

    const supabase = getSupabaseClient();

    // Initial fetch
    fetchNotifications();

    // Subscribe to INSERT events (new notifications)
    const insertChannel = supabase
      .channel('notifications-insert')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logger.debug('[useNotifications] New notification:', payload);
          const newNotification = payload.new as Notification;

          setNotifications((prev) => {
            // Add new notification to the beginning
            const updated = [newNotification, ...prev];
            // Keep only the limit
            return updated.slice(0, limit);
          });

          // Increment unread count if not read
          if (!newNotification.read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    // Subscribe to UPDATE events (read status changes)
    const updateChannel = supabase
      .channel('notifications-update')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logger.debug('[useNotifications] Notification updated:', payload);
          const updatedNotification = payload.new as Notification;

          setNotifications((prev) =>
            prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
          );

          // Recalculate unread count
          setNotifications((prev) => {
            const unread = prev.filter((n) => !n.read).length;
            setUnreadCount(unread);
            return prev;
          });
        }
      )
      .subscribe();

    // Subscribe to DELETE events
    const deleteChannel = supabase
      .channel('notifications-delete')
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logger.debug('[useNotifications] Notification deleted:', payload);
          const deletedId = payload.old.id;

          setNotifications((prev) => {
            const updated = prev.filter((n) => n.id !== deletedId);
            const unread = updated.filter((n) => !n.read).length;
            setUnreadCount(unread);
            return updated;
          });
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      insertChannel.unsubscribe();
      updateChannel.unsubscribe();
      deleteChannel.unsubscribe();
    };
  }, [userId, fetchNotifications, limit]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    const success = await markNotificationAsRead(notificationId);

    if (success) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    const success = await markAllNotificationsAsRead(userId);

    if (success) {
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, read_at: now })));
      setUnreadCount(0);
    }
  }, [userId]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };
}

/**
 * Hook for getting unread count only (lightweight)
 */
export function useUnreadCount(userId: string | null): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }

    const supabase = getSupabaseClient();

    // Initial count
    const fetchCount = async () => {
      const { count: unreadCount, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (!error && unreadCount !== null) {
        setCount(unreadCount);
      }
    };

    fetchCount();

    // Subscribe to changes
    const channel = supabase
      .channel('notifications-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  return count;
}
