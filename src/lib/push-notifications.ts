/**
 * Web Push Notifications
 *
 * Features:
 * - Push subscription management
 * - Permission handling
 * - Notification display
 */

// ============================================
// Types
// ============================================

export type NotificationPermission = 'default' | 'granted' | 'denied';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

// ============================================
// Permission Handling
// ============================================

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

/**
 * Get current notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    console.warn('[Push] Push notifications not supported');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

// ============================================
// Subscription Management
// ============================================

/**
 * Get VAPID public key from environment
 */
function getVapidPublicKey(): string | null {
  if (typeof window === 'undefined') return null;
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
}

/**
 * Convert VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<PushSubscriptionData | null> {
  if (!isPushSupported()) {
    console.warn('[Push] Push notifications not supported');
    return null;
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    console.warn('[Push] Permission not granted');
    return null;
  }

  const vapidPublicKey = getVapidPublicKey();
  if (!vapidPublicKey) {
    console.warn('[Push] VAPID public key not configured');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });

    const subscriptionJson = subscription.toJSON();

    return {
      endpoint: subscriptionJson.endpoint!,
      keys: {
        p256dh: subscriptionJson.keys!.p256dh!,
        auth: subscriptionJson.keys!.auth!,
      },
    };
  } catch (error) {
    console.error('[Push] Subscription failed:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Push] Unsubscribe failed:', error);
    return false;
  }
}

/**
 * Check if already subscribed
 */
export async function isSubscribedToPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}

// ============================================
// Local Notifications
// ============================================

/**
 * Show a local notification (without push)
 */
export async function showNotification(
  title: string,
  options?: NotificationOptions
): Promise<boolean> {
  if (!isPushSupported()) {
    console.warn('[Push] Notifications not supported');
    return false;
  }

  if (Notification.permission !== 'granted') {
    console.warn('[Push] Permission not granted');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: '/icon-192.svg',
      badge: '/badge-72.png',
      ...options,
    });
    return true;
  } catch (error) {
    console.error('[Push] Show notification failed:', error);
    return false;
  }
}

/**
 * ZZIK-specific notification templates
 */
export const ZzikNotifications = {
  /**
   * Participation notification
   */
  participation: (popupName: string, currentCount: number, targetCount: number) =>
    showNotification(`${popupName}`, {
      body: `${currentCount}/${targetCount}명 참여 완료! 오픈 확정이 가까워지고 있어요.`,
      tag: 'participation',
      icon: '/icon-192.svg',
      data: { type: 'participation' },
    }),

  /**
   * Popup confirmed notification
   */
  confirmed: (popupName: string) =>
    showNotification(`🎉 ${popupName} 오픈 확정!`, {
      body: '참여하신 팝업이 오픈 확정되었습니다. 지금 바로 방문하세요!',
      tag: 'confirmed',
      icon: '/icon-192.svg',
      requireInteraction: true,
      data: { type: 'confirmed' },
    }),

  /**
   * Deadline reminder notification
   */
  deadline: (popupName: string, hoursLeft: number) =>
    showNotification(`⏰ 마감 임박!`, {
      body: `${popupName} 참여 마감까지 ${hoursLeft}시간 남았습니다.`,
      tag: 'deadline',
      icon: '/icon-192.svg',
      data: { type: 'deadline' },
    }),

  /**
   * Check-in success notification
   */
  checkin: (popupName: string, points: number) =>
    showNotification(`✅ 찍음 완료!`, {
      body: `${popupName} 방문 인증! ${points} 포인트 획득!`,
      tag: 'checkin',
      icon: '/icon-192.svg',
      data: { type: 'checkin' },
    }),

  /**
   * Referral notification (for leaders)
   */
  referral: (count: number) =>
    showNotification(`🎁 레퍼럴 보상!`, {
      body: `${count}명이 당신의 링크로 참여했습니다. 보상을 확인하세요!`,
      tag: 'referral',
      icon: '/icon-192.svg',
      data: { type: 'referral' },
    }),
};

export default {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribedToPush,
  showNotification,
  ZzikNotifications,
};
