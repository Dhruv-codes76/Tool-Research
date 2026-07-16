import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { buildMetadata } from '@/lib/seo';

// Utility/auth page — kept out of search results.
export const metadata = buildMetadata({
  title: 'Accept Invite',
  description: 'Set your password to activate your admin account.',
  path: '/accept-invite',
  index: false,
});

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white">Loading...</div>}>
      <AuthForm mode="accept-invite" />
    </Suspense>
  );
}
