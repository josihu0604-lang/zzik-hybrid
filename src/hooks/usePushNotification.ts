'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribedToPush,
  type NotificationPermission,
  type PushSubscriptionData,
} from '@/lib/push-notifications';

/**
 * usePushNotification - Push notification management hook
 *
 * Features:
 * - Permission state
 * - Subscription state
 * - Subscribe/unsubscribe actions
 */

interface UsePushNotificationReturn {
  /** Whether push is supported */
  isSupported: boolean;
  /** Current permission status */
  permission: NotificationPermission;
  /** Whether currently subscribed */
  isSubscribed: boolean;
  /** Subscription data (if subscribed) */
  subscription: PushSubscriptionData | null;
  /** Loading state */
  isLoading: boolean;
  /** Request permission */
  requestPermission: () => Promise<NotificationPermission>;
  /** Subscribe to push */
  subscribe: () => Promise<PushSubscriptionData | null>;
  /** Unsubscribe from push */
  unsubscribe: () => Promise<boolean>;
  /** Toggle subscription */
  toggle: () => Promise<void>;
}

export function usePushNotification(): UsePushNotificationReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const init = async () => {
      const supported = isPushSupported();
      setIsSupported(supported);

      if (supported) {
        setPermission(getNotificationPermission());
        const subscribed = await isSubscribedToPush();
        setIsSubscribed(subscribed);
      }

      setIsLoading(false);
    };

    init();
  }, []);

  // Request permission
  const requestPermissionAction = useCallback(async () => {
    setIsLoading(true);
    const result = await requestNotificationPermission();
    setPermission(result);
    setIsLoading(false);
    return result;
  }, []);

  // Subscribe
  const subscribeAction = useCallback(async () => {
    setIsLoading(true);
    const sub = await subscribeToPush();

    if (sub) {
      setSubscription(sub);
      setIsSubscribed(true);

      // Send subscription to server
      try {
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub),
        });
      } catch (error) {
        console.error('[Push] Failed to send subscription to server:', error);
      }
    }

    setIsLoading(false);
    return sub;
  }, []);

  // Unsubscribe
  const unsubscribeAction = useCallback(async () => {
    setIsLoading(true);
    const success = await unsubscribeFromPush();

    if (success) {
      setSubscription(null);
      setIsSubscribed(false);

      // Notify server
      try {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
        });
      } catch (error) {
        console.error('[Push] Failed to notify server of unsubscription:', error);
      }
    }

    setIsLoading(false);
    return success;
  }, []);

  // Toggle subscription
  const toggleAction = useCallback(async () => {
    if (isSubscribed) {
      await unsubscribeAction();
    } else {
      if (permission !== 'granted') {
        const newPermission = await requestPermissionAction();
        if (newPermission !== 'granted') return;
      }
      await subscribeAction();
    }
  }, [isSubscribed, permission, requestPermissionAction, subscribeAction, unsubscribeAction]);

  return {
    isSupported,
    permission,
    isSubscribed,
    subscription,
    isLoading,
    requestPermission: requestPermissionAction,
    subscribe: subscribeAction,
    unsubscribe: unsubscribeAction,
    toggle: toggleAction,
  };
}

export default usePushNotification;
