import { client } from "@/sanity/client";
import { postsQuery } from "@/sanity/queries";
import BlogClient, { SanityPost } from "./BlogClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, graph, breadcrumbSchema, collectionPageSchema } from "@/lib/seo";

export const revalidate = 60; // Revalidate every 60 seconds

const PAGE_DESCRIPTION =
  "Guides, deep-dives, and curation notes on the best open-source AI tools — how to choose them, install them, and get the most out of them.";

export const metadata = buildMetadata({
  title: "Blog — Open-Source AI Tool Guides",
  description: PAGE_DESCRIPTION,
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await client.fetch<SanityPost[]>(postsQuery);
  return (
    <>
      <JsonLd
        data={graph(
          collectionPageSchema({
            name: "AI Tool Research Blog",
            description: PAGE_DESCRIPTION,
            path: "/blog",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        )}
      />
      <BlogClient posts={posts} />
    </>
  );
}
