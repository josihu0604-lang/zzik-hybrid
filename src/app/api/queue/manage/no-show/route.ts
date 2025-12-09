/**
 * Queue Management API - Mark as No Show
 * POST /api/queue/manage/no-show
 * 
 * @module api/queue/manage/no-show
 */

import { NextRequest, NextResponse } from 'next/server';
import { QueueService } from '@/lib/queue-service';
import type { MarkNoShowRequest, MarkNoShowResponse } from '@/types/queue';
import { broadcastToRestaurant } from '../../stream/route';

export async function POST(request: NextRequest) {
  try {
    const body: MarkNoShowRequest = await request.json();

    if (!body.queue_entry_id) {
      return NextResponse.json(
        { error: 'Missing required field: queue_entry_id' },
        { status: 400 }
      );
    }

    // Get entry to get restaurant_id
    const entry = await QueueService.getQueueEntry(body.queue_entry_id);
    if (!entry) {
      return NextResponse.json(
        { error: 'Queue entry not found' },
        { status: 404 }
      );
    }

    // Mark as no-show
    const success = await QueueService.markNoShow(body.queue_entry_id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to mark as no-show' },
        { status: 500 }
      );
    }

    const response: MarkNoShowResponse = {
      success: true,
      message: 'Customer marked as no-show',
    };

    // Broadcast to SSE clients
    broadcastToRestaurant(entry.restaurant_id, 'queue_no_show', {
      entry_id: entry.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Queue Manage API] Error marking no-show:', error);
    return NextResponse.json(
      {
        error: 'Failed to mark as no-show',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
