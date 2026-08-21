import { LoginClient } from '@/components/LoginClient';
import { GreenularityLogo } from '@/components/GreenularityLogo';
import { isOAuthConfigured } from '@/lib/ludwitt/oauth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sign in · CEAL Green Energy Auditor',
  description: 'Sign in with Ludwitt to use the Caribbean energy calculator and count your session.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessages: Record<string, string> = {
    oauth_not_configured: 'Ludwitt OAuth is not configured on this server.',
    auth_required: 'Sign in to access the calculator and tools.',
  };
  const error = params.error ? (errorMessages[params.error] ?? params.error) : null;

  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-ceal-500/20 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <GreenularityLogo size="lg" href="/" />
      </div>
      <LoginClient oauthReady={isOAuthConfigured()} error={error} />
    </section>
  );
}
