'use client';

import { useCallback, useEffect, useState } from 'react';
import { authedFetch } from './authed-fetch';

export function useAuthedFetch<T>(
  enabled: boolean,
  url: string,
  getIdToken: () => Promise<string | null>,
  fallbackError: string
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!enabled) {
      setData(null);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const json = await authedFetch<T>(getIdToken, url, {}, fallbackError);
      setData(json);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : fallbackError);
    } finally {
      setLoading(false);
    }
  }, [enabled, fallbackError, getIdToken, url]);

  useEffect(() => {
    if (enabled) setLoading(true);
    void refresh();
  }, [refresh, enabled]);

  return { data, loading, error, refresh };
}
