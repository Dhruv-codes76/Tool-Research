import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { client as sanityClient } from "@/sanity/client";
import { postsQuery } from "@/sanity/queries";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.aitoolresearch.com").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/tools`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.4 },
  ];

  // Tools — only ACTIVE ones are public.
  let toolRoutes: MetadataRoute.Sitemap = [];
  try {
    const tools = await prisma.tool.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, slug: true, updatedAt: true },
    });
    toolRoutes = tools.map((t: any) => ({
      url: `${SITE_URL}/tools/${t.slug || t.id}`,
      lastModified: t.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // DB unreachable at build — degrade to static routes rather than failing the build.
  }

  // Blog posts (Sanity) — best-effort.
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts: Array<{ slug?: { current?: string }; publishedAt?: string }> =
      await sanityClient.fetch(postsQuery);
    blogRoutes = (posts || [])
      .filter((p) => p.slug?.current)
      .map((p: any) => ({
        url: `${SITE_URL}/blog/${p.slug!.current}`,
        lastModified: p.publishedAt ? new Date(p.publishedAt) : undefined,
        changeFrequency: "monthly",
        priority: 0.5,
      }));
  } catch {
    // Sanity unreachable / unconfigured — skip blog entries.
  }

  return [...staticRoutes, ...toolRoutes, ...blogRoutes];
}
