'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ParticipantMe } from './participant-status';

export function useParticipantStatus(
  getIdToken: () => Promise<string | null>,
  signedIn: boolean
) {
  const [me, setMe] = useState<ParticipantMe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!signedIn) {
      setMe(null);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const idToken = await getIdToken();
    if (!idToken) {
      setMe(null);
      setLoading(false);
      setError('Your GitHub session expired. Sign in again.');
      return;
    }

    try {
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const json = (await res.json()) as ParticipantMe & { error?: string };
      if (!res.ok) {
        throw new Error(json.error || 'Could not load your status.');
      }
      setMe(json);
    } catch (err) {
      setMe(null);
      setError(err instanceof Error ? err.message : 'Could not load your status.');
    } finally {
      setLoading(false);
    }
  }, [getIdToken, signedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { me, loading, error, refresh };
}
