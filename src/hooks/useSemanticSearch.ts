/**
 * Semantic Search Hook
 *
 * Natural language search with debouncing
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SemanticSearchResult } from '@/lib/ai/types';

interface UseSemanticSearchOptions {
  userId?: string;
  limit?: number;
  debounceMs?: number;
  enabled?: boolean;
  filters?: {
    categories?: string[];
    locations?: string[];
    status?: string[];
  };
}

interface UseSemanticSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SemanticSearchResult[];
  isSearching: boolean;
  error: Error | null;
  search: (q: string) => Promise<void>;
  clear: () => void;
}

export function useSemanticSearch(options: UseSemanticSearchOptions = {}): UseSemanticSearchReturn {
  const { userId, limit = 10, debounceMs = 300, enabled = true, filters } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!enabled || !searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: searchQuery.trim(),
          limit: limit.toString(),
        });

        if (userId) params.set('userId', userId);
        if (filters?.categories) params.set('categories', filters.categories.join(','));
        if (filters?.locations) params.set('locations', filters.locations.join(','));
        if (filters?.status) params.set('status', filters.status.join(','));

        const response = await fetch(`/api/ai/search?${params}`);

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const json = await response.json();

        if (!json.success) {
          throw new Error(json.error || 'Search failed');
        }

        setResults(json.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('[useSemanticSearch] Error:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [userId, limit, enabled, filters]
  );

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs, performSearch]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    search: performSearch,
    clear,
  };
}
