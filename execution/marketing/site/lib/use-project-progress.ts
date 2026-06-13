'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ProjectProgress } from './project-progress-types';

export function useProjectProgress(
  projectSlug: string,
  getIdToken: () => Promise<string | null>,
  enabled: boolean
) {
  const [progress, setProgress] = useState<ProjectProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!enabled) {
      setProgress(null);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const idToken = await getIdToken();
    if (!idToken) {
      setProgress(null);
      setLoading(false);
      setError('Sign in to see your progress.');
      return;
    }

    try {
      const res = await fetch(`/api/program/${projectSlug}/progress`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const json = (await res.json()) as ProjectProgress & { error?: string };
      if (!res.ok) throw new Error(json.error || 'Could not load progress.');
      setProgress(json);
    } catch (err) {
      setProgress(null);
      setError(err instanceof Error ? err.message : 'Could not load progress.');
    } finally {
      setLoading(false);
    }
  }, [enabled, getIdToken, projectSlug]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { progress, loading, error, refresh };
}
