import { groq } from "next-sanity";

export const postsQuery = groq`*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage,
  "authorName": author->name,
  "authorImage": author->image,
  "categories": categories[]->title
}`;

export const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage,
  body,
  "authorName": author->name,
  "authorImage": author->image,
  "categories": categories[]->title
}`;
