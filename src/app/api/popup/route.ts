import {
  createServerSupabaseClient,
  createAdminClient,
  isSupabaseConfigured,
  isAdminConfigured,
} from '@/lib/supabase/server';
import {
  withMiddleware,
  apiSuccess,
  apiError,
  PopupParticipationSchema,
  PopupQuerySchema,
  type PopupQuery,
} from '@/lib/api-middleware';
import { logger } from '@/lib/logger';
import type { Popup } from '@/types/database';
import { z } from 'zod';

// ============================================================================
// RESPONSE TYPES
// ============================================================================

interface PopupQueryResponse {
  id: string;
  brand_name: string;
  title: string;
  description: string | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  category: string;
  image_url: string | null;
  goal_participants: number;
  current_participants: number;
  status: 'funding' | 'confirmed' | 'completed' | 'cancelled';
  starts_at: string | null;
  ends_at: string | null;
  deadline_at: string;
  leader_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ExistingParticipation {
  id: string;
}

/**
 * Popup API - 팝업 펀딩 목록 및 참여
 *
 * Security features:
 * - Rate limiting (relaxed for GET, strict for POST)
 * - CSRF protection on POST
 * - Authentication optional for GET, required for POST
 * - Input validation with Zod
 * - CAPTCHA verification for guest participation
 */

// Extended schema with CAPTCHA token
const PopupParticipationWithCaptchaSchema = PopupParticipationSchema.extend({
  captchaToken: z.string().optional(),
});

type ParticipationWithCaptchaInput = z.infer<typeof PopupParticipationWithCaptchaSchema>;

// ============================================================================
// CAPTCHA VERIFICATION
// ============================================================================

/**
 * Verify CAPTCHA token (supports reCAPTCHA v3 or hCaptcha)
 * Returns true if valid or CAPTCHA is disabled
 */
async function verifyCaptchaToken(
  token: string | undefined
): Promise<{ valid: boolean; error?: string }> {
  const captchaSecret = process.env.CAPTCHA_SECRET_KEY;
  const captchaProvider = process.env.CAPTCHA_PROVIDER || 'recaptcha'; // 'recaptcha' or 'hcaptcha'
  const isProduction = process.env.NODE_ENV === 'production';

  // SEC-005 FIX: In production, fail if CAPTCHA is not properly configured
  if (!captchaSecret) {
    if (isProduction) {
      logger.error(
        '[Security] CRITICAL: CAPTCHA_SECRET_KEY not configured in production - blocking request'
      );
      return {
        valid: false,
        error: 'CAPTCHA verification unavailable. Please contact support.',
      };
    }
    // Development: allow without CAPTCHA but warn
    logger.warn('[Security] CAPTCHA_SECRET_KEY not configured - CAPTCHA verification skipped');
    return { valid: true };
  }

  if (!token) {
    return { valid: false, error: 'CAPTCHA token required' };
  }

  try {
    const verifyUrl =
      captchaProvider === 'hcaptcha'
        ? 'https://hcaptcha.com/siteverify'
        : 'https://www.google.com/recaptcha/api/siteverify';

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: captchaSecret,
        response: token,
      }),
    });

    const result = await response.json();

    if (captchaProvider === 'hcaptcha') {
      return { valid: result.success === true };
    } else {
      // reCAPTCHA v3 - check score threshold
      const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');
      return {
        valid: result.success === true && (result.score ?? 1) >= minScore,
        error: result.success ? undefined : 'CAPTCHA verification failed',
      };
    }
  } catch (error) {
    logger.error('[CAPTCHA] Verification error', error);
    return { valid: false, error: 'CAPTCHA verification service unavailable' };
  }
}

/**
 * Check if guest participation is allowed
 */
function isGuestParticipationAllowed(): boolean {
  // In production, guest participation can be disabled via env
  if (process.env.NODE_ENV === 'production') {
    return process.env.ALLOW_GUEST_PARTICIPATION === 'true';
  }
  // In development, allow by default for testing
  return true;
}

// ============================================================================
// MOCK DATA (Fallback when database unavailable)
// ============================================================================

