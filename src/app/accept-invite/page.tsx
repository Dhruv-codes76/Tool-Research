import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Accept Invite | AI Tool Research',
  description: 'Set your password to activate your admin account.',
};

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white">Loading...</div>}>
      <AuthForm mode="accept-invite" />
    </Suspense>
  );
}
