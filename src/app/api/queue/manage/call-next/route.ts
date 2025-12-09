/**
 * Queue Management API - Call Next Customer
 * POST /api/queue/manage/call-next
 * 
 * @module api/queue/manage/call-next
 */

import { NextRequest, NextResponse } from 'next/server';
import { QueueService } from '@/lib/queue-service';
import type { CallNextRequest, CallNextResponse } from '@/types/queue';
import { broadcastToRestaurant } from '../../stream/route';

export async function POST(request: NextRequest) {
  try {
    const body: CallNextRequest = await request.json();

    if (!body.restaurant_id) {
      return NextResponse.json(
        { error: 'Missing required field: restaurant_id' },
        { status: 400 }
      );
    }

    const count = body.count || 1;

    // Call next customer(s)
    const calledEntries = await QueueService.callNext(body.restaurant_id, count);

    if (calledEntries.length === 0) {
      return NextResponse.json(
        { error: 'No customers waiting in queue' },
        { status: 404 }
      );
    }

    // Get updated statistics
    const stats = await QueueService.getQueueStatistics(body.restaurant_id);

    const response: CallNextResponse = {
      success: true,
      called_entries: calledEntries,
      remaining_queue_size: stats.total_waiting,
    };

    // Broadcast to SSE clients
    for (const entry of calledEntries) {
      broadcastToRestaurant(body.restaurant_id, 'queue_called', {
        entry_id: entry.id,
        entry,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Queue Manage API] Error calling next:', error);
    return NextResponse.json(
      {
        error: 'Failed to call next customer',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
