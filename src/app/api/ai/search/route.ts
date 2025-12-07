/**
 * Semantic Search API
 *
 * GET /api/ai/search
 * Query params:
 *   - q: Search query (required)
 *   - userId: User ID for personalized results
 *   - limit: Number of results (default: 10)
 *   - categories: Comma-separated categories filter
 *   - locations: Comma-separated locations filter
 */
import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-middleware';
import { semanticSearch, trackSearchQuery } from '@/lib/ai';
import type { SearchQuery } from '@/lib/ai';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query
    const query = searchParams.get('q');
    if (!query || query.trim().length === 0) {
      return apiError('Query parameter "q" is required', 400);
    }

    const userId = searchParams.get('userId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Parse filters
    const categories = searchParams.get('categories')?.split(',').filter(Boolean);
    const locations = searchParams.get('locations')?.split(',').filter(Boolean);
    const status = searchParams.get('status')?.split(',').filter(Boolean);
    const minProgress = searchParams.get('minProgress')
      ? parseInt(searchParams.get('minProgress')!, 10)
      : undefined;

    const searchQuery: SearchQuery = {
      query: query.trim(),
      userId,
      limit,
      filters: {
        categories,
        locations,
        status,
        minProgress,
      },
    };

    // Perform search
    const results = await semanticSearch(searchQuery);

    // Track search analytics
    if (userId) {
      trackSearchQuery(userId, query, results.length, false).catch((err) =>
        logger.error('[SearchAnalytics] Failed to track:', err)
      );
    }

    return apiSuccess({
      results,
      meta: {
        query: query.trim(),
        count: results.length,
        filters: searchQuery.filters,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('[API] Search error:', error);

    return apiError('Search failed', 500, {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
