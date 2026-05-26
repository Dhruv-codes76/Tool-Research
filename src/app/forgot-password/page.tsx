import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Forgot Password | AI Tool Research',
  description: 'Reset your AI Tool Research account password.',
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center text-[#918fa1]">Loading...</div>}>
      <AuthForm mode="forgot-password" />
    </Suspense>
  );
}