const MOCK_POPUPS: Partial<Popup>[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    brand_name: 'GENTLE MONSTER',
    title: '성수동 한정판 선글라스 팝업',
    location: '성수동',
    current_participants: 72,
    goal_participants: 100,
    deadline_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'fashion',
    status: 'funding',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    brand_name: 'ADER ERROR',
    title: '2025 S/S 컬렉션 프리뷰',
    location: '한남동',
    current_participants: 156,
    goal_participants: 200,
    deadline_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'fashion',
    status: 'funding',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    brand_name: 'TAMBURINS',
    title: '신규 향수 라인 체험존',
    location: '압구정',
    current_participants: 89,
    goal_participants: 100,
    deadline_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'beauty',
    status: 'funding',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    brand_name: 'HYBE',
    title: 'BTS 10주년 특별 전시',
    location: '용산',
    current_participants: 500,
    goal_participants: 500,
    deadline_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'kpop',
    status: 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ============================================================================
// GET: List popups with filtering
// ============================================================================

export const GET = withMiddleware<PopupQuery>(
  async (request, context, query) => {
    const { category, status, limit = 20, offset = 0 } = query || {};

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      // Return mock data only in development
      if (process.env.NODE_ENV === 'development') {
        return apiSuccess({
          popups: filterMockData(category, status, limit, offset),
          total: MOCK_POPUPS.length,
          source: 'mock',
        });
      }
      return apiError('Database not configured', 503);
    }

    try {
      const supabase = await createServerSupabaseClient();

      // Build query
      let dbQuery = supabase
        .from('popups')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (category && category !== 'all') {
        dbQuery = dbQuery.eq('category', category);
      }

      if (status) {
        dbQuery = dbQuery.eq('status', status);
      }

      const { data, error, count } = await dbQuery;

      if (error) {
        logger.error('[Popup] Database error', error);
        // Fall back to mock data only in development
        if (process.env.NODE_ENV === 'development') {
          return apiSuccess({
            popups: filterMockData(category, status, limit, offset),
            total: MOCK_POPUPS.length,
            source: 'mock',
          });
        }
        return apiError('Database query failed', 500);
      }

      // Transform data for frontend
      const popups = (data || []).map(transformPopupForFrontend);

      const response = apiSuccess({
        popups,
        total: count || 0,
        source: 'database',
      });

      // Add Cache-Control headers for GET requests
      response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');

      return response;
    } catch (error) {
      logger.error('[Popup] Error fetching popups', error);
      // Fall back to mock data only in development
      if (process.env.NODE_ENV === 'development') {
        return apiSuccess({
          popups: filterMockData(category, status, limit, offset),
          total: MOCK_POPUPS.length,
          source: 'mock',
        });
      }
      return apiError('Failed to fetch popups', 500);
    }
  },
  {
    requireAuth: false,
    csrf: false,
    rateLimit: 'relaxed',
    querySchema: PopupQuerySchema,
  }
);

// ============================================================================
// POST: Participate in a popup
// ============================================================================

