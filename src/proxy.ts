import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Edge gate for the admin area.
 *
 * The Edge runtime can't reach Prisma, so this only enforces "is there a
 * verified Supabase session?" and refreshes the auth token (the piece the
 * `@supabase/ssr` flow needs that we were previously missing). The actual
 * ADMIN role/status check runs in the Node runtime — `getCurrentAdmin()` in the
 * admin layout and `requireAdmin()` in every admin Server Action.
 */
export async function proxy(request: NextRequest) {
  // ─── DEV BYPASS ────────────────────────────────────────────────────────────
  // In development, a quick-login cookie skips the Supabase JWT check so you
  // can reach the admin panel without a real session. Never runs in production.
  if (process.env.NODE_ENV !== "production") {
    const devBypass = request.cookies.get("x-dev-bypass")?.value;
    if (devBypass === "admin" || devBypass === "user") {
      return NextResponse.next();
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured (e.g. local dev without env), don't hard-fail
  // the whole site — let the Node-runtime guards handle access downstream.
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
