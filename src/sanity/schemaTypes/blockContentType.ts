import { defineType, defineArrayMember, defineField } from "sanity";

// The custom object members below (contentImage, codeBlock, callout) MUST stay
// in sync with the renderers in
// src/components/blog/PortableTextComponents.tsx — the frontend reads these
// exact type/field names.
export const blockContentType = defineType({
  title: "Body",
  name: "blockContent",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H1", value: "h1" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
          { title: "Code", value: "code" },
        ],
        annotations: [
          defineArrayMember({
            title: "URL",
            name: "link",
            type: "object",
            fields: [
              defineField({
                title: "URL",
                name: "href",
                type: "url",
              }),
            ],
          }),
        ],
      },
    }),
    // Rendered by the `contentImage` component.
    defineArrayMember({
      type: "object",
      name: "contentImage",
      title: "Image",
      fields: [
        defineField({ name: "image", type: "image", options: { hotspot: true } }),
        defineField({ name: "alt", type: "string", title: "Alt text" }),
        defineField({ name: "caption", type: "string" }),
      ],
      preview: {
        select: { media: "image", title: "caption" },
        prepare({ media, title }) {
          return { media, title: title || "Image" };
        },
      },
    }),
    // Source code with a language dropdown + filename, from @sanity/code-input
    // (the `code` type is registered by codeInput() in sanity.config.ts).
    // Rendered with syntax highlighting by the `code` component.
    defineArrayMember({
      type: "code",
      name: "code",
      title: "Code block",
      options: {
        withFilename: true,
        languageAlternatives: [
          { title: "Bash / Shell", value: "bash" },
          { title: "TypeScript", value: "typescript" },
          { title: "TSX", value: "tsx" },
          { title: "JavaScript", value: "javascript" },
          { title: "JSX", value: "jsx" },
          { title: "JSON", value: "json" },
          { title: "Python", value: "python" },
          { title: "Go", value: "go" },
          { title: "Rust", value: "rust" },
          { title: "YAML", value: "yaml" },
          { title: "SQL", value: "sql" },
          { title: "HTML", value: "markup" },
          { title: "CSS", value: "css" },
          { title: "Dockerfile", value: "docker" },
          { title: "Markdown", value: "markdown" },
          { title: "Plain text", value: "text" },
        ],
      },
    }),
    // Shell commands in a terminal-window UI (registered in schemaTypes/index).
    defineArrayMember({ type: "terminal" }),
    // Comparison / spec tables, from @sanity/table (the `table` type is
    // registered by table() in sanity.config.ts).
    defineArrayMember({ type: "table" }),
    // YouTube / Vimeo embeds (registered in schemaTypes/index).
    defineArrayMember({ type: "videoEmbed" }),
    // Rendered by the `callout` component.
    defineArrayMember({
      type: "object",
      name: "callout",
      title: "Callout",
      fields: [
        defineField({ name: "text", type: "text", rows: 3 }),
        defineField({
          name: "type",
          type: "string",
          options: {
            list: [
              { title: "Pro Tip", value: "tip" },
              { title: "Info", value: "info" },
              { title: "Warning", value: "warning" },
              { title: "Danger", value: "danger" },
            ],
            layout: "radio",
          },
          initialValue: "tip",
        }),
      ],
      preview: {
        select: { title: "text", subtitle: "type" },
      },
    }),
  ],
});
