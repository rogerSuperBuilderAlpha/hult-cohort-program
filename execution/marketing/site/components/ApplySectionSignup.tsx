'use client';

import Link from 'next/link';
import { NextCohortInterestPanel } from '@/components/NextCohortInterestPanel';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { useParticipantStatus } from '@/lib/use-participant-status';
import styles from '../app/page.module.css';

const NEXT_OPEN = Boolean(process.env.NEXT_PUBLIC_NEXT_COHORT_ID?.trim());

/** Apply section on the home page — current cohort + next cohort interest. */
export function ApplySectionSignup() {
  const { profile, getIdToken } = useGithubAuth();
  const { me, refresh } = useParticipantStatus(getIdToken, Boolean(profile));

  return (
    <>
      <div className={styles.heroActions} style={{ marginTop: 16, marginBottom: 20 }}>
        <Link href="/apply" className={styles.primaryBtn}>
          Apply for Summer 2026 (July 9)
        </Link>
      </div>
      {NEXT_OPEN ? (
        <NextCohortInterestPanel
          interest={me?.nextCohortInterest}
          onInterestUpdated={() => void refresh()}
          variant="card"
        />
      ) : null}
    </>
  );
}
