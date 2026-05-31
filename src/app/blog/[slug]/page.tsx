import { client } from "@/sanity/client";
import { postBySlugQuery } from "@/sanity/queries";
import BlogArticleClient from "@/components/blog/BlogArticleClient";
import { notFound } from "next/navigation";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  // Safe param extraction for Next.js 16 Client/Server Component
  const resolvedParams = params && 'then' in params ? await params : params;
  const postSlug = resolvedParams?.slug || '';

  const post = await client.fetch(postBySlugQuery, { slug: postSlug });

  if (!post) {
    notFound();
  }

  return <BlogArticleClient post={post} />;
}
