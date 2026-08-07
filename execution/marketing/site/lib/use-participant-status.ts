'use client';

import { useAuthedFetch } from '@/lib/use-authed-fetch';
import type { ParticipantMe } from './participant-status';

export function useParticipantStatus(
  getIdToken: () => Promise<string | null>,
  signedIn: boolean
) {
  const { data, loading, error, refresh } = useAuthedFetch<ParticipantMe>(
    signedIn,
    '/api/me',
    getIdToken,
    'Could not load your status.'
  );

  return { me: data, loading, error, refresh };
}
