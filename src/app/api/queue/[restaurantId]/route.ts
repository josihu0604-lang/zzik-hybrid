/**
 * Queue API - Restaurant Queue Management
 * GET /api/queue/[restaurantId] - Get queue status
 * POST /api/queue/[restaurantId] - Join queue
 * DELETE /api/queue/[restaurantId] - Leave queue
 * 
 * @module api/queue/[restaurantId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { QueueService } from '@/lib/queue-service';
import type {
  JoinQueueRequest,
  JoinQueueResponse,
  GetRestaurantQueueResponse,
  LeaveQueueResponse,
} from '@/types/queue';
import { broadcastToRestaurant } from '../stream/route';

/**
 * GET - Get restaurant queue status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = params;

    // Get queue settings
    const settings = await QueueService.getQueueSettings(restaurantId);
    if (!settings) {
      return NextResponse.json(
        { error: 'Restaurant queue not configured' },
        { status: 404 }
      );
    }

    // Get active queue entries
    const queueEntries = await QueueService.getRestaurantQueue(restaurantId);

    // Get statistics
    const stats = await QueueService.getQueueStatistics(restaurantId);

    const response: GetRestaurantQueueResponse = {
      success: true,
      queue_entries: queueEntries,
      total_waiting: stats.total_waiting,
      total_called: stats.total_called,
      avg_wait_time: stats.avg_wait_time,
      settings,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Queue API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch queue',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Join queue
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = params;
    const body: Partial<JoinQueueRequest> = await request.json();

    // Validate required fields
    if (!body.party_size) {
      return NextResponse.json(
        { error: 'Missing required field: party_size' },
        { status: 400 }
      );
    }

    // Validate guest info for non-authenticated users
    if (!body.guest_name && !body.phone_number) {
      return NextResponse.json(
        { error: 'Guest name or phone number required' },
        { status: 400 }
      );
    }

    // Create join request
    const joinRequest: JoinQueueRequest = {
      restaurant_id: restaurantId,
      party_size: body.party_size,
      guest_name: body.guest_name,
      phone_number: body.phone_number,
      email: body.email,
      special_requests: body.special_requests,
      seating_preference: body.seating_preference,
      notification_enabled: body.notification_enabled,
      notification_phone: body.notification_phone,
      notification_email: body.notification_email,
    };

    // Join queue
    const queueEntry = await QueueService.joinQueue(joinRequest);

    if (!queueEntry) {
      return NextResponse.json(
        { error: 'Failed to join queue' },
        { status: 500 }
      );
    }

    // Get updated statistics
    const stats = await QueueService.getQueueStatistics(restaurantId);

    // Prepare response
    const response: JoinQueueResponse = {
      success: true,
      queue_entry: queueEntry,
      estimated_wait_minutes: queueEntry.estimated_wait_minutes || 0,
      estimated_seating_time: queueEntry.estimated_seating_time || '',
      current_queue_size: stats.total_waiting,
      message: `Successfully joined queue at position ${queueEntry.position}`,
    };

    // Broadcast update to SSE clients
    broadcastToRestaurant(restaurantId, 'queue_joined', {
      entry: queueEntry,
      queue_size: stats.total_waiting,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[Queue API] Error joining queue:', error);
    return NextResponse.json(
      {
        error: 'Failed to join queue',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Leave queue
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = params;
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('entryId');

    if (!entryId) {
      return NextResponse.json(
        { error: 'Missing entryId parameter' },
        { status: 400 }
      );
    }

    // Verify entry belongs to restaurant
    const entry = await QueueService.getQueueEntry(entryId);
    if (!entry || entry.restaurant_id !== restaurantId) {
      return NextResponse.json(
        { error: 'Queue entry not found' },
        { status: 404 }
      );
    }

    // Leave queue
    const success = await QueueService.leaveQueue(entryId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to leave queue' },
        { status: 500 }
      );
    }

    // Get updated statistics
    const stats = await QueueService.getQueueStatistics(restaurantId);

    const response: LeaveQueueResponse = {
      success: true,
      message: 'Successfully left the queue',
    };

    // Broadcast update to SSE clients
    broadcastToRestaurant(restaurantId, 'queue_left', {
      entry_id: entryId,
      queue_size: stats.total_waiting,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Queue API] Error leaving queue:', error);
    return NextResponse.json(
      {
        error: 'Failed to leave queue',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
