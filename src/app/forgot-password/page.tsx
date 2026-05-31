import { AuthForm } from '@/components/auth/AuthForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Forgot Password | AI Tool Research',
  description: 'Reset your AI Tool Research account password.',
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white">Loading...</div>}>
      <AuthForm mode="forgot-password" />
    </Suspense>
  );
}

