import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Create Account | AI Tool Research',
  description: 'Create your account to start curating open-source tools.',
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center text-[#918fa1]">Loading...</div>}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
