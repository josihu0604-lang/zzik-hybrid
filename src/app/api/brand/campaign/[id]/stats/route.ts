import { NextRequest } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api-middleware';
import type { CampaignStats, DailyStats } from '@/types/brand';
import { logger } from '@/lib/logger';

/**
 * Generate mock daily stats for demo mode
 */
function generateMockDailyStats(days: number, baseCount: number): DailyStats[] {
  const stats: DailyStats[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    stats.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(baseCount * (0.5 + Math.random() * 0.5)),
    });
  }

  return stats;
}

/**
 * Mock stats data for demo mode
 */
const mockStats: Record<string, CampaignStats> = {
  '1': {
    campaign_id: '1',
    total_participants: 156,
    goal_participants: 200,
    progress_percent: 78,
    total_checkins: 0,
    passed_checkins: 0,
    conversion_rate: 0,
    daily_participants: generateMockDailyStats(14, 15),
    daily_checkins: generateMockDailyStats(14, 0),
    verification_breakdown: {
      gps_verified: 0,
      qr_verified: 0,
      receipt_verified: 0,
      multi_verified: 0,
    },
  },
  '2': {
    campaign_id: '2',
    total_participants: 150,
    goal_participants: 150,
    progress_percent: 100,
    total_checkins: 89,
    passed_checkins: 72,
    conversion_rate: 59.3,
    daily_participants: generateMockDailyStats(21, 8),
    daily_checkins: generateMockDailyStats(7, 13),
    verification_breakdown: {
      gps_verified: 89,
      qr_verified: 78,
      receipt_verified: 45,
      multi_verified: 38,
    },
  },
  '3': {
    campaign_id: '3',
    total_participants: 45,
    goal_participants: 300,
    progress_percent: 15,
    total_checkins: 0,
    passed_checkins: 0,
    conversion_rate: 0,
    daily_participants: generateMockDailyStats(7, 7),
    daily_checkins: generateMockDailyStats(7, 0),
    verification_breakdown: {
      gps_verified: 0,
      qr_verified: 0,
      receipt_verified: 0,
      multi_verified: 0,
    },
  },
  '4': {
    campaign_id: '4',
    total_participants: 250,
    goal_participants: 250,
    progress_percent: 100,
    total_checkins: 198,
    passed_checkins: 186,
    conversion_rate: 79.2,
    daily_participants: generateMockDailyStats(30, 9),
    daily_checkins: generateMockDailyStats(10, 20),
    verification_breakdown: {
      gps_verified: 198,
      qr_verified: 192,
      receipt_verified: 156,
      multi_verified: 142,
    },
  },
};

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/brand/campaign/[id]/stats
 * Get detailed statistics for a campaign
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check Supabase configuration
    if (!isSupabaseConfigured()) {
      // Demo mode - return mock stats
      const stats = mockStats[id];

      if (!stats) {
        // Generate generic stats for unknown campaigns
        const genericStats: CampaignStats = {
          campaign_id: id,
          total_participants: Math.floor(Math.random() * 100) + 50,
          goal_participants: 200,
          progress_percent: Math.floor(Math.random() * 100),
          total_checkins: Math.floor(Math.random() * 50),
          passed_checkins: Math.floor(Math.random() * 40),
          conversion_rate: Math.floor(Math.random() * 80),
          daily_participants: generateMockDailyStats(14, 10),
          daily_checkins: generateMockDailyStats(7, 7),
          verification_breakdown: {
            gps_verified: Math.floor(Math.random() * 50),
            qr_verified: Math.floor(Math.random() * 45),
            receipt_verified: Math.floor(Math.random() * 30),
            multi_verified: Math.floor(Math.random() * 25),
          },
        };

        return apiSuccess(genericStats);
      }

      return apiSuccess(stats);
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

    // Get popup data
    type PopupData = {
      id: string;
      brand_name: string;
      title: string;
      goal_participants: number;
      current_participants: number;
      status: string;
    };
    const { data: popup, error: popupError } = (await supabase
      .from('popups')
      .select('id, brand_name, title, goal_participants, current_participants, status')
      .eq('id', id)
      .single()) as { data: PopupData | null; error: { message: string } | null };

    if (popupError || !popup) {
      return apiError('Campaign not found', 404);
    }

    // Get participation count
    const { count: participationCount } = await supabase
      .from('popup_participations')
      .select('*', { count: 'exact', head: true })
      .eq('popup_id', id);

    // Get checkin data
    type CheckinData = {
      passed: boolean;
      created_at: string;
      gps_score: number;
      qr_verified: boolean;
      receipt_verified: boolean;
    };
    const { data: checkins, count: checkinCount } = (await supabase
      .from('popup_checkins')
      .select('*', { count: 'exact' })
      .eq('popup_id', id)) as { data: CheckinData[] | null; count: number | null };

    // Count passed checkins
    const passedCheckins = checkins?.filter((c) => c.passed).length || 0;

    // Get daily participation stats (last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    type ParticipationData = {
      created_at: string;
    };
    const { data: dailyParticipations } = (await supabase
      .from('popup_participations')
      .select('created_at')
      .eq('popup_id', id)
      .gte('created_at', fourteenDaysAgo.toISOString())) as { data: ParticipationData[] | null };

    // Aggregate daily participations
    const dailyParticipantsMap = new Map<string, number>();
    dailyParticipations?.forEach((p) => {
      const date = new Date(p.created_at).toISOString().split('T')[0];
      dailyParticipantsMap.set(date, (dailyParticipantsMap.get(date) || 0) + 1);
    });

    const dailyParticipants: DailyStats[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyParticipants.push({
        date: dateStr,
        count: dailyParticipantsMap.get(dateStr) || 0,
      });
    }

    // Get daily checkin stats (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyCheckinsMap = new Map<string, number>();
    checkins
      ?.filter((c) => new Date(c.created_at) >= sevenDaysAgo)
      .forEach((c) => {
        const date = new Date(c.created_at).toISOString().split('T')[0];
        dailyCheckinsMap.set(date, (dailyCheckinsMap.get(date) || 0) + 1);
      });

    const dailyCheckins: DailyStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyCheckins.push({
        date: dateStr,
        count: dailyCheckinsMap.get(dateStr) || 0,
      });
    }

    // Calculate verification breakdown
    const verificationBreakdown = {
      gps_verified: checkins?.filter((c) => c.gps_score > 0).length || 0,
      qr_verified: checkins?.filter((c) => c.qr_verified).length || 0,
      receipt_verified: checkins?.filter((c) => c.receipt_verified).length || 0,
      multi_verified:
        checkins?.filter((c) => c.gps_score > 0 && c.qr_verified && c.receipt_verified).length || 0,
    };

    // Build stats response
    const stats: CampaignStats = {
      campaign_id: id,
      total_participants: participationCount || popup.current_participants,
      goal_participants: popup.goal_participants,
      progress_percent: Math.round(
        ((participationCount || popup.current_participants) / popup.goal_participants) * 100
      ),
      total_checkins: checkinCount || 0,
      passed_checkins: passedCheckins,
      conversion_rate:
        participationCount && participationCount > 0
          ? Math.round((passedCheckins / participationCount) * 100 * 10) / 10
          : 0,
      daily_participants: dailyParticipants,
      daily_checkins: dailyCheckins,
      verification_breakdown: verificationBreakdown,
    };

    return apiSuccess(stats);
  } catch (error) {
    logger.error('Stats fetch error', error);
    return apiError('Internal server error', 500);
  }
}
