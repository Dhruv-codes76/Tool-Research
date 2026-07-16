import { Suspense } from 'react';
import VerifiedClient from './VerifiedClient';
import { buildMetadata } from '@/lib/seo';

// Utility/auth page — kept out of search results.
export const metadata = buildMetadata({
  title: 'Verifying…',
  description: 'Confirming your account.',
  path: '/auth/verified',
  index: false,
});

export default function VerifiedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white">Loading…</div>
      }
    >
      <VerifiedClient />
    </Suspense>
  );
}
