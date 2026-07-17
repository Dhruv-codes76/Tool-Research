import { Skeleton } from '@/components/ui/Skeleton';

/** Generic loading state for admin routes. The sidebar + footer live in the
 *  admin layout and stay put; this stands in for the content pane: a page
 *  header, a metrics row, and a list/table. */
export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-10" role="status" aria-label="Loading">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-3 w-32 rounded" />
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-3 w-80 max-w-full rounded" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-panel p-6 rounded-xl flex flex-col gap-3">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
        ))}
      </div>

      {/* List / table */}
      <div className="glass-panel rounded-xl p-6 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/3 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
