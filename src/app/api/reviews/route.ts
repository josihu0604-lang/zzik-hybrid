/**
 * Reviews API - CRUD Operations for Reviews
 * 
 * GET /api/reviews - List reviews
 * POST /api/reviews - Create a review
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ===========================================
// Types
// ===========================================

export interface Review {
  id: string;
  userId: string;
  targetType: 'experience' | 'restaurant' | 'product';
  targetId: string;
  rating: number;
  content: string;
  images: string[];
  tags: string[];
  likesCount: number;
  isVerified: boolean;
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

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  page: number;
  hasMore: boolean;
}

// ===========================================
// Validation Schemas
// ===========================================

const listQuerySchema = z.object({
  targetType: z.enum(['experience', 'restaurant', 'product']).optional(),
  targetId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  sortBy: z.enum(['recent', 'rating', 'likes']).default('recent'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const createReviewSchema = z.object({
  targetType: z.enum(['experience', 'restaurant', 'product']),
  targetId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(10).max(2000),
  images: z.array(z.string().url()).max(5).default([]),
  tags: z.array(z.string()).max(10).default([]),
});

// ===========================================
// GET /api/reviews - List Reviews
// ===========================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const query = listQuerySchema.safeParse({
      targetType: searchParams.get('targetType'),
      targetId: searchParams.get('targetId'),
      userId: searchParams.get('userId'),
      sortBy: searchParams.get('sortBy') || 'recent',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    });
    
    if (!query.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: query.error.issues },
        { status: 400 }
      );
    }
    
    const { targetType, targetId, userId, sortBy, page, limit } = query.data;
    const offset = (page - 1) * limit;
    
    // Build query
    let reviewQuery = supabase
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
      `, { count: 'exact' })
      .eq('is_deleted', false);
    
    // Apply filters
    if (targetType) {
      reviewQuery = reviewQuery.eq('target_type', targetType);
    }
    if (targetId) {
      reviewQuery = reviewQuery.eq('target_id', targetId);
    }
    if (userId) {
      reviewQuery = reviewQuery.eq('user_id', userId);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'rating':
        reviewQuery = reviewQuery.order('rating', { ascending: false });
        break;
      case 'likes':
        reviewQuery = reviewQuery.order('likes_count', { ascending: false });
        break;
      case 'recent':
      default:
        reviewQuery = reviewQuery.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    reviewQuery = reviewQuery.range(offset, offset + limit - 1);
    
    const { data, error, count } = await reviewQuery;
    
    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }
    
    // Transform data
    const reviews: Review[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      targetType: row.target_type,
      targetId: row.target_id,
      rating: row.rating,
      content: row.content,
      images: row.images || [],
      tags: row.tags || [],
      likesCount: row.likes_count,
      isVerified: row.is_verified,
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
    
    return NextResponse.json<ReviewListResponse>({
      reviews,
      total,
      page,
      hasMore: offset + limit < total,
    });
    
  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===========================================
// POST /api/reviews - Create Review
// ===========================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { targetType, targetId, rating, content, images, tags } = parsed.data;
    
    // Check if user already reviewed this target
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .eq('is_deleted', false)
      .single();
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this item' },
        { status: 409 }
      );
    }
    
    // Check if user has a verified purchase/booking (optional enhancement)
    // const isVerified = await checkVerifiedPurchase(user.id, targetType, targetId);
    const isVerified = false; // Default to false for now
    
    // Insert review
    const { data: newReview, error: insertError } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        target_type: targetType,
        target_id: targetId,
        rating,
        content,
        images,
        tags,
        is_verified: isVerified,
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating review:', insertError);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }
    
    // Award points for review (gamification)
    const pointsEarned = isVerified ? 100 : 50;
    await awardPointsForReview(supabase, user.id, newReview.id, pointsEarned);
    
    // Check for badge eligibility
    const earnedBadges = await checkReviewBadges(supabase, user.id);
    
    // Create activity
    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'review',
      content: {
        reviewId: newReview.id,
        targetType,
        targetId,
        rating,
      },
      target_id: newReview.id,
      target_type: 'review',
    });
    
    return NextResponse.json({
      review: {
        id: newReview.id,
        userId: newReview.user_id,
        targetType: newReview.target_type,
        targetId: newReview.target_id,
        rating: newReview.rating,
        content: newReview.content,
        images: newReview.images || [],
        tags: newReview.tags || [],
        likesCount: 0,
        isVerified: newReview.is_verified,
        createdAt: newReview.created_at,
        updatedAt: newReview.updated_at,
      },
      earnedBadges,
      pointsEarned,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===========================================
// Helper Functions
// ===========================================

async function awardPointsForReview(
  supabase: any,
  userId: string,
  reviewId: string,
  points: number
) {
  try {
    await supabase.from('point_transactions').insert({
      user_id: userId,
      type: 'earn',
      amount: points,
      source: 'review',
      description: 'Points earned for writing a review',
      reference_id: reviewId,
      reference_type: 'review',
    });
    
    // Update user's total points
    await supabase.rpc('increment_user_points', {
      p_user_id: userId,
      p_amount: points,
    });
  } catch (error) {
    console.error('Error awarding points:', error);
  }
}

async function checkReviewBadges(supabase: any, userId: string) {
  const earnedBadges: any[] = [];
  
  try {
    // Count user's reviews
    const { count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_deleted', false);
    
    // Define badge thresholds
    const badgeThresholds = [
      { count: 1, badgeId: 'first_review' },
      { count: 10, badgeId: 'review_bronze' },
      { count: 50, badgeId: 'review_silver' },
      { count: 100, badgeId: 'review_gold' },
    ];
    
    for (const threshold of badgeThresholds) {
      if (count >= threshold.count) {
        // Check if user already has this badge
        const { data: existingBadge } = await supabase
          .from('user_badges')
          .select('id')
          .eq('user_id', userId)
          .eq('badge_id', threshold.badgeId)
          .single();
        
        if (!existingBadge) {
          // Award badge
          const { data: badge } = await supabase
            .from('badges')
            .select('*')
            .eq('id', threshold.badgeId)
            .single();
          
          if (badge) {
            await supabase.from('user_badges').insert({
              user_id: userId,
              badge_id: badge.id,
            });
            earnedBadges.push(badge);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }
  
  return earnedBadges;
}
