'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * useRealtimeSubscription - Generic Supabase Realtime subscription hook
 *
 * Extracts common realtime subscription logic to avoid duplication.
 * Supports both INSERT and UPDATE events with fallback to demo mode.
 */

export interface RealtimeSubscriptionOptions<T> {
  /** Supabase table name */
  table: string;
  /** Event type to listen to */
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  /** Filter expression (e.g., 'popup_id=eq.123') */
  filter?: string;
  /** Callback when new data is received */
  onData: (payload: T) => void;
  /** Enable/disable subscription */
  enabled?: boolean;
  /** Demo mode callback (runs periodically when Supabase unavailable) */
  onDemoTick?: () => void;
  /** Demo tick interval in ms (default: 5000) */
  demoTickInterval?: number;
}

export interface RealtimeSubscriptionState {
  /** Whether connected to Supabase Realtime */
  isConnected: boolean;
  /** Whether in demo/mock mode */
  isDemo: boolean;
  /** Connection error if any */
  error: string | null;
}

export function useRealtimeSubscription<T = unknown>(
  channelName: string,
  options: RealtimeSubscriptionOptions<T>
): RealtimeSubscriptionState {
  const {
    table,
    event,
    filter,
    onData,
    enabled = true,
    onDemoTick,
    demoTickInterval = 5000,
  } = options;

  const [state, setState] = useState<RealtimeSubscriptionState>({
    isConnected: false,
    isDemo: false,
    error: null,
  });

  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Check if Supabase is configured
  const isSupabaseConfigured = useCallback(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return !!(url && key && !url.includes('placeholder'));
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Try Supabase Realtime
    if (isSupabaseConfigured()) {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        supabaseRef.current = supabase;

        // Build channel with postgres_changes subscription
        // Using type assertion due to Supabase overload complexity
        const channelBuilder = supabase.channel(channelName);

        // Subscribe to postgres changes with dynamic config
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const channel = (channelBuilder as any)
          .on(
            'postgres_changes',
            {
              event,
              schema: 'public',
              table,
              ...(filter ? { filter } : {}),
            },
            (payload: { new: Record<string, unknown> }) => {
              onData(payload.new as T);
            }
          )
          .subscribe((status: string) => {
            setState((prev) => ({
              ...prev,
              isConnected: status === 'SUBSCRIBED',
              isDemo: false,
              error: status === 'CHANNEL_ERROR' ? 'Failed to connect to realtime' : null,
            }));
          });

        channelRef.current = channel;

        return () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error('Supabase Realtime error:', error);
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Realtime connection failed',
        }));
        // Fall through to mock mode
      }
    }

    // Mock mode for demo
    setState((prev) => ({
      ...prev,
      isDemo: true,
      isConnected: true,
      error: null,
    }));

    if (!onDemoTick) return;

    // Demo: Trigger callback periodically
    const interval = setInterval(() => {
      onDemoTick();
    }, demoTickInterval);

    return () => {
      clearInterval(interval);
    };
  }, [
    enabled,
    channelName,
    table,
    event,
    filter,
    onData,
    onDemoTick,
    demoTickInterval,
    isSupabaseConfigured,
  ]);

  return state;
}

export default useRealtimeSubscription;
