'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the server logs / error monitoring; never expose details to users.
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center text-white px-4">
      <div className="glass-panel p-10 rounded-2xl max-w-md w-full text-center space-y-6 border border-outline-variant/30">
        <span className="material-symbols-outlined text-6xl text-primary-container block">error</span>
        <h1 className="font-headline-md text-2xl">Something went wrong</h1>
        <p className="text-on-surface-variant text-sm font-body-base leading-relaxed">
          An unexpected error occurred. Please try again — if it keeps happening, come back shortly.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-label-sm hover:bg-primary-container/80 transition-colors"
          >
            TRY AGAIN
          </button>
          <Link href="/" className="text-on-surface-variant hover:text-white transition-colors text-xs font-semibold">
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
