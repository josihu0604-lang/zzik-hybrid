/**
 * AI Recommendations Hook
 *
 * Fetches personalized popup recommendations using AI
 * PERF-001: Fixed useCallback/useEffect dependency pattern to prevent infinite re-fetch
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { RecommendationResult } from '@/lib/ai/types';
import { logger } from '@/lib/logger';

interface UseAIRecommendationsOptions {
  userId?: string;
  strategy?: 'hybrid' | 'collaborative' | 'content' | 'popular' | 'trending';
  limit?: number;
  enabled?: boolean;
  demoMode?: boolean;
}

interface UseAIRecommendationsReturn {
  recommendations: RecommendationResult[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAIRecommendations(
  options: UseAIRecommendationsOptions = {}
): UseAIRecommendationsReturn {
  const {
    userId = 'guest',
    strategy = 'hybrid',
    limit = 10,
    enabled = true,
    demoMode = false,
  } = options;

  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // PERF-001: Track mounted state to prevent state updates after unmount
  const isMountedRef = useRef(true);

  // PERF-001: Memoize fetch function with stable dependencies
  const fetchRecommendations = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        userId,
        strategy,
        limit: limit.toString(),
        demo: demoMode.toString(),
      });

      const response = await fetch(`/api/ai/recommendations?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch recommendations');
      }

      // Only update state if still mounted
      if (isMountedRef.current) {
        setRecommendations(json.data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
      logger.error(
        'useAIRecommendations error',
        err instanceof Error ? err : new Error(String(err))
      );
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [userId, strategy, limit, enabled, demoMode]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchRecommendations();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    refetch: fetchRecommendations,
  };
}
