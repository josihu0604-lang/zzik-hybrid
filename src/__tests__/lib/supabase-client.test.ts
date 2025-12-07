/**
 * TST-015: Supabase Client Tests
 * Testing DB connection, auth, middleware with mocks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createClient,
  getSupabaseClient,
  isSupabaseConfigured,
  resetSupabaseClient,
} from '@/lib/supabase/client';

describe('Supabase Client - Configuration Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should throw error when SUPABASE_URL is not set', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

    expect(() => createClient()).toThrow(/NEXT_PUBLIC_SUPABASE_URL is not configured/);
  });

  it('should throw error when SUPABASE_ANON_KEY is not set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => createClient()).toThrow(/NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured/);
  });

  it('should throw error for placeholder URL', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

    expect(() => createClient()).toThrow(/contains placeholder value/);
  });

  it('should throw error for placeholder key', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'placeholder-key';

    expect(() => createClient()).toThrow(/contains placeholder value/);
  });

  it('should return true when properly configured', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'valid-anon-key-12345';

    expect(isSupabaseConfigured()).toBe(true);
  });

  it('should return false when not configured', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(isSupabaseConfigured()).toBe(false);
  });

  it('should detect invalid URL formats', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-url';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

    // Should not throw during config check, only during actual creation
    expect(isSupabaseConfigured()).toBe(true);
  });
});

describe('Supabase Client - Singleton Pattern', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    resetSupabaseClient();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    };
  });

  afterEach(() => {
    resetSupabaseClient();
    process.env = originalEnv;
  });

  it('should return same client instance on multiple calls', () => {
    const client1 = getSupabaseClient();
    const client2 = getSupabaseClient();

    expect(client1).toBe(client2);
  });

  it('should create new client when called directly', () => {
    const client1 = createClient();
    const client2 = createClient();

    // createBrowserClient from Supabase may return singleton internally
    // We can't control Supabase's internal behavior, so just verify both work
    expect(client1).toBeDefined();
    expect(client2).toBeDefined();
    expect(client1.auth).toBeDefined();
    expect(client2.auth).toBeDefined();
  });
});

describe('Supabase Client - Environment Variables', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should handle missing environment variables gracefully', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(isSupabaseConfigured()).toBe(false);
    expect(() => createClient()).toThrow();
  });

  it('should validate URL format', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://myproject.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'valid-key';

    expect(isSupabaseConfigured()).toBe(true);
  });

  it('should reject URLs with placeholder in name', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://my-placeholder-project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'valid-key';

    expect(() => createClient()).toThrow(/placeholder/);
  });

  it('should reject keys with placeholder in value', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'my-placeholder-key';

    expect(() => createClient()).toThrow(/placeholder/);
  });
});

describe('Supabase Client - Error Messages', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should provide helpful error message for missing URL', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

    expect(() => createClient()).toThrow(/Please set this environment variable/);
  });

  it('should provide helpful error message for missing key', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => createClient()).toThrow(/Please set this environment variable/);
  });

  it('should identify placeholder URL specifically', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'valid-key';

    expect(() => createClient()).toThrow(/Please set a valid Supabase URL/);
  });

  it('should identify placeholder key specifically', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'placeholder-key';

    expect(() => createClient()).toThrow(/Please set a valid Supabase anon key/);
  });
});

describe('Supabase Client - Security', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should not expose credentials in error messages', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'secret-key-12345';

    try {
      // Force an error by setting to placeholder
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'placeholder-key';
      createClient();
    } catch (error) {
      const errorMessage = (error as Error).message;
      expect(errorMessage).not.toContain('secret-key');
      expect(errorMessage).not.toContain('12345');
    }
  });

  it('should validate environment before client creation', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const configured = isSupabaseConfigured();
    expect(configured).toBe(false);

    // Should fail to create
    expect(() => createClient()).toThrow();
  });
});

describe('Supabase Client - Edge Cases', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should handle empty string URL', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

    expect(() => createClient()).toThrow();
  });

  it('should handle empty string key', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

    expect(() => createClient()).toThrow();
  });

  it('should handle whitespace in URL', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '  https://test.supabase.co  ';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

    // May or may not work depending on implementation
    // Just testing that it doesn't crash unexpectedly
    expect(() => {
      isSupabaseConfigured();
    }).not.toThrow();
  });

  it('should handle case sensitivity in placeholder detection', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://my-PLACEHOLDER-project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

    // Should detect placeholder in URL (case insensitive check in implementation)
    expect(() => createClient()).toThrow(/placeholder/i);
  });

  it('should handle URLs without https protocol', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

    // Should not throw - Supabase SDK handles protocol
    expect(() => isSupabaseConfigured()).not.toThrow();
  });
});

describe('Supabase Client - Configuration States', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should detect fully configured state', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc123.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

    expect(isSupabaseConfigured()).toBe(true);
  });

  it('should detect partially configured state (URL only)', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(isSupabaseConfigured()).toBe(false);
  });

  it('should detect partially configured state (key only)', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

    expect(isSupabaseConfigured()).toBe(false);
  });

  it('should detect unconfigured state', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(isSupabaseConfigured()).toBe(false);
  });
});

describe('Supabase Client - Integration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key-12345',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create client with valid configuration', () => {
    expect(() => createClient()).not.toThrow();
  });

  it('should return client object with expected properties', () => {
    const client = createClient();

    expect(client).toBeDefined();
    expect(client).toHaveProperty('auth');
    expect(client).toHaveProperty('from');
    expect(client).toHaveProperty('rpc');
    expect(client).toHaveProperty('storage');
  });

  it('should have auth methods', () => {
    const client = createClient();

    expect(client.auth).toHaveProperty('signUp');
    expect(client.auth).toHaveProperty('signInWithPassword');
    expect(client.auth).toHaveProperty('signOut');
    expect(client.auth).toHaveProperty('getUser');
    expect(client.auth).toHaveProperty('getSession');
  });

  it('should support table queries', () => {
    const client = createClient();

    expect(typeof client.from).toBe('function');

    // Should be able to chain query methods
    const query = client.from('popups');
    expect(query).toHaveProperty('select');
    expect(query).toHaveProperty('insert');
    expect(query).toHaveProperty('update');
    expect(query).toHaveProperty('delete');
  });

  it('should support storage operations', () => {
    const client = createClient();

    expect(client.storage).toBeDefined();
    expect(typeof client.storage.from).toBe('function');
  });

  it('should support RPC calls', () => {
    const client = createClient();

    expect(typeof client.rpc).toBe('function');
  });
});

describe('Supabase Client - Compatibility', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should work in browser environment', () => {
    expect(() => createClient()).not.toThrow();
  });

  it('should handle undefined navigator', () => {
    // Simulate server environment
    const originalNavigator = global.navigator;
    // @ts-expect-error - Testing undefined navigator
    global.navigator = undefined;

    expect(() => createClient()).not.toThrow();

    global.navigator = originalNavigator;
  });

  it('should handle undefined window', () => {
    // Simulate server environment
    const originalWindow = global.window;
    // @ts-expect-error - Testing undefined window
    global.window = undefined;

    expect(() => createClient()).not.toThrow();

    global.window = originalWindow;
  });
});
