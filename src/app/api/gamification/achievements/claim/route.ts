/**
 * Claim Achievement API - Claim completed achievements
 * 
 * POST /api/gamification/achievements/claim - Claim an achievement
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ===========================================
// Types
// ===========================================

export interface ClaimAchievementResponse {
  success: boolean;
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    tier: string;
    pointsReward: number;
  };
  pointsEarned: number;
  badge?: {
    id: string;
    name: string;
    icon: string;
  };
  newTier?: string;
}

// ===========================================
// Validation
// ===========================================

const claimSchema = z.object({
  achievementId: z.string().uuid(),
});

// ===========================================
// POST /api/gamification/achievements/claim
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
    const parsed = claimSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { achievementId } = parsed.data;
    
    // Get achievement/badge details
    const { data: achievement, error: achievementError } = await supabase
      .from('badges')
      .select('*')
      .eq('id', achievementId)
      .eq('is_active', true)
      .single();
    
    if (achievementError || !achievement) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }
    
    // Check if user already claimed this achievement
    const { data: existingClaim } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', user.id)
      .eq('badge_id', achievementId)
      .single();
    
    if (existingClaim) {
      return NextResponse.json(
        { error: 'Achievement already claimed' },
        { status: 409 }
      );
    }
    
    // Verify user meets the requirement
    const meetsRequirement = await verifyAchievementRequirement(
      supabase,
      user.id,
      achievement
    );
    
    if (!meetsRequirement) {
      return NextResponse.json(
        { error: 'Achievement requirements not met' },
        { status: 400 }
      );
    }
    
    // Claim the achievement
    const { error: claimError } = await supabase
      .from('user_badges')
      .insert({
        user_id: user.id,
        badge_id: achievementId,
      });
    
    if (claimError) {
      console.error('Error claiming achievement:', claimError);
      return NextResponse.json(
        { error: 'Failed to claim achievement' },
        { status: 500 }
      );
    }
    
    // Award points
    const pointsReward = achievement.points_reward || 0;
    
    if (pointsReward > 0) {
      await supabase.from('point_transactions').insert({
        user_id: user.id,
        type: 'earn',
        amount: pointsReward,
        source: 'achievement_claim',
        description: `Claimed achievement: ${achievement.name}`,
        reference_id: achievementId,
        reference_type: 'badge',
      });
      
      // Update user's total points
      await supabase.rpc('increment_user_points', {
        p_user_id: user.id,
        p_amount: pointsReward,
      });
    }
    
    // Check for tier upgrade
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('total_points, tier')
      .eq('id', user.id)
      .single();
    
    let newTier: string | undefined;
    if (profile) {
      const newTotalPoints = (profile.total_points || 0) + pointsReward;
      const calculatedTier = calculateTier(newTotalPoints);
      
      if (calculatedTier !== profile.tier) {
        await supabase
          .from('user_profiles')
          .update({ tier: calculatedTier })
          .eq('id', user.id);
        newTier = calculatedTier;
      }
    }
    
    // Create activity
    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'badge',
      content: {
        badgeId: achievementId,
        badgeName: achievement.name,
        category: achievement.category,
        tier: achievement.tier,
      },
      target_id: achievementId,
      target_type: 'badge',
    });
    
    return NextResponse.json<ClaimAchievementResponse>({
      success: true,
      achievement: {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description || '',
        icon: achievement.icon_url || '',
        category: achievement.category,
        tier: achievement.tier,
        pointsReward,
      },
      pointsEarned: pointsReward,
      badge: {
        id: achievement.id,
        name: achievement.name,
        icon: achievement.icon_url || '',
      },
      newTier,
    });
    
  } catch (error) {
    console.error('Claim achievement error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===========================================
// Helper Functions
// ===========================================

async function verifyAchievementRequirement(
  supabase: any,
  userId: string,
  achievement: any
): Promise<boolean> {
  const { category, requirement } = achievement;
  
  try {
    let count = 0;
    
    switch (category) {
      case 'experience': {
        const { count: experienceCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'completed');
        count = experienceCount || 0;
        break;
      }
      
      case 'collector': {
        const { count: reviewCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_deleted', false);
        count = reviewCount || 0;
        break;
      }
      
      case 'social': {
        const { count: followersCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId);
        count = followersCount || 0;
        break;
      }
      
      case 'achievement': {
        const { count: checkinCount } = await supabase
          .from('checkins')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        count = checkinCount || 0;
        break;
      }
      
      default:
        return false;
    }
    
    return count >= requirement;
    
  } catch (error) {
    console.error('Error verifying achievement:', error);
    return false;
  }
}

function calculateTier(totalPoints: number): string {
  if (totalPoints >= 20000) return 'platinum';
  if (totalPoints >= 5000) return 'gold';
  if (totalPoints >= 1000) return 'silver';
  return 'bronze';
}
