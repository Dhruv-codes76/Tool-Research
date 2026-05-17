import { AuthForm } from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Forgot Password | AI Tool Research',
  description: 'Reset your AI Tool Research account password.',
};

export default function ForgotPasswordPage() {
  return <AuthForm mode="forgot-password" />;
}
