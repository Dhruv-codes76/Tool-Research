import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware runs on every page route (see `config.matcher`) and does two jobs:
 *
 *  1. Content-Security-Policy — a per-request nonce is generated and embedded in
 *     the CSP so scripts load via `'strict-dynamic'` without `'unsafe-inline'`.
 *     Next.js reads this header and stamps the nonce onto its own bootstrap
 *     scripts automatically. The nonce is exposed to Server Components via the
 *     `x-nonce` request header.
 *
 *  2. Admin edge gate (only for `/admin/*`) — "is there a verified Supabase
 *     session?" plus auth-token refresh. The Edge runtime can't reach Prisma, so
 *     the real ADMIN role/status check runs in the Node runtime
 *     (`getCurrentAdmin()` in the admin layout, `requireAdmin()` in actions).
 */

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== "production";

  // Scripts: nonce + strict-dynamic (self/https are ignored by supporting
  // browsers once strict-dynamic is present, kept for older ones). Dev needs
  // 'unsafe-eval' for React Fast Refresh / HMR.
  const scriptSrc = ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", isDev ? "'unsafe-eval'" : ""]
    .filter(Boolean)
    .join(" ");

  // Styles: React inline style={{}} objects render as style attributes, which
  // nonces cannot cover — so 'unsafe-inline' is required. Google Fonts serves
  // the Material Symbols stylesheet.
  const styleSrc = "'self' 'unsafe-inline' https://fonts.googleapis.com";

  // XHR/fetch/websocket: Supabase (auth + realtime) and Sanity (blog CMS). Dev
  // adds ws: for the HMR socket.
  const connectSrc = [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://*.sanity.io",
    isDev ? "ws:" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    // Tool logos/screenshots come from arbitrary external hosts (GitHub, CDNs)
    // plus Supabase storage — allow any https image, data:, and blob:.
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src ${connectSrc}`,
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  // Expose the nonce + CSP to the rendering pipeline via request headers so
  // Next.js can nonce its framework scripts.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  // ─── Admin edge gate ───────────────────────────────────────────────────────
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // DEV BYPASS: a quick-login cookie skips the JWT check in development so you
    // can reach the admin panel without a real session. Never runs in prod.
    const devBypass =
      process.env.NODE_ENV !== "production"
        ? request.cookies.get("x-dev-bypass")?.value
        : undefined;

    if (devBypass !== "admin" && devBypass !== "user") {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // If Supabase isn't configured (e.g. local dev without env), don't
      // hard-fail — let the Node-runtime guards handle access downstream.
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
              response = NextResponse.next({ request: { headers: requestHeaders } });
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            },
          },
        });

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          const url = request.nextUrl.clone();
          url.pathname = "/login";
          url.searchParams.set("next", request.nextUrl.pathname);
          const redirect = NextResponse.redirect(url);
          redirect.headers.set("Content-Security-Policy", csp);
          return redirect;
        }
      }
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Run on all page routes; skip API, Next internals, and static asset files
  // (they don't need a CSP and this avoids per-asset middleware overhead).
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?)).*)",
  ],
  runtime: "experimental-edge",
};
