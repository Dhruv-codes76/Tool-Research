import { client } from "@/sanity/client";
import { postsQuery } from "@/sanity/queries";
import BlogClient, { SanityPost } from "./BlogClient";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function BlogPage() {
  const posts = await client.fetch<SanityPost[]>(postsQuery);
  return <BlogClient posts={posts} />;
}
