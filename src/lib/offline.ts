/**
 * Offline Support
 *
 * Features:
 * - Network status detection
 * - Offline data persistence
 * - Sync queue for offline actions
 * - Cache management
 */

// ============================================
// Types
// ============================================

export interface SyncAction {
  id: string;
  type: 'participate' | 'checkin' | 'bookmark' | 'custom';
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  data?: unknown;
  timestamp: number;
  retries: number;
}

// ============================================
// Network Status
// ============================================

/**
 * Check if browser is online
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Subscribe to network status changes
 */
export function onNetworkChange(callback: (online: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// ============================================
// Offline Storage
// ============================================

const STORAGE_PREFIX = 'zzik_offline_';

/**
 * Save data for offline use
 */
export function saveOfflineData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      STORAGE_PREFIX + key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch {
    // Silent fail - offline storage errors are not critical
  }
}

/**
 * Get offline data
 */
export function getOfflineData<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (!stored) return null;

    const { data } = JSON.parse(stored);
    return data as T;
  } catch {
    return null;
  }
}

/**
 * Remove offline data
 */
export function removeOfflineData(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_PREFIX + key);
}

/**
 * Clear all offline data
 */
export function clearOfflineData(): void {
  if (typeof window === 'undefined') return;

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

// ============================================
// Sync Queue
// ============================================

const SYNC_QUEUE_KEY = 'sync_queue';
const MAX_RETRIES = 3;

/**
 * Get sync queue
 */
export function getSyncQueue(): SyncAction[] {
  return getOfflineData<SyncAction[]>(SYNC_QUEUE_KEY) || [];
}

/**
 * Add action to sync queue
 */
export function addToSyncQueue(action: Omit<SyncAction, 'id' | 'timestamp' | 'retries'>): void {
  const queue = getSyncQueue();

  const newAction: SyncAction = {
    ...action,
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    retries: 0,
  };

  queue.push(newAction);
  saveOfflineData(SYNC_QUEUE_KEY, queue);

  // Try to sync if online
  if (isOnline()) {
    processSyncQueue();
  }
}

/**
 * Remove action from sync queue
 */
export function removeFromSyncQueue(id: string): void {
  const queue = getSyncQueue();
  const filtered = queue.filter((action) => action.id !== id);
  saveOfflineData(SYNC_QUEUE_KEY, filtered);
}

/**
 * Process sync queue
 */
export async function processSyncQueue(): Promise<void> {
  if (!isOnline()) return;

  const queue = getSyncQueue();
  if (queue.length === 0) return;

  for (const action of queue) {
    try {
      const response = await fetch(action.endpoint, {
        method: action.method,
        headers: { 'Content-Type': 'application/json' },
        body: action.data ? JSON.stringify(action.data) : undefined,
      });

      if (response.ok) {
        removeFromSyncQueue(action.id);
      } else if (action.retries < MAX_RETRIES) {
        // Increment retry count
        const updated = getSyncQueue().map((a) =>
          a.id === action.id ? { ...a, retries: a.retries + 1 } : a
        );
        saveOfflineData(SYNC_QUEUE_KEY, updated);
      } else {
        // Max retries reached, remove silently
        removeFromSyncQueue(action.id);
      }
    } catch {
      // Will retry on next sync - network error
    }
  }
}

// ============================================
// Auto-sync on reconnect
// ============================================

let syncCleanup: (() => void) | null = null;

/**
 * Initialize auto-sync
 */
export function initAutoSync(): () => void {
  if (typeof window === 'undefined') return () => {};

  if (syncCleanup) {
    syncCleanup();
  }

  syncCleanup = onNetworkChange((online) => {
    if (online) {
      processSyncQueue();
    }
  });

  // Initial sync if online
  if (isOnline()) {
    processSyncQueue();
  }

  return () => {
    if (syncCleanup) {
      syncCleanup();
      syncCleanup = null;
    }
  };
}

// ============================================
// Service Worker Cache
// ============================================

/**
 * Clear service worker cache
 */
export async function clearServiceWorkerCache(): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    return true;
  } catch {
    return false;
  }
}

/**
 * Get cache storage usage
 */
export async function getCacheStorageUsage(): Promise<{
  usage: number;
  quota: number;
  percentage: number;
} | null> {
  if (typeof navigator === 'undefined' || !('storage' in navigator)) return null;

  try {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      percentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0,
    };
  } catch {
    return null;
  }
}

// ============================================
// Offline-First Data Fetcher
// ============================================

interface OfflineFetchOptions {
  cacheKey: string;
  cacheTTL?: number; // ms
  forceRefresh?: boolean;
}

/**
 * Fetch with offline fallback
 */
export async function offlineFetch<T>(
  url: string,
  options: OfflineFetchOptions
): Promise<{ data: T; fromCache: boolean }> {
  const { cacheKey, cacheTTL = 5 * 60 * 1000, forceRefresh = false } = options;

  // Try cache first (if not forcing refresh and offline)
  if (!forceRefresh && !isOnline()) {
    const cached = getOfflineData<{ data: T; timestamp: number }>(cacheKey);
    if (cached) {
      return { data: cached.data, fromCache: true };
    }
    throw new Error('No cached data available offline');
  }

  // Try network
  if (isOnline()) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      // Save to cache
      saveOfflineData(cacheKey, { data, timestamp: Date.now() });

      return { data, fromCache: false };
    } catch (error) {
      // Fall back to cache on error
      const cached = getOfflineData<{ data: T; timestamp: number }>(cacheKey);
      if (cached) {
        const isExpired = Date.now() - cached.timestamp > cacheTTL;
        if (!isExpired) {
          return { data: cached.data, fromCache: true };
        }
      }
      throw error;
    }
  }

  // Offline and no cache
  const cached = getOfflineData<{ data: T; timestamp: number }>(cacheKey);
  if (cached) {
    return { data: cached.data, fromCache: true };
  }

  throw new Error('No network connection and no cached data');
}

export default {
  isOnline,
  onNetworkChange,
  saveOfflineData,
  getOfflineData,
  removeOfflineData,
  clearOfflineData,
  getSyncQueue,
  addToSyncQueue,
  removeFromSyncQueue,
  processSyncQueue,
  initAutoSync,
  clearServiceWorkerCache,
  getCacheStorageUsage,
  offlineFetch,
};
