import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { buildMetadata } from '@/lib/seo';

// Utility/auth page — kept out of search results.
export const metadata = buildMetadata({
  title: 'Sign In',
  description: 'Sign in to access the AI Tool Research admin panel.',
  path: '/login',
  index: false,
});

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white">Loading...</div>}>
      <AuthForm mode="login" />
    </Suspense>
  );
}

