'use client';

/**
 * QueryProvider - TanStack React Query Provider
 *
 * Provides caching, background refetching, and optimistic updates
 * for server state management throughout the application.
 *
 * Default Configuration:
 * - staleTime: 60s (data considered fresh for 1 minute)
 * - gcTime: 5min (unused data kept in cache for 5 minutes)
 * - refetchOnWindowFocus: disabled (no automatic refetch on tab focus)
 * - retry: 2 attempts on failure
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 60 seconds
            staleTime: 60 * 1000,
            // Unused data is garbage collected after 5 minutes
            gcTime: 5 * 60 * 1000,
            // Don't refetch on window focus (reduces API calls)
            refetchOnWindowFocus: false,
            // Retry failed requests 2 times
            retry: 2,
            // Use exponential backoff for retries
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Retry mutations once
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export default QueryProvider;
