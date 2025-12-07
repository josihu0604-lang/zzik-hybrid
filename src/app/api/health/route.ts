import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, createServerSupabaseClient } from '@/lib/supabase/server';

type ServiceStatus = 'up' | 'down' | 'degraded' | 'unconfigured';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    api: ServiceStatus;
    supabase: ServiceStatus;
    gemini: ServiceStatus;
  };
  environment: string;
  details?: Record<string, string>;
}

// SEC-020: Minimal health check for public access
interface PublicHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
}

/**
 * Check if Gemini API is configured
 */
function checkGeminiConfig(): ServiceStatus {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey.length < 10) {
    return 'unconfigured';
  }
  return 'up';
}

/**
 * Check Supabase configuration
 */
function checkSupabaseConfig(): ServiceStatus {
  if (!isSupabaseConfigured()) {
    return 'unconfigured';
  }
  return 'up';
}

/**
 * Determine overall health status
 */
function determineOverallStatus(services: HealthCheck['services']): HealthCheck['status'] {
  const statuses = Object.values(services);

  // If any critical service is down, system is unhealthy
  if (statuses.includes('down')) {
    return 'unhealthy';
  }

  // If core API is up but others are degraded/unconfigured, system is degraded
  if (services.api === 'up' && statuses.some((s) => s === 'degraded')) {
    return 'degraded';
  }

  // All services up (unconfigured is acceptable for non-critical services)
  return 'healthy';
}

/**
 * SEC-020 FIX: Check if request is from authenticated admin user
 */
async function isAuthenticatedAdmin(request: NextRequest): Promise<boolean> {
  try {
    // Check for admin API key (for monitoring systems)
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey && process.env.HEALTH_CHECK_ADMIN_KEY) {
      // Constant-time comparison
      const expected = process.env.HEALTH_CHECK_ADMIN_KEY;
      if (adminKey.length === expected.length) {
        let result = 0;
        for (let i = 0; i < adminKey.length; i++) {
          result |= adminKey.charCodeAt(i) ^ expected.charCodeAt(i);
        }
        if (result === 0) return true;
      }
    }

    // Check for authenticated session
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Check if user has admin role (implement based on your role system)
      // For now, any authenticated user can see detailed health info
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * GET /api/health
 * Health check endpoint for monitoring
 *
 * SEC-020 FIX: Returns minimal info for public, detailed info for authenticated admins
 *
 * Public response:
 * - 200: { status: 'healthy', timestamp: '...' }
 *
 * Authenticated response:
 * - 200: { status, timestamp, version, services, environment, details }
 * - 503: Unhealthy (critical services down)
 */
export async function GET(request: NextRequest) {
  const services: HealthCheck['services'] = {
    api: 'up',
    supabase: checkSupabaseConfig(),
    gemini: checkGeminiConfig(),
  };

  const overallStatus = determineOverallStatus(services);
  const timestamp = new Date().toISOString();

  // SEC-020 FIX: Check authentication level
  const isAdmin = await isAuthenticatedAdmin(request);

  // Public health check - minimal information
  if (!isAdmin) {
    const publicHealth: PublicHealthCheck = {
      status: overallStatus,
      timestamp,
    };

    const httpStatus = overallStatus === 'unhealthy' ? 503 : 200;
    const response = NextResponse.json(publicHealth, { status: httpStatus });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  // Authenticated admin - full health check with details
  const healthCheck: HealthCheck = {
    status: overallStatus,
    timestamp,
    version: process.env.npm_package_version || '0.1.0',
    services,
    environment: process.env.NODE_ENV || 'development',
  };

  // Add details if any service is not fully up
  if (overallStatus !== 'healthy') {
    healthCheck.details = {};
    if (services.supabase === 'unconfigured') {
      healthCheck.details.supabase = 'Demo mode - Supabase not configured';
    }
    if (services.gemini === 'unconfigured') {
      healthCheck.details.gemini = 'Gemini API key not configured';
    }
  }

  const httpStatus = overallStatus === 'unhealthy' ? 503 : 200;

  const response = NextResponse.json(healthCheck, { status: httpStatus });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
