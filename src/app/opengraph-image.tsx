import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";

/**
 * Default site-wide Open Graph / Twitter card (1200×630). Next.js inherits this
 * for every route that does not define its own opengraph-image (home, /tools,
 * /blog, /about, /privacy, /terms, and any blog post without a cover image).
 * Tool detail pages override it with their own per-tool card.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AI Tool Research — a human-curated directory of open-source AI tools";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "radial-gradient(1200px 600px at 15% -10%, #1a1030 0%, transparent 60%), radial-gradient(900px 500px at 100% 120%, #10233a 0%, transparent 55%), #050507",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            alignItems: "center",
            gap: 14,
            background: "rgba(139, 92, 246, 0.12)",
            border: "1px solid rgba(139, 92, 246, 0.35)",
            color: "#c4b5fd",
            borderRadius: 999,
            padding: "12px 28px",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          <div style={{ display: "flex", width: 12, height: 12, borderRadius: 6, background: "#a78bfa" }} />
          CURATED · OPEN SOURCE · AI
        </div>

        {/* Wordmark + headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>
            {SITE_NAME}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 500,
              color: "rgba(255,255,255,0.82)",
              maxWidth: 940,
              lineHeight: 1.35,
            }}
          >
            The best open-source AI tools on GitHub — hand-curated, with live repo
            stats, install guides, and honest detail pages.
          </div>
        </div>

        {/* Footer row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#8b5cf6" }}>
            aitoolresearch.com
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 26,
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            No scraping · No noise
          </div>
        </div>
      </div>
    ),
    size,
  );
}
