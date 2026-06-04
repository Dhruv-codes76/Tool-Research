import { Suspense } from 'react';
import VerifiedClient from './VerifiedClient';

export const metadata = {
  title: 'Verifying… | AI Tool Research',
  description: 'Confirming your account.',
};

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
