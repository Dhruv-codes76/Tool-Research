import Studio from "./Studio";

// The Studio is a single-page app; render it statically and let it hydrate.
export const dynamic = "force-static";

// Sanity ships sensible <head> metadata + viewport for the Studio route.
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <Studio />;
}
