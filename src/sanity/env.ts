// Single source of truth for Sanity project coordinates, shared by the read
// client (src/sanity/client.ts) and the embedded Studio (sanity.config.ts).
// Falls back to the live project so the app connects even without env vars set.
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-05-31";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "avrir21x";
