/**
 * POST /api/push/unsubscribe
 *
 * Unsubscribe from push notifications
 * Removes the push subscription from the database
 *
 * SEC-025: Added Zod validation + proper authentication + rate limiting
 */

import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { withMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// SEC-025: Zod schema for unsubscribe request
const UnsubscribeSchema = z.object({
  // Optional: specific endpoint to unsubscribe
  // If not provided, unsubscribe all endpoints for the user
  endpoint: z.string().url().max(2048).optional(),
});

export const POST = withMiddleware<z.infer<typeof UnsubscribeSchema>>(
  async (request, context, body) => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return apiSuccess({
        message: 'Push notifications not available (Supabase not configured)',
      });
    }

    // SEC-025: Authentication is required (handled by withMiddleware)
    const userId = context.userId;
    if (!userId || userId.startsWith('guest_')) {
      return apiError('Authentication required', 401);
    }

    // Use server client (not admin) to respect RLS
    const supabase = await createServerSupabaseClient();

    // body is validated via bodySchema (optional endpoint)

    // Build delete query
    let deleteQuery = supabase.from('push_subscriptions').delete().eq('user_id', userId);

    // If specific endpoint provided, only delete that one
    if (body?.endpoint) {
      deleteQuery = deleteQuery.eq('endpoint', body.endpoint);
    }

    const { error: deleteError } = await deleteQuery;

    if (deleteError) {
      logger.error('[Push Unsubscribe] Database error:', deleteError);
      return apiError('Failed to unsubscribe', 500);
    }

    return apiSuccess({
      message: body?.endpoint
        ? 'Successfully unsubscribed endpoint from push notifications'
        : 'Successfully unsubscribed all endpoints from push notifications',
    });
  },
  {
    // SEC-025: Require authentication
    requireAuth: true,
    allowGuest: false,
    // SEC-025: Rate limiting to prevent abuse
    rateLimit: 'normal',
    // SEC-025: Optional body validation
    bodySchema: UnsubscribeSchema.optional(),
  }
);
