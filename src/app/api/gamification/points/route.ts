/**
 * Points API - Get user points and transaction history
 * 
 * GET /api/gamification/points - Get points info
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// ===========================================
// Types
// ===========================================

export interface PointTransaction {
  id: string;
  type: 'earn' | 'spend' | 'expire' | 'refund';
  amount: number;
  source: string;
  description: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}

export interface PointsData {
  total: number;
  available: number;
  pending: number;
  expiring: number; // Points expiring in next 30 days
  expiryDate?: string;
  tier: string;
  nextTierPoints?: number;
  history: PointTransaction[];
}

export interface PointsResponse {
  points: PointsData;
}

// ===========================================
// GET /api/gamification/points - Get Points
// ===========================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    
    // Pagination for history
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch user profile for tier info
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tier, total_points')
      .eq('id', user.id)
      .single();
    
    // Calculate points breakdown
    const [
      earnedResult,
      spentResult,
      pendingResult,
      historyResult,
      expiringResult,
    ] = await Promise.all([
      // Total earned
      supabase
        .from('point_transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'earn'),
      
      // Total spent
      supabase
        .from('point_transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'spend'),
      
      // Pending points (from recent activities not yet confirmed)
      supabase
        .from('point_transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'earn')
        .eq('status', 'pending'),
      
      // Transaction history
      supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
      
      // Points expiring in next 30 days
      (() => {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        return supabase
          .from('point_transactions')
          .select('amount, expires_at')
          .eq('user_id', user.id)
          .eq('type', 'earn')
          .not('expires_at', 'is', null)
          .lte('expires_at', thirtyDaysFromNow.toISOString())
          .gt('expires_at', new Date().toISOString());
      })(),
    ]);
    
    // Calculate totals
    const totalEarned = (earnedResult.data || []).reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const totalSpent = (spentResult.data || []).reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const totalPending = (pendingResult.data || []).reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const expiringPoints = (expiringResult.data || []).reduce(
      (sum, t) => sum + t.amount,
      0
    );
    
    // Find earliest expiry date
    const expiryDate = expiringResult.data?.length
      ? expiringResult.data
          .map(t => t.expires_at)
          .filter(Boolean)
          .sort()[0]
      : undefined;
    
    // Transform transaction history
    const history: PointTransaction[] = (historyResult.data || []).map(
      (row: any) => ({
        id: row.id,
        type: row.type as PointTransaction['type'],
        amount: row.amount,
        source: row.source,
        description: row.description || getDefaultDescription(row.type, row.source),
        referenceId: row.reference_id,
        referenceType: row.reference_type,
        createdAt: row.created_at,
      })
    );
    
    // Calculate tier thresholds
    const tierThresholds = {
      bronze: 0,
      silver: 1000,
      gold: 5000,
      platinum: 20000,
    };
    
    const currentTier = profile?.tier || 'bronze';
    const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
    const currentTierIndex = tierOrder.indexOf(currentTier);
    const nextTier = tierOrder[currentTierIndex + 1];
    const nextTierPoints = nextTier
      ? tierThresholds[nextTier as keyof typeof tierThresholds]
      : undefined;
    
    const available = Math.max(0, totalEarned - totalSpent);
    
    return NextResponse.json<PointsResponse>({
      points: {
        total: profile?.total_points || available,
        available,
        pending: totalPending,
        expiring: expiringPoints,
        expiryDate,
        tier: currentTier,
        nextTierPoints,
        history,
      },
    });
    
  } catch (error) {
    console.error('Points error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===========================================
// Helper Functions
// ===========================================

function getDefaultDescription(type: string, source: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    earn: {
      review: 'Points earned for writing a review',
      booking: 'Points earned for completing a booking',
      referral: 'Points earned for successful referral',
      checkin: 'Points earned for checking in',
      badge_earned: 'Bonus points for earning a badge',
      new_follower: 'Points for gaining a new follower',
      review_like: 'Points for receiving a like on your review',
      review_reply: 'Points for engagement on your review',
      daily_login: 'Daily login bonus',
      first_purchase: 'First purchase bonus',
    },
    spend: {
      redemption: 'Points redeemed for reward',
      discount: 'Points used for discount',
      upgrade: 'Points used for upgrade',
    },
    expire: {
      default: 'Points expired',
    },
    refund: {
      cancelled: 'Points refunded for cancelled transaction',
      adjustment: 'Points adjustment',
    },
  };
  
  return descriptions[type]?.[source] || `${type} - ${source}`;
}
