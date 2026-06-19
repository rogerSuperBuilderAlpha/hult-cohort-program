'use client';

import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { isEnrolled } from '@/lib/participant-status';
import { useParticipantStatus } from '@/lib/use-participant-status';

/** Shared Apply ↔ Dashboard hub link state for nav, footer, and CTAs. */
export function useEnrollmentHub() {
  const { profile, loading: authLoading, getIdToken } = useGithubAuth();
  const { me, loading: meLoading } = useParticipantStatus(getIdToken, Boolean(profile));

  const enrolled = isEnrolled(me);
  const loading = authLoading || (Boolean(profile) && meLoading);

  return {
    loading,
    enrolled,
    href: enrolled ? '/dashboard' : '/apply',
    label: loading ? '…' : enrolled ? 'Dashboard' : 'Apply',
    heroLabel: loading ? '…' : enrolled ? 'Open your dashboard' : 'Apply for Fall 2026',
  };
}
