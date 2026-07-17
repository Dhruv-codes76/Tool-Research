import { Skeleton } from '@/components/ui/Skeleton';

/** Loading state for a single article — back link, title block, author meta,
 *  hero image, then body paragraphs. */
export default function BlogArticleLoading() {
  return (
    <main
      className="flex-grow pt-[100px] pb-32 px-gutter w-full min-h-screen"
      role="status"
      aria-label="Loading article"
    >
      <article className="max-w-3xl mx-auto space-y-8">
        <Skeleton className="h-4 w-24 rounded" />

        <div className="space-y-4">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-3/4 rounded-xl" />
        </div>

        {/* Author meta */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-32 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </div>

        {/* Hero image */}
        <Skeleton className="w-full aspect-video rounded-2xl" />

        {/* Body */}
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className={`h-4 rounded ${i % 4 === 3 ? 'w-2/3' : 'w-full'}`}
            />
          ))}
        </div>
      </article>

      <span className="sr-only">Loading article…</span>
    </main>
  );
}
