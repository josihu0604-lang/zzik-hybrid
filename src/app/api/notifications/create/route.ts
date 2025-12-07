/**
 * Create Notification API
 *
 * POST /api/notifications/create - Create a new notification
 *
 * Security:
 * - Requires authentication
 * - Users can only create notifications for themselves
 * - Admin users can create for any user
 * - Server-side calls can use X-API-Secret header
 */

import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api-middleware';
import { timingSafeCompare } from '@/lib/security';
import { typedFrom } from '@/lib/supabase/typed-client';
import type { NotificationType, NotificationPriority } from '@/types/notification';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Validation schema
const CreateNotificationSchema = z.object({
  user_id: z.string().uuid('Invalid user ID format'),
  type: z.string().min(1, 'Type is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  data: z.record(z.string(), z.unknown()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  expires_at: z.string().datetime().optional().nullable(),
});

type CreateNotificationRequest = z.infer<typeof CreateNotificationSchema>;

// Server-side API secret for internal calls (server-to-server)
const API_SECRET = process.env.INTERNAL_API_SECRET;

export async function POST(request: NextRequest) {
  try {
    // SEC-019: Check for server-side API secret with timing-safe comparison
    const apiSecret = request.headers.get('X-API-Secret');
    const isInternalCall = timingSafeCompare(apiSecret, API_SECRET);

    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Must be either internal call or authenticated user
    if (!isInternalCall && (authError || !user)) {
      logger.warn('[Notifications] Unauthorized create attempt');
      return apiError('Authentication required', 401);
    }

    // Parse and validate body
    let body: CreateNotificationRequest;
    try {
      const rawBody = await request.json();
      body = CreateNotificationSchema.parse(rawBody);
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

    // Authorization check: users can only create notifications for themselves
    // Unless admin or internal call
    if (!isInternalCall && user) {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdmin = profile?.role === 'admin';

      if (!isAdmin && body.user_id !== user.id) {
        logger.warn('[Notifications] User tried to create notification for another user', {
          data: { requestingUser: user.id, targetUser: body.user_id },
        });
        return apiError('Cannot create notifications for other users', 403);
      }
    }

    // Create notification using typed helper
    const { data, error } = await typedFrom(supabase, 'notifications')
      .insert({
        user_id: body.user_id,
        type: body.type as NotificationType,
        title: body.title,
        message: body.message,
        data: body.data || {},
        priority: (body.priority || 'medium') as NotificationPriority,
        read: false,
        expires_at: body.expires_at || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('[Notifications] Create error', error);
      return apiError('Failed to create notification', 500);
    }

    return apiSuccess(data);
  } catch (error) {
    logger.error('[Notifications] Create error', error);
    return apiError('Internal server error', 500);
  }
}
