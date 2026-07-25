import SignupForm from '@/components/auth/SignupForm';
import WelcomeAuthShell from '@/components/auth/WelcomeAuthShell';

export default function SignupPage() {
  return (
    <WelcomeAuthShell
      formTitle="Create account"
      formSubtitle="Join Initiara and start tracking your initiatives."
    >
      <SignupForm />
    </WelcomeAuthShell>
  );
}
