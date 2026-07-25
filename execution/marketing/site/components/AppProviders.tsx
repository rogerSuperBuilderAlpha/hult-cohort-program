'use client';

import { GithubAuthProvider } from '@/lib/firebase/use-github-auth';
import { ParticipantStatusProvider } from '@/components/ParticipantStatusProvider';
import type { ReactNode } from 'react';

/** App-wide auth + single /api/me fetch. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GithubAuthProvider>
      <ParticipantStatusProvider>{children}</ParticipantStatusProvider>
    </GithubAuthProvider>
  );
}
