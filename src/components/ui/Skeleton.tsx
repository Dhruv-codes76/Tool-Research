import React from 'react';

/**
 * A single content-shaped placeholder block. Compose these to mirror the real
 * layout of whatever is loading — the shimmer sweep lives in `.skeleton`
 * (globals.css) and is compositor-only + reduced-motion aware.
 *
 * Always decorative: individual blocks are `aria-hidden`; the enclosing
 * loading surface carries the single `role="status"` + label.
 */
export function Skeleton({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

/** Placeholder for a `ToolCard` — same shell (surface, radius, padding) so the
 *  grid doesn't jump when the real cards swap in. */
export function ToolCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/30 p-6 flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-3 w-10 rounded" />
        </div>
      </div>
      <div className="space-y-2 flex-grow">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-3/5 rounded" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-6 w-20 rounded" />
      </div>
    </div>
  );
}

/** Placeholder for the admin `ToolForm` — breadcrumb, stacked field panels, and
 *  an action bar. Shared by the new-tool and edit-tool loading states so the
 *  layout holds steady while the (DB-backed) page resolves. */
export function ToolFormSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-20" role="status" aria-label="Loading">
      {/* Breadcrumb */}
      <Skeleton className="h-3 w-56 rounded" />

      {/* Field panels */}
      {Array.from({ length: 2 }).map((_, panel) => (
        <div key={panel} className="glass-panel rounded-xl p-6 space-y-6">
          <Skeleton className="h-5 w-40 rounded" />
          {Array.from({ length: 3 }).map((_, row) => (
            <div key={row} className="space-y-2">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ))}

      {/* Action bar */}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** A grid of `ToolCardSkeleton`s — the shared body for the home and directory
 *  loading states. */
export function ToolGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ToolCardSkeleton key={i} />
      ))}
    </div>
  );
}
