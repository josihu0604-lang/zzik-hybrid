'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  isOnline as checkOnline,
  onNetworkChange,
  initAutoSync,
  getSyncQueue,
  addToSyncQueue,
  processSyncQueue,
  type SyncAction,
} from '@/lib/offline';

/**
 * useOnlineStatus - Track network status
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // Set initial value
    setOnline(checkOnline());

    // Subscribe to changes
    return onNetworkChange(setOnline);
  }, []);

  return online;
}

/**
 * useOfflineSync - Manage offline sync queue
 */
interface UseOfflineSyncReturn {
  /** Current online status */
  isOnline: boolean;
  /** Pending sync actions */
  pendingActions: SyncAction[];
  /** Number of pending actions */
  pendingCount: number;
  /** Add action to sync queue */
  queueAction: (action: Omit<SyncAction, 'id' | 'timestamp' | 'retries'>) => void;
  /** Manually trigger sync */
  sync: () => Promise<void>;
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const isOnline = useOnlineStatus();
  const [pendingActions, setPendingActions] = useState<SyncAction[]>([]);

  // Initialize auto-sync
  useEffect(() => {
    const cleanup = initAutoSync();
    return cleanup;
  }, []);

  // Update pending actions
  useEffect(() => {
    const updateQueue = () => {
      setPendingActions(getSyncQueue());
    };

    updateQueue();

    // Poll for updates
    const interval = setInterval(updateQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const queueAction = useCallback((action: Omit<SyncAction, 'id' | 'timestamp' | 'retries'>) => {
    addToSyncQueue(action);
    setPendingActions(getSyncQueue());
  }, []);

  const sync = useCallback(async () => {
    await processSyncQueue();
    setPendingActions(getSyncQueue());
  }, []);

  return {
    isOnline,
    pendingActions,
    pendingCount: pendingActions.length,
    queueAction,
    sync,
  };
}

/**
 * useOfflineData - Persist data for offline access
 */
interface UseOfflineDataOptions<T> {
  key: string;
  initialData?: T;
}

interface UseOfflineDataReturn<T> {
  data: T | null;
  setData: (data: T) => void;
  clearData: () => void;
  isHydrated: boolean;
}

export function useOfflineData<T>({
  key,
  initialData,
}: UseOfflineDataOptions<T>): UseOfflineDataReturn<T> {
  const [data, setDataState] = useState<T | null>(initialData ?? null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(`zzik_offline_${key}`);
      if (stored) {
        const { data: storedData } = JSON.parse(stored);
        setDataState(storedData);
      }
    } catch {
      // Ignore parse errors - localStorage data may be corrupted
    }

    setIsHydrated(true);
  }, [key]);

  // Save to storage
  const setData = useCallback(
    (newData: T) => {
      setDataState(newData);

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `zzik_offline_${key}`,
          JSON.stringify({ data: newData, timestamp: Date.now() })
        );
      }
    },
    [key]
  );

  // Clear from storage
  const clearData = useCallback(() => {
    setDataState(initialData ?? null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(`zzik_offline_${key}`);
    }
  }, [key, initialData]);

  return { data, setData, clearData, isHydrated };
}

export default useOnlineStatus;
