'use client';

import { NextCohortInterestPanel } from '@/components/NextCohortInterestPanel';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { useParticipantStatus } from '@/lib/use-participant-status';
import styles from '../app/page.module.css';

const NEXT_OPEN = Boolean(process.env.NEXT_PUBLIC_NEXT_COHORT_ID?.trim());
const NEXT_COHORT_ID = process.env.NEXT_PUBLIC_NEXT_COHORT_ID?.trim() || 'fall26';

export function ApplyNextCohortSection() {
  const { profile, getIdToken } = useGithubAuth();
  const { me, refresh } = useParticipantStatus(getIdToken, Boolean(profile));
  const nextInterest = me?.nextCohortInterest ?? {
    cohortId: NEXT_COHORT_ID,
    interested: false,
  };

  if (!NEXT_OPEN) return null;

  return (
    <section id="next-cohort" className={styles.overviewBlock} style={{ marginTop: 32 }}>
      <h2 className={styles.participantHeading}>Fall 2026 cohort</h2>
      <NextCohortInterestPanel
        interest={nextInterest}
        onInterestUpdated={() => void refresh()}
      />
    </section>
  );
}
