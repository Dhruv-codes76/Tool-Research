import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { codeInput } from "@sanity/code-input";
import { table } from "@sanity/table";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { dataset, projectId } from "./src/sanity/env";

// Embedded Studio, mounted at /studio via
// src/app/studio/[[...tool]]/page.tsx. Auth is Sanity's own project login
// (separate from the app's Supabase auth) — only project members can edit.
export default defineConfig({
  name: "default",
  title: "AI Tool Research — Blog",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool(), codeInput(), table()],
  schema: {
    types: schemaTypes,
  },
});
