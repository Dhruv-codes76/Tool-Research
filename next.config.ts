import type { NextConfig } from "next";

// Baseline security headers applied to every response. These are low-risk on a
// Vercel-hosted, HTTPS-only Next.js app. A nonce-based Content-Security-Policy
// is intentionally NOT set here — it requires per-request nonces via middleware
// plus testing against the Supabase/Sanity/GitHub origins, and belongs in its
// own change. See .claude/rules/web/security.md.
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['10.238.71.101'],
  serverExternalPackages: ["pg-cloudflare"],
  async headers() {
    return [
      {
        // Apply to all routes.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
