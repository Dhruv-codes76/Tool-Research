import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Sign In | AI Tool Research',
  description: 'Sign in to access the AI Tool Research admin panel.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center text-[#918fa1]">Loading...</div>}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
