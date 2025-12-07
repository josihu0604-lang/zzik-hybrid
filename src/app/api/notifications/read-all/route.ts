/**
 * Mark All Notifications as Read API
 *
 * POST /api/notifications/read-all - Mark all notifications as read for a user
 *
 * SEC-022: Added Zod validation for request body
 */

import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api-middleware';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// SEC-022: Validation schema for mark-all-read request
const MarkAllReadSchema = z.object({
  userId: z.string().uuid('Invalid user ID format').optional(),
});

export async function POST(request: NextRequest) {
  try {
    // SEC-022: Validate request body with Zod
    let validatedBody;
    try {
      const rawBody = await request.json();
      validatedBody = MarkAllReadSchema.parse(rawBody);
    } catch (parseError) {
      if (parseError instanceof z.ZodError) {
        return apiError('Validation failed', 400, {
          details: parseError.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        });
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

    // Use provided userId or authenticated user's id
    const targetUserId = validatedBody.userId || user.id;

    // Ensure user can only mark their own notifications
    if (targetUserId !== user.id) {
      return apiError('Forbidden', 403);
    }

    // Update all unread notifications
    type NotificationUpdate = {
      read: boolean;
      read_at: string;
    };
    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      } as NotificationUpdate)
      .eq('user_id', targetUserId)
      .eq('read', false);

    if (error) {
      logger.error('[Notifications] Mark all as read error', error);
      return apiError('Failed to mark all as read', 500);
    }

    return apiSuccess({ updated: true });
  } catch (error) {
    logger.error('[Notifications] Mark all as read error', error);
    return apiError('Internal server error', 500);
  }
}
