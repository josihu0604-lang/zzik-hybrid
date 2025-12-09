/**
 * Offline Sync Hook
 *
 * Manages offline queue and automatic synchronization
 */

import { useEffect, useCallback, useState } from 'react';
import { logger } from '@/lib/logger';
import { isOnline, onNetworkChange } from '@/lib/offline';
import {
  addToQueue,
  getQueuedActions,
  removeFromQueue,
  incrementRetry,
  type QueuedAction,
} from '@/lib/indexed-db';

const MAX_RETRIES = 3;

export interface OfflineSyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  queueSize: number;
  lastSyncTime: Date | null;
}

export function useOfflineSync() {
  const [status, setStatus] = useState<OfflineSyncStatus>({
    isOnline: isOnline(),
    isSyncing: false,
    queueSize: 0,
    lastSyncTime: null,
  });

  /**
   * Sync queued actions with server
   */
  const syncQueue = useCallback(async () => {
    if (!isOnline()) {
      logger.debug('[Offline Sync] Cannot sync - offline');
      return;
    }

    setStatus((prev) => ({ ...prev, isSyncing: true }));

    try {
      const actions = await getQueuedActions();
      logger.debug('[Offline Sync] Syncing actions', { count: actions.length });

      for (const action of actions) {
        try {
          const response = await fetch(action.endpoint, {
            method: action.method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: action.data ? JSON.stringify(action.data) : undefined,
          });

          if (response.ok) {
            // Success - remove from queue
            await removeFromQueue(action.id);
            logger.debug('[Offline Sync] Action synced', { type: action.type, id: action.id });
          } else {
            // HTTP error - retry or remove
            if (action.retries < MAX_RETRIES) {
              await incrementRetry(action.id);
              logger.debug('[Offline Sync] Retry scheduled', {
                retry: action.retries + 1,
                id: action.id,
              });
            } else {
              await removeFromQueue(action.id);
              logger.error('[Offline Sync] Max retries reached', { id: action.id });
            }
          }
        } catch (error) {
          // Network error - keep in queue for next sync
          logger.error('[Offline Sync] Network error', { id: action.id, error });
        }
      }

      // Update queue size
      const remainingActions = await getQueuedActions();
      setStatus((prev) => ({
        ...prev,
        queueSize: remainingActions.length,
        lastSyncTime: new Date(),
      }));
    } catch (error) {
      console.error('[Offline Sync] Sync failed:', error);
    } finally {
      setStatus((prev) => ({ ...prev, isSyncing: false }));
    }
  }, []);

  /**
   * Queue an action for offline sync
   */
  const queueAction = useCallback(
    async (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>) => {
      try {
        const actionId = await addToQueue(action);
        logger.debug('[Offline Sync] Action queued', { type: action.type, id: actionId });

        // Update queue size
        const actions = await getQueuedActions();
        setStatus((prev) => ({ ...prev, queueSize: actions.length }));

        // Try immediate sync if online
        if (isOnline()) {
          await syncQueue();
        }

        return actionId;
      } catch (error) {
        logger.error('[Offline Sync] Failed to queue action', { error });
        throw error;
      }
    },
    [syncQueue]
  );

  /**
   * Force sync now
   */
  const forceSync = useCallback(async () => {
    await syncQueue();
  }, [syncQueue]);

  /**
   * Initialize sync on mount and network changes
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Initial queue size
    getQueuedActions().then((actions) => {
      setStatus((prev) => ({ ...prev, queueSize: actions.length }));
    });

    // Listen to network status
    const cleanup = onNetworkChange((online) => {
      setStatus((prev) => ({ ...prev, isOnline: online }));

      if (online) {
        logger.debug('[Offline Sync] Network restored - syncing queue');
        syncQueue();
      }
    });

    // Initial sync if online
    if (isOnline()) {
      syncQueue();
    }

    return cleanup;
  }, [syncQueue]);

  return {
    status,
    queueAction,
    forceSync,
  };
}
