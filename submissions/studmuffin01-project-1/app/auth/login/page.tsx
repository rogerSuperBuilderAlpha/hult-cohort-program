import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import WelcomeAuthShell from '@/components/auth/WelcomeAuthShell';

export default function LoginPage() {
  return (
    <WelcomeAuthShell formSubtitle="Begin Your Journey.....">
      <Suspense fallback={<p className="text-sm text-white/70">Loading...</p>}>
        <LoginForm />
      </Suspense>
    </WelcomeAuthShell>
  );
}
