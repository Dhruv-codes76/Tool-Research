import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { buildMetadata } from '@/lib/seo';

// Utility/auth page — kept out of search results.
export const metadata = buildMetadata({
  title: 'Update Password',
  description: 'Set a new password for your AI Tool Research account.',
  path: '/update-password',
  index: false,
});

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white">Loading...</div>}>
      <AuthForm mode="update-password" />
    </Suspense>
  );
}

