'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { cohortDisplayLabel } from '@/lib/cohort-config';
import type { NextCohortInterest } from '@/lib/cohort-interest-types';
import styles from '../app/page.module.css';

type Props = {
  interest: NextCohortInterest | null | undefined;
  onInterestUpdated?: () => void;
  variant?: 'card' | 'inline';
};

export function NextCohortInterestPanel({
  interest,
  onInterestUpdated,
  variant = 'card',
}: Props) {
  const { configured, profile, loading, authError, signIn, getIdToken } = useGithubAuth();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');
  const [localInterest, setLocalInterest] = useState(interest);

  useEffect(() => {
    setLocalInterest(interest);
  }, [interest]);

  const active = localInterest ?? interest;
  if (!active) return null;

  const nextLabel = cohortDisplayLabel(active.cohortId);

  async function indicateInterest() {
    setStatus('loading');
    setError('');
    const idToken = await getIdToken();
    if (!idToken) {
      setStatus('error');
      setError('Your session expired. Sign in again.');
      return;
    }
    try {
      const res = await fetch('/api/cohort-interest', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const json = (await res.json()) as NextCohortInterest & { error?: string };
      if (!res.ok) throw new Error(json.error || 'Could not save your interest.');
      setLocalInterest(json);
      setStatus('idle');
      onInterestUpdated?.();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  const wrapperClass = variant === 'card' ? styles.callout : styles.interestInline;

  if (active.interested) {
    return (
      <div className={styles.calloutSuccess}>
        <p style={{ margin: 0 }}>
          <strong>You have indicated interest in the {nextLabel} cohort.</strong> We will email you
          when applications open — no further action needed for now.
          {active.indicatedAt ? (
            <>
              {' '}
              Recorded{' '}
              {new Date(active.indicatedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
              .
            </>
          ) : null}
        </p>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <p style={{ marginTop: 0 }}>
        <strong>{nextLabel} cohort.</strong> Dates and curriculum are not finalized yet. Indicate
        interest and we will notify you when applications open.
      </p>
      {!configured ? (
        <p className={styles.formNote} style={{ marginBottom: 0 }}>
          Interest sign-up is unavailable on this deployment.
        </p>
      ) : loading ? (
        <p className={styles.formNote} style={{ marginBottom: 0 }}>
          Loading…
        </p>
      ) : !profile ? (
        <>
          <button type="button" className={styles.secondaryBtn} onClick={() => void signIn()}>
            Indicate interest
          </button>
          {authError ? <p className={styles.formError}>{authError}</p> : null}
        </>
      ) : (
        <>
          <button
            type="button"
            className={styles.secondaryBtn}
            disabled={status === 'loading'}
            onClick={() => void indicateInterest()}
          >
            {status === 'loading' ? 'Saving…' : `Indicate interest in ${nextLabel}`}
          </button>
          {error ? <p className={styles.formError}>{error}</p> : null}
        </>
      )}
      {variant === 'inline' ? null : (
        <p className={styles.formNote} style={{ marginBottom: 0 }}>
          Applying for Summer 2026 (July 9 start)?{' '}
          <Link href="/apply">Complete the Summer cohort application →</Link>
        </p>
      )}
    </div>
  );
}
