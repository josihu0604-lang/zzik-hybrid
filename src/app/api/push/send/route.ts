/**
 * Send Push Notification API
 *
 * POST /api/push/send - Send push notification to users
 *
 * Security:
 * - Requires authentication
 * - Only admin or leader roles can send push notifications
 * - Server-side calls can use X-API-Secret header
 * - Rate limited to prevent spam
 */

import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api-middleware';
import { timingSafeCompare } from '@/lib/security';
import webpush from 'web-push';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Configure web-push with VAPID details
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    process.env.VAPID_PRIVATE_KEY
  );
}

// Validation schema
const PushPayloadSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  icon: z.string().optional(),
  badge: z.string().optional(),
  image: z.string().url().optional(),
  url: z.string().optional(),
  tag: z.string().optional(),
  type: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

const SendPushSchema = z.object({
  userIds: z.array(z.string().uuid()).optional(),
  popupId: z.string().uuid().optional(),
  payload: PushPayloadSchema,
});

interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
}

interface Participant {
  user_id: string;
}

// Server-side API secret for internal calls
const API_SECRET = process.env.INTERNAL_API_SECRET;

// Allowed roles for sending push notifications
const ALLOWED_ROLES = ['admin', 'leader'];

export async function POST(request: NextRequest) {
  try {
    // SEC-019: Check API secret with timing-safe comparison
    const apiSecret = request.headers.get('X-API-Secret');
    const isInternalCall = timingSafeCompare(apiSecret, API_SECRET);

    // Validate VAPID configuration
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      logger.error('[Push] VAPID keys not configured');
      return apiError('Push service not configured', 500);
    }

    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Must be either internal call or authenticated user
    if (!isInternalCall && (authError || !user)) {
      logger.warn('[Push] Unauthorized send attempt');
      return apiError('Authentication required', 401);
    }

    // Role-based access control for non-internal calls
    if (!isInternalCall && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const userRole = profile?.role || 'user';

      if (!ALLOWED_ROLES.includes(userRole)) {
        logger.warn('[Push] User without permission tried to send push', {
          data: { userId: user.id, role: userRole },
        });
        return apiError('Insufficient permissions to send push notifications', 403);
      }
    }

    // Parse and validate request body
    let validatedBody;
    try {
      const rawBody = await request.json();
      validatedBody = SendPushSchema.parse(rawBody);
    } catch (parseError) {
      if (parseError instanceof z.ZodError) {
        return apiError('Validation failed', 400, {
          validation: parseError.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        });
      }
      return apiError('Invalid request body', 400);
    }

    const { userIds, popupId, payload } = validatedBody;

    // Build query for subscriptions
    let query = supabase
      .from('push_subscriptions')
      .select('id, user_id, endpoint, p256dh_key, auth_key');

    if (userIds && userIds.length > 0) {
      // Send to specific users
      query = query.in('user_id', userIds);
    } else if (popupId) {
      // Send to users who participated in popup
      const { data: participants } = await supabase
        .from('participations')
        .select('user_id')
        .eq('popup_id', popupId);

      if (participants && participants.length > 0) {
        const participantIds = (participants as Participant[]).map((p) => p.user_id);
        query = query.in('user_id', participantIds);
      } else {
        return apiSuccess({
          sent: 0,
          message: 'No participants found',
        });
      }
    } else {
      // Without specific targeting, reject (prevent spam)
      return apiError('Must specify userIds or popupId', 400);
    }

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      logger.error('[Push] Query error', subError);
      return apiError('Failed to fetch subscriptions', 500);
    }

    if (!subscriptions || subscriptions.length === 0) {
      return apiSuccess({
        sent: 0,
        message: 'No subscriptions found',
      });
    }

    // Prepare notification payload
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

    // Cast subscriptions to typed array
    const typedSubscriptions = subscriptions as PushSubscription[];

    // Send notifications
    const results = await Promise.allSettled(
      typedSubscriptions.map((sub) =>
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

    // Count successes and failures
    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    // Remove invalid subscriptions (410 Gone)
    const invalidSubscriptions = typedSubscriptions.filter((_, index) => {
      const result = results[index];
      if (result.status === 'rejected') {
        const error = result.reason as { statusCode?: number };
        return error?.statusCode === 410;
      }
      return false;
    });

    if (invalidSubscriptions.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in(
          'id',
          invalidSubscriptions.map((s) => s.id)
        );
    }

    return apiSuccess({
      sent,
      failed,
      total: subscriptions.length,
      message: `Sent ${sent} notifications`,
    });
  } catch (error) {
    logger.error('[Push] Send error', error);
    return apiError('Internal server error', 500);
  }
}
