/**
 * Review Detail API - GET, PUT, DELETE for individual review
 * 
 * GET /api/reviews/[id] - Get review by ID
 * PUT /api/reviews/[id] - Update review
 * DELETE /api/reviews/[id] - Delete review
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ===========================================
// Validation Schemas
// ===========================================

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  content: z.string().min(10).max(2000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

// ===========================================
// GET /api/reviews/[id] - Get Review Detail
// ===========================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();
    const { id } = params;
    
    // Validate ID
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }
    
    // Fetch review with user info and replies count
    const { data: review, error } = await supabase
      .from('reviews')
      .select(`
        id,
        user_id,
        target_type,
        target_id,
        rating,
        content,
        images,
        tags,
        likes_count,
        is_verified,
        created_at,
        updated_at,
        user_profiles!inner (
          id,
          username,
          display_name,
          avatar_url,
          tier
        )
      `)
      .eq('id', id)
      .eq('is_deleted', false)
      .single();
    
    if (error || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Get replies count
    const { count: repliesCount } = await supabase
      .from('review_replies')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', id)
      .eq('is_deleted', false);
    
    // Check if current user liked this review
    const { data: { user } } = await supabase.auth.getUser();
    let isLiked = false;
    
    if (user) {
      const { data: like } = await supabase
        .from('review_likes')
        .select('id')
        .eq('review_id', id)
        .eq('user_id', user.id)
        .single();
      isLiked = !!like;
    }
    
    return NextResponse.json({
      review: {
        id: review.id,
        userId: review.user_id,
        targetType: review.target_type,
        targetId: review.target_id,
        rating: review.rating,
        content: review.content,
        images: review.images || [],
        tags: review.tags || [],
        likesCount: review.likes_count,
        repliesCount: repliesCount || 0,
        isVerified: review.is_verified,
        isLiked,
        createdAt: review.created_at,
        updatedAt: review.updated_at,
        user: {
          id: (review as any).user_profiles.id,
          username: (review as any).user_profiles.username,
          displayName: (review as any).user_profiles.display_name,
          avatar: (review as any).user_profiles.avatar_url,
          tier: (review as any).user_profiles.tier,
        },
      },
    });
    
  } catch (error) {
    console.error('Get review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===========================================
// PUT /api/reviews/[id] - Update Review
// ===========================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();
    const { id } = params;
    
    // Validate ID
    if (!z.string().uuid().safeParse(id).success) {
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
    
    // Check if user owns this review
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('id, user_id')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();
    
    if (fetchError || !existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    if (existingReview.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only update your own reviews' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const parsed = updateReviewSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const updateData = parsed.data;
    
    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    // Update review
    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating review:', updateError);
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      review: {
        id: updatedReview.id,
        userId: updatedReview.user_id,
        targetType: updatedReview.target_type,
        targetId: updatedReview.target_id,
        rating: updatedReview.rating,
        content: updatedReview.content,
        images: updatedReview.images || [],
        tags: updatedReview.tags || [],
        likesCount: updatedReview.likes_count,
        isVerified: updatedReview.is_verified,
        createdAt: updatedReview.created_at,
        updatedAt: updatedReview.updated_at,
      },
    });
    
  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===========================================
// DELETE /api/reviews/[id] - Soft Delete Review
// ===========================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();
    const { id } = params;
    
    // Validate ID
    if (!z.string().uuid().safeParse(id).success) {
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
    
    // Check if user owns this review
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('id, user_id')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();
    
    if (fetchError || !existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    if (existingReview.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own reviews' },
        { status: 403 }
      );
    }
    
    // Soft delete
    const { error: deleteError } = await supabase
      .from('reviews')
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting review:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
