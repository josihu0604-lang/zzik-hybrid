/**
 * Real-time Queue Management System
 * Provides WebSocket/SSE infrastructure for live queue updates
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// Queue entry types
export interface QueueEntry {
  id: string;
  restaurantId: string;
  userId: string;
  userName: string;
  partySize: number;
  position: number;
  estimatedWaitMinutes: number;
  joinedAt: Date;
  status: 'waiting' | 'called' | 'seated' | 'cancelled' | 'expired';
  notified: boolean;
  estimatedSeatingTime?: Date;
}

export interface QueueUpdate {
  type: 'position_change' | 'status_change' | 'time_update' | 'queue_joined' | 'queue_left';
  entry: QueueEntry;
  previousPosition?: number;
  timestamp: Date;
}

export interface RestaurantQueue {
  restaurantId: string;
  restaurantName: string;
  totalWaiting: number;
  averageWaitMinutes: number;
  entries: QueueEntry[];
  lastUpdated: Date;
}

// Real-time connection configuration
export interface RealtimeConfig {
  url?: string;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  maxReconnectAttempts?: number;
}

// SSE Event types
type SSEEventType = 'queue_update' | 'heartbeat' | 'error' | 'connected';

interface SSEMessage {
  event: SSEEventType;
  data: any;
  timestamp: string;
}

/**
 * Server-Sent Events (SSE) connection manager
 * Provides lightweight real-time updates with automatic reconnection
 */
export class QueueRealtimeConnection {
  private eventSource: EventSource | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  
  private config: Required<RealtimeConfig>;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  
  constructor(config: RealtimeConfig = {}) {
    this.config = {
      url: config.url || '/api/queue/stream',
      reconnectInterval: config.reconnectInterval || 3000,
      heartbeatInterval: config.heartbeatInterval || 30000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
    };
  }

  /**
   * Connect to SSE stream
   */
  connect(restaurantId: string, userId?: string): void {
    this.disconnect();

    const params = new URLSearchParams({ restaurantId });
    if (userId) params.append('userId', userId);

    const url = `${this.config.url}?${params.toString()}`;

    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('[QueueRealtime] Connected to SSE stream');
        this.reconnectAttempts = 0;
        this.startHeartbeatMonitor();
        this.emit('connected', { restaurantId, userId });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const message: SSEMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[QueueRealtime] Failed to parse message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('[QueueRealtime] Connection error:', error);
        this.emit('error', { error, restaurantId });
        
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.scheduleReconnect(restaurantId, userId);
        } else {
          console.error('[QueueRealtime] Max reconnection attempts reached');
          this.disconnect();
        }
      };

      // Listen for custom events
      this.eventSource.addEventListener('queue_update', (event) => {
        try {
          const update = JSON.parse((event as MessageEvent).data);
          this.emit('queue_update', update);
        } catch (error) {
          console.error('[QueueRealtime] Failed to parse queue update:', error);
        }
      });

    } catch (error) {
      console.error('[QueueRealtime] Failed to create EventSource:', error);
      this.scheduleReconnect(restaurantId, userId);
    }
  }

  /**
   * Disconnect from SSE stream
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    console.log('[QueueRealtime] Disconnected');
  }

  /**
   * Subscribe to events
   */
  on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[QueueRealtime] Error in ${event} callback:`, error);
        }
      });
    }
  }

  /**
   * Handle incoming SSE message
   */
  private handleMessage(message: SSEMessage): void {
    switch (message.event) {
      case 'queue_update':
        this.emit('queue_update', message.data);
        break;
      case 'heartbeat':
        // Reset heartbeat monitor
        if (this.heartbeatTimer) {
          clearInterval(this.heartbeatTimer);
          this.startHeartbeatMonitor();
        }
        break;
      case 'error':
        this.emit('error', message.data);
        break;
      default:
        console.warn('[QueueRealtime] Unknown message type:', message.event);
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(restaurantId: string, userId?: string): void {
    this.reconnectAttempts++;
    
    const backoffTime = Math.min(
      this.config.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    console.log(
      `[QueueRealtime] Scheduling reconnect attempt ${this.reconnectAttempts} in ${backoffTime}ms`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect(restaurantId, userId);
    }, backoffTime);
  }

  /**
   * Start heartbeat monitor
   */
  private startHeartbeatMonitor(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.eventSource?.readyState === EventSource.OPEN) {
        // Connection is still active, emit heartbeat
        this.emit('heartbeat', { timestamp: new Date() });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Get connection status
   */
  getStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (!this.eventSource) return 'disconnected';
    
    switch (this.eventSource.readyState) {
      case EventSource.OPEN:
        return 'connected';
      case EventSource.CONNECTING:
        return 'connecting';
      default:
        return 'disconnected';
    }
  }
}

/**
 * React hook for real-time queue updates
 */
export function useRealtimeQueue(restaurantId: string, userId?: string) {
  const [queue, setQueue] = useState<RestaurantQueue | null>(null);
  const [userEntry, setUserEntry] = useState<QueueEntry | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  
  const connectionRef = useRef<QueueRealtimeConnection | null>(null);

  // Initialize connection
  useEffect(() => {
    if (!restaurantId) return;

    const connection = new QueueRealtimeConnection();
    connectionRef.current = connection;

    // Subscribe to events
    const unsubscribeConnected = connection.on('connected', () => {
      setConnectionStatus('connected');
      setError(null);
    });

    const unsubscribeUpdate = connection.on('queue_update', (update: QueueUpdate) => {
      handleQueueUpdate(update);
    });

    const unsubscribeError = connection.on('error', ({ error: err }) => {
      setError(err);
      setConnectionStatus('disconnected');
    });

    // Connect
    setConnectionStatus('connecting');
    connection.connect(restaurantId, userId);

    // Cleanup
    return () => {
      unsubscribeConnected();
      unsubscribeUpdate();
      unsubscribeError();
      connection.disconnect();
      connectionRef.current = null;
    };
  }, [restaurantId, userId]);

  // Handle queue updates
  const handleQueueUpdate = useCallback((update: QueueUpdate) => {
    setQueue(prev => {
      if (!prev) return null;

      const updatedEntries = [...prev.entries];
      const entryIndex = updatedEntries.findIndex(e => e.id === update.entry.id);

      switch (update.type) {
        case 'queue_joined':
          if (entryIndex === -1) {
            updatedEntries.push(update.entry);
          }
          break;

        case 'queue_left':
          if (entryIndex !== -1) {
            updatedEntries.splice(entryIndex, 1);
          }
          break;

        case 'position_change':
        case 'status_change':
        case 'time_update':
          if (entryIndex !== -1) {
            updatedEntries[entryIndex] = update.entry;
          }
          break;
      }

      // Update user entry if it's theirs
      if (userId && update.entry.userId === userId) {
        setUserEntry(update.entry);
      }

      return {
        ...prev,
        entries: updatedEntries,
        totalWaiting: updatedEntries.filter(e => e.status === 'waiting').length,
        lastUpdated: new Date(),
      };
    });
  }, [userId]);

  // Manual refresh
  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/queue/${restaurantId}`);
      if (!response.ok) throw new Error('Failed to fetch queue data');
      
      const data = await response.json();
      setQueue(data);

      if (userId) {
        const entry = data.entries.find((e: QueueEntry) => e.userId === userId);
        setUserEntry(entry || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [restaurantId, userId]);

  return {
    queue,
    userEntry,
    connectionStatus,
    error,
    refresh,
    isConnected: connectionStatus === 'connected',
  };
}

