import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { validateRedirectUrl } from '@/lib/api-middleware';

/**
 * Auth Callback Route
 *
 * Handles OAuth callback from Supabase Auth.
 * Fixed: Open redirect vulnerability - validates 'next' parameter
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next');

  // Validate redirect URL to prevent open redirect attacks
  const next = validateRedirectUrl(rawNext, '/dashboard');

  if (code) {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      console.error('Auth callback error:', error.message);
    } catch (err) {
      console.error('Auth callback exception:', err);
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
