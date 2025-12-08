'use client';

import { useState, useCallback, useEffect } from 'react';
import type { UserBadges, Badge, EarnedBadge } from '@/lib/badges';

/**
 * useBadges Hook
 *
 * Manages user badge state and fetching.
 *
 * @example
 * ```tsx
 * const { badges, isLoading, error, refetch } = useBadges();
 *
 * if (isLoading) return <Skeleton />;
 * if (error) return <Error message={error} />;
 *
 * return <BadgeGrid userBadges={badges} />;
 * ```
 */

interface BadgesStats {
  totalEarned: number;
  totalPoints: number;
  participationCount: number;
  checkinCount: number;
  perfectCheckinCount: number;
}

interface BadgesResponse {
  badges: UserBadges;
  stats: BadgesStats;
  demo?: boolean;
}

interface UseBadgesOptions {
  /** Auto-fetch on mount */
  autoFetch?: boolean;
  /** Callback when new badge is earned */
  onBadgeEarned?: (badge: EarnedBadge) => void;
}

interface UseBadgesReturn {
  badges: UserBadges | null;
  stats: BadgesStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  /** Check if a specific badge is earned */
  isBadgeEarned: (badgeId: string) => boolean;
  /** Get progress for a specific badge */
  getBadgeProgress: (badgeId: string) => number;
  /** Get a specific badge */
  getBadge: (badgeId: string) => Badge | EarnedBadge | undefined;
}

export function useBadges(options: UseBadgesOptions = {}): UseBadgesReturn {
  const { autoFetch = true, onBadgeEarned } = options;

  const [badges, setBadges] = useState<UserBadges | null>(null);
  const [stats, setStats] = useState<BadgesStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousEarnedIds, setPreviousEarnedIds] = useState<Set<string>>(new Set());

  const fetchBadges = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/badges');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch badges');
      }

      const badgesData = data.data as BadgesResponse;
      setBadges(badgesData.badges);
      setStats(badgesData.stats);

      // Check for newly earned badges
      if (onBadgeEarned && previousEarnedIds.size > 0) {
        for (const badge of badgesData.badges.earned) {
          if (!previousEarnedIds.has(badge.id)) {
            onBadgeEarned(badge);
          }
        }
      }

      // Update previous earned IDs
      setPreviousEarnedIds(new Set(badgesData.badges.earned.map((b) => b.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [onBadgeEarned, previousEarnedIds]);

  // Auto-fetch on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (autoFetch) {
      fetchBadges();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  const isBadgeEarned = useCallback(
    (badgeId: string): boolean => {
      if (!badges) return false;
      return badges.earned.some((b) => b.id === badgeId);
    },
    [badges]
  );

  const getBadgeProgress = useCallback(
    (badgeId: string): number => {
      if (!badges) return 0;

      // Check if earned
      const earned = badges.earned.find((b) => b.id === badgeId);
      if (earned) return 100;

      // Check in progress
      const inProgress = badges.inProgress.find((b) => b.id === badgeId);
      if (inProgress) return inProgress.progress;

      return 0;
    },
    [badges]
  );

  const getBadge = useCallback(
    (badgeId: string): Badge | EarnedBadge | undefined => {
      if (!badges) return undefined;

      return (
        badges.earned.find((b) => b.id === badgeId) ||
        badges.inProgress.find((b) => b.id === badgeId) ||
        badges.locked.find((b) => b.id === badgeId)
      );
    },
    [badges]
  );

  return {
    badges,
    stats,
    isLoading,
    error,
    refetch: fetchBadges,
    isBadgeEarned,
    getBadgeProgress,
    getBadge,
  };
}

/**
 * useBadgeNotification - Show notification when badge is earned
 */
export function useBadgeNotification() {
  const [newBadge, setNewBadge] = useState<EarnedBadge | null>(null);

  const showBadgeNotification = useCallback((badge: EarnedBadge) => {
    setNewBadge(badge);
    // Auto-hide after 5 seconds
    setTimeout(() => setNewBadge(null), 5000);
  }, []);

  const dismissNotification = useCallback(() => {
    setNewBadge(null);
  }, []);

  return {
    newBadge,
    showBadgeNotification,
    dismissNotification,
  };
}

export default useBadges;
