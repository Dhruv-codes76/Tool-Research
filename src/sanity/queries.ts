import { groq } from "next-sanity";

export const postsQuery = groq`*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage,
  tags,
  "authorName": author->name,
  "authorImage": author->image,
  "categories": categories[]->title
}`;

export const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0] {
  _id,
  _createdAt,
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage,
  body,
  tags,
  seo,
  "authorName": author->name,
  "author": author->{name, image, role},
  "category": categories[0]->{title},
  "categories": categories[]->title
}`;
