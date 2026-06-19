'use client';

import { useAuthedFetch } from '@/lib/use-authed-fetch';
import type { ProjectProgress } from './project-progress-types';

export function useProjectProgress(
  projectSlug: string,
  getIdToken: () => Promise<string | null>,
  enabled: boolean
) {
  const { data, loading, error, refresh } = useAuthedFetch<ProjectProgress>(
    enabled,
    `/api/program/${projectSlug}/progress`,
    getIdToken,
    'Could not load progress.'
  );

  return { progress: data, loading, error, refresh };
}
