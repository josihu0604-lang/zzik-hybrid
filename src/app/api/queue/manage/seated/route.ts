/**
 * Queue Management API - Mark as Seated
 * POST /api/queue/manage/seated
 * 
 * @module api/queue/manage/seated
 */

import { NextRequest, NextResponse } from 'next/server';
import { QueueService } from '@/lib/queue-service';
import type { MarkSeatedRequest, MarkSeatedResponse } from '@/types/queue';
import { broadcastToRestaurant } from '../../stream/route';

export async function POST(request: NextRequest) {
  try {
    const body: MarkSeatedRequest = await request.json();

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

    // Mark as seated
    const success = await QueueService.markSeated(body.queue_entry_id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to mark as seated' },
        { status: 500 }
      );
    }

    const response: MarkSeatedResponse = {
      success: true,
      message: 'Customer marked as seated',
    };

    // Broadcast to SSE clients
    broadcastToRestaurant(entry.restaurant_id, 'queue_seated', {
      entry_id: entry.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Queue Manage API] Error marking seated:', error);
    return NextResponse.json(
      {
        error: 'Failed to mark as seated',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
