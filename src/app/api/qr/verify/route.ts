/**
 * QR Code Verification API
 *
 * POST /api/qr/verify - QR 코드 유효성 검증
 *
 * 사용자가 입력한 QR 코드가 해당 팝업의 현재 유효한 코드인지 검증합니다.
 * 체크인을 수행하지 않고 검증만 수행합니다.
 */

import { withMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { z } from 'zod';
import { verifyQrCode, MAX_SCORES } from '@/lib/verification';
import { isAdminConfigured, createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// =============================================================================
// Types
// =============================================================================

interface PopupForVerify {
  id: string;
  brand_name: string;
  status: string;
}

// =============================================================================
// Schemas
// =============================================================================

const QrVerifySchema = z.object({
  popupId: z.string().uuid('Invalid popup ID'),
  code: z.string().length(6, 'QR code must be 6 digits'),
});

type QrVerifyInput = z.infer<typeof QrVerifySchema>;

// =============================================================================
// POST: Verify QR Code
// =============================================================================

export const POST = withMiddleware<QrVerifyInput>(
  async (_request, context, data) => {
    if (!context.userId) {
      return apiError('Authentication required', 401);
    }

    const { popupId, code } = data!;

    // Check if admin client is configured
    if (!isAdminConfigured()) {
      return apiError('Database not configured', 503);
    }

    try {
      const supabase = createAdminClient();

      // 1. Verify popup exists and is active
      const { data: popup, error: popupError } = (await supabase
        .from('popups')
        .select('id, brand_name, status')
        .eq('id', popupId)
        .single()) as { data: PopupForVerify | null; error: { message: string } | null };

      if (popupError || !popup) {
        return apiError('Popup not found', 404);
      }

      // 2. Check popup status
      if (!['confirmed', 'completed'].includes(popup.status)) {
        return apiError('This popup is not yet open for verification', 400);
      }

      // 3. Verify QR code
      const result = verifyQrCode(code, popupId);

      if (result.matched) {
        return apiSuccess({
          valid: true,
          score: result.score,
          maxScore: MAX_SCORES.qr,
          remainingSeconds: result.remainingSeconds,
          message: 'QR 코드가 유효합니다',
        });
      } else {
        return apiSuccess({
          valid: false,
          score: 0,
          maxScore: MAX_SCORES.qr,
          remainingSeconds: result.remainingSeconds,
          message: result.expired
            ? 'QR 코드가 만료되었습니다. 새 코드를 스캔해주세요.'
            : '유효하지 않은 QR 코드입니다',
        });
      }
    } catch (error) {
      logger.error('QR verification error:', error);
      return apiError('QR verification failed', 500);
    }
  },
  {
    requireAuth: true,
    allowGuest: false,
    csrf: true,
    rateLimit: 'normal',
    bodySchema: QrVerifySchema,
  }
);
