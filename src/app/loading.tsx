import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Global fallback loading UI. Next.js shows this whenever a route segment that
 * lacks its own `loading.tsx` suspends. The navbar/footer live in the layout
 * and stay put, so this only stands in for the page body.
 *
 * Kept deliberately neutral — a centered title block over a few content lines —
 * because it's the catch-all for every uncovered route (forms, legal text,
 * status pages), not any one page's shape. Data-heavy routes ship their own
 * accurate skeleton alongside their page.
 */
export default function Loading() {
  return (
    <main
      className="flex-grow pt-32 pb-32 max-w-3xl mx-auto px-gutter w-full"
      role="status"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center text-center gap-5 mb-12">
        <Skeleton className="h-3 w-40 rounded-full" />
        <Skeleton className="h-11 w-3/4 rounded-xl" />
        <Skeleton className="h-5 w-2/3 rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className={`h-4 rounded ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </main>
  );
}
