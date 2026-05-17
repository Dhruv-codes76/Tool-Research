import { AuthForm } from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Update Password | AI Tool Research',
  description: 'Set a new password for your AI Tool Research account.',
};

export default function UpdatePasswordPage() {
  return <AuthForm mode="update-password" />;
}
