import {
  createAdminClient,
  isAdminConfigured,
  createServerSupabaseClient,
  isSupabaseConfigured,
} from '@/lib/supabase/server';
import { withMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { z } from 'zod';
import { verifyGpsLocation, type Coordinates } from '@/lib/geo';
import {
  verifyQrCode,
  generateTotpCode,
  performVerification,
  getVerificationSummary,
  PASS_THRESHOLD,
} from '@/lib/verification';
import { logger } from '@/lib/logger';
import { timingSafeCompare } from '@/lib/security';
import { eventBus } from '@/lib/events/event-bus';
import '@/lib/events/handlers/checkin-handlers'; // Register handlers
import { PopupCheckInSchema, type PopupCheckInSchema as PopupCheckInInput } from '@/lib/schemas';

// ============================================================================
// RESPONSE TYPES
// ============================================================================

interface PopupForCheckin {
  id: string;
  brand_name: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  title?: string;
}

interface ExistingCheckin {
  id: string;
  total_score: number;
  passed: boolean;
}

interface CheckinRecord {
  id: string;
  popup_id: string;
  user_id: string;
  gps_score: number;
  qr_score: number;
  receipt_score: number;
  total_score: number;
  gps_distance: number | null;
  gps_accuracy: number | null;
  qr_verified: boolean;
  receipt_verified: boolean;
  user_latitude: number | null;
  user_longitude: number | null;
  passed: boolean;
  verified_at: string;
}

/**
 * Check-in API - Triple Verification
 *
 * GPS (40점) + QR (40점) + Receipt (20점) = 100점
 * 통과 기준: 60점 이상
 */

// ============================================================================
// SCHEMAS
// ============================================================================

const QrCodeSchema = z.object({
  popupId: z.string().uuid('Invalid popup ID'),
});

type CheckinInput = z.infer<typeof PopupCheckInSchema>;
type QrCodeInput = z.infer<typeof QrCodeSchema>;

// ============================================================================
// KIOSK API KEY VERIFICATION
// ============================================================================

/**
 * SEC-006 FIX: Use crypto.timingSafeEqual for API key comparison
 *
 * Prevents timing attacks by using Node.js native constant-time comparison.
 */
function verifyKioskApiKey(request: Request): boolean {
  const kioskApiKey = process.env.KIOSK_API_KEY;

  // If no KIOSK_API_KEY is configured, kiosk mode is disabled
  if (!kioskApiKey) {
    return false;
  }

  const providedKey = request.headers.get('x-kiosk-api-key');

  // Use centralized timing-safe comparison from security.ts
  return timingSafeCompare(providedKey, kioskApiKey);
}

// ============================================================================
// SESSION VALIDATION FOR NON-KIOSK REQUESTS
// ============================================================================

/**
 * SEC-010 FIX: Validate user session for non-kiosk GET requests
 *
 * The GET endpoint was previously accessible without session validation
 * for non-kiosk requests, which could expose QR codes to unauthorized users.
 */
async function validateUserSession(): Promise<{ valid: boolean; userId?: string }> {
  if (!isSupabaseConfigured()) {
    return { valid: false };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { valid: false };
    }

    return { valid: true, userId: user.id };
  } catch {
    return { valid: false };
  }
}

// ============================================================================
// GET: Get current QR code for a popup (Requires Kiosk API key)
// ============================================================================

