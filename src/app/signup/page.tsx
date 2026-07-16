import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { buildMetadata } from '@/lib/seo';

// Utility/auth page — kept out of search results.
export const metadata = buildMetadata({
  title: 'Create Account',
  description: 'Create your account to start curating open-source tools.',
  path: '/signup',
  index: false,
});

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white">Loading...</div>}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}

