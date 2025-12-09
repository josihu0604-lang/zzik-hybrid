/**
 * User Profile API - Get user profile information
 * 
 * GET /api/social/users/[id] - Get user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ===========================================
// Types
// ===========================================

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  country: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  stats: {
    experiences: number;
    reviews: number;
    followers: number;
    following: number;
    badges: number;
    points: number;
  };
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    tier: string;
    earnedAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    content: object;
    createdAt: string;
  }>;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
}

// ===========================================
// GET /api/social/users/[id] - Get User Profile
// ===========================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();
    const { id: userId } = params;
    
    // Validate ID
    if (!z.string().uuid().safeParse(userId).success) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    // Get current user
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        username,
        display_name,
        avatar_url,
        bio,
        country,
        tier,
        total_points,
        created_at
      `)
      .eq('id', userId)
      .single();
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Fetch stats in parallel
    const [
      experiencesResult,
      reviewsResult,
      followersResult,
      followingResult,
      badgesResult,
      recentActivityResult,
      isFollowingResult,
    ] = await Promise.all([
      // Experiences (bookings) count
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed'),
      
      // Reviews count
      supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_deleted', false),
      
      // Followers count
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId),
      
      // Following count
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId),
      
      // User badges
      supabase
        .from('user_badges')
        .select(`
          earned_at,
          badges (
            id,
            name,
            description,
            icon_url,
            category,
            tier
          )
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })
        .limit(10),
      
      // Recent activity
      supabase
        .from('activities')
        .select('id, type, content, created_at')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10),
      
      // Is current user following this user
      currentUser && currentUser.id !== userId
        ? supabase
            .from('follows')
            .select('id')
            .eq('follower_id', currentUser.id)
            .eq('following_id', userId)
            .single()
        : Promise.resolve({ data: null, error: null }),
    ]);
    
    // Process badges
    const badges = (badgesResult.data || []).map((row: any) => ({
      id: row.badges.id,
      name: row.badges.name,
      description: row.badges.description,
      icon: row.badges.icon_url,
      category: row.badges.category,
      tier: row.badges.tier,
      earnedAt: row.earned_at,
    }));
    
    // Process recent activity
    const recentActivity = (recentActivityResult.data || []).map((row: any) => ({
      id: row.id,
      type: row.type,
      content: row.content,
      createdAt: row.created_at,
    }));
    
    // Build response
    const userProfile: UserProfile = {
      id: profile.id,
      username: profile.username,
      displayName: profile.display_name || profile.username,
      avatar: profile.avatar_url || '',
      bio: profile.bio || '',
      country: profile.country || '',
      tier: profile.tier as UserProfile['tier'],
      stats: {
        experiences: experiencesResult.count || 0,
        reviews: reviewsResult.count || 0,
        followers: followersResult.count || 0,
        following: followingResult.count || 0,
        badges: badges.length,
        points: profile.total_points || 0,
      },
      badges,
      recentActivity,
      isFollowing: !!isFollowingResult.data,
      isOwnProfile: currentUser?.id === userId,
    };
    
    return NextResponse.json({ user: userProfile });
    
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
