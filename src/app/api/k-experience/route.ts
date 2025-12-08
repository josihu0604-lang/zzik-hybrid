import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getExperiencePrice, type CountryCode, type ExperienceType } from '@/lib/currency';

/**
 * GET /api/k-experience
 * 
 * List K-experiences with filtering and sorting
 * 
 * Query params:
 * - type: Filter by experience type (hightough, soundcheck, backstage, popup)
 * - country: Filter by country
 * - artist: Filter by artist name
 * - status: Filter by status (upcoming, ongoing, closed)
 * - sort: Sort by (deadline, popular, latest, price)
 * - limit: Number of results (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse query params
    const type = searchParams.get('type') as ExperienceType | null;
    const country = searchParams.get('country') as CountryCode | null;
    const artist = searchParams.get('artist');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'deadline';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('k_experiences')
      .select(
        `
        id,
        type,
        title,
        artist_name,
        artist_image,
        cover_image,
        location,
        country,
        base_price_usd,
        spots_total,
        spots_taken,
        deadline,
        status,
        created_at
      `,
        { count: 'exact' }
      );

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (country) {
      query = query.eq('country', country);
    }

    if (artist) {
      query = query.ilike('artist_name', `%${artist}%`);
    }

    if (status) {
      query = query.eq('status', status);
    } else {
      // By default, only show active experiences
      query = query.in('status', ['upcoming', 'ongoing']);
    }

    // Apply sorting
    switch (sort) {
      case 'deadline':
        query = query.order('deadline', { ascending: true });
        break;
      case 'popular':
        query = query.order('spots_taken', { ascending: false });
        break;
      case 'latest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'price':
        query = query.order('base_price_usd', { ascending: true });
        break;
      default:
        query = query.order('deadline', { ascending: true });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: experiences, error, count } = await query;

    if (error) {
      console.error('[API] K-experience list error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch experiences' },
        { status: 500 }
      );
    }

    // Enrich with localized pricing if country specified
    const enrichedExperiences = experiences?.map((exp) => {
      const spotsLeft = exp.spots_total - exp.spots_taken;
      const daysLeft = Math.ceil(
        (new Date(exp.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      const baseResult = {
        ...exp,
        spotsLeft,
        daysLeft,
      };

      if (country && exp.type) {
        const localPrice = getExperiencePrice(exp.type as ExperienceType, country);
        return {
          ...baseResult,
          localPrice,
        };
      }

      return baseResult;
    });

    return NextResponse.json({
      data: enrichedExperiences,
      count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[API] K-experience error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/k-experience
 * 
 * Create a new K-experience (Admin only)
 * 
 * Body:
 * {
 *   type: "hightough",
 *   title: "BTS Meet & Greet",
 *   artist_name: "BTS",
 *   location: "Seoul",
 *   country: "KR",
 *   base_price_usd: 150,
 *   spots_total: 100,
 *   deadline: "2025-03-01T00:00:00Z"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Add admin role check
    // For now, any authenticated user can create (will be restricted later)

    const body = await request.json();
    const {
      type,
      title,
      artist_name,
      artist_image,
      cover_image,
      location,
      country,
      base_price_usd,
      spots_total,
      deadline,
      description,
    } = body;

    // Validate required fields
    if (!type || !title || !artist_name || !location || !country || !base_price_usd || !spots_total || !deadline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert experience
    const { data: experience, error } = await supabase
      .from('k_experiences')
      .insert({
        type,
        title,
        artist_name,
        artist_image,
        cover_image,
        location,
        country,
        base_price_usd,
        spots_total,
        spots_taken: 0,
        deadline,
        description,
        status: 'upcoming',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[API] K-experience create error:', error);
      return NextResponse.json(
        { error: 'Failed to create experience' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: experience },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] K-experience error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
