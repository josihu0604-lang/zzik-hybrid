/**
 * Review Replies API - CRUD for review replies
 * 
 * GET /api/reviews/[id]/replies - List replies
 * POST /api/reviews/[id]/replies - Create reply
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ===========================================
// Types
// ===========================================

export interface ReviewReply {
  id: string;
  reviewId: string;
  userId: string;
  content: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    tier: string;
  };
}

// ===========================================
// Validation Schemas
// ===========================================

const createReplySchema = z.object({
  content: z.string().min(1).max(1000),
});

// ===========================================
// GET /api/reviews/[id]/replies - List Replies
// ===========================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();
    const { id: reviewId } = params;
    const { searchParams } = new URL(request.url);
    
    // Validate ID
    if (!z.string().uuid().safeParse(reviewId).success) {
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }
    
    // Parse pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;
    
    // Check if review exists
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id')
      .eq('id', reviewId)
      .eq('is_deleted', false)
      .single();
    
    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Fetch replies
    const { data: replies, error, count } = await supabase
      .from('review_replies')
      .select(`
        id,
        review_id,
        user_id,
        content,
        likes_count,
        created_at,
        updated_at,
        user_profiles!inner (
          id,
          username,
          display_name,
          avatar_url,
          tier
        )
      `, { count: 'exact' })
      .eq('review_id', reviewId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching replies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch replies' },
        { status: 500 }
      );
    }
    
    // Transform data
    const transformedReplies: ReviewReply[] = (replies || []).map((row: any) => ({
      id: row.id,
      reviewId: row.review_id,
      userId: row.user_id,
      content: row.content,
      likesCount: row.likes_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: row.user_profiles ? {
        id: row.user_profiles.id,
        username: row.user_profiles.username,
        displayName: row.user_profiles.display_name,
        avatar: row.user_profiles.avatar_url,
        tier: row.user_profiles.tier,
      } : undefined,
    }));
    
    const total = count || 0;
    
    return NextResponse.json({
      replies: transformedReplies,
      total,
      page,
      hasMore: offset + limit < total,
    });
    
  } catch (error) {
    console.error('Get replies error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===========================================
// POST /api/reviews/[id]/replies - Create Reply
// ===========================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();
    const { id: reviewId } = params;
    
    // Validate ID
    if (!z.string().uuid().safeParse(reviewId).success) {
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if review exists
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id, user_id')
      .eq('id', reviewId)
      .eq('is_deleted', false)
      .single();
    
    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const parsed = createReplySchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { content } = parsed.data;
    
    // Insert reply
    const { data: newReply, error: insertError } = await supabase
      .from('review_replies')
      .insert({
        review_id: reviewId,
        user_id: user.id,
        content,
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating reply:', insertError);
      return NextResponse.json(
        { error: 'Failed to create reply' },
        { status: 500 }
      );
    }
    
    // Notify review author (if not self-replying)
    if (review.user_id !== user.id) {
      // Award points to review author for engagement
      await supabase.from('point_transactions').insert({
        user_id: review.user_id,
        type: 'earn',
        amount: 10,
        source: 'review_reply',
        description: 'Someone replied to your review',
        reference_id: newReply.id,
        reference_type: 'reply',
      });
    }
    
    // Fetch user info for response
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, avatar_url, tier')
      .eq('id', user.id)
      .single();
    
    return NextResponse.json({
      reply: {
        id: newReply.id,
        reviewId: newReply.review_id,
        userId: newReply.user_id,
        content: newReply.content,
        likesCount: 0,
        createdAt: newReply.created_at,
        updatedAt: newReply.updated_at,
        user: userProfile ? {
          id: userProfile.id,
          username: userProfile.username,
          displayName: userProfile.display_name,
          avatar: userProfile.avatar_url,
          tier: userProfile.tier,
        } : undefined,
      },
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create reply error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
