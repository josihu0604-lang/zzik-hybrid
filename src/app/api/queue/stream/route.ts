/**
 * Queue SSE Stream API
 * GET /api/queue/stream?restaurantId=xxx&userId=xxx
 * 
 * Provides real-time queue updates via Server-Sent Events with DB persistence
 * 
 * @module api/queue/stream
 */

import { NextRequest } from 'next/server';
import { QueueService } from '@/lib/queue-service';
import type { QueueSSEEvent, QueueSSEEventType } from '@/types/queue';

// SSE clients store: restaurant_id -> Set of controllers
const clients = new Map<string, Set<ReadableStreamDefaultController>>();

// Client metadata: controller -> client info
const clientMetadata = new Map<ReadableStreamDefaultController, {
  restaurantId: string;
  userId?: string;
  entryId?: string;
}>();

// Heartbeat interval (30 seconds)
const HEARTBEAT_INTERVAL = 30000;

// Position update interval (30 seconds)
const POSITION_UPDATE_INTERVAL = 30000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get('restaurantId');
  const userId = searchParams.get('userId');
  const entryId = searchParams.get('entryId');

  if (!restaurantId) {
    return new Response('Missing restaurantId parameter', { status: 400 });
  }

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      // Register client
      if (!clients.has(restaurantId)) {
        clients.set(restaurantId, new Set());
      }
      clients.get(restaurantId)!.add(controller);

      // Store client metadata
      clientMetadata.set(controller, {
        restaurantId,
        userId: userId || undefined,
        entryId: entryId || undefined,
      });

      console.log(`[SSE] Client connected: restaurant=${restaurantId}, user=${userId || 'anonymous'}, entry=${entryId || 'none'}`);

      // Send initial connection message
      sendSSE(controller, {
        event: 'connected',
        data: {
          restaurantId,
          userId,
          entryId,
          timestamp: new Date().toISOString(),
        },
      });

      // Send initial queue state
      try {
        const queueEntries = await QueueService.getRestaurantQueue(restaurantId);
        const stats = await QueueService.getQueueStatistics(restaurantId);

        sendSSE(controller, {
          event: 'initial_state',
          data: {
            queue_entries: queueEntries,
            statistics: stats,
            timestamp: new Date().toISOString(),
          },
        });

        // If user has an entry, send their specific position
        if (entryId) {
          const entry = await QueueService.getQueueEntry(entryId);
          if (entry) {
            sendSSE(controller, {
              event: 'position_update',
              data: {
                entry_id: entryId,
                position: entry.position,
                estimated_wait_minutes: entry.estimated_wait_minutes,
                status: entry.status,
                timestamp: new Date().toISOString(),
              },
            });
          }
        }
      } catch (error) {
        console.error('[SSE] Error sending initial state:', error);
      }

      // Setup heartbeat
      const heartbeatTimer = setInterval(() => {
        try {
          sendSSE(controller, {
            event: 'heartbeat',
            data: { timestamp: new Date().toISOString() },
          });
        } catch (error) {
          console.error('[SSE] Heartbeat error:', error);
          clearInterval(heartbeatTimer);
        }
      }, HEARTBEAT_INTERVAL);

      // Setup periodic position updates for this client's entry
      let positionUpdateTimer: NodeJS.Timeout | null = null;
      if (entryId) {
        positionUpdateTimer = setInterval(async () => {
          try {
            const entry = await QueueService.getQueueEntry(entryId);
            if (entry && (entry.status === 'waiting' || entry.status === 'called')) {
              sendSSE(controller, {
                event: 'position_update',
                data: {
                  entry_id: entryId,
                  position: entry.position,
                  estimated_wait_minutes: entry.estimated_wait_minutes,
                  estimated_seating_time: entry.estimated_seating_time,
                  status: entry.status,
                  timestamp: new Date().toISOString(),
                },
              });

              // Send "almost ready" notification when 3 or fewer ahead
              if (entry.position <= 3 && entry.status === 'waiting') {
                sendSSE(controller, {
                  event: 'almost_ready',
                  data: {
                    entry_id: entryId,
                    position: entry.position,
                    message: `You're almost ready! Only ${entry.position - 1} ${entry.position === 1 ? 'party' : 'parties'} ahead.`,
                    timestamp: new Date().toISOString(),
                  },
                });
              }
            }
          } catch (error) {
            console.error('[SSE] Position update error:', error);
          }
        }, POSITION_UPDATE_INTERVAL);
      }

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        console.log(`[SSE] Client disconnected: restaurant=${restaurantId}`);
        
        // Clear timers
        clearInterval(heartbeatTimer);
        if (positionUpdateTimer) {
          clearInterval(positionUpdateTimer);
        }
        
        // Remove from clients
        const restaurantClients = clients.get(restaurantId);
        if (restaurantClients) {
          restaurantClients.delete(controller);
          if (restaurantClients.size === 0) {
            clients.delete(restaurantId);
          }
        }

        // Remove metadata
        clientMetadata.delete(controller);

        try {
          controller.close();
        } catch (error) {
          // Stream already closed
        }
      });
    },

    cancel() {
      console.log('[SSE] Stream cancelled');
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

/**
 * Send SSE message
 */
function sendSSE(
  controller: ReadableStreamDefaultController,
  message: { event: string; data: any }
): void {
  const data = JSON.stringify(message.data);
  const sseMessage = `event: ${message.event}\ndata: ${data}\n\n`;
  
  try {
    controller.enqueue(new TextEncoder().encode(sseMessage));
  } catch (error) {
    console.error('[SSE] Failed to send message:', error);
  }
}

/**
 * Broadcast to all clients in a restaurant queue
 */
export function broadcastToRestaurant(restaurantId: string, event: string, data: any): void {
  const restaurantClients = clients.get(restaurantId);
  
  if (!restaurantClients || restaurantClients.size === 0) {
    return;
  }

  console.log(`[SSE] Broadcasting '${event}' to ${restaurantClients.size} clients in ${restaurantId}`);

  restaurantClients.forEach(controller => {
    sendSSE(controller, { event, data });
  });
}

/**
 * Broadcast to specific user by entry ID
 */
export function broadcastToEntry(restaurantId: string, entryId: string, event: string, data: any): void {
  const restaurantClients = clients.get(restaurantId);
  
  if (!restaurantClients || restaurantClients.size === 0) {
    return;
  }

  restaurantClients.forEach(controller => {
    const metadata = clientMetadata.get(controller);
    if (metadata && metadata.entryId === entryId) {
      sendSSE(controller, { event, data: { ...data, entry_id: entryId } });
    }
  });
}

/**
 * Broadcast to specific user by user ID
 */
export function broadcastToUser(restaurantId: string, userId: string, event: string, data: any): void {
  const restaurantClients = clients.get(restaurantId);
  
  if (!restaurantClients || restaurantClients.size === 0) {
    return;
  }

  restaurantClients.forEach(controller => {
    const metadata = clientMetadata.get(controller);
    if (metadata && metadata.userId === userId) {
      sendSSE(controller, { event, data: { ...data, user_id: userId } });
    }
  });
}

/**
 * Get connected clients count
 */
export function getConnectedClientsCount(restaurantId?: string): number {
  if (restaurantId) {
    return clients.get(restaurantId)?.size || 0;
  }
  
  let total = 0;
  clients.forEach(set => {
    total += set.size;
  });
  return total;
}

/**
 * Close all connections for a restaurant
 */
export function closeRestaurantConnections(restaurantId: string): void {
  const restaurantClients = clients.get(restaurantId);
  
  if (!restaurantClients) return;

  restaurantClients.forEach(controller => {
    try {
      controller.close();
    } catch (error) {
      // Already closed
    }
  });

  clients.delete(restaurantId);
  console.log(`[SSE] Closed all connections for ${restaurantId}`);
}

/**
 * Broadcast queue update to all clients
 * This is called from other API endpoints when queue changes
 */
export async function broadcastQueueUpdate(
  restaurantId: string,
  eventType: QueueSSEEventType,
  data: any
): Promise<void> {
  const event: QueueSSEEvent = {
    event_type: eventType,
    queue_entry_id: data.entry_id || data.entry?.id,
    restaurant_id: restaurantId,
    data,
    timestamp: new Date().toISOString(),
  };

  broadcastToRestaurant(restaurantId, 'queue_update', event);

  // Also send specific updates to affected users
  if (data.entry_id) {
    broadcastToEntry(restaurantId, data.entry_id, eventType, data);
  }
}
