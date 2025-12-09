/**
 * Smart Notifications Schedule API
 *
 * POST /api/ai/notifications/schedule
 * Body:
 *   - popupId: Popup ID
 *   - targetUserIds: Array of user IDs
 *   - popupData: Popup information
 */
import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-middleware';
import { createPopupNotificationSchedule } from '@/lib/ai';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { popupId, targetUserIds, popupData } = body;

    // Validation
    if (!popupId || typeof popupId !== 'string') {
      return apiError('popupId is required', 400);
    }

    if (!Array.isArray(targetUserIds) || targetUserIds.length === 0) {
      return apiError('targetUserIds must be a non-empty array', 400);
    }

    if (!popupData || typeof popupData !== 'object') {
      return apiError('popupData is required', 400);
    }

    // Required popup data fields
    const requiredFields = [
      'title',
      'brandName',
      'category',
      'currentParticipants',
      'goalParticipants',
      'daysLeft',
    ];
    for (const field of requiredFields) {
      if (!(field in popupData)) {
        return apiError(`popupData.${field} is required`, 400);
      }
    }

    // Create notification schedule
    const schedules = await createPopupNotificationSchedule(popupId, popupData, targetUserIds);

    return apiSuccess({
      schedules,
      meta: {
        popupId,
        totalScheduled: schedules.length,
        targetUsers: targetUserIds.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('[API] Notification scheduling error:', error);

    return apiError('Failed to create notification schedule', 500, {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
