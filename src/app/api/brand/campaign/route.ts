import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api-middleware';
import type { BrandCampaign } from '@/types/brand';
import type { Insertable } from '@/types/database';
import { logger } from '@/lib/logger';

/**
 * Campaign creation schema
 */
const createCampaignSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  image_url: z.string().url().optional(),
  location: z.string().min(1, 'Location is required').max(200),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  category: z.string().min(1, 'Category is required'),
  goal_participants: z.number().min(10, 'Goal must be at least 10'),
  deadline_at: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Deadline must be in the future',
  }),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
});

/**
 * POST /api/brand/campaign
 * Create a new campaign
 */
export async function POST(request: NextRequest) {
  try {
    // Check Supabase configuration
    if (!isSupabaseConfigured()) {
      // Demo mode - return mock response
      const body = await request.json();
      const validated = createCampaignSchema.parse(body);

      const mockCampaign: BrandCampaign = {
        id: `demo_${Date.now()}`,
        brand_id: 'demo_brand',
        popup_id: `popup_${Date.now()}`,
        title: validated.title,
        description: validated.description || null,
        image_url: validated.image_url || null,
        location: validated.location,
        latitude: validated.latitude || null,
        longitude: validated.longitude || null,
        category: validated.category,
        goal_participants: validated.goal_participants,
        current_participants: 0,
        deadline_at: validated.deadline_at,
        starts_at: validated.starts_at || null,
        ends_at: validated.ends_at || null,
        status: 'funding',
        progress_percent: 0,
        total_checkins: 0,
        conversion_rate: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return apiSuccess(mockCampaign);
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = createCampaignSchema.parse(body);

    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return apiError('Unauthorized', 401);
    }

    // Create popup in database
    type PopupRow = {
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
      status: string;
      deadline_at: string;
      starts_at: string | null;
      ends_at: string | null;
      created_at: string;
      updated_at: string;
    };

    const popupData: Insertable<'popups'> = {
      brand_name: user.email?.split('@')[0] || 'Brand',
      title: validated.title,
      description: validated.description || null,
      location: validated.location,
      latitude: validated.latitude || null,
      longitude: validated.longitude || null,
      category: validated.category,
      image_url: validated.image_url || null,
      goal_participants: validated.goal_participants,
      current_participants: 0,
      status: 'funding',
      deadline_at: validated.deadline_at,
      starts_at: validated.starts_at || null,
      ends_at: validated.ends_at || null,
    };

    // Use type assertion to work around Supabase client type inference issues
    // The Database type is correctly defined but supabase-js generic inference fails
    const popupsTable = supabase.from('popups') as unknown as {
      insert: (data: Insertable<'popups'>) => {
        select: () => {
          single: () => Promise<{ data: PopupRow | null; error: { message: string } | null }>;
        };
      };
    };

    const { data: popup, error: popupError } = await popupsTable
      .insert(popupData)
      .select()
      .single();

    if (popupError || !popup) {
      logger.error('Failed to create popup', popupError);
      return apiError('Failed to create campaign', 500);
    }

    // Transform to campaign response
    const campaign: BrandCampaign = {
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
      total_checkins: 0,
      conversion_rate: 0,
      created_at: popup.created_at,
      updated_at: popup.updated_at,
    };

    return apiSuccess(campaign);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError('Validation failed', 400, {
        validation: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    logger.error('Campaign creation error', error);
    return apiError('Internal server error', 500);
  }
}
