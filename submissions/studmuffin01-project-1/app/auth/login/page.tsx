'use client';

import { FormEvent, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        const errorMessage = data.error ?? 'Login failed.';
        if (errorMessage.toLowerCase().includes('email not confirmed')) {
          setNeedsEmailConfirmation(true);
          setMessage(
            'Your email is not confirmed yet. Check your inbox and spam folder for the confirmation link, or resend it below.'
          );
        } else {
          setMessage(errorMessage);
        }
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setMessage('Login request failed. Please try again.');
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

    try {
      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(data.error ?? 'Could not resend confirmation email.');
        return;
      }

      setNeedsEmailConfirmation(true);
      setMessage('Confirmation email sent. Check your inbox, then log in again.');
    } catch {
      setMessage('Could not resend confirmation email. Please try again.');
    } finally {
      setResending(false);
    }
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
