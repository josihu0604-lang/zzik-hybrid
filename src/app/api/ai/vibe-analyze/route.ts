/**
 * Vibe Analysis API
 *
 * POST /api/ai/vibe-analyze
 * Body:
 *   - description: Popup description text
 *   - imageUrl: Optional image URL
 */
import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-middleware';
import { analyzePopupDescription } from '@/lib/ai';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { description, imageUrl } = body;

    if (!description || typeof description !== 'string') {
      return apiError('Description is required and must be a string', 400);
    }

    if (description.length < 10) {
      return apiError('Description must be at least 10 characters', 400);
    }

    // Analyze vibe
    const analysis = await analyzePopupDescription(description, imageUrl);

    if (!analysis) {
      return apiError('Failed to analyze vibe', 500);
    }

    return apiSuccess({
      analysis,
      meta: {
        timestamp: new Date().toISOString(),
        demoMode: !process.env.GEMINI_API_KEY,
      },
    });
  } catch (error) {
    logger.error('[API] Vibe analysis error:', error);

    return apiError('Vibe analysis failed', 500, {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
