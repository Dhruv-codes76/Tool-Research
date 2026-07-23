import { defineType, defineField } from "sanity";

// Matches postsQuery / postBySlugQuery in src/sanity/queries.ts.
export const postType = defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "mainImage",
      title: "Main image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", type: "string", title: "Alt text" }),
      ],
    }),
    defineField({
      name: "categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      type: "text",
      rows: 3,
      description: "Short summary shown on the blog index and social cards.",
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Free-form technical tags, e.g. docker, ci/cd, rust.",
    }),
    defineField({
      name: "body",
      type: "blockContent",
    }),
    defineField({
      name: "seo",
      title: "SEO overrides",
      type: "object",
      description:
        "Optional. Leave blank to fall back to the title / excerpt / main image.",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "metaTitle",
          type: "string",
          description: "Overrides the <title> and social title.",
          validation: (rule) => rule.max(70),
        }),
        defineField({
          name: "metaDescription",
          type: "text",
          rows: 2,
          description: "Overrides the meta description / social description.",
          validation: (rule) => rule.max(160),
        }),
        defineField({
          name: "ogImage",
          title: "Social share image",
          type: "image",
          description: "Overrides the main image for social cards.",
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", author: "author.name", media: "mainImage" },
    prepare({ title, author, media }) {
      return { title, subtitle: author ? `by ${author}` : undefined, media };
    },
  },
});
