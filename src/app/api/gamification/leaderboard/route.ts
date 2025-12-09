/**
 * Leaderboard API - Get rankings
 * 
 * GET /api/gamification/leaderboard - Get leaderboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ===========================================
// Types
// ===========================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  country: string;
  tier: string;
  score: number;
  change: number; // Rank change from previous period
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  userRank?: LeaderboardEntry;
  total: number;
  type: string;
  period: string;
}

// ===========================================
// Validation
// ===========================================

const leaderboardParamsSchema = z.object({
  type: z.enum(['points', 'experiences', 'referrals', 'reviews']).default('points'),
  period: z.enum(['daily', 'weekly', 'monthly', 'all-time']).default('weekly'),
  country: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ===========================================
// GET /api/gamification/leaderboard
// ===========================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    
    // Parse and validate parameters
    const params = leaderboardParamsSchema.safeParse({
      type: searchParams.get('type') || 'points',
      period: searchParams.get('period') || 'weekly',
      country: searchParams.get('country'),
      limit: searchParams.get('limit') || '50',
    });
    
    if (!params.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: params.error.issues },
        { status: 400 }
      );
    }
    
    const { type, period, country, limit } = params.data;
    
    // Get current user
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    // Calculate date range based on period
    const dateRange = getDateRange(period);
    
    // Build leaderboard query based on type
    let entries: LeaderboardEntry[] = [];
    let total = 0;
    
    switch (type) {
      case 'points':
        ({ entries, total } = await getPointsLeaderboard(
          supabase,
          dateRange,
          country,
          limit
        ));
        break;
        
      case 'experiences':
        ({ entries, total } = await getExperiencesLeaderboard(
          supabase,
          dateRange,
          country,
          limit
        ));
        break;
        
      case 'referrals':
        ({ entries, total } = await getReferralsLeaderboard(
          supabase,
          dateRange,
          country,
          limit
        ));
        break;
        
      case 'reviews':
        ({ entries, total } = await getReviewsLeaderboard(
          supabase,
          dateRange,
          country,
          limit
        ));
        break;
    }
    
    // Get current user's rank if logged in
    let userRank: LeaderboardEntry | undefined;
    if (currentUser) {
      const userEntry = entries.find(e => e.userId === currentUser.id);
      if (userEntry) {
        userRank = userEntry;
      } else {
        // User not in top list, calculate their rank
        userRank = await getUserRank(supabase, currentUser.id, type, dateRange, country);
      }
    }
    
    return NextResponse.json<LeaderboardResponse>({
      entries,
      userRank,
      total,
      type,
      period,
    });
    
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===========================================
// Helper Functions
// ===========================================

interface DateRange {
  start: Date | null;
  end: Date;
}

function getDateRange(period: string): DateRange {
  const now = new Date();
  let start: Date | null = null;
  
  switch (period) {
    case 'daily':
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    case 'monthly':
      start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      break;
    case 'all-time':
      start = null;
      break;
  }
  
  return { start, end: now };
}

async function getPointsLeaderboard(
  supabase: any,
  dateRange: DateRange,
  country: string | undefined,
  limit: number
): Promise<{ entries: LeaderboardEntry[]; total: number }> {
  let query = supabase
    .from('point_transactions')
    .select(`
      user_id,
      amount,
      user_profiles!inner (
        id,
        username,
        display_name,
        avatar_url,
        country,
        tier
      )
    `)
    .eq('type', 'earn');
  
  if (dateRange.start) {
    query = query.gte('created_at', dateRange.start.toISOString());
  }
  
  if (country) {
    query = query.eq('user_profiles.country', country);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching points leaderboard:', error);
    return { entries: [], total: 0 };
  }
  
  // Aggregate points by user
  const userPoints = new Map<string, { total: number; profile: any }>();
  
  for (const row of data || []) {
    const existing = userPoints.get(row.user_id);
    if (existing) {
      existing.total += row.amount;
    } else {
      userPoints.set(row.user_id, {
        total: row.amount,
        profile: row.user_profiles,
      });
    }
  }
  
  // Sort and rank
  const sorted = Array.from(userPoints.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, limit);
  
  const entries: LeaderboardEntry[] = sorted.map(([userId, data], index) => ({
    rank: index + 1,
    userId,
    username: data.profile.username,
    displayName: data.profile.display_name || data.profile.username,
    avatar: data.profile.avatar_url || '',
    country: data.profile.country || '',
    tier: data.profile.tier || 'bronze',
    score: data.total,
    change: 0, // TODO: Calculate rank change
  }));
  
  return { entries, total: userPoints.size };
}

async function getExperiencesLeaderboard(
  supabase: any,
  dateRange: DateRange,
  country: string | undefined,
  limit: number
): Promise<{ entries: LeaderboardEntry[]; total: number }> {
  let query = supabase
    .from('bookings')
    .select(`
      user_id,
      user_profiles!inner (
        id,
        username,
        display_name,
        avatar_url,
        country,
        tier
      )
    `)
    .eq('status', 'completed');
  
  if (dateRange.start) {
    query = query.gte('created_at', dateRange.start.toISOString());
  }
  
  if (country) {
    query = query.eq('user_profiles.country', country);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching experiences leaderboard:', error);
    return { entries: [], total: 0 };
  }
  
  // Count experiences by user
  const userExperiences = new Map<string, { count: number; profile: any }>();
  
  for (const row of data || []) {
    const existing = userExperiences.get(row.user_id);
    if (existing) {
      existing.count++;
    } else {
      userExperiences.set(row.user_id, {
        count: 1,
        profile: row.user_profiles,
      });
    }
  }
  
  // Sort and rank
  const sorted = Array.from(userExperiences.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit);
  
  const entries: LeaderboardEntry[] = sorted.map(([userId, data], index) => ({
    rank: index + 1,
    userId,
    username: data.profile.username,
    displayName: data.profile.display_name || data.profile.username,
    avatar: data.profile.avatar_url || '',
    country: data.profile.country || '',
    tier: data.profile.tier || 'bronze',
    score: data.count,
    change: 0,
  }));
  
  return { entries, total: userExperiences.size };
}

async function getReferralsLeaderboard(
  supabase: any,
  dateRange: DateRange,
  country: string | undefined,
  limit: number
): Promise<{ entries: LeaderboardEntry[]; total: number }> {
  let query = supabase
    .from('referrals')
    .select(`
      referrer_id,
      user_profiles!inner (
        id,
        username,
        display_name,
        avatar_url,
        country,
        tier
      )
    `)
    .eq('status', 'completed');
  
  if (dateRange.start) {
    query = query.gte('created_at', dateRange.start.toISOString());
  }
  
  if (country) {
    query = query.eq('user_profiles.country', country);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching referrals leaderboard:', error);
    return { entries: [], total: 0 };
  }
  
  // Count referrals by user
  const userReferrals = new Map<string, { count: number; profile: any }>();
  
  for (const row of data || []) {
    const existing = userReferrals.get(row.referrer_id);
    if (existing) {
      existing.count++;
    } else {
      userReferrals.set(row.referrer_id, {
        count: 1,
        profile: row.user_profiles,
      });
    }
  }
  
  // Sort and rank
  const sorted = Array.from(userReferrals.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit);
  
  const entries: LeaderboardEntry[] = sorted.map(([userId, data], index) => ({
    rank: index + 1,
    userId,
    username: data.profile.username,
    displayName: data.profile.display_name || data.profile.username,
    avatar: data.profile.avatar_url || '',
    country: data.profile.country || '',
    tier: data.profile.tier || 'bronze',
    score: data.count,
    change: 0,
  }));
  
  return { entries, total: userReferrals.size };
}

async function getReviewsLeaderboard(
  supabase: any,
  dateRange: DateRange,
  country: string | undefined,
  limit: number
): Promise<{ entries: LeaderboardEntry[]; total: number }> {
  let query = supabase
    .from('reviews')
    .select(`
      user_id,
      user_profiles!inner (
        id,
        username,
        display_name,
        avatar_url,
        country,
        tier
      )
    `)
    .eq('is_deleted', false);
  
  if (dateRange.start) {
    query = query.gte('created_at', dateRange.start.toISOString());
  }
  
  if (country) {
    query = query.eq('user_profiles.country', country);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching reviews leaderboard:', error);
    return { entries: [], total: 0 };
  }
  
  // Count reviews by user
  const userReviews = new Map<string, { count: number; profile: any }>();
  
  for (const row of data || []) {
    const existing = userReviews.get(row.user_id);
    if (existing) {
      existing.count++;
    } else {
      userReviews.set(row.user_id, {
        count: 1,
        profile: row.user_profiles,
      });
    }
  }
  
  // Sort and rank
  const sorted = Array.from(userReviews.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit);
  
  const entries: LeaderboardEntry[] = sorted.map(([userId, data], index) => ({
    rank: index + 1,
    userId,
    username: data.profile.username,
    displayName: data.profile.display_name || data.profile.username,
    avatar: data.profile.avatar_url || '',
    country: data.profile.country || '',
    tier: data.profile.tier || 'bronze',
    score: data.count,
    change: 0,
  }));
  
  return { entries, total: userReviews.size };
}

async function getUserRank(
  supabase: any,
  userId: string,
  type: string,
  dateRange: DateRange,
  country: string | undefined
): Promise<LeaderboardEntry | undefined> {
  // Get user's profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, username, display_name, avatar_url, country, tier')
    .eq('id', userId)
    .single();
  
  if (profileError || !profile) {
    return undefined;
  }
  
  // Get user's score based on type
  let score = 0;
  
  switch (type) {
    case 'points': {
      let query = supabase
        .from('point_transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'earn');
      
      if (dateRange.start) {
        query = query.gte('created_at', dateRange.start.toISOString());
      }
      
      const { data } = await query;
      score = data?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0;
      break;
    }
    
    case 'experiences': {
      let query = supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed');
      
      if (dateRange.start) {
        query = query.gte('created_at', dateRange.start.toISOString());
      }
      
      const { count } = await query;
      score = count || 0;
      break;
    }
    
    case 'reviews': {
      let query = supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_deleted', false);
      
      if (dateRange.start) {
        query = query.gte('created_at', dateRange.start.toISOString());
      }
      
      const { count } = await query;
      score = count || 0;
      break;
    }
    
    case 'referrals': {
      let query = supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', userId)
        .eq('status', 'completed');
      
      if (dateRange.start) {
        query = query.gte('created_at', dateRange.start.toISOString());
      }
      
      const { count } = await query;
      score = count || 0;
      break;
    }
  }
  
  // Calculate rank (simplified - in production, use materialized views)
  const rank = 999; // Placeholder
  
  return {
    rank,
    userId,
    username: profile.username,
    displayName: profile.display_name || profile.username,
    avatar: profile.avatar_url || '',
    country: profile.country || '',
    tier: profile.tier || 'bronze',
    score,
    change: 0,
  };
}
