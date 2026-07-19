'use client';

import { useParticipantStatusContext } from '@/components/ParticipantStatusProvider';

/**
 * Shared participant status. Args are ignored when AppProviders is mounted —
 * kept for call-site compatibility.
 */
export function useParticipantStatus(
  _getIdToken?: () => Promise<string | null>,
  _signedIn?: boolean
) {
  return useParticipantStatusContext();
}
