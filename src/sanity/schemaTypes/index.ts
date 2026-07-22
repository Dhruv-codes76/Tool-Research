import { postType } from "./postType";
import { authorType } from "./authorType";
import { categoryType } from "./categoryType";
import { blockContentType } from "./blockContentType";

// Registered in sanity.config.ts. Keep field names in sync with the GROQ
// projections in src/sanity/queries.ts and the renderers in
// src/components/blog/PortableTextComponents.tsx.
export const schemaTypes = [
  postType,
  authorType,
  categoryType,
  blockContentType,
];
