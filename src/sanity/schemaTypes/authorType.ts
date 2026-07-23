import { defineType, defineField } from "sanity";

export const authorType = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
    }),
    defineField({
      name: "role",
      type: "string",
      description: "Byline shown under the name, e.g. \"Senior Engineer\".",
    }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "bio",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: { title: "name", media: "image" },
  },
});