/**
 * Queue time estimation algorithm
 */
export class QueueTimeEstimator {
  /**
   * Estimate wait time based on queue position and historical data
   */
  static estimateWaitTime(
    position: number,
    averageServiceTime: number = 15, // minutes per party
    restaurantCapacity: number = 10, // tables available
    currentQueueSize: number = 0
  ): number {
    // Base calculation: position * average service time / capacity
    const baseTime = (position * averageServiceTime) / Math.max(restaurantCapacity, 1);

    // Apply queue size adjustment (longer queues tend to move slower)
    const queueFactor = 1 + (currentQueueSize / 100) * 0.2; // +20% for every 100 people

    // Apply time-of-day adjustment
    const hour = new Date().getHours();
    let rushFactor = 1.0;
    
    if ((hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 20)) {
      // Peak hours: slower service
      rushFactor = 1.3;
    } else if (hour >= 15 && hour <= 17) {
      // Off-peak: faster service
      rushFactor = 0.8;
    }

    // Calculate final estimate
    const estimatedMinutes = Math.ceil(baseTime * queueFactor * rushFactor);

    // Add buffer (10-20% uncertainty)
    const buffer = Math.ceil(estimatedMinutes * 0.15);

    return estimatedMinutes + buffer;
  }

  /**
   * Calculate estimated seating time
   */
  static estimateSeatingTime(waitMinutes: number): Date {
    const now = new Date();
    return new Date(now.getTime() + waitMinutes * 60 * 1000);
  }

  /**
   * Get wait time display string with localization
   */
  static formatWaitTime(minutes: number, locale: string = 'en'): string {
    if (minutes < 5) {
      return locale === 'ko' ? '곧 입장' : 
             locale === 'ja' ? 'まもなく' :
             locale === 'zh' ? '即将入场' :
             'Soon';
    }

    if (minutes < 60) {
      return locale === 'ko' ? `약 ${minutes}분` :
             locale === 'ja' ? `約${minutes}分` :
             locale === 'zh' ? `约${minutes}分钟` :
             `~${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return locale === 'ko' ? `약 ${hours}시간` :
             locale === 'ja' ? `約${hours}時間` :
             locale === 'zh' ? `约${hours}小时` :
             `~${hours} hr`;
    }

    return locale === 'ko' ? `약 ${hours}시간 ${remainingMinutes}분` :
           locale === 'ja' ? `約${hours}時間${remainingMinutes}分` :
           locale === 'zh' ? `约${hours}小时${remainingMinutes}分钟` :
           `~${hours}h ${remainingMinutes}m`;
  }
}
