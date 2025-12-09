import { z } from 'zod';
import { withMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { UserProfile, ParticipationWithPopup, CheckinWithPopup } from '@/types/database';

// ============================================================================
// RESPONSE TYPES
// ============================================================================

interface CheckinMapEntry {
  popup_id: string;
  passed: boolean;
}

/**
 * My Page API - 사용자 프로필 및 활동 데이터
 *
 * GET: 사용자 정보, 통계, 참여 내역, 체크인 내역 조회
 *
 * Security:
 * - Authentication required
 * - Users can only view their own data
 */

// ============================================================================
// SCHEMAS
// ============================================================================

const MeQuerySchema = z.object({
  includeParticipations: z.enum(['true', 'false']).optional(),
  includeCheckins: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

type MeQuery = z.infer<typeof MeQuerySchema>;

// ============================================================================
// MOCK DATA (Fallback)
// ============================================================================

function getMockUserData(userId: string) {
  return {
    user: {
      id: userId,
      name: '김찍찍',
      email: 'demo@zzik.kr',
      profileImage: null,
      createdAt: new Date().toISOString(),
    },
    stats: {
      participated: 12,
      visited: 8,
      badges: 5,
    },
    participations: [
      {
        id: '1',
        popupId: '550e8400-e29b-41d4-a716-446655440001',
        brandName: 'GENTLE MONSTER',
        title: '성수동 아이웨어 팝업',
        status: 'funding',
        currentParticipants: 72,
        goalParticipants: 100,
        participatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        hasCheckedIn: false,
        checkinPassed: false,
      },
      {
        id: '2',
        popupId: '550e8400-e29b-41d4-a716-446655440002',
        brandName: 'ADER ERROR',
        title: '한남동 쇼룸',
        status: 'confirmed',
        currentParticipants: 100,
        goalParticipants: 100,
        participatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        hasCheckedIn: true,
        checkinPassed: true,
      },
      {
        id: '3',
        popupId: '550e8400-e29b-41d4-a716-446655440003',
        brandName: 'MSCHF',
        title: '빅 레드 부츠 전시',
        status: 'completed',
        currentParticipants: 150,
        goalParticipants: 100,
        participatedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        hasCheckedIn: true,
        checkinPassed: true,
      },
    ],
    recentCheckins: [
      {
        id: 'c1',
        popupId: '550e8400-e29b-41d4-a716-446655440002',
        brandName: 'ADER ERROR',
        title: '한남동 쇼룸',
        totalScore: 80,
        gpsScore: 40,
        qrScore: 40,
        passed: true,
        verifiedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'c2',
        popupId: '550e8400-e29b-41d4-a716-446655440003',
        brandName: 'MSCHF',
        title: '빅 레드 부츠 전시',
        totalScore: 65,
        gpsScore: 25,
        qrScore: 40,
        passed: true,
        verifiedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
    ],
  };
}

// ============================================================================
// GET: Get user profile and activity
// ============================================================================

export const GET = withMiddleware<MeQuery>(
  async (request, context, query) => {
    const userId = context.userId;

    if (!userId) {
      return apiError('로그인이 필요합니다', 401);
    }

    const includeParticipations = query?.includeParticipations !== 'false';
    const includeCheckins = query?.includeCheckins !== 'false';
    const limit = query?.limit || 20;

    // Try to get from database
    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();

        // 1. Get user profile
        const { data: user, error: userError } = (await supabase
          .from('users')
          .select('id, name, email, profile_image, created_at')
          .eq('id', userId)
          .single()) as { data: UserProfile | null; error: { message: string } | null };

        if (userError) {
          logger.error('[Me] User fetch error', userError);
          // Continue with partial data
        }

        // 2. Get participation stats
        const { count: participatedCount } = (await supabase
          .from('popup_participations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)) as { count: number | null };

        // 3. Get checkin stats
        const { count: visitedCount } = (await supabase
          .from('popup_checkins')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('passed', true)) as { count: number | null };

        // 4. Get participations with popup details
        let participations: Array<{
          id: string;
          popupId: string;
          brandName: string;
          title: string;
          status: string;
          currentParticipants: number;
          goalParticipants: number;
          participatedAt: string;
          hasCheckedIn: boolean;
          checkinPassed: boolean;
        }> = [];

        if (includeParticipations) {
          const { data: participationData } = (await supabase
            .from('popup_participations')
            .select(
              `
              id,
              popup_id,
              created_at,
              popups!inner(
                id,
                brand_name,
                title,
                status,
                current_participants,
                goal_participants
              )
            `
            )
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit)) as { data: ParticipationWithPopup[] | null };

          if (participationData) {
            // Get checkin status for each participation
            const popupIds = participationData.map((p) => p.popup_id);

            const { data: checkins } = (await supabase
              .from('popup_checkins')
              .select('popup_id, passed')
              .eq('user_id', userId)
              .in('popup_id', popupIds)) as { data: CheckinMapEntry[] | null };

            const checkinMap = new Map((checkins || []).map((c) => [c.popup_id, c.passed]));

            participations = participationData.map((p) => ({
              id: p.id,
              popupId: p.popup_id,
              brandName: p.popups.brand_name,
              title: p.popups.title,
              status: p.popups.status,
              currentParticipants: p.popups.current_participants,
              goalParticipants: p.popups.goal_participants,
              participatedAt: p.created_at,
              hasCheckedIn: checkinMap.has(p.popup_id),
              checkinPassed: checkinMap.get(p.popup_id) === true,
            }));
          }
        }

        // 5. Get recent checkins
        let recentCheckins: Array<{
          id: string;
          popupId: string;
          brandName: string;
          title: string;
          totalScore: number;
          gpsScore: number;
          qrScore: number;
          passed: boolean;
          verifiedAt: string;
        }> = [];

        if (includeCheckins) {
          const { data: checkinData } = (await supabase
            .from('popup_checkins')
            .select(
              `
              id,
              popup_id,
              total_score,
              gps_score,
              qr_score,
              passed,
              verified_at,
              popups!inner(
                brand_name,
                title
              )
            `
            )
            .eq('user_id', userId)
            .eq('passed', true)
            .order('verified_at', { ascending: false })
            .limit(limit)) as { data: CheckinWithPopup[] | null };

          if (checkinData) {
            recentCheckins = checkinData.map((c) => ({
              id: c.id,
              popupId: c.popup_id,
              brandName: c.popups.brand_name,
              title: c.popups.title,
              totalScore: c.total_score,
              gpsScore: c.gps_score,
              qrScore: c.qr_score,
              passed: c.passed,
              verifiedAt: c.verified_at,
            }));
          }
        }

        return apiSuccess({
          user: user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                profileImage: user.profile_image,
                createdAt: user.created_at,
              }
            : {
                id: userId,
                name: '사용자',
                email: null,
                profileImage: null,
                createdAt: new Date().toISOString(),
              },
          stats: {
            participated: participatedCount || 0,
            visited: visitedCount || 0,
            badges: visitedCount || 0, // badges = successful checkins
          },
          participations: includeParticipations ? participations : undefined,
          recentCheckins: includeCheckins ? recentCheckins : undefined,
          source: 'database',
        });
      } catch (error) {
        logger.error('[Me] Database error', error);
        // Fall through to mock data
      }
    }

    // Fallback to mock data
    const mockData = getMockUserData(userId);
    const response = apiSuccess({
      ...mockData,
      participations: includeParticipations ? mockData.participations : undefined,
      recentCheckins: includeCheckins ? mockData.recentCheckins : undefined,
      source: 'mock',
    });

    // Add Cache-Control for user profile (private, 5 min)
    response.headers.set('Cache-Control', 'private, max-age=300, s-maxage=600');
    return response;
  },
  {
    requireAuth: true,
    rateLimit: 'normal',
    querySchema: MeQuerySchema,
  }
);
