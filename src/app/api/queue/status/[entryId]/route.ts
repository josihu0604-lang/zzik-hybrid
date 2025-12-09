/**
 * Queue Status API - Get individual queue entry status
 * GET /api/queue/status/[entryId]
 * 
 * @module api/queue/status/[entryId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { QueueService } from '@/lib/queue-service';
import type { QueueStatusResponse } from '@/types/queue';

export async function GET(
  request: NextRequest,
  { params }: { params: { entryId: string } }
) {
  try {
    const { entryId } = params;

    // Get queue entry
    const queueEntry = await QueueService.getQueueEntry(entryId);

    if (!queueEntry) {
      return NextResponse.json(
        { error: 'Queue entry not found' },
        { status: 404 }
      );
    }

    // Get current queue size to calculate parties ahead
    const allEntries = await QueueService.getRestaurantQueue(
      queueEntry.restaurant_id,
      ['waiting']
    );

    const partiesAhead = Math.max(0, queueEntry.position - 1);
    const isReady = queueEntry.status === 'called' || queueEntry.position <= 3;

    const response: QueueStatusResponse = {
      success: true,
      queue_entry: queueEntry,
      current_position: queueEntry.position,
      estimated_wait_minutes: queueEntry.estimated_wait_minutes || 0,
      estimated_seating_time: queueEntry.estimated_seating_time || '',
      parties_ahead: partiesAhead,
      is_ready: isReady,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Queue Status API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch queue status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
