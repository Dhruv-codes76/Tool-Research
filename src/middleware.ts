import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware runs on every page route (see `config.matcher`) and does two jobs:
 *
 *  1. Content-Security-Policy — a STATIC, cache-safe policy. We deliberately do
 *     NOT use a per-request nonce: this site is statically/ISR-rendered and sits
 *     behind a CDN (Cloudflare), so the HTML body is cached while a nonce header
 *     would rotate per request — the baked-in script nonce then no longer matches
 *     the header, and `'strict-dynamic'` blocks EVERY script (sitewide blank page,
 *     the outage this replaced). A constant `script-src 'self' 'unsafe-inline'`
 *     is identical on every response, so it survives caching. Same-origin bundles
 *     load via `'self'`; Next.js's inline hydration/flight scripts via
 *     `'unsafe-inline'`. All the strong directives (object-src, frame-ancestors,
 *     base-uri, form-action…) are kept.
 *
 *  2. Admin edge gate (only for `/admin/*`) — "is there a verified Supabase
 *     session?" plus auth-token refresh. The Edge runtime can't reach Prisma, so
 *     the real ADMIN role/status check runs in the Node runtime
 *     (`getCurrentAdmin()` in the admin layout, `requireAdmin()` in actions).
 */

function buildCsp(): string {
  const isDev = process.env.NODE_ENV !== "production";

  // Scripts: static policy — 'self' for same-origin bundles, 'unsafe-inline' for
  // Next.js's inline bootstrap/flight scripts. No nonce/'strict-dynamic' (see the
  // file header: they break under CDN/ISR HTML caching). Dev adds 'unsafe-eval'
  // for React Fast Refresh / HMR.
  const scriptSrc = ["'self'", "'unsafe-inline'", isDev ? "'unsafe-eval'" : ""]
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
  // Static, cache-safe CSP — identical on every response (no per-request nonce).
  const csp = buildCsp();

  const requestHeaders = new Headers(request.headers);

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