export const GET = withMiddleware<QrCodeInput>(
  async (request, context, query) => {
    const { popupId } = query!;

    // Check for Kiosk API key first
    const isKioskRequest = verifyKioskApiKey(request);

    // SEC-010 FIX: If not a kiosk request, require valid user session
    if (!isKioskRequest) {
      const session = await validateUserSession();
      if (!session.valid) {
        return apiError(
          'Authentication required. Provide valid x-kiosk-api-key header or sign in.',
          401
        );
      }
    }

    // Check if admin client is configured
    if (!isAdminConfigured()) {
      return apiError('Database not configured', 503);
    }

    try {
      const supabase = createAdminClient();

      // Get popup location for verification
      const { data: popup, error: popupError } = (await supabase
        .from('popups')
        .select('id, brand_name, latitude, longitude, status')
        .eq('id', popupId)
        .single()) as { data: PopupForCheckin | null; error: { message: string } | null };

      if (popupError || !popup) {
        return apiError('Popup not found', 404);
      }

      // Generate TOTP code
      const code = generateTotpCode(popupId);

      // Calculate expiry
      const now = Date.now();
      const elapsed = (now / 1000) % 30;
      const refreshIn = Math.ceil(30 - elapsed);

      return apiSuccess({
        code,
        refreshIn,
        popupId,
        brandName: popup.brand_name,
      });
    } catch (error) {
      logger.error('QR code generation error', error);
      return apiError('Failed to generate QR code', 500);
    }
  },
  {
    requireAuth: false, // Kiosk uses API key, not user auth
    csrf: false,
    rateLimit: 'relaxed',
    querySchema: QrCodeSchema,
  }
);

// ============================================================================
// POST: Perform check-in verification
// ============================================================================

