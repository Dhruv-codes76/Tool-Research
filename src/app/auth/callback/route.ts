import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase-server';
import { logAuthEvent } from '@/app/actions/auditActions';

/**
 * Single entry point for every email/OAuth redirect: signup confirmation,
 * password recovery, admin invites, and OAuth sign-in.
 *
 * It performs the token exchange server-side (sets the cookie session the
 * middleware + server guards rely on), then redirects to `next`. On failure it
 * forwards an `?error=verification` flag so the destination page can show a
 * clear message instead of leaving the user stranded.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const next = url.searchParams.get('next') ?? '/';

  const destination = new URL(next, url.origin);

  const supabase = await createServerClient();

  let failed = false;
  if (code) {
    // PKCE / OAuth + default email links
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = !!error;
  } else if (tokenHash && type) {
    // token_hash style email links
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    failed = !!error;
  } else {
    failed = true;
  }

  if (failed) {
    destination.searchParams.set('error', 'verification');
  } else {
    // Token exchange set the cookie session; record the verified sign-in.
    // Best-effort — must never block the redirect.
    await logAuthEvent('auth.login').catch(() => {});
  }

  return NextResponse.redirect(destination);
}
