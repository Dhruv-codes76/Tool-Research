import { Skeleton, ToolGridSkeleton } from '@/components/ui/Skeleton';

/** Loading state for the tool directory — mirrors ToolsPage: title + intro,
 *  the search/filter bar, then the 4-up card grid. */
export default function ToolsLoading() {
  return (
    <main
      className="flex-grow pt-24 pb-32 max-w-container-max mx-auto px-gutter w-full"
      role="status"
      aria-label="Loading tools"
    >
      {/* Header */}
      <header className="mb-12 space-y-4">
        <Skeleton className="h-10 w-80 max-w-full rounded-xl" />
        <Skeleton className="h-4 w-full max-w-2xl rounded" />
        <Skeleton className="h-4 w-2/3 max-w-xl rounded" />
      </header>

      {/* Search + filter bar */}
      <div className="mb-16">
        <Skeleton className="h-14 w-full rounded-full" />
      </div>

      {/* Card grid — one full page of results */}
      <ToolGridSkeleton count={16} />

      <span className="sr-only">Loading tools…</span>
    </main>
  );
}
