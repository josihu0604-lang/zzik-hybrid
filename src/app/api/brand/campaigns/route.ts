import { NextRequest } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api-middleware';
import type { BrandCampaign } from '@/types/brand';
import { logger } from '@/lib/logger';

/**
 * Mock data for demo mode
 */
const mockCampaigns: BrandCampaign[] = [
  {
    id: '1',
    brand_id: 'demo_brand',
    popup_id: 'p1',
    title: '2024 Winter Collection',
    description: '겨울 신상품 런칭 팝업',
    image_url: null,
    location: '성수동 카페거리',
    latitude: 37.5445,
    longitude: 127.0561,
    category: 'fashion',
    goal_participants: 200,
    current_participants: 156,
    deadline_at: '2025-01-15T00:00:00Z',
    starts_at: '2025-01-20T00:00:00Z',
    ends_at: '2025-01-25T00:00:00Z',
    status: 'funding',
    progress_percent: 78,
    total_checkins: 0,
    conversion_rate: 0,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-06T00:00:00Z',
  },
  {
    id: '2',
    brand_id: 'demo_brand',
    popup_id: 'p2',
    title: 'Holiday Special Event',
    description: '홀리데이 특별 이벤트',
    image_url: null,
    location: '홍대입구역',
    latitude: 37.5563,
    longitude: 126.9234,
    category: 'lifestyle',
    goal_participants: 150,
    current_participants: 150,
    deadline_at: '2024-12-20T00:00:00Z',
    starts_at: '2024-12-25T00:00:00Z',
    ends_at: '2024-12-31T00:00:00Z',
    status: 'confirmed',
    progress_percent: 100,
    total_checkins: 89,
    conversion_rate: 59.3,
    created_at: '2024-11-15T00:00:00Z',
    updated_at: '2024-12-06T00:00:00Z',
  },
  {
    id: '3',
    brand_id: 'demo_brand',
    popup_id: 'p3',
    title: 'New Year Launch',
    description: '새해 런칭 캠페인',
    image_url: null,
    location: '강남역',
    latitude: 37.498,
    longitude: 127.0276,
    category: 'beauty',
    goal_participants: 300,
    current_participants: 45,
    deadline_at: '2025-01-25T00:00:00Z',
    starts_at: '2025-02-01T00:00:00Z',
    ends_at: '2025-02-10T00:00:00Z',
    status: 'funding',
    progress_percent: 15,
    total_checkins: 0,
    conversion_rate: 0,
    created_at: '2024-12-05T00:00:00Z',
    updated_at: '2024-12-06T00:00:00Z',
  },
];

/**
 * GET /api/brand/campaigns
 * Get list of campaigns for the authenticated brand
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Check Supabase configuration
    if (!isSupabaseConfigured()) {
      // Demo mode - return mock data with filters
      let filteredCampaigns = [...mockCampaigns];

      if (status && status !== 'all') {
        filteredCampaigns = filteredCampaigns.filter((c) => c.status === status);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredCampaigns = filteredCampaigns.filter(
          (c) =>
            c.title.toLowerCase().includes(searchLower) ||
            c.location.toLowerCase().includes(searchLower)
        );
      }

      const total = filteredCampaigns.length;
      const start = (page - 1) * perPage;
      const paginatedCampaigns = filteredCampaigns.slice(start, start + perPage);

      return apiSuccess({
        campaigns: paginatedCampaigns,
        total,
        page,
        per_page: perPage,
        has_more: start + perPage < total,
      });
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

    // Build query
    let query = supabase.from('popups').select('*, popup_checkins(count)', { count: 'exact' });

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Search
    if (search) {
      query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`);
    }

    // Pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    type PopupData = {
      id: string;
      title: string;
      description: string | null;
      image_url: string | null;
      location: string;
      latitude: number | null;
      longitude: number | null;
      category: string;
      goal_participants: number;
      current_participants: number;
      deadline_at: string;
      starts_at: string | null;
      ends_at: string | null;
      status: string;
      created_at: string;
      updated_at: string;
      popup_checkins: Array<{ count: number }>;
    };
    const {
      data: popups,
      error: queryError,
      count,
    } = (await query) as {
      data: PopupData[] | null;
      error: { message: string } | null;
      count: number | null;
    };

    if (queryError) {
      logger.error('Failed to fetch campaigns', queryError);
      return apiError('Failed to fetch campaigns', 500);
    }

    // Transform to campaign format
    const campaigns: BrandCampaign[] = (popups || []).map((popup) => ({
      id: popup.id,
      brand_id: user.id,
      popup_id: popup.id,
      title: popup.title,
      description: popup.description,
      image_url: popup.image_url,
      location: popup.location,
      latitude: popup.latitude,
      longitude: popup.longitude,
      category: popup.category,
      goal_participants: popup.goal_participants,
      current_participants: popup.current_participants,
      deadline_at: popup.deadline_at,
      starts_at: popup.starts_at,
      ends_at: popup.ends_at,
      status: popup.status as BrandCampaign['status'],
      progress_percent: Math.round((popup.current_participants / popup.goal_participants) * 100),
      total_checkins: (popup.popup_checkins as Array<{ count: number }>)?.[0]?.count || 0,
      conversion_rate:
        popup.current_participants > 0
          ? Math.round(
              (((popup.popup_checkins as Array<{ count: number }>)?.[0]?.count || 0) /
                popup.current_participants) *
                100 *
                10
            ) / 10
          : 0,
      created_at: popup.created_at,
      updated_at: popup.updated_at,
    }));

    const response = apiSuccess({
      campaigns,
      total: count || 0,
      page,
      per_page: perPage,
      has_more: (count || 0) > from + perPage,
    });

    // Add Cache-Control for campaign list (public, 1 min with SWR)
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    logger.error('Campaigns fetch error', error);
    return apiError('Internal server error', 500);
  }
}
