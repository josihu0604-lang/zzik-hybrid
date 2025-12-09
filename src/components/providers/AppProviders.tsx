'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { privyConfig } from '@/lib/auth/privy-config';
import { useState, useEffect } from 'react';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
  // Simple check to avoid crashing with dummy/invalid IDs during dev/test
  const isValidAppId = appId && appId.length > 5 && !appId.includes('dummy');

  useEffect(() => {
    if (!isValidAppId) {
      // Only log once on mount
      console.warn('[AppProviders] Invalid or missing Privy App ID. Auth features disabled.');
    }
  }, [isValidAppId]);

  if (!isValidAppId) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </PrivyProvider>
  );
}