export const POST = withMiddleware<ParticipationWithCaptchaInput>(
  async (request, context, data) => {
    const { popupId, referralCode, captchaToken } = data!;

    // Check if user is authenticated or guest
    const isGuest = !context.userId || context.userId.startsWith('guest-');

    // Guest participation validation
    if (isGuest) {
      // Check if guest participation is allowed
      if (!isGuestParticipationAllowed()) {
        return apiError('Guest participation is disabled. Please sign in.', 401);
      }

      // Require CAPTCHA for guest participation
      const captchaResult = await verifyCaptchaToken(captchaToken);
      if (!captchaResult.valid) {
        return apiError(
          captchaResult.error || 'CAPTCHA verification required for guest participation',
          403
        );
      }
    }

    // For authenticated users without userId (shouldn't happen, but safeguard)
    if (!context.userId) {
      return apiError('Authentication required', 401);
    }

    // Check if admin client is configured
    if (!isAdminConfigured()) {
      // Return mock response only in development
      if (process.env.NODE_ENV === 'development') {
        const mockPopup = MOCK_POPUPS.find((p) => p.id === popupId);
        if (!mockPopup) {
          return apiError('Popup not found', 404);
        }
        return apiSuccess({
          message: '참여가 완료되었습니다',
          popup: {
            ...transformPopupForFrontend(mockPopup as Popup),
            currentParticipants: (mockPopup.current_participants || 0) + 1,
          },
          isDemo: true,
        });
      }
      return apiError('Database not configured', 503);
    }

    try {
      const supabase = createAdminClient();

      const { data: popup, error } = (await supabase
        .from('popups')
        .select(
          'id, brand_name, title, description, location, category, image_url, current_participants, goal_participants, status, deadline_at, starts_at, ends_at, leader_id, created_at, updated_at'
        )
        .eq('id', popupId)
        .single()) as { data: PopupQueryResponse | null; error: { message: string } | null };

      if (error || !popup) {
        return apiError('Popup not found', 404);
      }

      // Check if already participating
      const { data: existing } = (await supabase
        .from('popup_participations')
        .select('id')
        .eq('popup_id', popupId)
        .eq('user_id', context.userId)
        .single()) as { data: ExistingParticipation | null };

      if (existing) {
        return apiError('Already participating in this popup', 409);
      }

      // Validate popup status
      if (popup.status !== 'funding') {
        return apiError('This popup is no longer accepting participants', 400);
      }

      if (new Date(popup.deadline_at) < new Date()) {
        return apiError('Participation deadline has passed', 400);
      }

      // Create participation
      // Note: Type assertion needed as Supabase types may not be in sync with actual schema
      await (supabase.from('popup_participations') as ReturnType<typeof supabase.from>).insert({
        popup_id: popupId,
        user_id: context.userId,
        referral_code: referralCode || null,
        is_guest: isGuest,
      } as unknown);

      // Update participant count
      const newCount = popup.current_participants + 1;
      const goalReached = newCount >= popup.goal_participants;

      const { data: updated } = (await (supabase.from('popups') as ReturnType<typeof supabase.from>)
        .update({
          current_participants: newCount,
          status: goalReached ? 'confirmed' : 'funding',
        } as unknown)
        .eq('id', popupId)
        .select()
        .single()) as { data: PopupQueryResponse | null };

      return apiSuccess({
        message: goalReached
          ? '팝업 오픈 확정! 당신의 참여로 목표를 달성했습니다!'
          : '참여가 완료되었습니다',
        popup: transformPopupForFrontend(updated || popup),
        goalReached,
        isGuest,
      });
    } catch (error) {
      logger.error('[Popup] Participation database error', error);
      return apiError('Failed to participate', 500);
    }
  },
  {
    requireAuth: true,
    allowGuest: true, // Allow guest participation with CAPTCHA
    csrf: true,
    rateLimit: 'strict',
    bodySchema: PopupParticipationWithCaptchaSchema,
  }
);

// ============================================================================
// HELPERS
// ============================================================================

function transformPopupForFrontend(popup: Popup | Partial<Popup>) {
  const deadline = new Date(popup.deadline_at || Date.now());
  const now = new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  return {
    id: popup.id,
    brandName: popup.brand_name,
    title: popup.title,
    description: popup.description,
    location: popup.location,
    category: popup.category,
    imageUrl: popup.image_url,
    currentParticipants: popup.current_participants || 0,
    goalParticipants: popup.goal_participants || 100,
    status: popup.status || 'funding',
    daysLeft,
    deadlineAt: popup.deadline_at,
    startsAt: popup.starts_at,
    endsAt: popup.ends_at,
    leaderId: popup.leader_id,
    createdAt: popup.created_at,
  };
}

function filterMockData(
  category?: string,
  status?: string,
  limit: number = 20,
  offset: number = 0
) {
  let filtered = [...MOCK_POPUPS];

  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (status) {
    filtered = filtered.filter((p) => p.status === status);
  }

  return filtered.slice(offset, offset + limit).map((p) => transformPopupForFrontend(p as Popup));
}
