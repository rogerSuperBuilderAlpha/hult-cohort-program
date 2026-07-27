'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  welcomeGlassButtonClassName,
  welcomeGlassInputClassName,
  welcomeLinkClassName,
} from '@/lib/auth/welcomeStyles';

export default function LoginForm() {
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
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="sr-only">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="Email"
            className={welcomeGlassInputClassName}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="login-password" className="sr-only">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            placeholder="Password"
            className={welcomeGlassInputClassName}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" disabled={loading} className={welcomeGlassButtonClassName}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm drop-shadow-sm ${
            searchParams.get('confirmed') === '1'
              ? 'text-emerald-200'
              : needsEmailConfirmation
                ? 'text-amber-100'
                : 'text-red-200'
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
          className="mt-3 text-sm font-medium text-white/90 underline decoration-white/40 underline-offset-2 disabled:opacity-50"
        >
          {resending ? 'Sending...' : 'Resend confirmation email'}
        </button>
      )}

      <p className="mt-6 text-center text-sm text-white/85">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className={welcomeLinkClassName}>
          Create one
        </Link>
      </p>
    </>
  );
}
