import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Get and validate Supabase URL
 * Throws error if not properly configured
 */
function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error(
      '[Supabase Server] NEXT_PUBLIC_SUPABASE_URL is not configured. ' +
        'Please set this environment variable.'
    );
  }

  if (url === 'https://placeholder.supabase.co' || url.includes('placeholder')) {
    throw new Error(
      '[Supabase Server] NEXT_PUBLIC_SUPABASE_URL contains placeholder value. ' +
        'Please set a valid Supabase URL.'
    );
  }

  return url;
}

/**
 * Get and validate Supabase Anon Key
 * Throws error if not properly configured
 */
function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error(
      '[Supabase Server] NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured. ' +
        'Please set this environment variable.'
    );
  }

  if (key === 'placeholder-key' || key.includes('placeholder')) {
    throw new Error(
      '[Supabase Server] NEXT_PUBLIC_SUPABASE_ANON_KEY contains placeholder value. ' +
        'Please set a valid Supabase anon key.'
    );
  }

  return key;
}

/**
 * Get and validate Supabase Service Role Key
 * Throws error if not properly configured
 */
function getSupabaseServiceKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error(
      '[Supabase Server] SUPABASE_SERVICE_ROLE_KEY is not configured. ' +
        'Admin operations require this environment variable.'
    );
  }

  if (key === 'placeholder-service-key' || key.includes('placeholder')) {
    throw new Error(
      '[Supabase Server] SUPABASE_SERVICE_ROLE_KEY contains placeholder value. ' +
        'Please set a valid service role key.'
    );
  }

  return key;
}

/**
 * Check if Supabase is properly configured for server-side usage
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

/**
 * Check if admin client can be created
 */
export function isAdminConfigured(): boolean {
  try {
    getSupabaseUrl();
    getSupabaseServiceKey();
    return true;
  } catch {
    return false;
  }
}

// Type alias for untyped Supabase client (bypasses strict type checking)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedSupabaseClient = ReturnType<typeof createServerClient<any>>;

export async function createServerSupabaseClient(): Promise<UntypedSupabaseClient> {
  const cookieStore = await cookies();
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  // Use untyped client to avoid type inference issues with supabase-js
  // Type safety is enforced at the application layer via TypeScript types
  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Cookie setting in Server Component - ignore
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Cookie removal in Server Component - ignore
        }
      },
    },
  });
}

// Admin client with service role (server-side only)
export function createAdminClient(): UntypedSupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceKey();

  // Use untyped client for admin operations
  return createServerClient(url, key, {
    cookies: {
      get: () => undefined,
      set: () => {},
      remove: () => {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
