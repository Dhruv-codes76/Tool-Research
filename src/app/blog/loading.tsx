import { Skeleton } from '@/components/ui/Skeleton';

/** Loading state for the blog index — centered header, category chips, then the
 *  3-up article grid (mirrors BlogClient). */
export default function BlogLoading() {
  return (
    <main
      className="flex-grow pt-[100px] pb-32 px-gutter w-full min-h-screen"
      role="status"
      aria-label="Loading blog"
    >
      {/* Header */}
      <div className="max-w-container-max mx-auto text-center py-8 mb-6 flex flex-col items-center gap-4">
        <Skeleton className="h-12 w-72 max-w-full rounded-xl" />
        <Skeleton className="h-4 w-full max-w-xl rounded" />
      </div>

      {/* Category chips */}
      <div className="max-w-container-max mx-auto mb-10 flex justify-center gap-3 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>

      {/* Article grid */}
      <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-outline-variant/20 bg-surface-container-low overflow-hidden flex flex-col"
          >
            <Skeleton className="w-full aspect-video rounded-none" />
            <div className="p-6 space-y-3">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-6 w-full rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
              <div className="flex items-center gap-3 pt-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Loading blog…</span>
    </main>
  );
}
