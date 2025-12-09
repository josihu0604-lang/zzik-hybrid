'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * SEC-022 SECURITY NOTE: Supabase Client-Side Configuration
 *
 * IMPORTANT: The anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY) is intentionally exposed
 * to the client. This is by design and NOT a security vulnerability because:
 *
 * 1. The anon key is meant to be public - it identifies your Supabase project
 *    but does NOT grant any special permissions by itself.
 *
 * 2. All security is enforced through Row Level Security (RLS) policies:
 *    - Every table should have RLS enabled
 *    - Policies define WHO can access WHAT data
 *    - Even with the anon key, users can only access data allowed by RLS
 *
 * 3. This is the official Supabase architecture for client-side applications.
 *    See: https://supabase.com/docs/guides/auth/row-level-security
 *
 * REQUIREMENTS for secure operation:
 * - RLS MUST be enabled on ALL tables containing sensitive data
 * - Test RLS policies thoroughly before deploying
 * - Use service_role key ONLY on server-side (never expose to client)
 * - Regularly audit RLS policies for each table
 *
 * Example RLS policy for user data:
 *   CREATE POLICY "Users can view own data"
 *   ON user_data FOR SELECT
 *   USING (auth.uid() = user_id);
 */

/**
 * Get Supabase URL from environment
 * Throws error if not configured (no fallback for security)
 */
function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error(
      '[Supabase] NEXT_PUBLIC_SUPABASE_URL is not configured. ' +
        'Please set this environment variable.'
    );
  }

  if (url === 'https://placeholder.supabase.co' || url.toLowerCase().includes('placeholder')) {
    throw new Error(
      '[Supabase] NEXT_PUBLIC_SUPABASE_URL contains placeholder value. ' +
        'Please set a valid Supabase URL.'
    );
  }

  return url;
}

/**
 * Get Supabase Anon Key from environment
 *
 * SEC-022: This key is intentionally public. Security is enforced via RLS.
 * See module-level comment for details.
 *
 * Throws error if not configured (no fallback for security)
 */
function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error(
      '[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured. ' +
        'Please set this environment variable.'
    );
  }

  if (key === 'placeholder-key' || key.toLowerCase().includes('placeholder')) {
    throw new Error(
      '[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY contains placeholder value. ' +
        'Please set a valid Supabase anon key.'
    );
  }

  return key;
}

/**
 * Check if Supabase is properly configured
 * Returns true only if valid credentials are available
 */
export function isSupabaseConfigured(): boolean {
  try {
    getSupabaseUrl();
    getSupabaseAnonKey();
    return true;
  } catch {
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedBrowserClient = ReturnType<typeof createBrowserClient<any>>;

export function createClient(): UntypedBrowserClient {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  // Use untyped client to avoid type inference issues with supabase-js
  return createBrowserClient(url, key);
}

// Singleton for client-side usage
let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createClient();
  }
  return client;
}

// For testing: reset singleton
export function resetSupabaseClient() {
  client = null;
}
