/**
 * Activity Feed API - Get social feed
 * 
 * GET /api/social/feed - Get activity feed
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ===========================================
// Types
// ===========================================

export interface FeedItem {
  id: string;
  type: 'booking' | 'review' | 'badge' | 'checkin' | 'follow';
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    tier: string;
  };
  content: object;
  targetId?: string;
  targetType?: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

export interface FeedResponse {
  items: FeedItem[];
  total: number;
  page: number;
  hasMore: boolean;
}

// ===========================================
// GET /api/social/feed - Get Feed
// ===========================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const type = searchParams.get('type') || 'all'; // all | following | trending
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;
    
    // Validate type
    if (!['all', 'following', 'trending'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid feed type' },
        { status: 400 }
      );
    }
    
    // Get current user
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    let query = supabase
      .from('activities')
      .select(`
        id,
        user_id,
        type,
        content,
        target_id,
        target_type,
        created_at,
        likes_count,
        comments_count,
        user_profiles!inner (
          id,
          username,
          display_name,
          avatar_url,
          tier
        )
      `, { count: 'exact' })
      .eq('is_public', true);
    
    // Apply feed type filter
    if (type === 'following' && currentUser) {
      // Get list of users the current user follows
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.id);
      
      const followingIds = following?.map(f => f.following_id) || [];
      
      if (followingIds.length > 0) {
        query = query.in('user_id', followingIds);
      } else {
        // If not following anyone, return empty
        return NextResponse.json<FeedResponse>({
          items: [],
          total: 0,
          page,
          hasMore: false,
        });
      }
    } else if (type === 'trending') {
      // Trending: Recent activities with most engagement
      // Filter to last 7 days and sort by engagement
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      query = query
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('likes_count', { ascending: false })
        .order('comments_count', { ascending: false });
    }
    
    // Default sorting for 'all' type
    if (type !== 'trending') {
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching feed:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feed' },
        { status: 500 }
      );
    }
    
    // Check if current user liked each item
    let likedItemIds: Set<string> = new Set();
    if (currentUser && data && data.length > 0) {
      const itemIds = data.map((item: any) => item.id);
      const { data: likes } = await supabase
        .from('activity_likes')
        .select('activity_id')
        .eq('user_id', currentUser.id)
        .in('activity_id', itemIds);
      
      likedItemIds = new Set(likes?.map(l => l.activity_id) || []);
    }
    
    // Transform data
    const items: FeedItem[] = (data || []).map((row: any) => ({
      id: row.id,
      type: row.type as FeedItem['type'],
      user: {
        id: row.user_profiles.id,
        username: row.user_profiles.username,
        displayName: row.user_profiles.display_name || row.user_profiles.username,
        avatar: row.user_profiles.avatar_url || '',
        tier: row.user_profiles.tier,
      },
      content: row.content,
      targetId: row.target_id,
      targetType: row.target_type,
      createdAt: row.created_at,
      likes: row.likes_count || 0,
      comments: row.comments_count || 0,
      isLiked: likedItemIds.has(row.id),
    }));
    
    const total = count || 0;
    
    return NextResponse.json<FeedResponse>({
      items,
      total,
      page,
      hasMore: offset + limit < total,
    });
    
  } catch (error) {
    console.error('Feed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
