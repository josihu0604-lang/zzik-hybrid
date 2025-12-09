
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getRateLimiterStatus } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const traceId = request.headers.get('x-trace-id') || 'unknown';
  const startTime = Date.now();

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    traceId,
    services: {
      database: 'unknown',
      redis: 'unknown',
    },
    meta: {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      latency: 0
    }
  };

  try {
    // 1. Check Database (Supabase)
    const supabase = createAdminClient();
    const { error } = await supabase.from('users').select('id').limit(1);
    health.services.database = error ? 'down' : 'up';
    
    if (error) {
        logger.error('[Health] Database check failed', error, { traceId });
        health.status = 'degraded';
    }

    // 2. Check Rate Limiter (Redis)
    const rateLimiter = getRateLimiterStatus();
    health.services.redis = rateLimiter.configured ? 'up' : 'disabled';
    
    if (rateLimiter.type === 'memory' && process.env.NODE_ENV === 'production') {
       health.services.redis = 'warning (memory-only)';
    }

    health.meta.latency = Date.now() - startTime;

    return NextResponse.json(health, { 
      status: health.status === 'ok' ? 200 : 503 
    });

  } catch (error) {
    logger.error('[Health] Critical failure', error, { traceId });
    return NextResponse.json({ 
        status: 'error', 
        message: 'Health check failed' 
    }, { status: 500 });
  }
}
