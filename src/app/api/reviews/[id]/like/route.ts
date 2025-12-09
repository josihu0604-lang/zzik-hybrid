/**
 * Review Like API - Toggle like on a review
 * 
 * POST /api/reviews/[id]/like - Toggle like
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ===========================================
// POST /api/reviews/[id]/like - Toggle Like
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
      .select('id, user_id, likes_count')
      .eq('id', reviewId)
      .eq('is_deleted', false)
      .single();
    
    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Check if user already liked this review
    const { data: existingLike } = await supabase
      .from('review_likes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
      .single();
    
    let isLiked: boolean;
    let newLikesCount: number;
    
    if (existingLike) {
      // Unlike - remove the like
      await supabase
        .from('review_likes')
        .delete()
        .eq('id', existingLike.id);
      
      // Decrement likes count
      const { data: updatedReview } = await supabase
        .from('reviews')
        .update({ likes_count: Math.max(0, review.likes_count - 1) })
        .eq('id', reviewId)
        .select('likes_count')
        .single();
      
      isLiked = false;
      newLikesCount = updatedReview?.likes_count || review.likes_count - 1;
    } else {
      // Like - add the like
      await supabase
        .from('review_likes')
        .insert({
          review_id: reviewId,
          user_id: user.id,
        });
      
      // Increment likes count
      const { data: updatedReview } = await supabase
        .from('reviews')
        .update({ likes_count: review.likes_count + 1 })
        .eq('id', reviewId)
        .select('likes_count')
        .single();
      
      isLiked = true;
      newLikesCount = updatedReview?.likes_count || review.likes_count + 1;
      
      // Award points to review author (if not self-liking)
      if (review.user_id !== user.id) {
        await supabase.from('point_transactions').insert({
          user_id: review.user_id,
          type: 'earn',
          amount: 5,
          source: 'review_like',
          description: 'Someone liked your review',
          reference_id: reviewId,
          reference_type: 'review',
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      isLiked,
      likesCount: newLikesCount,
    });
    
  } catch (error) {
    console.error('Like review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
