'use client';

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react';

/**
 * User Settings Context
 *
 * Manages user preferences with IndexedDB persistence.
 * Falls back to localStorage if IndexedDB is unavailable.
 *
 * Settings:
 * - Push notifications enabled/disabled
 * - Location tracking enabled/disabled
 * - Language preference
 * - Display preferences
 */

// ============================================================================
// Types
// ============================================================================

export interface UserSettings {
  /** Push notification preferences */
  notifications: {
    enabled: boolean;
    /** Marketing notifications */
    marketing: boolean;
    /** New popup alerts */
    newPopups: boolean;
    /** Funding progress updates */
    fundingProgress: boolean;
    /** Check-in reminders */
    checkInReminders: boolean;
  };

  /** Location/GPS preferences */
  location: {
    enabled: boolean;
    /** Allow background location */
    background: boolean;
    /** High accuracy mode */
    highAccuracy: boolean;
  };

  /** Display preferences */
  display: {
    /** Reduced motion */
    reducedMotion: boolean;
    /** High contrast mode */
    highContrast: boolean;
    /** Map default zoom level */
    mapZoom: number;
  };

  /** Language preference */
  language: 'ko' | 'en' | 'ja' | 'zh';

  /** App version when settings were last saved */
  version: string;
}

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (updates: Partial<DeepPartial<UserSettings>>) => void;
  resetSettings: () => void;
  isLoading: boolean;
}

// Deep partial type for nested updates
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ============================================================================
// Default Settings
// ============================================================================

const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    enabled: true,
    marketing: false,
    newPopups: true,
    fundingProgress: true,
    checkInReminders: true,
  },
  location: {
    enabled: true,
    background: false,
    highAccuracy: true,
  },
  display: {
    reducedMotion: false,
    highContrast: false,
    mapZoom: 11,
  },
  language: 'ko',
  version: '1.0.0',
};

// ============================================================================
// Storage Helpers
// ============================================================================

const STORAGE_KEY = 'zzik-user-settings';
const DB_NAME = 'zzik-settings';
const DB_VERSION = 1;
const STORE_NAME = 'settings';

// IndexedDB helper
async function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return null;
  }

  return new Promise((resolve, _reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.warn('[Settings] IndexedDB not available');
      resolve(null);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function loadFromIndexedDB(): Promise<UserSettings | null> {
  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(STORAGE_KEY);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
}

async function saveToIndexedDB(settings: UserSettings): Promise<void> {
  const db = await openDB();
  if (!db) {
    // Fallback to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return;
  }

  return new Promise((resolve, _reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(settings, STORAGE_KEY);

    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.warn('[Settings] Failed to save to IndexedDB, using localStorage');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      resolve();
    };
  });
}

// ============================================================================
// Context
// ============================================================================

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    async function loadSettings() {
      try {
        // Try IndexedDB first
        let saved = await loadFromIndexedDB();

        // Fallback to localStorage
        if (!saved && typeof window !== 'undefined') {
          const localData = localStorage.getItem(STORAGE_KEY);
          if (localData) {
            saved = JSON.parse(localData);
          }
        }

        if (saved) {
          // Merge with defaults to handle new settings
          setSettings((prev) => deepMerge(prev, saved));
        }
      } catch (error) {
        console.error('[Settings] Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<DeepPartial<UserSettings>>) => {
    setSettings((prev) => {
      const newSettings = deepMerge(prev, updates as Partial<UserSettings>);
      // Save asynchronously
      saveToIndexedDB(newSettings).catch((error) => {
        console.error('[Settings] Failed to save settings:', error);
      });
      return newSettings;
    });
  }, []);

  // Reset settings
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveToIndexedDB(DEFAULT_SETTINGS).catch((error) => {
      console.error('[Settings] Failed to reset settings:', error);
    });
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// ============================================================================
// Helpers
// ============================================================================

function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object'
      ) {
        result[key] = deepMerge(targetValue as object, sourceValue as object) as T[Extract<
          keyof T,
          string
        >];
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

export default SettingsProvider;
