import { AuthForm } from '@/components/auth/AuthForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Update Password | AI Tool Research',
  description: 'Set a new password for your AI Tool Research account.',
};

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white">Loading...</div>}>
      <AuthForm mode="update-password" />
    </Suspense>
  );
}

