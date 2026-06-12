'use client';

import Link from 'next/link';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { isAdmitted } from '@/lib/participant-status';
import { useParticipantStatus } from '@/lib/use-participant-status';
import styles from '../app/page.module.css';

type Props = {
  slug: string;
  phaseLabel: string;
  title: string;
};

export function ParticipantProjectBanner({ slug, phaseLabel, title }: Props) {
  const { profile, loading: authLoading, getIdToken } = useGithubAuth();
  const { me, loading: statusLoading } = useParticipantStatus(getIdToken, Boolean(profile));

  if (authLoading || statusLoading || !profile || !isAdmitted(me)) {
    return null;
  }

  const isOnboarding = slug === 'onboarding';

  return (
    <div className={styles.participantBanner}>
      <p className={styles.participantBannerEyebrow}>Enrolled · Fall 2026</p>
      <p className={styles.participantBannerLead}>
        {isOnboarding ? (
          <>
            You are on <strong>{phaseLabel}</strong>. Complete the checklist below, then open your
            onboarding PR in the cohort roster repo.
          </>
        ) : (
          <>
            Reading ahead: <strong>{title}</strong>. Contest submissions open in{' '}
            {phaseLabel.toLowerCase()}.
          </>
        )}
      </p>
      <Link href="/apply" className={styles.participantBannerLink}>
        Back to dashboard
      </Link>
    </div>
  );
}
