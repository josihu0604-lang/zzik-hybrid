/**
 * Push Notification Subscription API
 *
 * POST /api/push/subscribe - Subscribe to push notifications
 * DELETE /api/push/subscribe - Unsubscribe from push notifications
 */

import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api-middleware';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// SEC-018: Zod validation schemas for push subscription
const PushSubscriptionSchema = z.object({
  endpoint: z.string().url('Invalid endpoint URL').max(2048, 'Endpoint URL too long'),
  keys: z.object({
    p256dh: z
      .string()
      .min(1, 'p256dh key required')
      .max(512, 'p256dh key too long')
      .regex(/^[A-Za-z0-9_-]+$/, 'Invalid p256dh key format'),
    auth: z
      .string()
      .min(1, 'auth key required')
      .max(256, 'auth key too long')
      .regex(/^[A-Za-z0-9_-]+$/, 'Invalid auth key format'),
  }),
});

const UnsubscribeSchema = z.object({
  endpoint: z.string().url('Invalid endpoint URL').max(2048, 'Endpoint URL too long'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate with Zod
    let subscription;
    try {
      const rawBody = await request.json();
      subscription = PushSubscriptionSchema.parse(rawBody);
    } catch (parseError) {
      if (parseError instanceof z.ZodError) {
        const errors = parseError.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        }));
        return apiError('Validation failed', 400, { validation: errors });
      }
      return apiError('Invalid request body', 400);
    }

    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return apiError('Unauthorized', 401);
    }

    // Store subscription in database
    type PushSubscriptionRecord = {
      user_id: string;
      endpoint: string;
      p256dh_key: string;
      auth_key: string;
      subscribed_at: string;
      updated_at: string;
    };
    const { error: dbError } = await supabase
      .from('push_subscriptions')
      .upsert<PushSubscriptionRecord>(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh_key: subscription.keys.p256dh,
          auth_key: subscription.keys.auth,
          subscribed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,endpoint',
        }
      );

    if (dbError) {
      logger.error('[Push Subscribe] Database error', dbError);
      return apiError('Failed to save subscription', 500);
    }

    return apiSuccess({ message: 'Subscribed to push notifications' });
  } catch (error) {
    logger.error('[Push Subscribe] Error', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // SEC-018: Validate with Zod schema
    let validatedBody;
    try {
      const rawBody = await request.json();
      validatedBody = UnsubscribeSchema.parse(rawBody);
    } catch (parseError) {
      if (parseError instanceof z.ZodError) {
        const errors = parseError.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        }));
        return apiError('Validation failed', 400, { validation: errors });
      }
      return apiError('Invalid request body', 400);
    }

    const { endpoint } = validatedBody;

    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return apiError('Unauthorized', 401);
    }

    // Remove subscription from database
    const { error: dbError } = await supabase.from('push_subscriptions').delete().match({
      user_id: user.id,
      endpoint,
    });

    if (dbError) {
      logger.error('[Push Unsubscribe] Database error', dbError);
      return apiError('Failed to remove subscription', 500);
    }

    return apiSuccess({ message: 'Unsubscribed from push notifications' });
  } catch (error) {
    logger.error('[Push Unsubscribe] Error', error);
    return apiError('Internal server error', 500);
  }
}
