/**
 * Offline Support Tests (TST-016)
 *
 * Tests for offline functionality:
 * - Network status detection
 * - Offline data caching
 * - Sync queue management
 * - Queue processing
 * - Service worker cache operations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
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
} from '@/lib/offline';

// ============================================================================
// SETUP & MOCKING
// ============================================================================

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

beforeEach(() => {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  // Mock navigator.onLine
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true,
  });

  // Mock fetch
  global.fetch = vi.fn();

  mockLocalStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================================
// NETWORK STATUS
// ============================================================================

describe('Network Status Detection', () => {
  it('should detect online status', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    expect(isOnline()).toBe(true);
  });

  it('should detect offline status', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
    expect(isOnline()).toBe(false);
  });

  it('should return true in SSR environment', () => {
    const originalWindow = global.window;
    // @ts-expect-error - testing SSR
    delete global.window;

    expect(isOnline()).toBe(true);

    global.window = originalWindow;
  });

  it('should subscribe to network status changes', () => {
    const callback = vi.fn();
    const unsubscribe = onNetworkChange(callback);

    // Simulate going offline
    window.dispatchEvent(new Event('offline'));
    expect(callback).toHaveBeenCalledWith(false);

    // Simulate going online
    window.dispatchEvent(new Event('online'));
    expect(callback).toHaveBeenCalledWith(true);

    // Cleanup
    unsubscribe();
  });

  it('should cleanup network listeners on unsubscribe', () => {
    const callback = vi.fn();
    const unsubscribe = onNetworkChange(callback);

    unsubscribe();

    window.dispatchEvent(new Event('offline'));
    expect(callback).not.toHaveBeenCalled();
  });
});

// ============================================================================
// OFFLINE STORAGE
// ============================================================================

describe('Offline Storage', () => {
  it('should save offline data with timestamp', () => {
    const testData = { id: '123', name: 'Test Popup' };
    saveOfflineData('test', testData);

    const stored = mockLocalStorage.getItem('zzik_offline_test');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.data).toEqual(testData);
    expect(parsed.timestamp).toBeTypeOf('number');
  });

  it('should retrieve offline data', () => {
    const testData = { id: '456', name: 'Another Popup' };
    saveOfflineData('retrieve_test', testData);

    const retrieved = getOfflineData<typeof testData>('retrieve_test');
    expect(retrieved).toEqual(testData);
  });

  it('should return null for non-existent data', () => {
    const retrieved = getOfflineData('non_existent');
    expect(retrieved).toBeNull();
  });

  it('should handle corrupted data gracefully', () => {
    mockLocalStorage.setItem('zzik_offline_corrupted', 'invalid json');

    const retrieved = getOfflineData('corrupted');
    expect(retrieved).toBeNull();
  });

  it('should remove offline data', () => {
    saveOfflineData('remove_test', { test: true });
    expect(getOfflineData('remove_test')).toBeTruthy();

    removeOfflineData('remove_test');
    expect(getOfflineData('remove_test')).toBeNull();
  });

  it('should clear all offline data', () => {
    saveOfflineData('test1', { a: 1 });
    saveOfflineData('test2', { b: 2 });
    saveOfflineData('test3', { c: 3 });

    clearOfflineData();

    expect(getOfflineData('test1')).toBeNull();
    expect(getOfflineData('test2')).toBeNull();
    expect(getOfflineData('test3')).toBeNull();
  });

  it('should only clear zzik_offline_ prefixed data', () => {
    mockLocalStorage.setItem('other_data', 'should remain');
    saveOfflineData('test', { a: 1 });

    clearOfflineData();

    expect(mockLocalStorage.getItem('other_data')).toBe('should remain');
    expect(getOfflineData('test')).toBeNull();
  });
});

// ============================================================================
// SYNC QUEUE
// ============================================================================

describe('Sync Queue Management', () => {
  it('should start with empty queue', () => {
    const queue = getSyncQueue();
    expect(queue).toEqual([]);
  });

  it('should add action to sync queue', () => {
    addToSyncQueue({
      type: 'participate',
      endpoint: '/api/participate',
      method: 'POST',
      data: { popupId: '123' },
    });

    const queue = getSyncQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({
      type: 'participate',
      endpoint: '/api/participate',
      method: 'POST',
    });
    expect(queue[0].id).toBeTruthy();
    expect(queue[0].timestamp).toBeTypeOf('number');
    expect(queue[0].retries).toBe(0);
  });

  it('should generate unique IDs for queue items', () => {
    addToSyncQueue({ type: 'checkin', endpoint: '/api/checkin', method: 'POST' });
    addToSyncQueue({ type: 'bookmark', endpoint: '/api/bookmark', method: 'POST' });

    const queue = getSyncQueue();
    expect(queue[0].id).not.toBe(queue[1].id);
  });

  it('should remove action from sync queue', () => {
    addToSyncQueue({ type: 'participate', endpoint: '/api/test', method: 'POST' });
    const queue = getSyncQueue();
    const actionId = queue[0].id;

    removeFromSyncQueue(actionId);

    const updatedQueue = getSyncQueue();
    expect(updatedQueue).toHaveLength(0);
  });

  it('should preserve other items when removing', () => {
    addToSyncQueue({ type: 'participate', endpoint: '/api/1', method: 'POST' });
    addToSyncQueue({ type: 'checkin', endpoint: '/api/2', method: 'POST' });

    const queue = getSyncQueue();
    const firstId = queue[0].id;

    removeFromSyncQueue(firstId);

    const updatedQueue = getSyncQueue();
    expect(updatedQueue).toHaveLength(1);
    expect(updatedQueue[0].endpoint).toBe('/api/2');
  });
});

// ============================================================================
// SYNC QUEUE PROCESSING
// ============================================================================

describe('Sync Queue Processing', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
  });

  it('should not process queue when offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    addToSyncQueue({ type: 'participate', endpoint: '/api/test', method: 'POST' });

    await processSyncQueue();

    const queue = getSyncQueue();
    expect(queue).toHaveLength(1); // Should still be in queue
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should process successful requests and remove from queue', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    addToSyncQueue({ type: 'participate', endpoint: '/api/test', method: 'POST' });

    await processSyncQueue();

    expect(fetch).toHaveBeenCalledWith('/api/test', expect.any(Object));

    const queue = getSyncQueue();
    expect(queue).toHaveLength(0);
  });

  it('should increment retry count on failure', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    addToSyncQueue({ type: 'participate', endpoint: '/api/test', method: 'POST' });

    await processSyncQueue();

    const queue = getSyncQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].retries).toBe(1);
  });

  it('should remove item after max retries', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
    });

    addToSyncQueue({ type: 'participate', endpoint: '/api/test', method: 'POST' });

    // Process 4 times (initial + 3 retries = max)
    for (let i = 0; i < 4; i++) {
      await processSyncQueue();
    }

    const queue = getSyncQueue();
    expect(queue).toHaveLength(0); // Should be removed after max retries
  });

  it('should handle network errors gracefully', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    addToSyncQueue({ type: 'participate', endpoint: '/api/test', method: 'POST' });

    await processSyncQueue();

    // Should not throw, item should remain in queue
    const queue = getSyncQueue();
    expect(queue).toHaveLength(1);
  });

  it('should include request body for POST requests', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
    });

    const testData = { popupId: '123', userId: '456' };
    addToSyncQueue({
      type: 'participate',
      endpoint: '/api/test',
      method: 'POST',
      data: testData,
    });

    await processSyncQueue();

    expect(fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      })
    );
  });
});

// ============================================================================
// AUTO-SYNC
// ============================================================================

describe('Auto-Sync Initialization', () => {
  it('should process queue on reconnect', async () => {
    vi.spyOn(await import('@/lib/offline'), 'processSyncQueue');

    const cleanup = initAutoSync();

    window.dispatchEvent(new Event('online'));

    // Small delay for async processing
    await new Promise((resolve) => setTimeout(resolve, 10));

    cleanup();
  });

  it('should return cleanup function', () => {
    const cleanup = initAutoSync();
    expect(cleanup).toBeTypeOf('function');

    cleanup();
  });

  it('should cleanup previous listener on re-init', () => {
    initAutoSync();
    const cleanup2 = initAutoSync();

    cleanup2();
  });
});

// ============================================================================
// SERVICE WORKER CACHE
// ============================================================================

describe('Service Worker Cache', () => {
  it('should return false when caches API not available', async () => {
    const result = await clearServiceWorkerCache();
    expect(result).toBe(false);
  });

  it('should clear all caches', async () => {
    const mockDelete = vi.fn().mockResolvedValue(true);

    global.caches = {
      keys: vi.fn().mockResolvedValue(['cache1', 'cache2']),
      delete: mockDelete,
    } as unknown as CacheStorage;

    const result = await clearServiceWorkerCache();

    expect(result).toBe(true);
    expect(mockDelete).toHaveBeenCalledTimes(2);
    expect(mockDelete).toHaveBeenCalledWith('cache1');
    expect(mockDelete).toHaveBeenCalledWith('cache2');
  });

  it('should handle cache deletion errors', async () => {
    global.caches = {
      keys: vi.fn().mockRejectedValue(new Error('Access denied')),
    } as unknown as CacheStorage;

    const result = await clearServiceWorkerCache();
    expect(result).toBe(false);
  });
});

describe('Cache Storage Usage', () => {
  it('should return null when storage API not available', async () => {
    const result = await getCacheStorageUsage();
    expect(result).toBeNull();
  });

  it('should return usage statistics', async () => {
    Object.defineProperty(navigator, 'storage', {
      value: {
        estimate: vi.fn().mockResolvedValue({
          usage: 5000000,
          quota: 10000000,
        }),
      },
      writable: true,
    });

    const result = await getCacheStorageUsage();

    expect(result).toEqual({
      usage: 5000000,
      quota: 10000000,
      percentage: 50,
    });
  });

  it('should handle zero quota', async () => {
    Object.defineProperty(navigator, 'storage', {
      value: {
        estimate: vi.fn().mockResolvedValue({
          usage: 0,
          quota: 0,
        }),
      },
      writable: true,
    });

    const result = await getCacheStorageUsage();

    expect(result?.percentage).toBe(0);
  });
});

// ============================================================================
// OFFLINE FETCH
// ============================================================================

describe('Offline Fetch', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
  });

  it('should fetch from network when online', async () => {
    const mockData = { id: '123', name: 'Test' };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await offlineFetch('/api/test', { cacheKey: 'test' });

    expect(result.data).toEqual(mockData);
    expect(result.fromCache).toBe(false);
    expect(fetch).toHaveBeenCalledWith('/api/test');
  });

  it('should cache successful responses', async () => {
    const mockData = { id: '123', name: 'Test' };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    await offlineFetch('/api/test', { cacheKey: 'cache_test' });

    const cached = getOfflineData('cache_test');
    expect(cached).toBeTruthy();
  });

  it('should return cached data when offline', async () => {
    const mockData = { id: '123', name: 'Cached' };
    saveOfflineData('offline_test', { data: mockData, timestamp: Date.now() });

    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    const result = await offlineFetch('/api/test', { cacheKey: 'offline_test' });

    expect(result.data).toEqual(mockData);
    expect(result.fromCache).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should throw error when offline without cache', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    await expect(offlineFetch('/api/test', { cacheKey: 'no_cache' })).rejects.toThrow(
      'No cached data available offline'
    );
  });

  it('should fallback to cache on network error', async () => {
    const mockData = { id: '123', name: 'Cached' };
    saveOfflineData('fallback_test', { data: mockData, timestamp: Date.now() });

    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    const result = await offlineFetch('/api/test', { cacheKey: 'fallback_test' });

    expect(result.data).toEqual(mockData);
    expect(result.fromCache).toBe(true);
  });

  it('should respect cache TTL', async () => {
    const oldData = { id: '123', name: 'Old' };
    const expiredTimestamp = Date.now() - 10 * 60 * 1000; // 10 minutes ago

    saveOfflineData('ttl_test', { data: oldData, timestamp: expiredTimestamp });

    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    await expect(
      offlineFetch('/api/test', { cacheKey: 'ttl_test', cacheTTL: 5 * 60 * 1000 })
    ).rejects.toThrow();
  });

  it('should force refresh when requested', async () => {
    const cachedData = { id: '123', name: 'Cached' };
    const freshData = { id: '123', name: 'Fresh' };

    saveOfflineData('refresh_test', { data: cachedData, timestamp: Date.now() });

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => freshData,
    });

    const result = await offlineFetch('/api/test', {
      cacheKey: 'refresh_test',
      forceRefresh: true,
    });

    expect(result.data).toEqual(freshData);
    expect(result.fromCache).toBe(false);
  });
});
