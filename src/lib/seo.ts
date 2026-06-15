import type { Metadata } from "next";

/**
 * Central SEO helper. Every page builds its metadata through `buildMetadata` so
 * titles, descriptions, canonicals, and social cards stay consistent sitewide —
 * change the rules here once and they apply everywhere.
 *
 * Sitewide structured data (Organization + WebSite) lives here too and is
 * rendered once in the root layout via the <JsonLd /> component.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aitoolresearch.com";
export const SITE_NAME = "AI Tool Research";

// Optional X/Twitter handle (e.g. "@aitoolresearch") for card attribution.
export const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE || undefined;

// Default share image. TODO: replace with a purpose-built 1200×630 OG image.
export const DEFAULT_OG_IMAGE = "/logo-v2.png";

export const DEFAULT_TITLE = "AI Tool Research — Curated Open-Source AI Tools";
export const DEFAULT_DESCRIPTION =
  "A human-curated directory of the best open-source AI tools on GitHub. Live repo stats, install guides, and honest detail pages — no scraping, no noise.";

type BuildMetadataInput = {
  /** Page concept WITHOUT the brand (e.g. "Open-Source AI Tool Directory"). The brand is appended automatically. Omit on the home page. */
  title?: string;
  description?: string;
  /** Path beginning with "/" (e.g. "/tools"). Used for the canonical + OG url. Resolved to absolute via metadataBase. */
  path?: string;
  /** Absolute or root-relative image URL. Falls back to the default OG image. */
  image?: string | null;
  /** Set false to keep a page out of search (e.g. drafts). Default true. */
  index?: boolean;
  type?: "website" | "article";
  /** Set false on keyword-heavy pages to drop the " | AI Tool Research" suffix and reclaim ~20 chars for keywords. Default true. */
  appendBrand?: boolean;
};

export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  index = true,
  type = "website",
  appendBrand = true,
}: BuildMetadataInput = {}): Metadata {
  const fullTitle = title
    ? appendBrand
      ? `${title} | ${SITE_NAME}`
      : title
    : DEFAULT_TITLE;
  const desc = (description || DEFAULT_DESCRIPTION).slice(0, 160);
  const ogImage = image || DEFAULT_OG_IMAGE;

  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical: path },
    robots: index ? undefined : { index: false, follow: false },
    openGraph: {
      title: fullTitle,
      description: desc,
      url: path,
      siteName: SITE_NAME,
      type,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [ogImage],
      ...(TWITTER_HANDLE ? { site: TWITTER_HANDLE, creator: TWITTER_HANDLE } : {}),
    },
  };
}

// Stable @id anchors so any page's schema can cross-reference these nodes
// instead of redefining the brand on every page (the @graph pattern).
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Organization node — who we are. Referenced by @id from page schemas. */
export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-v2.png`,
    description: DEFAULT_DESCRIPTION,
  } as const;
}

/**
 * WebSite node. Intentionally omits a SearchAction because site search is
 * client-side filtering (no crawlable ?q= endpoint) — declaring one would point
 * Google at a URL that performs no search.
 */
export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: { "@id": ORG_ID },
  } as const;
}

/**
 * Wraps schema nodes into a single JSON-LD @graph document. Use one graph()
 * per page so all entities share context and can reference each other by @id.
 */
export function graph(...nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

/** BreadcrumbList node from an ordered list of { name, path } crumbs. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  } as const;
}

/** CollectionPage node for directory/listing pages. */
export function collectionPageSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@type": "CollectionPage",
    "@id": `${SITE_URL}${path}#webpage`,
    url: `${SITE_URL}${path}`,
    name,
    description,
    isPartOf: { "@id": WEBSITE_ID },
  } as const;
}

/** BlogPosting node for an editorial article. */
export function blogPostingSchema({
  title,
  description,
  path,
  image,
  datePublished,
  dateModified,
  authorName,
}: {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  authorName?: string | null;
}) {
  return {
    "@type": "BlogPosting",
    "@id": `${SITE_URL}${path}#article`,
    headline: title,
    ...(description ? { description } : {}),
    url: `${SITE_URL}${path}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${path}` },
    ...(image ? { image } : {}),
    ...(datePublished ? { datePublished } : {}),
    // Never fabricate "today" — fall back to publish date when no edit date exists.
    ...(dateModified || datePublished
      ? { dateModified: dateModified || datePublished }
      : {}),
    ...(authorName ? { author: { "@type": "Person", name: authorName } } : {}),
    publisher: { "@id": ORG_ID },
  } as const;
}

/**
 * SoftwareApplication node for a curated tool. Honest by design: no
 * aggregateRating/review (we don't collect them) — fabricating those risks a
 * structured-data penalty.
 */
export function softwareApplicationSchema({
  name,
  description,
  path,
  image,
  operatingSystems,
  category,
  repoUrl,
}: {
  name: string;
  description: string;
  path: string;
  image?: string | null;
  operatingSystems?: string[];
  category?: string;
  repoUrl?: string | null;
}) {
  return {
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}${path}#software`,
    name,
    description,
    url: `${SITE_URL}${path}`,
    applicationCategory: category || "DeveloperApplication",
    ...(operatingSystems && operatingSystems.length
      ? { operatingSystem: operatingSystems.join(", ") }
      : {}),
    ...(image ? { image } : {}),
    ...(repoUrl ? { codeRepository: repoUrl, sameAs: repoUrl } : {}),
    // It's open source — explicitly free.
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
    publisher: { "@id": ORG_ID },
  } as const;
}
