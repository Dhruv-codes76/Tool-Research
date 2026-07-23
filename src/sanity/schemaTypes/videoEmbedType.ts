import { defineType, defineField } from "sanity";

// Rendered by the `videoEmbed` component as a responsive 16:9 iframe.
// Supports YouTube and Vimeo URLs (see getEmbedUrl in PortableTextComponents).
export const videoEmbedType = defineType({
  name: "videoEmbed",
  title: "Video embed",
  type: "object",
  fields: [
    defineField({
      name: "url",
      type: "url",
      title: "Video URL",
      description: "A YouTube or Vimeo link (watch, youtu.be, or embed form).",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "url", subtitle: "caption" },
    prepare({ title, subtitle }) {
      return { title: title || "Video", subtitle };
    },
  },
});
