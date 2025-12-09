/**
 * Mark Notification as Read API
 *
 * POST /api/notifications/[id]/read - Mark a notification as read
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

export async function POST(request: NextRequest, context: RouteContext) {
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

    // Update notification
    // Use type assertion to work around Supabase client type inference issues
    const notificationsTable = supabase.from('notifications') as unknown as {
      update: (data: { read: boolean; read_at: string }) => {
        eq: (
          column: string,
          value: string
        ) => {
          eq: (
            column: string,
            value: string
          ) => {
            select: () => {
              single: () => Promise<{
                data: Record<string, unknown> | null;
                error: { message: string } | null;
              }>;
            };
          };
        };
      };
    };

    const { data, error } = await notificationsTable
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the notification
      .select()
      .single();

    if (error) {
      logger.error('[Notifications] Mark as read error', error);
      return apiError('Failed to mark as read', 500);
    }

    return apiSuccess(data);
  } catch (error) {
    logger.error('[Notifications] Mark as read error', error);
    return apiError('Internal server error', 500);
  }
}
