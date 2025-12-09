import { z } from 'zod';
import { withMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * Account API - 계정 삭제
 *
 * DELETE: 계정 삭제 요청 (30일 유예기간)
 *
 * iOS App Store Requirement:
 * - Apps must provide account deletion functionality
 * - Must delete all user data upon request
 *
 * Security:
 * - Authentication required
 * - Users can only delete their own account
 * - 30-day grace period before permanent deletion
 */

// ============================================================================
// SCHEMAS
// ============================================================================

const DeleteAccountSchema = z.object({
  reason: z
    .enum(['not-using', 'privacy', 'found-alternative', 'too-many-notifications', 'other'])
    .optional(),
  otherReason: z.string().max(500).optional(),
  confirmText: z.string(),
});

// ============================================================================
// DELETE - Account Deletion Request
// ============================================================================

export const DELETE = withMiddleware(
  async (request) => {
    try {
      const body = await request.json();
      const validatedData = DeleteAccountSchema.parse(body);

      // Verify confirmation text
      if (validatedData.confirmText !== '삭제합니다') {
        return apiError('Invalid confirmation text', 400);
      }

      // Check Supabase configuration
      if (!isSupabaseConfigured()) {
        logger.warn('[Account] Supabase not configured, returning mock response');
        return apiSuccess({
          message: 'Account deletion scheduled',
          deletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          gracePeriodDays: 30,
        });
      }

      const supabase = await createAdminClient();

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return apiError('Authentication required', 401);
      }

      const userId = user.id;

      // Log deletion reason (for analytics)
      if (validatedData.reason) {
        logger.info('[Account] Deletion requested', {
          userId,
          reason: validatedData.reason,
          hasOtherReason: !!validatedData.otherReason,
        });
      }

      // Schedule deletion (set deletion_scheduled_at in user profile)
      const deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          deletion_scheduled_at: deletionDate.toISOString(),
          deletion_reason: validatedData.reason || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        logger.error('[Account] Failed to schedule deletion', { userId, error: updateError });
        return apiError('Failed to schedule account deletion', 500);
      }

      // Sign out user
      await supabase.auth.signOut();

      logger.info('[Account] Deletion scheduled successfully', {
        userId,
        deletionDate: deletionDate.toISOString(),
      });

      return apiSuccess({
        message: 'Account deletion scheduled',
        deletionDate: deletionDate.toISOString(),
        gracePeriodDays: 30,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError('Invalid request data', 400);
      }
      logger.error('[Account] Delete error', { error });
      return apiError('Internal server error', 500);
    }
  },
  { requireAuth: true }
);

// ============================================================================
// GET - Check deletion status
// ============================================================================

export const GET = withMiddleware(
  async () => {
    try {
      if (!isSupabaseConfigured()) {
        return apiSuccess({
          isScheduledForDeletion: false,
          deletionDate: null,
        });
      }

      const supabase = await createAdminClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return apiError('Authentication required', 401);
      }

      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('deletion_scheduled_at')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        return apiError('Failed to fetch account status', 500);
      }

      return apiSuccess({
        isScheduledForDeletion: !!userData?.deletion_scheduled_at,
        deletionDate: userData?.deletion_scheduled_at || null,
      });
    } catch (error) {
      logger.error('[Account] Get status error', { error });
      return apiError('Internal server error', 500);
    }
  },
  { requireAuth: true }
);

// ============================================================================
// POST - Cancel deletion (reactivate account)
// ============================================================================

export const POST = withMiddleware(
  async () => {
    try {
      if (!isSupabaseConfigured()) {
        return apiSuccess({
          message: 'Account reactivated',
        });
      }

      const supabase = await createAdminClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return apiError('Authentication required', 401);
      }

      // Cancel deletion
      const { error: updateError } = await supabase
        .from('users')
        .update({
          deletion_scheduled_at: null,
          deletion_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        return apiError('Failed to cancel deletion', 500);
      }

      logger.info('[Account] Deletion cancelled', { userId: user.id });

      return apiSuccess({
        message: 'Account reactivated',
      });
    } catch (error) {
      logger.error('[Account] Cancel deletion error', { error });
      return apiError('Internal server error', 500);
    }
  },
  { requireAuth: true }
);
