'use client';

import Link from 'next/link';
import { NextCohortInterestPanel } from '@/components/NextCohortInterestPanel';
import { cohortMarketing } from '@/content/program';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { useParticipantStatus } from '@/lib/use-participant-status';
import styles from '../app/page.module.css';

const NEXT_OPEN = Boolean(process.env.NEXT_PUBLIC_NEXT_COHORT_ID?.trim());
const NEXT_COHORT_ID = process.env.NEXT_PUBLIC_NEXT_COHORT_ID?.trim() || 'fall26';

/** Apply section on the home page — current cohort + next cohort interest. */
export function ApplySectionSignup() {
  const { profile, getIdToken } = useGithubAuth();
  const { me, refresh } = useParticipantStatus(getIdToken, Boolean(profile));
  const nextInterest = me?.nextCohortInterest ?? {
    cohortId: NEXT_COHORT_ID,
    interested: false,
  };

  return (
    <div className={styles.applyGrid}>
      <div className={styles.applyCardPrimary}>
        <span className={styles.phaseTag}>{cohortMarketing.label}</span>
        <h3>Apply for the {cohortMarketing.cohortStart.replace(', 2026', '')} cohort</h3>
        <p>
          Complete the application, then the 48-hour technical take-home. Admitted students join the
          active six-week pilot.
        </p>
        <Link href="/apply" className={styles.primaryBtn}>
          Start application
        </Link>
      </div>
      {NEXT_OPEN ? (
        <div className={styles.applyCard}>
          <span className={styles.phaseTag}>Fall 2026</span>
          <h3>Not ready for July?</h3>
          <NextCohortInterestPanel
            interest={nextInterest}
            onInterestUpdated={() => void refresh()}
            variant="inline"
          />
        </div>
      ) : null}
    </div>
  );
}
