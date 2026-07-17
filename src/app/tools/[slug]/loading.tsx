import { Skeleton } from '@/components/ui/Skeleton';

const glassStyle = {
  background: 'rgba(28, 32, 37, 0.4)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
};

const stellarGlowStyle = {
  boxShadow: '0 0 30px rgba(62, 166, 255, 0.1)',
};

/** Loading state for a tool detail page — mirrors the 8/4 two-column layout:
 *  hero + about + install on the left, metadata + capability cards on the right. */
export default function ToolDetailLoading() {
  return (
    <main
      className="max-w-[1280px] mx-auto px-4 md:px-6 pt-24 pb-12"
      role="status"
      aria-label="Loading tool"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Hero card */}
          <div
            className="relative rounded-xl overflow-hidden mb-8 border border-white/5 bg-[#09090b] min-h-[290px] p-6 md:p-8 flex flex-col gap-4"
            style={stellarGlowStyle}
          >
            <div className="flex gap-3">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-12 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-full max-w-2xl rounded" />
            <Skeleton className="h-4 w-2/3 max-w-xl rounded" />
            <Skeleton className="h-10 w-56 rounded-full mt-2" />
            <div className="flex gap-3 mt-auto pt-8">
              <Skeleton className="h-11 w-36 rounded-full" />
              <Skeleton className="h-11 w-36 rounded-full" />
            </div>
          </div>

          {/* About */}
          <div className="p-6 rounded-2xl space-y-3" style={glassStyle}>
            <Skeleton className="h-6 w-40 rounded" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-5/6 rounded" />
            <Skeleton className="h-3 w-3/4 rounded" />
          </div>

          {/* Install */}
          <div className="p-6 rounded-2xl space-y-3" style={glassStyle}>
            <Skeleton className="h-6 w-32 rounded" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>

        {/* Right column (sidebar) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            {/* Uploaded-by */}
            <div className="p-5 rounded-2xl flex items-center gap-3" style={glassStyle}>
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>

            {/* Metadata card */}
            <div
              className="p-6 rounded-2xl space-y-4"
              style={{ ...glassStyle, ...stellarGlowStyle, backgroundColor: 'rgba(10, 10, 15, 0.7)' }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-2 border-b border-outline-variant/30"
                >
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              ))}
            </div>

            {/* Capability card */}
            <div
              className="p-6 rounded-2xl space-y-4"
              style={{ ...glassStyle, backgroundColor: 'rgba(10, 10, 15, 0.7)' }}
            >
              <Skeleton className="h-6 w-32 rounded" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <span className="sr-only">Loading tool…</span>
    </main>
  );
}