export const POST = withMiddleware<CheckinInput>(
  async (request, context, data) => {
    if (!context.userId) {
      return apiError('Authentication required', 401);
    }

    // Check if admin client is configured
    if (!isAdminConfigured()) {
      return apiError('Database not configured', 503);
    }

    const { popupId, latitude, longitude, qrCode, referralCode } = data!;

    try {
      const supabase = createAdminClient();

      // 1. Get popup details
      const { data: popup, error: popupError } = (await supabase
        .from('popups')
        .select('id, brand_name, latitude, longitude, status, title')
        .eq('id', popupId)
        .single()) as { data: PopupForCheckin | null; error: { message: string } | null };

      if (popupError || !popup) {
        return apiError('Popup not found', 404);
      }

      // 2. Check popup status (must be confirmed or completed for check-in)
      if (!['confirmed', 'completed'].includes(popup.status)) {
        return apiError('This popup is not yet open for check-in', 400);
      }

      /**
       * SEC-024: GPS Coordinates Privacy Notice
       *
       * GPS coordinates are stored in plaintext for verification purposes.
       *
       * Privacy considerations:
       * - Coordinates are only stored when user explicitly performs check-in
       * - Data is used solely for proximity verification to prevent fraud
       * - User consent is obtained through the check-in action
       * - Consider implementing coordinate precision reduction for privacy:
       *   - Round to 4 decimal places (~11m precision) instead of full precision
       *   - Example: 37.123456 -> 37.1235
       *
       * Privacy Policy Requirements:
       * - Disclose location data collection in Terms of Service
       * - Provide opt-out mechanism if required by jurisdiction
       * - Implement data retention policy (delete old coordinates)
       * - Ensure GDPR/CCPA compliance if applicable
       *
       * TODO: Consider implementing:
       * 1. Coordinate precision reduction: parseFloat(latitude.toFixed(4))
       * 2. Data retention policy: Auto-delete coordinates older than 90 days
       * 3. User consent tracking: Add accepted_location_terms flag
       */

      // 3. Check if already checked in
      const { data: existingCheckin } = (await supabase
        .from('popup_checkins')
        .select('id, total_score, passed')
        .eq('popup_id', popupId)
        .eq('user_id', context.userId)
        .single()) as { data: ExistingCheckin | null };

      if (existingCheckin?.passed) {
        return apiError('You have already successfully checked in to this popup', 409, {
          checkin: existingCheckin,
        });
      }

      // 4. Prepare verification data
      const popupLocation: Coordinates | null =
        popup.latitude && popup.longitude
          ? { latitude: popup.latitude, longitude: popup.longitude }
          : null;

      // SEC-024: GPS 좌표 정밀도 감소 (11m 정확도로 제한)
      // 프라이버시 보호를 위해 4자리 소수점으로 제한
      const roundCoordinate = (coord: number): number => Math.round(coord * 10000) / 10000;

      const userLocation: Coordinates | null =
        latitude && longitude ? { latitude, longitude } : null;

      // 저장용 좌표는 정밀도 감소 적용
      const roundedLatitude = latitude ? roundCoordinate(latitude) : null;
      const roundedLongitude = longitude ? roundCoordinate(longitude) : null;

      // 5. Perform GPS verification
      let gpsResult = null;
      if (userLocation && popupLocation) {
        gpsResult = verifyGpsLocation(userLocation, popupLocation, 100);
      }

      // 6. Perform QR verification
      let qrResult = null;
      if (qrCode) {
        qrResult = verifyQrCode(qrCode, popupId);
      }

      // 7. Calculate total score
      const gpsScore = gpsResult?.score ?? 0;
      const qrScore = qrResult?.score ?? 0;
      const receiptScore = 0; // MVP에서는 영수증 검증 생략
      const totalScore = gpsScore + qrScore + receiptScore;
      const passed = totalScore >= PASS_THRESHOLD;

      // 8. Save or update check-in record (Atomic Upsert)
      const checkinData = {
        popup_id: popupId,
        user_id: context.userId,
        gps_score: gpsScore,
        qr_score: qrScore,
        receipt_score: receiptScore,
        total_score: totalScore,
        gps_distance: gpsResult?.distance ?? null,
        gps_accuracy: gpsResult?.accuracy ?? null,
        qr_verified: qrResult?.matched ?? false,
        receipt_verified: false,
        // SEC-024: 정밀도 감소된 좌표 저장 (프라이버시 보호)
        user_latitude: roundedLatitude,
        user_longitude: roundedLongitude,
        passed,
        verified_at: new Date().toISOString(),
      };

      // Perform atomic UPSERT to prevent race conditions
      // Requires unique constraint on (popup_id, user_id)
      const { data: upsertedCheckin, error: upsertError } = (await (
        supabase.from('popup_checkins') as ReturnType<typeof supabase.from>
      )
        .upsert(checkinData as unknown, { 
          onConflict: 'popup_id,user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single()) as { data: CheckinRecord | null; error: { message: string } | null };

      if (upsertError) {
        logger.error('[Checkin] Upsert error', upsertError);
        return apiError('Failed to save check-in', 500);
      }
      
      const checkin = upsertedCheckin || ({ ...checkinData, id: existingCheckin?.id || 'new' } as CheckinRecord);

      // 8.5. Async Event Processing (Tier 1 Architecture)
      // Offload side effects (Referral updates, Earnings) to Event Bus
      if (passed) {
        // We await here to ensure execution in serverless environment, 
        // but the logic is decoupled and can be moved to background worker easily.
        await eventBus.publish('checkin.verified', {
          userId: context.userId,
          popupId,
          referralCode,
          timestamp: new Date().toISOString()
        });
      }

      // 9. Build verification result for response
      const verificationResult = await performVerification({
        popupId,
        userId: context.userId,
        popupLocation: popupLocation || { latitude: 0, longitude: 0 },
        brandName: popup.brand_name,
        gpsData: userLocation && popupLocation ? { userLocation } : undefined,
        qrData: qrCode
          ? {
              inputCode: qrCode,
              validCode: generateTotpCode(popupId),
              generatedAt: new Date(),
            }
          : undefined,
      });

      const summary = getVerificationSummary(verificationResult);

      return apiSuccess({
        checkin: {
          id: checkin.id,
          popupId,
          totalScore,
          passed,
          verifiedAt: checkin.verified_at,
        },
        verification: {
          gps: gpsResult
            ? {
                score: gpsResult.score,
                maxScore: 40,
                distance: gpsResult.distance,
                accuracy: gpsResult.accuracy,
                verified: gpsResult.score > 0,
              }
            : null,
          qr: qrResult
            ? {
                score: qrResult.score,
                maxScore: 40,
                verified: qrResult.matched,
              }
            : null,
          receipt: null, // MVP에서는 생략
          total: {
            score: totalScore,
            maxScore: 100,
            passed,
            threshold: PASS_THRESHOLD,
          },
        },
        summary,
        popup: {
          id: popup.id,
          brandName: popup.brand_name,
          title: popup.title,
        },
      });
    } catch (error) {
      logger.error('Check-in error', error);
      return apiError('Check-in failed', 500);
    }
  },
  {
    requireAuth: true,
    allowGuest: false, // Real verification requires real user
    csrf: true,
    rateLimit: 'strict',
    bodySchema: PopupCheckInSchema,
  }
);
