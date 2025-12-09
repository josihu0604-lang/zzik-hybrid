/**
 * Queue Management Store
 * Centralized state management for restaurant queues
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QueueEntry, RestaurantQueue, QueueUpdate } from '@/lib/realtime-queue';

interface QueueState {
  // Active queues by restaurant ID
  queues: Map<string, RestaurantQueue>;
  
  // User's active queue entries
  userEntries: Map<string, QueueEntry>;
  
  // Queue history
  history: QueueEntry[];
  
  // Actions
  setQueue: (restaurantId: string, queue: RestaurantQueue) => void;
  updateQueueEntry: (restaurantId: string, entry: QueueEntry) => void;
  removeQueueEntry: (restaurantId: string, entryId: string) => void;
  setUserEntry: (restaurantId: string, entry: QueueEntry) => void;
  removeUserEntry: (restaurantId: string) => void;
  addToHistory: (entry: QueueEntry) => void;
  clearQueue: (restaurantId: string) => void;
  clearAll: () => void;
  
  // Getters
  getQueue: (restaurantId: string) => RestaurantQueue | undefined;
  getUserEntry: (restaurantId: string) => QueueEntry | undefined;
  getQueuePosition: (restaurantId: string, userId: string) => number;
  isUserInQueue: (restaurantId: string, userId: string) => boolean;
}

export const useQueueStore = create<QueueState>()(
  persist(
    (set, get) => ({
      queues: new Map(),
      userEntries: new Map(),
      history: [],

      // Set entire queue data
      setQueue: (restaurantId, queue) => {
        set(state => {
          const newQueues = new Map(state.queues);
          newQueues.set(restaurantId, queue);
          return { queues: newQueues };
        });
      },

      // Update a single entry in queue
      updateQueueEntry: (restaurantId, entry) => {
        set(state => {
          const queue = state.queues.get(restaurantId);
          if (!queue) return state;

          const entryIndex = queue.entries.findIndex(e => e.id === entry.id);
          const updatedEntries = [...queue.entries];

          if (entryIndex !== -1) {
            updatedEntries[entryIndex] = entry;
          } else {
            updatedEntries.push(entry);
          }

          // Recalculate positions
          const waitingEntries = updatedEntries
            .filter(e => e.status === 'waiting')
            .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())
            .map((e, index) => ({ ...e, position: index + 1 }));

          const otherEntries = updatedEntries.filter(e => e.status !== 'waiting');

          const newQueues = new Map(state.queues);
          newQueues.set(restaurantId, {
            ...queue,
            entries: [...waitingEntries, ...otherEntries],
            totalWaiting: waitingEntries.length,
            lastUpdated: new Date(),
          });

          return { queues: newQueues };
        });
      },

      // Remove entry from queue
      removeQueueEntry: (restaurantId, entryId) => {
        set(state => {
          const queue = state.queues.get(restaurantId);
          if (!queue) return state;

          const updatedEntries = queue.entries.filter(e => e.id !== entryId);

          // Recalculate positions
          const waitingEntries = updatedEntries
            .filter(e => e.status === 'waiting')
            .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())
            .map((e, index) => ({ ...e, position: index + 1 }));

          const otherEntries = updatedEntries.filter(e => e.status !== 'waiting');

          const newQueues = new Map(state.queues);
          newQueues.set(restaurantId, {
            ...queue,
            entries: [...waitingEntries, ...otherEntries],
            totalWaiting: waitingEntries.length,
            lastUpdated: new Date(),
          });

          return { queues: newQueues };
        });
      },

      // Set user's entry for a restaurant
      setUserEntry: (restaurantId, entry) => {
        set(state => {
          const newUserEntries = new Map(state.userEntries);
          newUserEntries.set(restaurantId, entry);
          return { userEntries: newUserEntries };
        });
      },

      // Remove user's entry
      removeUserEntry: (restaurantId) => {
        set(state => {
          const newUserEntries = new Map(state.userEntries);
          const entry = newUserEntries.get(restaurantId);
          
          if (entry) {
            // Add to history before removing
            state.addToHistory(entry);
            newUserEntries.delete(restaurantId);
          }
          
          return { userEntries: newUserEntries };
        });
      },

      // Add to history
      addToHistory: (entry) => {
        set(state => {
          // Keep last 50 entries
          const history = [entry, ...state.history].slice(0, 50);
          return { history };
        });
      },

      // Clear specific queue
      clearQueue: (restaurantId) => {
        set(state => {
          const newQueues = new Map(state.queues);
          newQueues.delete(restaurantId);
          return { queues: newQueues };
        });
      },

      // Clear all data
      clearAll: () => {
        set({
          queues: new Map(),
          userEntries: new Map(),
          history: [],
        });
      },

      // Get queue by restaurant ID
      getQueue: (restaurantId) => {
        return get().queues.get(restaurantId);
      },

      // Get user entry for restaurant
      getUserEntry: (restaurantId) => {
        return get().userEntries.get(restaurantId);
      },

      // Get user's position in queue
      getQueuePosition: (restaurantId, userId) => {
        const queue = get().queues.get(restaurantId);
        if (!queue) return -1;

        const entry = queue.entries.find(e => e.userId === userId && e.status === 'waiting');
        return entry ? entry.position : -1;
      },

      // Check if user is in queue
      isUserInQueue: (restaurantId, userId) => {
        const queue = get().queues.get(restaurantId);
        if (!queue) return false;

        return queue.entries.some(
          e => e.userId === userId && e.status === 'waiting'
        );
      },
    }),
    {
      name: 'zzik-queue-storage',
      // Custom serialization for Map objects
      partialize: (state) => ({
        queues: Array.from(state.queues.entries()),
        userEntries: Array.from(state.userEntries.entries()),
        history: state.history,
      }),
      // Custom deserialization
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert arrays back to Maps
          state.queues = new Map(state.queues as any);
          state.userEntries = new Map(state.userEntries as any);
        }
      },
    }
  )
);

/**
 * Queue notification manager
 */
export interface QueueNotification {
  id: string;
  type: 'position_update' | 'almost_ready' | 'ready' | 'cancelled';
  title: string;
  message: string;
  restaurantId: string;
  restaurantName: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationState {
  notifications: QueueNotification[];
  unreadCount: number;
  
  addNotification: (notification: Omit<QueueNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  getUnreadNotifications: () => QueueNotification[];
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: QueueNotification = {
          ...notification,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          read: false,
        };

        set(state => ({
          notifications: [newNotification, ...state.notifications].slice(0, 100), // Keep last 100
          unreadCount: state.unreadCount + 1,
        }));

        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            tag: notification.restaurantId,
          });
        }
      },

      markAsRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      getUnreadNotifications: () => {
        return get().notifications.filter(n => !n.read);
      },
    }),
    {
      name: 'zzik-queue-notifications',
    }
  )
);
