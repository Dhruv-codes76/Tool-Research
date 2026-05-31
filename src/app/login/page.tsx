import { AuthForm } from '@/components/auth/AuthForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Sign In | AI Tool Research',
  description: 'Sign in to access the AI Tool Research admin panel.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white">Loading...</div>}>
      <AuthForm mode="login" />
    </Suspense>
  );
}

