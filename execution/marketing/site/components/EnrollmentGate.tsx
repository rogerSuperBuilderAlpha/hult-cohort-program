'use client';

import type { ReactNode } from 'react';
import { useParticipantStatus } from '@/lib/use-participant-status';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { isEnrolled } from '@/lib/participant-status';
import styles from '../app/page.module.css';

type EnrollmentGateProps = {
  unconfiguredMessage?: string;
  loadingMessage?: string;
  signedOut: ReactNode;
  notEnrolled: ReactNode;
  enrolled: ReactNode;
};

export function EnrollmentGate({
  unconfiguredMessage = 'Unavailable — platform services not configured.',
  loadingMessage = 'Loading…',
  signedOut,
  notEnrolled,
  enrolled,
}: EnrollmentGateProps) {
  const { configured, profile, loading: authLoading, getIdToken } = useGithubAuth();
  const { me, loading: statusLoading } = useParticipantStatus(getIdToken, Boolean(profile));

  if (!configured) {
    return <div className={styles.callout}>{unconfiguredMessage}</div>;
  }

  if (authLoading || (profile && statusLoading)) {
    return <p className={styles.formNote}>{loadingMessage}</p>;
  }

  if (!profile) {
    return <>{signedOut}</>;
  }

  if (!isEnrolled(me)) {
    return <>{notEnrolled}</>;
  }

  return <>{enrolled}</>;
}
