import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { buildMetadata } from '@/lib/seo';

// Utility/auth page — kept out of search results.
export const metadata = buildMetadata({
  title: 'Forgot Password',
  description: 'Reset your AI Tool Research account password.',
  path: '/forgot-password',
  index: false,
});

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white">Loading...</div>}>
      <AuthForm mode="forgot-password" />
    </Suspense>
  );
}

