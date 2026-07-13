'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import type { ParticipantMe } from '@/lib/participant-status';
import { useAuthedFetch } from '@/lib/use-authed-fetch';

type ParticipantStatusContextValue = {
  me: ParticipantMe | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
};

const ParticipantStatusContext = createContext<ParticipantStatusContextValue | null>(null);

/** One shared GET /api/me for the whole tree (nav, footer, banner, pages). */
export function ParticipantStatusProvider({ children }: { children: ReactNode }) {
  const { profile, getIdToken } = useGithubAuth();
  const signedIn = Boolean(profile);
  const { data, loading, error, refresh } = useAuthedFetch<ParticipantMe>(
    signedIn,
    '/api/me',
    getIdToken,
    'Could not load your status.'
  );

  return (
    <ParticipantStatusContext.Provider value={{ me: data, loading, error, refresh }}>
      {children}
    </ParticipantStatusContext.Provider>
  );
}

export function useParticipantStatusContext(): ParticipantStatusContextValue {
  const ctx = useContext(ParticipantStatusContext);
  if (!ctx) {
    throw new Error('useParticipantStatus must be used within ParticipantStatusProvider');
  }
  return ctx;
}
