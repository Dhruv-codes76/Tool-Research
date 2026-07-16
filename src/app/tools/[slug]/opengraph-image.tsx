import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AI Tool Research — open-source AI tool";

const fmt = (n: number) =>
  n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // The dynamic segment is [slug] — the param key is `slug`, not `id`.
  // Reading `id` here left it undefined and rendered the wrong tool's card.
  const { slug } = await params;

  const tool = await prisma.tool.findFirst({
    where: {
      OR: [{ slug }, { id: slug }, { repoUrl: { contains: `/${slug}` } }],
    },
    include: { toolTypes: true },
  });

  const name = tool?.name ?? "AI Tool Research";
  const description = (tool?.description ?? "A curated index of open-source AI tools.").slice(0, 120);
  const logo = tool?.heroImageUrl || tool?.imageUrl || null;
  const category = (tool?.toolTypes?.[0]?.name ?? "Open Source").toUpperCase();
  const version = tool?.version ?? "v1.0.0"; // default for preview if none

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 40,
          background: "#050505",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "48px 56px",
            borderRadius: 36,
            background: "linear-gradient(to bottom right, #1a1010, #0a0a0c)",
            border: "1px solid rgba(255,255,255,0.05)",
            color: "#fff",
          }}
        >
          {/* Top section: Category and Share icon */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div
              style={{
                display: "flex",
                background: "rgba(76, 29, 149, 0.3)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                color: "#a78bfa",
                borderRadius: 999,
                padding: "8px 24px",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 1.5,
              }}
            >
              {category}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: 28,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </div>
          </div>

          {/* Logo + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 32, marginTop: 40 }}>
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" width={100} height={100} style={{ objectFit: "contain", borderRadius: 20 }} />
            ) : null}
            <div style={{ display: "flex", fontSize: 96, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>
              {name}
            </div>
          </div>

          {/* Description */}
          <div style={{ display: "flex", fontSize: 36, fontWeight: 500, color: "rgba(255,255,255,0.85)", marginTop: 32, maxWidth: 960, lineHeight: 1.4 }}>
            {description}
          </div>

          {/* Stars / forks pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 40,
              marginTop: 48,
              background: "#000",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 999,
              padding: "16px 40px",
              alignSelf: "flex-start",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, fontWeight: 700 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#facc15">
                <path d="M12 2l2.9 6.26 6.9.6-5.2 4.52 1.55 6.74L12 17.27 5.85 20.6l1.55-6.74L2.2 8.86l6.9-.6z" />
              </svg>
              {fmt(tool?.stars ?? 0)} Stars
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, fontWeight: 700 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="3" x2="6" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
              </svg>
              {fmt(tool?.forks ?? 0)} Forks
            </div>
          </div>

          {/* Version */}
          {version ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 40, fontSize: 28, color: "rgba(255,255,255,0.7)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              <div style={{ display: "flex", alignItems: "center" }}>
                Version:&nbsp;<span style={{ color: "#fff", fontWeight: 700 }}>{version}</span>
              </div>
            </div>
          ) : null}

          {/* Bottom Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: "auto", paddingTop: 40 }}>
            {/* view repo button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "rgba(255,255,255,0.15)",
                borderRadius: 999,
                padding: "12px 12px 12px 32px",
                fontSize: 28,
                fontWeight: 600,
                color: "#fff",
              }}
            >
              view repo
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f472b6",
                  borderRadius: 30,
                  width: 48,
                  height: 48,
                  marginLeft: 8,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#000">
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="19" r="2" />
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
              </div>
            </div>

            {/* download button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "rgba(255,255,255,0.15)",
                borderRadius: 999,
                padding: "12px 12px 12px 32px",
                fontSize: 28,
                fontWeight: 600,
                color: "#fff",
              }}
            >
              download
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.4)",
                  borderRadius: 30,
                  width: 48,
                  height: 48,
                  marginLeft: 8,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
