import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Get and validate Supabase URL
 * Throws error if not properly configured, unless in Mock Mode
 */
function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isMock = process.env.MOCK_DB === 'true' || process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

  if (!url) {
    if (isMock) return 'https://mock.supabase.co';
    throw new Error(
      '[Supabase Server] NEXT_PUBLIC_SUPABASE_URL is not configured. ' +
        'Please set this environment variable.'
    );
  }

  if (!isMock && (url === 'https://placeholder.supabase.co' || url.includes('placeholder'))) {
    throw new Error(
      '[Supabase Server] NEXT_PUBLIC_SUPABASE_URL contains placeholder value. ' +
        'Please set a valid Supabase URL.'
    );
  }

  return url;
}

/**
 * Get and validate Supabase Anon Key
 * Throws error if not properly configured, unless in Mock Mode
 */
function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isMock = process.env.MOCK_DB === 'true' || process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

  if (!key) {
    if (isMock) return 'mock-anon-key';
    throw new Error(
      '[Supabase Server] NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured. ' +
        'Please set this environment variable.'
    );
  }

  if (!isMock && (key === 'placeholder-key' || key.includes('placeholder'))) {
    throw new Error(
      '[Supabase Server] NEXT_PUBLIC_SUPABASE_ANON_KEY contains placeholder value. ' +
        'Please set a valid Supabase anon key.'
    );
  }

  return key;
}

/**
 * Get and validate Supabase Service Role Key
 * Throws error if not properly configured, unless in Mock Mode
 */
function getSupabaseServiceKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const isMock = process.env.MOCK_DB === 'true' || process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

  if (!key) {
    if (isMock) return 'mock-service-key';
    throw new Error(
      '[Supabase Server] SUPABASE_SERVICE_ROLE_KEY is not configured. ' +
        'Admin operations require this environment variable.'
    );
  }

  if (!isMock && (key === 'placeholder-service-key' || key.includes('placeholder'))) {
    throw new Error(
      '[Supabase Server] SUPABASE_SERVICE_ROLE_KEY contains placeholder value. ' +
        'Please set a valid service role key.'
    );
  }

  return key;
}

// ... existing code ...

export async function createServerSupabaseClient(): Promise<UntypedSupabaseClient> {
  const isMock = process.env.MOCK_DB === 'true' || process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
  
  if (isMock) {
    return createMockClient();
  }

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
  const isMock = process.env.MOCK_DB === 'true' || process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
  
  if (isMock) {
    return createMockClient();
  }

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

function createMockClient(): any {
  console.warn('[Supabase] Running in MOCK MODE. Database operations are simulated.');
  return new Proxy({}, {
    get: (target, prop) => {
      if (prop === 'from') {
        return () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: null }),
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
              order: () => Promise.resolve({ data: [], error: null }),
            }),
            order: () => Promise.resolve({ data: [], error: null }),
            limit: () => Promise.resolve({ data: [], error: null }),
            insert: () => Promise.resolve({ data: null, error: null }),
            update: () => Promise.resolve({ data: null, error: null }),
            delete: () => Promise.resolve({ data: null, error: null }),
          }),
          insert: () => Promise.resolve({ data: null, error: null }),
          upsert: () => Promise.resolve({ data: null, error: null }),
        });
      }
      if (prop === 'auth') {
        return {
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          signInWithPassword: () => Promise.resolve({ data: { user: { id: 'mock-user' } }, error: null }),
          signOut: () => Promise.resolve({ error: null }),
        };
      }
      return () => Promise.resolve({ data: [], error: null });
    }
  });
}
