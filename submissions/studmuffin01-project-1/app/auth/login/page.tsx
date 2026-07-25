'use client';

import { FormEvent, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getAuthCallbackUrl } from '@/lib/supabase/authRedirect';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const confirmed = searchParams.get('confirmed');
    const error = searchParams.get('error');

    if (confirmed === '1') {
      setMessage('Email confirmed. You can log in now.');
      setNeedsEmailConfirmation(false);
      return;
    }

    if (error) {
      setMessage(decodeURIComponent(error.replace(/\+/g, ' ')));
    }
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage('');
    setNeedsEmailConfirmation(false);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setNeedsEmailConfirmation(true);
          setMessage(
            'Your email is not confirmed yet. Check your inbox and spam folder for the confirmation link, or resend it below.'
          );
        } else {
          setMessage(error.message);
        }
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Unknown error';
      if (detail.toLowerCase().includes('fetch')) {
        setMessage(
          'Cannot reach Supabase. On Vercel, set NEXT_PUBLIC_SUPABASE_URL to https://YOUR-PROJECT.supabase.co (full URL), add the anon key, redeploy, then open /api/health on this site to verify.'
        );
      } else if (detail.includes('Missing Supabase environment variables')) {
        setMessage(
          'Supabase env vars are missing in this deployment. Add them in Vercel → Settings → Environment Variables → Production, then redeploy.'
        );
      } else {
        setMessage(detail);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendConfirmation() {
    if (!email.trim()) {
      setMessage('Enter your email address above, then try resending.');
      return;
    }

    setResending(true);
    setMessage('');

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });

    setResending(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setNeedsEmailConfirmation(true);
    setMessage('Confirmation email sent. Check your inbox, then log in again.');
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-6 text-2xl font-bold">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded border p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded border p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 p-3 text-white"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm ${
            searchParams.get('confirmed') === '1'
              ? 'text-green-600'
              : needsEmailConfirmation
                ? 'text-amber-700'
                : 'text-red-500'
          }`}
        >
          {message}
        </p>
      )}

      {needsEmailConfirmation && (
        <button
          type="button"
          onClick={handleResendConfirmation}
          disabled={resending}
          className="mt-3 text-sm text-blue-600 underline disabled:opacity-50"
        >
          {resending ? 'Sending...' : 'Resend confirmation email'}
        </button>
      )}

      <p className="mt-6 text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-blue-600 underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md p-8">Loading...</main>}>
      <LoginForm />
    </Suspense>
  );
}
