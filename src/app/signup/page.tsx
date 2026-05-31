import { AuthForm } from '@/components/auth/AuthForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Create Account | AI Tool Research',
  description: 'Create your account to start curating open-source tools.',
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white">Loading...</div>}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}

