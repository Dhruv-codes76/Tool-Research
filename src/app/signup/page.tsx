import { AuthForm } from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Create Account | AI Tool Research',
  description: 'Create your account to start curating open-source tools.',
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
