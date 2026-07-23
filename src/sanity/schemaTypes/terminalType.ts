import { defineType, defineField } from "sanity";

// Rendered by the `terminal` component in PortableTextComponents.tsx as a
// terminal-window UI (prompt + optional output). Use for shell commands;
// use the `code` block for source files.
export const terminalType = defineType({
  name: "terminal",
  title: "Terminal",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "Shell label shown in the window bar, e.g. bash, zsh, powershell.",
      initialValue: "bash",
    }),
    defineField({
      name: "command",
      type: "text",
      rows: 4,
      description: "The command(s) the reader runs (no leading $ — it's added for you).",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "output",
      type: "text",
      rows: 4,
      description: "Optional output printed after the command.",
    }),
  ],
  preview: {
    select: { title: "command", subtitle: "title" },
    prepare({ title, subtitle }) {
      return { title: title || "Terminal", subtitle: subtitle || "bash" };
    },
  },
});
