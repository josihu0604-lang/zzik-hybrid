'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { User as DbUser } from '@/types/database';

// Check if Supabase is properly configured
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return !!(
    url &&
    key &&
    !url.includes('placeholder') &&
    url !== 'your-project.supabase.co' &&
    key !== 'placeholder-key'
  );
}

/**
 * SEC-001 FIX: Demo mode check now verifies with server-side API
 * instead of trusting client-side NEXT_PUBLIC_ env var
 *
 * The client-side check is only used for initial state.
 * Server-side verification is performed asynchronously.
 */
async function verifyDemoModeWithServer(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/demo-check', {
      method: 'GET',
      cache: 'no-store', // Prevent caching
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.demoEnabled === true;
  } catch (error) {
    console.error('[Auth] Failed to verify demo mode with server:', error);
    return false;
  }
}

interface AuthContextType {
  user: User | null;
  profile: DbUser | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean; // Alias for loading
  isDemo: boolean; // Demo mode indicator
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    nickname?: string
  ) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithKakao: () => Promise<{ error: Error | null }>;
  signInWithApple: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * SEC-023 FIX: Generate unique demo user ID per session
 *
 * Uses crypto.randomUUID() to prevent session conflicts and improve security.
 * Each demo session gets a unique ID that expires when the session ends.
 */
let demoUserId: string | null = null;

function getDemoUserId(): string {
  if (!demoUserId) {
    demoUserId = crypto.randomUUID();
  }
  return demoUserId;
}

// Demo user factory - only created when demo mode is explicitly enabled
function createDemoUser(): User {
  const userId = getDemoUserId();
  return {
    id: userId,
    email: 'demo@zzik.kr',
    app_metadata: {},
    user_metadata: { nickname: 'Demo User' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User;
}

function createDemoProfile(): DbUser {
  const userId = getDemoUserId();
  return {
    id: userId,
    email: 'demo@zzik.kr',
    nickname: '데모 사용자',
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as DbUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DbUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [demoVerified, setDemoVerified] = useState(false);

  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;

  // Fetch user profile from database
  const fetchProfile = useCallback(
    async (userId: string) => {
      if (!supabase) {
        if (isDemo && demoVerified) return createDemoProfile();
        return null;
      }

      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as DbUser;
    },
    [supabase, isDemo, demoVerified]
  );

  // Create profile if not exists
  const createProfile = useCallback(
    async (authUser: User) => {
      if (!supabase) {
        if (isDemo && demoVerified) return createDemoProfile();
        return null;
      }

      const profileData = {
        id: authUser.id,
        email: authUser.email!,
        nickname: authUser.user_metadata?.nickname || authUser.email?.split('@')[0],
        avatar_url: authUser.user_metadata?.avatar_url,
      };

      const { data, error } = await supabase
        .from('users')
        .insert(profileData as never)
        .select()
        .single();

      if (error) {
        // Profile might already exist
        if (error.code === '23505') {
          return await fetchProfile(authUser.id);
        }
        console.error('Error creating profile:', error);
        return null;
      }

      return data as unknown as DbUser;
    },
    [supabase, fetchProfile, isDemo, demoVerified]
  );

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (isDemo && demoVerified) {
      setProfile(createDemoProfile());
      return;
    }
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user, fetchProfile, isDemo, demoVerified]);

  // Initialize auth state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const initAuth = async () => {
      // SEC-001 FIX: Verify demo mode with server-side API
      if (!isSupabaseConfigured()) {
        const serverDemoEnabled = await verifyDemoModeWithServer();
        setIsDemo(serverDemoEnabled);
        setDemoVerified(true);

        if (serverDemoEnabled) {
          setUser(createDemoUser());
          setProfile(createDemoProfile());
          setLoading(false);
          console.warn(
            '[Auth] Running in DEMO mode (verified by server). Set ENABLE_DEMO_MODE=false to disable.'
          );
          return;
        } else {
          // Supabase not configured and demo mode not enabled - no user
          setLoading(false);
          return;
        }
      }

      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setSession(session);
          setUser(session.user);

          let profileData = await fetchProfile(session.user.id);
          if (!profileData) {
            profileData = await createProfile(session.user);
          }
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    if (!supabase) return;

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        let profileData = await fetchProfile(session.user.id);
        if (!profileData && event === 'SIGNED_IN') {
          profileData = await createProfile(session.user);
        }
        setProfile(profileData);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile, createProfile]);

  // Sign in with email
  const signInWithEmail = async (email: string, password: string) => {
    if (isDemo && demoVerified) {
      // Demo mode: simulate successful login
      setUser(createDemoUser());
      setProfile(createDemoProfile());
      return { error: null };
    }
    if (!supabase) {
      return { error: new Error('Authentication service not configured') };
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign up with email
  const signUpWithEmail = async (email: string, password: string, nickname?: string) => {
    if (isDemo && demoVerified) {
      // Demo mode: simulate successful signup
      const demoProfile = createDemoProfile();
      setUser(createDemoUser());
      setProfile({ ...demoProfile, nickname: nickname || demoProfile.nickname });
      return { error: null };
    }
    if (!supabase) {
      return { error: new Error('Authentication service not configured') };
    }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nickname },
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (isDemo && demoVerified) {
      // Demo mode: simulate successful Google login
      setUser(createDemoUser());
      setProfile(createDemoProfile());
      window.location.href = '/dashboard';
      return { error: null };
    }
    if (!supabase) {
      return { error: new Error('Authentication service not configured') };
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign in with Kakao
  const signInWithKakao = async () => {
    if (isDemo && demoVerified) {
      // Demo mode: simulate successful Kakao login
      setUser(createDemoUser());
      setProfile(createDemoProfile());
      window.location.href = '/dashboard';
      return { error: null };
    }
    if (!supabase) {
      return { error: new Error('Authentication service not configured') };
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign in with Apple
  const signInWithApple = async () => {
    if (isDemo && demoVerified) {
      // Demo mode: simulate successful Apple login
      setUser(createDemoUser());
      setProfile(createDemoProfile());
      window.location.href = '/dashboard';
      return { error: null };
    }
    if (!supabase) {
      return { error: new Error('Authentication service not configured') };
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    if (!(isDemo && demoVerified) && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isLoading: loading, // Alias
        isDemo,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithKakao,
        signInWithApple,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
