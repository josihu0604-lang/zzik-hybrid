import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/auth-context';
import type { ReactNode } from 'react';

// Mock fetch for demo-check API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock crypto.randomUUID
const mockUUID = '550e8400-e29b-41d4-a716-446655440000';
vi.stubGlobal('crypto', {
  randomUUID: () => mockUUID,
});

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: vi.fn(() => null),
}));

// Wrapper component for testing
function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: demo mode disabled
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ demoEnabled: false }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw error when used outside AuthProvider', () => {
    // Suppress console error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.isLoading).toBe(true); // alias
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('should finish loading when Supabase is not configured', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isDemo).toBe(false);
  });
});

describe('useAuth - Demo Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should enable demo mode when server confirms', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ demoEnabled: true }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isDemo).toBe(true);
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe('demo@zzik.kr');
  });

  it('should create demo user with unique ID', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ demoEnabled: true }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user?.id).toBe(mockUUID);
    expect(result.current.profile?.id).toBe(mockUUID);
  });

  it('should have demo profile with Korean nickname', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ demoEnabled: true }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile?.nickname).toBe('데모 사용자');
  });
});

describe('useAuth - Authentication Methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ demoEnabled: true }),
    });
  });

  it('should sign in with email in demo mode', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let signInResult: { error: Error | null } | undefined;

    await act(async () => {
      signInResult = await result.current.signInWithEmail('test@example.com', 'password');
    });

    expect(signInResult?.error).toBeNull();
    expect(result.current.user).not.toBeNull();
  });

  it('should sign up with email in demo mode', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let signUpResult: { error: Error | null } | undefined;

    await act(async () => {
      signUpResult = await result.current.signUpWithEmail(
        'new@example.com',
        'password',
        'TestUser'
      );
    });

    expect(signUpResult?.error).toBeNull();
    expect(result.current.user).not.toBeNull();
  });

  it('should sign out successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // First sign in
    await act(async () => {
      await result.current.signInWithEmail('test@example.com', 'password');
    });

    expect(result.current.user).not.toBeNull();

    // Then sign out
    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(result.current.session).toBeNull();
  });
});

describe('useAuth - Non-Demo Mode Errors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ demoEnabled: false }),
    });
  });

  it('should return error when signing in without Supabase', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let signInResult: { error: Error | null } | undefined;

    await act(async () => {
      signInResult = await result.current.signInWithEmail('test@example.com', 'password');
    });

    expect(signInResult?.error).not.toBeNull();
    expect(signInResult?.error?.message).toBe('Authentication service not configured');
  });

  it('should return error when signing up without Supabase', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let signUpResult: { error: Error | null } | undefined;

    await act(async () => {
      signUpResult = await result.current.signUpWithEmail('new@example.com', 'password');
    });

    expect(signUpResult?.error).not.toBeNull();
    expect(signUpResult?.error?.message).toBe('Authentication service not configured');
  });

  it('should return error for OAuth without Supabase', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const googleResult = await result.current.signInWithGoogle();
    expect(googleResult.error?.message).toBe('Authentication service not configured');

    const kakaoResult = await result.current.signInWithKakao();
    expect(kakaoResult.error?.message).toBe('Authentication service not configured');

    const appleResult = await result.current.signInWithApple();
    expect(appleResult.error?.message).toBe('Authentication service not configured');
  });
});

describe('useAuth - Server Verification', () => {
  it('should handle server verification failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isDemo).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should handle non-ok response from server', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isDemo).toBe(false);
  });

  it('should call demo-check API on init', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ demoEnabled: false }),
    });

    renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/demo-check', {
        method: 'GET',
        cache: 'no-store',
      });
    });
  });
});

describe('useAuth - Profile Management', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ demoEnabled: true }),
    });
  });

  it('should refresh profile in demo mode', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialProfile = result.current.profile;

    await act(async () => {
      await result.current.refreshProfile();
    });

    // Profile should still exist after refresh
    expect(result.current.profile).not.toBeNull();
    expect(result.current.profile?.nickname).toBe('데모 사용자');
    // ID should be consistent
    expect(result.current.profile?.id).toBe(initialProfile?.id);
  });
});
