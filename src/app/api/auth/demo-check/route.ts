/**
 * Demo Mode Check API
 *
 * Server-side endpoint to securely check if demo mode is enabled.
 * This prevents client-side manipulation of demo mode status.
 *
 * SEC-001 FIX: Demo mode verification moved to server-side
 */

import { apiSuccess } from '@/lib/api-middleware';

/**
 * Check if demo mode is enabled (server-side only)
 *
 * Demo mode is DISABLED by default in production.
 * This check runs on the server where env vars are secure.
 */
function isDemoModeEnabledServer(): boolean {
  // In production, demo mode is completely disabled unless explicitly enabled
  // via server-side environment variable (not NEXT_PUBLIC_)
  if (process.env.NODE_ENV === 'production') {
    // Use server-side env var, NOT client-exposed NEXT_PUBLIC_
    return process.env.ENABLE_DEMO_MODE === 'true';
  }

  // In development, allow demo mode if Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const isSupabaseConfigured = !!(
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl !== 'your-project.supabase.co' &&
    supabaseKey !== 'placeholder-key'
  );

  return !isSupabaseConfigured;
}

export async function GET() {
  const isDemoEnabled = isDemoModeEnabledServer();

  return apiSuccess({
    demoEnabled: isDemoEnabled,
    // Include timestamp to prevent caching attacks
    timestamp: Date.now(),
  });
}
