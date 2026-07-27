'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  welcomeGlassButtonClassName,
  welcomeGlassInputClassName,
  welcomeLinkClassName,
} from '@/lib/auth/welcomeStyles';

export default function SignupForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { error?: string; hasSession?: boolean };

      if (!response.ok) {
        setMessage(data.error ?? 'Signup failed.');
        setIsSuccess(false);
        return;
      }

      if (data.hasSession) {
        router.push('/');
        router.refresh();
        return;
      }

      setMessage(
        'Account created. Check your email for a confirmation link, then return here to log in.'
      );
      setIsSuccess(true);
    } catch {
      setMessage('Signup request failed. Please try again.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="signup-email" className="sr-only">
            Email
          </label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password" className="sr-only">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            placeholder="Password (min. 6 characters)"
            className={welcomeGlassInputClassName}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </div>

        <button type="submit" disabled={loading} className={welcomeGlassButtonClassName}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm drop-shadow-sm ${
            isSuccess ? 'text-emerald-200' : 'text-red-200'
          }`}
        >
          {message}
        </p>
      )}

      <p className="mt-6 text-center text-sm text-white/85">
        Already have an account?{' '}
        <Link href="/auth/login" className={welcomeLinkClassName}>
          Sign in
        </Link>
      </p>
    </>
  );
}
