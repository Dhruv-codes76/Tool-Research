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

function buildCsp(allowVideoEmbeds = false): string {
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
    // Blog posts can embed YouTube/Vimeo players; everywhere else stays 'none'.
    allowVideoEmbeds
      ? "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com"
      : "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

// The embedded Sanity Studio (/studio) is a client-side app that needs a much
// looser policy than the public site: `eval` for its runtime, blob: workers,
// and its own iframes for document previews. It is not CDN-cached like the
// marketing pages, so a route-scoped relaxed CSP is safe here.
function buildStudioCsp(): string {
  const isDev = process.env.NODE_ENV !== "production";

  const connectSrc = [
    "'self'",
    "https://*.sanity.io",
    "wss://*.sanity.io",
    "https://*.sanity-cdn.com",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    isDev ? "ws:" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return [
    "default-src 'self'",
    // *.sanity-cdn.com serves the Studio "bridge" script (dashboard/comments).
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://*.sanity-cdn.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src ${connectSrc}`,
    "worker-src 'self' blob:",
    "frame-src 'self' https://*.sanity.io blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  // Static, cache-safe CSP — identical on every response (no per-request nonce).
  // The Studio route gets its own relaxed policy (see buildStudioCsp).
  const pathname = request.nextUrl.pathname;
  const csp = pathname.startsWith("/studio")
    ? buildStudioCsp()
    : buildCsp(pathname.startsWith("/blog"));

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
