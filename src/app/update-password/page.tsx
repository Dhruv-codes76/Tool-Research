import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Update Password | AI Tool Research',
  description: 'Set a new password for your AI Tool Research account.',
};

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center text-[#918fa1]">Loading...</div>}>
      <AuthForm mode="update-password" />
    </Suspense>
  );
}
