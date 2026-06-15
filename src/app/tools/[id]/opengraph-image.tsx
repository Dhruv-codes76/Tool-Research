import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

// Branded 1200×630 share card per tool, mirroring the detail-page hero card.
// Next wires this to og:image / twitter:image with correct dimensions.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AI Tool Research — open-source AI tool";

const fmt = (n: number) =>
  n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);

export default async function OgImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tool = await prisma.tool.findFirst({
    where: {
      OR: [{ id }, { name: { equals: id } }, { repoUrl: { contains: `/${id}` } }],
    },
    include: { toolTypes: true },
  });

  const name = tool?.name ?? "AI Tool Research";
  const description = (tool?.description ?? "A curated index of open-source AI tools.").slice(0, 120);
  const logo = tool?.heroImageUrl || tool?.imageUrl || null;
  const category = (tool?.toolTypes?.[0]?.name ?? "Open Source").toUpperCase();
  const version = tool?.version ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 40,
          // page background
          background:
            "radial-gradient(900px 500px at 85% 0%, rgba(99,102,241,0.20), transparent 60%), radial-gradient(700px 500px at 10% 110%, rgba(168,85,247,0.18), transparent 60%), #0a0a0c",
          fontFamily: "sans-serif",
        }}
      >
        {/* The glass card panel (fills the 1200×630 frame) */}
        <div
          style={{
            position: "relative",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 30,
            padding: "60px 68px",
            borderRadius: 36,
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "radial-gradient(600px 320px at 50% 130%, rgba(99,102,241,0.18), transparent 70%), #0c0d10",
            boxShadow: "0 0 60px rgba(62,166,255,0.10)",
            color: "#fff",
          }}
        >
          {/* Wordmark */}
          <div
            style={{
              position: "absolute",
              top: 34,
              right: 44,
              display: "flex",
              fontSize: 26,
              fontWeight: 700,
              opacity: 0.8,
            }}
          >
            <span style={{ color: "#a5b4fc" }}>ai</span>
            <span>toolresearch</span>
          </div>

          {/* Category pill */}
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 3,
              color: "#c4b5fd",
              border: "1px solid rgba(196,181,253,0.32)",
              background: "rgba(196,181,253,0.08)",
              borderRadius: 999,
              padding: "9px 20px",
            }}
          >
            {category}
          </div>

          {/* Logo + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" width={108} height={108} style={{ objectFit: "contain", borderRadius: 18 }} />
            ) : null}
            <div style={{ display: "flex", fontSize: 104, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>
              {name}
            </div>
          </div>

          {/* Description */}
          <div style={{ display: "flex", fontSize: 34, fontWeight: 600, color: "rgba(255,255,255,0.85)", maxWidth: 920, lineHeight: 1.25 }}>
            {description}
          </div>

          {/* Stars / forks pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 30,
              alignSelf: "flex-start",
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 999,
              padding: "14px 28px",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="#facc15">
                <path d="M12 2l2.9 6.26 6.9.6-5.2 4.52 1.55 6.74L12 17.27 5.85 20.6l1.55-6.74L2.2 8.86l6.9-.6z" />
              </svg>
              {fmt(tool?.stars ?? 0)} Stars
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.9)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24">
                <circle cx="6" cy="5" r="2.6" fill="#cbd5e1" />
                <circle cx="6" cy="19" r="2.6" fill="#cbd5e1" />
                <circle cx="18" cy="6" r="2.6" fill="#cbd5e1" />
                <rect x="4.7" y="5" width="2.6" height="14" fill="#cbd5e1" />
              </svg>
              {fmt(tool?.forks ?? 0)} Forks
            </div>
          </div>

          {/* Version */}
          {version ? (
            <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.7)" }}>
              Version:&nbsp;<span style={{ color: "#fff", fontWeight: 700 }}>{version}</span>
            </div>
          ) : null}
        </div>
      </div>
    ),
    size,
  );
}
