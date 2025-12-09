/**
 * Badges API - Get user badges and available badges
 * 
 * GET /api/gamification/badges - Get badges for current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// ===========================================
// Types
// ===========================================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'experience' | 'collector' | 'social' | 'achievement';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: number;
  pointsReward: number;
  isActive: boolean;
  earnedAt?: string;
}

export interface BadgeProgress {
  badgeId: string;
  badge: Badge;
  current: number;
  required: number;
  percentage: number;
}

export interface BadgesResponse {
  earned: Badge[];
  available: Badge[];
  progress: BadgeProgress[];
  totalEarned: number;
  totalAvailable: number;
}

// ===========================================
// GET /api/gamification/badges - Get Badges
// ===========================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    
    // Optional user ID parameter (for viewing other users' badges)
    const targetUserId = searchParams.get('userId');
    
    // Get current user
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    // Determine which user's badges to fetch
    const userId = targetUserId || currentUser?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required or login required' },
        { status: 400 }
      );
    }
    
    // Fetch all active badges
    const { data: allBadges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('tier');
    
    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
      return NextResponse.json(
        { error: 'Failed to fetch badges' },
        { status: 500 }
      );
    }
    
    // Fetch user's earned badges
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', userId);
    
    if (userBadgesError) {
      console.error('Error fetching user badges:', userBadgesError);
      return NextResponse.json(
        { error: 'Failed to fetch user badges' },
        { status: 500 }
      );
    }
    
    // Create a map of earned badges
    const earnedBadgeMap = new Map(
      userBadges?.map(ub => [ub.badge_id, ub.earned_at]) || []
    );
    
    // Transform and categorize badges
    const earned: Badge[] = [];
    const available: Badge[] = [];
    
    for (const badge of allBadges || []) {
      const transformedBadge: Badge = {
        id: badge.id,
        name: badge.name,
        description: badge.description || '',
        icon: badge.icon_url || '',
        category: badge.category as Badge['category'],
        tier: badge.tier as Badge['tier'],
        requirement: badge.requirement,
        pointsReward: badge.points_reward || 0,
        isActive: badge.is_active,
      };
      
      const earnedAt = earnedBadgeMap.get(badge.id);
      if (earnedAt) {
        earned.push({
          ...transformedBadge,
          earnedAt,
        });
      } else {
        available.push(transformedBadge);
      }
    }
    
    // Calculate progress for available badges
    const progress: BadgeProgress[] = await calculateBadgeProgress(
      supabase,
      userId,
      available
    );
    
    return NextResponse.json<BadgesResponse>({
      earned,
      available,
      progress,
      totalEarned: earned.length,
      totalAvailable: available.length,
    });
    
  } catch (error) {
    console.error('Badges error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===========================================
// Helper Functions
// ===========================================

async function calculateBadgeProgress(
  supabase: any,
  userId: string,
  availableBadges: Badge[]
): Promise<BadgeProgress[]> {
  const progress: BadgeProgress[] = [];
  
  try {
    // Fetch user stats
    const [
      experiencesResult,
      reviewsResult,
      followersResult,
      checkinsResult,
    ] = await Promise.all([
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed'),
      supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_deleted', false),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId),
      supabase
        .from('checkins')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
    ]);
    
    const stats = {
      experiences: experiencesResult.count || 0,
      reviews: reviewsResult.count || 0,
      followers: followersResult.count || 0,
      checkins: checkinsResult.count || 0,
    };
    
    // Calculate progress for each available badge
    for (const badge of availableBadges) {
      let current = 0;
      
      switch (badge.category) {
        case 'experience':
          current = stats.experiences;
          break;
        case 'social':
          // Use followers for social badges
          current = stats.followers;
          break;
        case 'collector':
          // Use reviews for collector badges
          current = stats.reviews;
          break;
        case 'achievement':
          // Use checkins for achievement badges
          current = stats.checkins;
          break;
      }
      
      const percentage = Math.min(100, Math.round((current / badge.requirement) * 100));
      
      // Only include badges with some progress or close to completion
      if (current > 0 || badge.requirement <= 10) {
        progress.push({
          badgeId: badge.id,
          badge,
          current,
          required: badge.requirement,
          percentage,
        });
      }
    }
    
    // Sort by percentage (closest to completion first)
    progress.sort((a, b) => b.percentage - a.percentage);
    
    // Return top 10 in-progress badges
    return progress.slice(0, 10);
    
  } catch (error) {
    console.error('Error calculating badge progress:', error);
    return [];
  }
}
