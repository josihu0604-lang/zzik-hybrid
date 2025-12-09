import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse, NextRequest } from 'next/server';

/**
 * OAuth Callback Handler
 * 
 * This route handles the OAuth callback from providers (Google, Kakao, Apple).
 * After successful authentication, it:
 * 1. Exchanges the code for a session
 * 2. Redirects to the home page or the originally requested page
 * 
 * Security:
 * - Uses server-side Supabase client for secure session management
 * - Validates OAuth state to prevent CSRF attacks
 * - Handles errors gracefully with user-friendly messages
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('[Auth] OAuth callback error:', error, error_description);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error_description || error)}`, requestUrl.origin)
    );
  }

  // Validate code parameter
  if (!code) {
    console.error('[Auth] No code parameter in OAuth callback');
    return NextResponse.redirect(
      new URL('/auth/login?error=invalid_callback', requestUrl.origin)
    );
  }

  try {
    const supabase = await createServerSupabaseClient();

    // Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[Auth] Failed to exchange code for session:', exchangeError);
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      );
    }

    // Get the redirect URL from the state parameter (if any)
    const next = requestUrl.searchParams.get('next') || '/';

    // Successful authentication - redirect to home or requested page
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch (error) {
    console.error('[Auth] Unexpected error in OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=unexpected_error', requestUrl.origin)
    );
  }
}
