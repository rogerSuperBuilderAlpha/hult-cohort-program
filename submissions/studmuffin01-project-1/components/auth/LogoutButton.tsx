'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  compact?: boolean;
}

export default function LogoutButton({ compact = false }: LogoutButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleLogout() {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(data.error ?? 'Sign out failed.');
        setLoading(false);
        return;
      }

      router.push('/auth/login');
      router.refresh();
    } catch {
      setMessage('An unexpected error occurred while signing out.');
      setLoading(false);
    }
  }

  return (
    <div className={compact ? 'flex flex-col items-end gap-1' : 'space-y-3'}>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className={
          compact
            ? 'rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-border dark:bg-surface-card dark:text-surface-primary dark:hover:bg-surface-border/60'
            : 'rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
        }
      >
        {loading ? 'Signing Out...' : 'Sign Out'}
      </button>

      {message && (
        <p className={`text-sm text-red-600 ${compact ? 'max-w-40 text-right text-xs' : ''}`}>
          {message}
        </p>
      )}
    </div>
  );
}