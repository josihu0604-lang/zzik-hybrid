/**
 * Queue Settings API - Manage restaurant queue settings
 * GET /api/queue/settings/[restaurantId] - Get settings
 * PUT /api/queue/settings/[restaurantId] - Update settings
 * 
 * @module api/queue/settings/[restaurantId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { QueueService } from '@/lib/queue-service';
import type {
  UpdateQueueSettingsRequest,
  UpdateQueueSettingsResponse,
} from '@/types/queue';

/**
 * GET - Get queue settings
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = params;

    let settings = await QueueService.getQueueSettings(restaurantId);

    // Initialize if not exists
    if (!settings) {
      settings = await QueueService.initializeQueueSettings(restaurantId);
    }

    if (!settings) {
      return NextResponse.json(
        { error: 'Failed to get or initialize settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('[Queue Settings API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch settings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update queue settings
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = params;
    const body: UpdateQueueSettingsRequest = await request.json();

    if (!body.settings) {
      return NextResponse.json(
        { error: 'Missing settings data' },
        { status: 400 }
      );
    }

    // Update settings
    const updatedSettings = await QueueService.updateQueueSettings(
      restaurantId,
      body.settings
    );

    if (!updatedSettings) {
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    const response: UpdateQueueSettingsResponse = {
      success: true,
      settings: updatedSettings,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Queue Settings API] Error updating:', error);
    return NextResponse.json(
      {
        error: 'Failed to update settings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
