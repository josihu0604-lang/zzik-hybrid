/**
 * Follow API - Follow/Unfollow users
 * 
 * POST /api/social/follow - Follow a user
 * DELETE /api/social/follow - Unfollow a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ===========================================
// Validation Schemas
// ===========================================

const followSchema = z.object({
  targetUserId: z.string().uuid(),
});

// ===========================================
// POST /api/social/follow - Follow User
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
    const parsed = followSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { targetUserId } = parsed.data;
    
    // Prevent self-follow
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }
    
    // Check if target user exists
    const { data: targetUser, error: userError } = await supabase
      .from('user_profiles')
      .select('id, username')
      .eq('id', targetUserId)
      .single();
    
    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if already following
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .single();
    
    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 409 }
      );
    }
    
    // Create follow
    const { error: insertError } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: targetUserId,
      });
    
    if (insertError) {
      console.error('Error creating follow:', insertError);
      return NextResponse.json(
        { error: 'Failed to follow user' },
        { status: 500 }
      );
    }
    
    // Get updated followers count
    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetUserId);
    
    // Create activity for follower
    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'follow',
      content: {
        followedUserId: targetUserId,
        followedUsername: targetUser.username,
      },
      target_id: targetUserId,
      target_type: 'user',
    });
    
    // Award points to followed user
    await supabase.from('point_transactions').insert({
      user_id: targetUserId,
      type: 'earn',
      amount: 10,
      source: 'new_follower',
      description: 'Gained a new follower',
      reference_id: user.id,
      reference_type: 'user',
    });
    
    // Check for social badges
    await checkSocialBadges(supabase, targetUserId, followersCount || 1);
    
    return NextResponse.json({
      success: true,
      isFollowing: true,
      followersCount: followersCount || 1,
    });
    
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===========================================
// DELETE /api/social/follow - Unfollow User
// ===========================================

export async function DELETE(request: NextRequest) {
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
    const parsed = followSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { targetUserId } = parsed.data;
    
    // Check if following
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .single();
    
    if (!existingFollow) {
      return NextResponse.json(
        { error: 'Not following this user' },
        { status: 404 }
      );
    }
    
    // Delete follow
    const { error: deleteError } = await supabase
      .from('follows')
      .delete()
      .eq('id', existingFollow.id);
    
    if (deleteError) {
      console.error('Error deleting follow:', deleteError);
      return NextResponse.json(
        { error: 'Failed to unfollow user' },
        { status: 500 }
      );
    }
    
    // Get updated followers count
    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetUserId);
    
    return NextResponse.json({
      success: true,
      isFollowing: false,
      followersCount: followersCount || 0,
    });
    
  } catch (error) {
    console.error('Unfollow error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===========================================
// Helper Functions
// ===========================================

async function checkSocialBadges(
  supabase: any,
  userId: string,
  followersCount: number
) {
  try {
    // Define badge thresholds
    const badgeThresholds = [
      { count: 10, badgeId: 'social_starter' },
      { count: 100, badgeId: 'social_popular' },
      { count: 1000, badgeId: 'social_influencer' },
      { count: 10000, badgeId: 'social_celebrity' },
    ];
    
    for (const threshold of badgeThresholds) {
      if (followersCount >= threshold.count) {
        // Check if user already has this badge
        const { data: existingBadge } = await supabase
          .from('user_badges')
          .select('id')
          .eq('user_id', userId)
          .eq('badge_id', threshold.badgeId)
          .single();
        
        if (!existingBadge) {
          // Get badge info
          const { data: badge } = await supabase
            .from('badges')
            .select('*')
            .eq('id', threshold.badgeId)
            .single();
          
          if (badge) {
            // Award badge
            await supabase.from('user_badges').insert({
              user_id: userId,
              badge_id: badge.id,
            });
            
            // Award bonus points
            if (badge.points_reward) {
              await supabase.from('point_transactions').insert({
                user_id: userId,
                type: 'earn',
                amount: badge.points_reward,
                source: 'badge_earned',
                description: `Earned badge: ${badge.name}`,
                reference_id: badge.id,
                reference_type: 'badge',
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking social badges:', error);
  }
}
