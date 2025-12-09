/**
 * Notification Management API
 *
 * GET /api/notifications/[id] - Get a specific notification
 * DELETE /api/notifications/[id] - Delete a notification
 */

import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api-middleware';
import { logger } from '@/lib/logger';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return apiError('Unauthorized', 401);
    }

    // Fetch notification
    const { data, error } = await supabase
      .from('notifications')
      .select(
        'id, user_id, type, title, message, data, priority, read, read_at, expires_at, created_at'
      )
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      logger.error('[Notifications] Fetch error:', error);
      return apiError('Notification not found', 404);
    }

    return apiSuccess(data);
  } catch (error) {
    logger.error('[Notifications] Fetch error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return apiError('Unauthorized', 401);
    }

    // Delete notification
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      logger.error('[Notifications] Delete error:', error);
      return apiError('Failed to delete notification', 500);
    }

    return apiSuccess({ deleted: true });
  } catch (error) {
    logger.error('[Notifications] Delete error:', error);
    return apiError('Internal server error', 500);
  }
}
