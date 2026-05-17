import { AuthForm } from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Sign In | AI Tool Research',
  description: 'Sign in to access the AI Tool Research admin panel.',
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
