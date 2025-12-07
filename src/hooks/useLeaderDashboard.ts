/**
 * useLeaderDashboard Hook
 *
 * Handles leader dashboard data fetching and state management
 * - Real-time referral count
 * - Monthly earnings calculation
 * - Campaign performance tracking
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import {
  generateReferralCode,
  generateReferralLink,
  TIER_COMMISSION_RATES,
  type LeaderTier,
  type LeaderStats,
} from '@/lib/leader';

// ============================================================================
// TYPES
// ============================================================================

export interface Campaign {
  id: string;
  popupId: string;
  brandName: string;
  title: string;
  referrals: number;
  checkins: number;
  earnings: number;
  status: 'active' | 'completed' | 'pending';
}

export interface LeaderDashboardData {
  isLeader: boolean;
  referralCode: string;
  referralLink: string;
  tier: LeaderTier;
  stats: LeaderStats;
  campaigns: Campaign[];
}

export interface EarningsBreakdown {
  today: number;
  thisWeek: number;
  thisMonth: number;
  lastMonth: number;
  pendingPayout: number;
}

export interface PerformanceMetrics {
  conversionRate: number; // referrals -> checkins
  avgEarningsPerReferral: number;
  bestPerformingCampaign: Campaign | null;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface UseLeaderDashboardReturn {
  // Data
  data: LeaderDashboardData | null;
  earnings: EarningsBreakdown | null;
  performance: PerformanceMetrics | null;

  // State
  isLoading: boolean;
  isRegistering: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  register: () => Promise<boolean>;

  // Computed
  nextTierProgress: {
    current: number;
    target: number;
    percentage: number;
    nextTier: LeaderTier | null;
  };
}

// ============================================================================
// TIER THRESHOLDS
// ============================================================================

const TIER_THRESHOLDS: Record<LeaderTier, number> = {
  Bronze: 0,
  Silver: 50,
  Gold: 200,
  Platinum: 500,
};

const TIER_ORDER: LeaderTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];

// ============================================================================
// EARNINGS RATES (per action)
// ============================================================================

export const EARNINGS_RATES = {
  // Per participation (user joins via referral)
  participation: {
    Bronze: 100,
    Silver: 150,
    Gold: 250,
    Platinum: 500,
  },
  // Per checkin (user actually visits)
  checkin: {
    Bronze: 500,
    Silver: 600,
    Gold: 750,
    Platinum: 1000,
  },
} as const;

// ============================================================================
// HOOK
// ============================================================================

export function useLeaderDashboard(): UseLeaderDashboardReturn {
  const { user, isDemo } = useAuth();

  const [data, setData] = useState<LeaderDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // FETCH DATA
  // ========================================

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Demo mode
      if (isDemo) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setData(generateDemoData(user.id));
        return;
      }

      // Real API call
      const response = await fetch('/api/leader');

      if (!response.ok) {
        if (response.status === 404) {
          // Not a leader yet
          setData(null);
          return;
        }
        throw new Error('Failed to fetch leader data');
      }

      const result = await response.json();

      if (result.success && result.data) {
        const apiData = result.data;

        setData({
          isLeader: apiData.isLeader !== false,
          referralCode: apiData.referralCode || apiData.data?.referralCode,
          referralLink: apiData.referralLink || apiData.data?.referralLink,
          tier: apiData.tier || apiData.data?.tier || 'Bronze',
          stats: {
            tier: apiData.tier || apiData.data?.tier || 'Bronze',
            totalEarnings: apiData.totalEarnings || apiData.data?.totalEarnings || 0,
            thisMonthEarnings: apiData.thisMonthEarnings || apiData.data?.thisMonthEarnings || 0,
            totalReferrals: apiData.totalReferrals || apiData.data?.totalReferrals || 0,
            thisMonthReferrals: apiData.thisMonthReferrals || apiData.data?.thisMonthReferrals || 0,
            totalCheckins: apiData.totalCheckins || apiData.data?.totalCheckins || 0,
            thisMonthCheckins: apiData.thisMonthCheckins || apiData.data?.thisMonthCheckins || 0,
            commissionRate:
              apiData.commissionRate ||
              apiData.data?.commissionRate ||
              TIER_COMMISSION_RATES['Bronze'],
          },
          campaigns: apiData.campaigns || apiData.data?.campaigns || [],
        });
      } else if (!result.data?.isLeader) {
        setData(null);
      }
    } catch (err) {
      console.error('[useLeaderDashboard] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');

      // Fallback to demo data
      if (user) {
        setData(generateDemoData(user.id));
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, isDemo]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ========================================
  // REGISTER
  // ========================================

  const register = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsRegistering(true);
      setError(null);

      // Demo mode
      if (isDemo) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newCode = generateReferralCode(user.id);
        setData({
          isLeader: true,
          referralCode: newCode,
          referralLink: generateReferralLink(newCode),
          tier: 'Bronze',
          stats: {
            tier: 'Bronze',
            totalEarnings: 0,
            thisMonthEarnings: 0,
            totalReferrals: 0,
            thisMonthReferrals: 0,
            totalCheckins: 0,
            thisMonthCheckins: 0,
            commissionRate: TIER_COMMISSION_RATES['Bronze'],
          },
          campaigns: [],
        });
        return true;
      }

      // Real API call
      const csrfToken = document.cookie
        .split(';')
        .find((c) => c.trim().startsWith('csrf_token='))
        ?.split('=')[1];

      const response = await fetch('/api/leader', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        body: JSON.stringify({ action: 'register' }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchData(); // Refresh data
        return true;
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (err) {
      console.error('[useLeaderDashboard] Register error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
      return false;
    } finally {
      setIsRegistering(false);
    }
  }, [user, isDemo, fetchData]);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // Calculate earnings breakdown
  const earnings = useMemo((): EarningsBreakdown | null => {
    if (!data) return null;

    const { stats } = data;

    // Estimated breakdown (in real app, this would come from API)
    const thisMonth = stats.thisMonthEarnings;
    const total = stats.totalEarnings;
    const lastMonth = total - thisMonth;

    return {
      today: Math.floor(thisMonth / 30), // Rough estimate
      thisWeek: Math.floor(thisMonth / 4),
      thisMonth,
      lastMonth: Math.max(0, lastMonth),
      pendingPayout: Math.floor(thisMonth * 0.8), // 80% pending
    };
  }, [data]);

  // Calculate performance metrics
  const performance = useMemo((): PerformanceMetrics | null => {
    if (!data) return null;

    const { stats, campaigns } = data;

    // Conversion rate
    const conversionRate =
      stats.totalReferrals > 0 ? Math.round((stats.totalCheckins / stats.totalReferrals) * 100) : 0;

    // Avg earnings per referral
    const avgEarningsPerReferral =
      stats.totalReferrals > 0 ? Math.floor(stats.totalEarnings / stats.totalReferrals) : 0;

    // Best performing campaign
    const sortedCampaigns = [...campaigns].sort((a, b) => b.earnings - a.earnings);
    const bestPerformingCampaign = sortedCampaigns[0] || null;

    // Trend (compare this month to estimated last month average)
    const monthlyAvg = stats.totalEarnings / Math.max(1, 3); // Assume 3 months active
    const trendPercentage =
      monthlyAvg > 0 ? Math.round(((stats.thisMonthEarnings - monthlyAvg) / monthlyAvg) * 100) : 0;

    const trend: 'up' | 'down' | 'stable' =
      trendPercentage > 5 ? 'up' : trendPercentage < -5 ? 'down' : 'stable';

    return {
      conversionRate,
      avgEarningsPerReferral,
      bestPerformingCampaign,
      trend,
      trendPercentage: Math.abs(trendPercentage),
    };
  }, [data]);

  // Calculate next tier progress
  const nextTierProgress = useMemo(() => {
    if (!data) {
      return { current: 0, target: 50, percentage: 0, nextTier: 'Silver' as LeaderTier };
    }

    const currentTier = data.tier;
    const currentIndex = TIER_ORDER.indexOf(currentTier);
    const totalReferrals = data.stats.totalReferrals;

    // Already at max tier
    if (currentIndex >= TIER_ORDER.length - 1) {
      return {
        current: totalReferrals,
        target: TIER_THRESHOLDS.Platinum,
        percentage: 100,
        nextTier: null,
      };
    }

    const nextTier = TIER_ORDER[currentIndex + 1];
    const currentThreshold = TIER_THRESHOLDS[currentTier];
    const nextThreshold = TIER_THRESHOLDS[nextTier];
    const progress = totalReferrals - currentThreshold;
    const needed = nextThreshold - currentThreshold;
    const percentage = Math.min(100, Math.round((progress / needed) * 100));

    return {
      current: totalReferrals,
      target: nextThreshold,
      percentage,
      nextTier,
    };
  }, [data]);

  return {
    data,
    earnings,
    performance,
    isLoading,
    isRegistering,
    error,
    refresh: fetchData,
    register,
    nextTierProgress,
  };
}

// ============================================================================
// DEMO DATA GENERATOR
// ============================================================================

function generateDemoData(userId: string): LeaderDashboardData {
  const referralCode = generateReferralCode(userId);

  return {
    isLeader: true,
    referralCode,
    referralLink: generateReferralLink(referralCode),
    tier: 'Silver',
    stats: {
      tier: 'Silver',
      totalEarnings: 125000,
      thisMonthEarnings: 42500,
      totalReferrals: 67,
      thisMonthReferrals: 23,
      totalCheckins: 45,
      thisMonthCheckins: 18,
      commissionRate: TIER_COMMISSION_RATES['Silver'],
    },
    campaigns: [
      {
        id: '1',
        popupId: 'popup-1',
        brandName: '성수 카페',
        title: '겨울 시즌 팝업 스토어',
        referrals: 28,
        checkins: 19,
        earnings: 22800,
        status: 'active',
      },
      {
        id: '2',
        popupId: 'popup-2',
        brandName: '뷰티 브랜드',
        title: '신제품 체험존',
        referrals: 15,
        checkins: 12,
        earnings: 14400,
        status: 'active',
      },
      {
        id: '3',
        popupId: 'popup-3',
        brandName: '패션 편집샵',
        title: '한정판 컬렉션 전시',
        referrals: 24,
        checkins: 14,
        earnings: 16800,
        status: 'completed',
      },
    ],
  };
}

export default useLeaderDashboard;
