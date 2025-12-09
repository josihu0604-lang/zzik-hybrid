/**
 * Followers/Following API - Get user's followers and following lists
 * 
 * GET /api/social/followers - Get followers or following list
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ===========================================
// Types
// ===========================================

export interface UserSummary {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  tier: string;
  isFollowing?: boolean;
}

export interface FollowListResponse {
  users: UserSummary[];
  total: number;
  page: number;
  hasMore: boolean;
}

// ===========================================
// GET /api/social/followers - Get Followers/Following List
// ===========================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'followers'; // followers | following
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;
    
    // Validate userId
    if (!userId || !z.string().uuid().safeParse(userId).success) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    // Validate type
    if (!['followers', 'following'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "followers" or "following"' },
        { status: 400 }
      );
    }
    
    // Get current user
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    let userIds: string[] = [];
    let total = 0;
    
    if (type === 'followers') {
      // Get users who follow this user
      const { data, count, error } = await supabase
        .from('follows')
        .select('follower_id', { count: 'exact' })
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('Error fetching followers:', error);
        return NextResponse.json(
          { error: 'Failed to fetch followers' },
          { status: 500 }
        );
      }
      
      userIds = data?.map(f => f.follower_id) || [];
      total = count || 0;
    } else {
      // Get users this user follows
      const { data, count, error } = await supabase
        .from('follows')
        .select('following_id', { count: 'exact' })
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('Error fetching following:', error);
        return NextResponse.json(
          { error: 'Failed to fetch following list' },
          { status: 500 }
        );
      }
      
      userIds = data?.map(f => f.following_id) || [];
      total = count || 0;
    }
    
    if (userIds.length === 0) {
      return NextResponse.json<FollowListResponse>({
        users: [],
        total: 0,
        page,
        hasMore: false,
      });
    }
    
    // Fetch user profiles
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, avatar_url, bio, tier')
      .in('id', userIds);
    
    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profiles' },
        { status: 500 }
      );
    }
    
    // Check if current user follows each user
    let followingSet: Set<string> = new Set();
    if (currentUser) {
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.id)
        .in('following_id', userIds);
      
      followingSet = new Set(follows?.map(f => f.following_id) || []);
    }
    
    // Create a map for maintaining order
    const profileMap = new Map(
      profiles?.map(p => [p.id, p]) || []
    );
    
    // Transform data maintaining order
    const users: UserSummary[] = userIds
      .map(id => profileMap.get(id))
      .filter(Boolean)
      .map((profile: any) => ({
        id: profile.id,
        username: profile.username,
        displayName: profile.display_name || profile.username,
        avatar: profile.avatar_url || '',
        bio: profile.bio || '',
        tier: profile.tier,
        isFollowing: currentUser ? followingSet.has(profile.id) : undefined,
      }));
    
    return NextResponse.json<FollowListResponse>({
      users,
      total,
      page,
      hasMore: offset + limit < total,
    });
    
  } catch (error) {
    console.error('Get followers/following error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
