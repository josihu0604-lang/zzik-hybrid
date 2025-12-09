/**
 * AI Recommendations API
 *
 * GET /api/ai/recommendations
 * Query params:
 *   - userId (optional): User ID for personalized recommendations
 *   - strategy: hybrid|collaborative|content|popular|trending
 *   - limit: Number of results (default: 10)
 */
import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-middleware';
import { generateAIRecommendations } from '@/lib/ai';
import type { RecommendationRequest } from '@/lib/ai';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const userId = searchParams.get('userId') || 'guest';
    const strategy = (searchParams.get('strategy') ||
      'hybrid') as RecommendationRequest['strategy'];
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const demoMode = searchParams.get('demo') === 'true';

    // Validate parameters
    if (limit < 1 || limit > 50) {
      return apiError('Limit must be between 1 and 50', 400);
    }

    const validStrategies = ['hybrid', 'collaborative', 'content', 'popular', 'trending'];
    if (!validStrategies.includes(strategy || '')) {
      return apiError(`Strategy must be one of: ${validStrategies.join(', ')}`, 400);
    }

    // Generate recommendations
    const recommendations = await generateAIRecommendations({
      userId,
      strategy,
      limit,
      demoMode,
    });

    return apiSuccess({
      recommendations,
      meta: {
        userId,
        strategy,
        count: recommendations.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('[API] Recommendations error:', error);

    return apiError('Failed to generate recommendations', 500, {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
