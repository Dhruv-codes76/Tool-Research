import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center text-white px-4">
      <div className="glass-panel p-10 rounded-2xl max-w-md w-full text-center space-y-6 border border-outline-variant/30">
        <p className="font-display-lg text-6xl font-bold tracking-tight text-primary">404</p>
        <h1 className="font-headline-md text-2xl">Page Not Found</h1>
        <p className="text-on-surface-variant text-sm font-body-base leading-relaxed">
          The page you’re looking for doesn’t exist or has moved.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/tools"
            className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-label-sm hover:bg-primary-container/80 transition-colors"
          >
            EXPLORE TOOLS
          </Link>
          <Link href="/" className="text-on-surface-variant hover:text-white transition-colors text-xs font-semibold">
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
