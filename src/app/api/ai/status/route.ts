/**
 * AI Service Status API
 *
 * GET /api/ai/status
 * Returns current status of all AI features
 */
import { apiSuccess, apiError } from '@/lib/api-middleware';
import { getAIServiceStatus } from '@/lib/ai';
import { getMetrics as getGeminiMetrics } from '@/lib/gemini';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await getAIServiceStatus();

    // Get Gemini metrics if available
    let metrics;
    try {
      metrics = getGeminiMetrics();
    } catch {
      metrics = undefined;
    }

    return apiSuccess({
      ...status,
      metrics,
      endpoints: {
        recommendations: '/api/ai/recommendations',
        search: '/api/ai/search',
        vibeAnalyze: '/api/ai/vibe-analyze',
        notificationSchedule: '/api/ai/notifications/schedule',
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error('[API] Status check error:', error);

    return apiError('Failed to get AI service status', 500, {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
