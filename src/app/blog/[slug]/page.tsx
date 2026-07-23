import { client } from "@/sanity/client";
import { postBySlugQuery } from "@/sanity/queries";
import { urlForImage } from "@/sanity/image";
import BlogArticleClient from "@/components/blog/BlogArticleClient";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, graph, breadcrumbSchema, blogPostingSchema } from "@/lib/seo";

export const revalidate = 60; // Revalidate every 60 seconds

async function getSlug(
  params: Promise<{ slug: string }> | { slug: string },
): Promise<string> {
  // Safe param extraction for Next.js 16 Client/Server Component
  const resolved = params && "then" in params ? await params : params;
  return resolved?.slug || "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const slug = await getSlug(params);
  const post = await client.fetch(postBySlugQuery, { slug });

  if (!post) {
    return buildMetadata({ title: "Article Not Found", index: false });
  }

  // SEO overrides (post.seo) win over the auto-generated title/excerpt/image.
  const ogSource = post.seo?.ogImage || post.mainImage;
  return buildMetadata({
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    path: `/blog/${slug}`,
    image: ogSource ? urlForImage(ogSource)?.url() : undefined,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const postSlug = await getSlug(params);

  const post = await client.fetch(postBySlugQuery, { slug: postSlug });

  if (!post) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={graph(
          blogPostingSchema({
            title: post.title,
            description: post.excerpt,
            path: `/blog/${postSlug}`,
            image: post.mainImage ? urlForImage(post.mainImage)?.url() : undefined,
            datePublished: post.publishedAt,
            authorName: post.authorName,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${postSlug}` },
          ]),
        )}
      />
      <BlogArticleClient post={post} />
    </>
  );
}
