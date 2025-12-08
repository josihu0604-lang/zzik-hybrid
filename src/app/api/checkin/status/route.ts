/**
 * Check-in Status API
 *
 * GET /api/checkin/status?popupId=xxx - 체크인 상태 조회
 *
 * 특정 팝업에 대한 사용자의 체크인 상태를 조회합니다.
 */

import { withMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { z } from 'zod';
import { isAdminConfigured, createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// =============================================================================
// Types
// =============================================================================

interface CheckinRecord {
  id: string;
  popup_id: string;
  user_id: string;
  gps_score: number;
  qr_score: number;
  receipt_score: number;
  total_score: number;
  passed: boolean;
  verified_at: string;
}

// =============================================================================
// Schemas
// =============================================================================

const StatusQuerySchema = z.object({
  popupId: z.string().uuid('Invalid popup ID'),
});

type StatusQuery = z.infer<typeof StatusQuerySchema>;

// =============================================================================
// GET: Get Check-in Status
// =============================================================================

export const GET = withMiddleware<StatusQuery>(
  async (_request, context, query) => {
    if (!context.userId) {
      return apiError('Authentication required', 401);
    }

    // Guest users don't have check-in history
    if (context.userId.startsWith('guest_')) {
      return apiSuccess({
        hasCheckedIn: false,
        checkin: null,
      });
    }

    const { popupId } = query!;

    // Check if admin client is configured
    if (!isAdminConfigured()) {
      return apiError('Database not configured', 503);
    }

    try {
      const supabase = createAdminClient();

      // Get user's check-in for this popup
      const { data: checkin, error } = (await supabase
        .from('popup_checkins')
        .select(
          'id, popup_id, user_id, gps_score, qr_score, receipt_score, total_score, passed, verified_at'
        )
        .eq('popup_id', popupId)
        .eq('user_id', context.userId)
        .single()) as {
        data: CheckinRecord | null;
        error: { code?: string; message: string } | null;
      };

      // PGRST116 = no rows found (not an error in this context)
      if (error && error.code !== 'PGRST116') {
        logger.error('Check-in status error:', error);
        return apiError('Failed to fetch check-in status', 500);
      }

      if (!checkin) {
        return apiSuccess({
          hasCheckedIn: false,
          checkin: null,
        });
      }

      return apiSuccess({
        hasCheckedIn: true,
        checkin: {
          id: checkin.id,
          popupId: checkin.popup_id,
          gpsScore: checkin.gps_score,
          qrScore: checkin.qr_score,
          receiptScore: checkin.receipt_score,
          totalScore: checkin.total_score,
          passed: checkin.passed,
          verifiedAt: checkin.verified_at,
        },
      });
    } catch (error) {
      logger.error('Check-in status error:', error);
      return apiError('Failed to fetch check-in status', 500);
    }
  },
  {
    requireAuth: true,
    allowGuest: true, // Guests can check but will always get false
    csrf: false, // GET requests don't need CSRF
    rateLimit: 'relaxed',
    querySchema: StatusQuerySchema,
  }
);
