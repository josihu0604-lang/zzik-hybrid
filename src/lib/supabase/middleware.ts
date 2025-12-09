import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { generateCsrfToken, CSRF_COOKIE_NAME, CSRF_TOKEN_LENGTH } from '@/lib/csrf';

// Check if Supabase is properly configured
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function isSupabaseConfigured(): boolean {
  return !!(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('placeholder') &&
    SUPABASE_URL !== 'your-project.supabase.co' &&
    SUPABASE_ANON_KEY !== 'placeholder-key'
  );
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Skip Supabase auth check if not configured (demo mode)
  if (!isSupabaseConfigured()) {
    // In demo mode, allow all routes
    return response;
  }

  let supabaseResponse = response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        supabaseResponse = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        supabaseResponse.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        supabaseResponse = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        supabaseResponse.cookies.set({ name, value: '', ...options });
      },
    },
  });

  // Refresh session if exists
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes check
  const protectedPaths = ['/dashboard', '/checkin', '/profile'];
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isProtectedPath && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect logged-in users away from login page
  if (request.nextUrl.pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Set CSRF token cookie if not present or invalid
  // CSRF_TOKEN_LENGTH is 32 bytes, hex encoding = 64 characters
  const existingToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!existingToken || existingToken.length !== CSRF_TOKEN_LENGTH * 2) {
    const newToken = generateCsrfToken();
    const isProduction = process.env.NODE_ENV === 'production';
    supabaseResponse.cookies.set(CSRF_COOKIE_NAME, newToken, {
      httpOnly: false, // Must be readable by JavaScript for double-submit
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  return supabaseResponse;
}
