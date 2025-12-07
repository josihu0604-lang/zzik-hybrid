/**
 * IndexedDB Utilities
 *
 * Offline-first storage for:
 * - Check-in queue
 * - Participation queue
 * - Cached popup data
 * - User preferences
 */

// ============================================
// Types
// ============================================

export interface QueuedAction {
  id: string;
  type: 'checkin' | 'participation' | 'bookmark';
  popupId: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  data: unknown;
  timestamp: number;
  retries: number;
}

export interface CachedPopup {
  id: string;
  data: unknown;
  timestamp: number;
}

// ============================================
// Database Setup
// ============================================

const DB_NAME = 'zzik-db';
const DB_VERSION = 1;

const STORES = {
  QUEUE: 'sync-queue',
  POPUPS: 'cached-popups',
  PREFERENCES: 'user-preferences',
} as const;

let dbInstance: IDBDatabase | null = null;

/**
 * Open IndexedDB connection
 */
export async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Sync queue store
      if (!db.objectStoreNames.contains(STORES.QUEUE)) {
        const queueStore = db.createObjectStore(STORES.QUEUE, { keyPath: 'id' });
        queueStore.createIndex('type', 'type', { unique: false });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Cached popups store
      if (!db.objectStoreNames.contains(STORES.POPUPS)) {
        const popupsStore = db.createObjectStore(STORES.POPUPS, { keyPath: 'id' });
        popupsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // User preferences store
      if (!db.objectStoreNames.contains(STORES.PREFERENCES)) {
        db.createObjectStore(STORES.PREFERENCES);
      }
    };
  });
}

/**
 * Close database connection
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// ============================================
// Sync Queue Operations
// ============================================

/**
 * Add action to sync queue
 */
export async function addToQueue(
  action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>
): Promise<string> {
  const db = await openDB();

  const queuedAction: QueuedAction = {
    ...action,
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    retries: 0,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.QUEUE);
    const request = store.add(queuedAction);

    request.onsuccess = () => resolve(queuedAction.id);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all queued actions
 */
export async function getQueuedActions(type?: QueuedAction['type']): Promise<QueuedAction[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.QUEUE], 'readonly');
    const store = transaction.objectStore(STORES.QUEUE);

    let request: IDBRequest;
    if (type) {
      const index = store.index('type');
      request = index.getAll(type);
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Remove action from queue
 */
export async function removeFromQueue(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.QUEUE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update action retry count
 */
export async function incrementRetry(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.QUEUE);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const action = getRequest.result;
      if (action) {
        action.retries += 1;
        const putRequest = store.put(action);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * Clear all queue items
 */
export async function clearQueue(): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.QUEUE);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ============================================
// Cached Popups Operations
// ============================================

/**
 * Cache popup data
 */
export async function cachePopup(id: string, data: unknown): Promise<void> {
  const db = await openDB();

  const cached: CachedPopup = {
    id,
    data,
    timestamp: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.POPUPS], 'readwrite');
    const store = transaction.objectStore(STORES.POPUPS);
    const request = store.put(cached);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get cached popup
 */
export async function getCachedPopup(id: string): Promise<CachedPopup | null> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.POPUPS], 'readonly');
    const store = transaction.objectStore(STORES.POPUPS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all cached popups
 */
export async function getAllCachedPopups(): Promise<CachedPopup[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.POPUPS], 'readonly');
    const store = transaction.objectStore(STORES.POPUPS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Remove old cached popups (older than 7 days)
 */
export async function cleanOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
  const db = await openDB();
  const cutoff = Date.now() - maxAge;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.POPUPS], 'readwrite');
    const store = transaction.objectStore(STORES.POPUPS);
    const index = store.index('timestamp');
    const request = index.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        if (cursor.value.timestamp < cutoff) {
          cursor.delete();
        }
        cursor.continue();
      } else {
        resolve();
      }
    };

    request.onerror = () => reject(request.error);
  });
}

// ============================================
// User Preferences Operations
// ============================================

/**
 * Save user preference
 */
export async function savePreference(key: string, value: unknown): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PREFERENCES], 'readwrite');
    const store = transaction.objectStore(STORES.PREFERENCES);
    const request = store.put(value, key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get user preference
 */
export async function getPreference<T>(key: string): Promise<T | null> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PREFERENCES], 'readonly');
    const store = transaction.objectStore(STORES.PREFERENCES);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete user preference
 */
export async function deletePreference(key: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PREFERENCES], 'readwrite');
    const store = transaction.objectStore(STORES.PREFERENCES);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ============================================
// Database Stats
// ============================================

/**
 * Get database usage statistics
 */
export async function getDBStats(): Promise<{
  queueSize: number;
  cachedPopups: number;
}> {
  const db = await openDB();

  const getCount = (storeName: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const [queueSize, cachedPopups] = await Promise.all([
    getCount(STORES.QUEUE),
    getCount(STORES.POPUPS),
  ]);

  return { queueSize, cachedPopups };
}

export default {
  openDB,
  closeDB,
  addToQueue,
  getQueuedActions,
  removeFromQueue,
  incrementRetry,
  clearQueue,
  cachePopup,
  getCachedPopup,
  getAllCachedPopups,
  cleanOldCache,
  savePreference,
  getPreference,
  deletePreference,
  getDBStats,
};
