import webpush from 'web-push';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Configure web-push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface SendPushOptions {
  userIds: string[];
  payload: {
    title: string;
    body: string;
    icon?: string;
    url?: string;
    badge?: string;
    image?: string;
    tag?: string;
    type?: string;
    data?: Record<string, unknown>;
  };
}

export async function sendPushNotifications({ userIds, payload }: SendPushOptions) {
  const supabase = await createServerSupabaseClient();

  // Fetch subscriptions
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('id, user_id, endpoint, p256dh_key, auth_key')
    .in('user_id', userIds);

  if (error || !subscriptions?.length) {
    return { sent: 0, failed: 0 };
  }

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/badge-72.png',
    image: payload.image,
    url: payload.url || '/',
    tag: payload.tag || 'zzik-notification',
    type: payload.type,
    data: payload.data,
  });

  // Send notifications
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = await Promise.allSettled(
    subscriptions.map((sub: any) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh_key,
            auth: sub.auth_key,
          },
        },
        notificationPayload
      )
    )
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  // Cleanup invalid subscriptions (410 Gone)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invalidIds = subscriptions
    .filter((_, i) => {
      const r = results[i];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reason = r.status === 'rejected' ? (r.reason as any) : null;
      return reason?.statusCode === 410;
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((s: any) => s.id);

  if (invalidIds.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', invalidIds);
  }

  return { sent, failed };
}
