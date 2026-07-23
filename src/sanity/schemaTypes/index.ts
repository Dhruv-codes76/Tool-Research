import { postType } from "./postType";
import { authorType } from "./authorType";
import { categoryType } from "./categoryType";
import { blockContentType } from "./blockContentType";
import { terminalType } from "./terminalType";
import { videoEmbedType } from "./videoEmbedType";

// Registered in sanity.config.ts. Keep field names in sync with the GROQ
// projections in src/sanity/queries.ts and the renderers in
// src/components/blog/PortableTextComponents.tsx.
// The `code` and `table` array members in blockContent come from the
// codeInput() / table() plugins, not from this list.
export const schemaTypes = [
  postType,
  authorType,
  categoryType,
  blockContentType,
  terminalType,
  videoEmbedType,
];
