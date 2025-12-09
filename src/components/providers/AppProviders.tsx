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
    if (!isValidAppId && process.env.NODE_ENV === 'development') {
      // Only log in development mode - guest mode is normal for initial setup
      console.info('[AppProviders] Running in guest mode - Privy auth not configured');
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
