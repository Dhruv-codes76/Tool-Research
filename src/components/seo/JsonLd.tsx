/**
 * Renders a JSON-LD structured-data block. Invisible to users; read by Google
 * and AI assistants. Pass a single schema object or an array of them.
 */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      // Schema is built server-side from our own data, never user free-text HTML.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
