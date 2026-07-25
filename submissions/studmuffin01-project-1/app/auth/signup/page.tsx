'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
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
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-6 text-2xl font-bold">Create Account</h1>

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
          minLength={6}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-green-600 p-3 text-white"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm ${isSuccess ? 'text-green-600' : 'text-red-500'}`}
        >
          {message}
        </p>
      )}

      <p className="mt-6 text-sm">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-blue-600 underline">
          Login
        </Link>
      </p>
    </main>
  );
}
