import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getExperiencePrice, type CountryCode, type ExperienceType } from '@/lib/currency';

/**
 * GET /api/k-experience/[id]
 * 
 * Get details for a specific K-experience
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') as CountryCode | null;

    const { data: experience, error } = await supabase
      .from('k_experiences')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !experience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }

    // Calculate derived fields
    const spotsLeft = experience.spots_total - experience.spots_taken;
    const daysLeft = Math.ceil(
      (new Date(experience.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const result = {
      ...experience,
      spotsLeft,
      daysLeft,
    };

    // Add localized pricing if country specified
    if (country && experience.type) {
      const localPrice = getExperiencePrice(experience.type as ExperienceType, country);
      return NextResponse.json({
        data: {
          ...result,
          localPrice,
        },
      });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('[API] K-experience detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/k-experience/[id]
 * 
 * Update K-experience (Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();

    // Update experience
    const { data: experience, error } = await supabase
      .from('k_experiences')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[API] K-experience update error:', error);
      return NextResponse.json(
        { error: 'Failed to update experience' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: experience });
  } catch (error) {
    console.error('[API] K-experience error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/k-experience/[id]
 * 
 * Delete K-experience (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    const { error } = await supabase
      .from('k_experiences')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[API] K-experience delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete experience' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] K-experience error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
