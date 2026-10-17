'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { EnrollmentGate } from '@/components/EnrollmentGate';
import { PageFrame } from '@/components/PageFrame';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import type { UserHistorySummary } from '@/lib/history-types';
import { isEnrolled } from '@/lib/participant-status';
import { useParticipantStatus } from '@/lib/use-participant-status';
import styles from '../page.module.css';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function HistoryPage() {
  const { profile, authError, signIn, getIdToken } = useGithubAuth();
  const { me } = useParticipantStatus(getIdToken, Boolean(profile));
  const enrolled = isEnrolled(me);
  const [summary, setSummary] = useState<UserHistorySummary | null>(null);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async (isCancelled?: () => boolean) => {
    const idToken = await getIdToken();
    if (isCancelled?.()) return;
    if (!idToken) {
      setError('Your session expired. Sign in again.');
      return;
    }
    setError('');
    try {
      const res = await fetch('/api/history', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (isCancelled?.()) return;
      const json = (await res.json()) as UserHistorySummary & { error?: string };
      if (!res.ok) throw new Error(json.error || 'Could not load history.');
      if (!isCancelled?.()) setSummary(json);
    } catch (err) {
      if (!isCancelled?.()) {
        setError(err instanceof Error ? err.message : 'Could not load history.');
      }
    }
  }, [getIdToken]);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    void loadHistory(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [profile, loadHistory]);

  return (
    <PageFrame>
      <article className={styles.overview}>
        <p className={styles.eyebrow}>Work track record</p>
        <h1 className={styles.sectionTitle}>Submission history</h1>
        <p className={styles.overviewLead}>
          Merged submission pull requests across cohort terms, discovered from GitHub.
        </p>

        <EnrollmentGate
          unconfiguredMessage="History unavailable — platform services not configured."
          signedOut={
            <div className={styles.authGate}>
              <p className={styles.authGateLead}>Sign in with GitHub to view your submission history.</p>
              <button type="button" className={styles.githubSignInBtn} onClick={() => void signIn()}>
                Sign in with GitHub
              </button>
              {authError ? <p className={styles.formError}>{authError}</p> : null}
            </div>
          }
          signedIn={
            error ? (
          <>
            <p className={styles.formError}>{error}</p>
            <button type="button" className={styles.secondaryBtn} onClick={() => void loadHistory()}>
              Try again
            </button>
          </>
        ) : !summary ? (
          <p className={styles.formNote}>Loading your history…</p>
        ) : (
          <>
            <div className={styles.calloutSuccess}>
              <p style={{ margin: 0 }}>
                <strong>@{summary.githubHandle}</strong> — {summary.totalMerged} merged submission
                {summary.totalMerged === 1 ? '' : 's'} across{' '}
                {summary.cohortsScanned.join(', ')}.
              </p>
            </div>

            {summary.entries.length === 0 ? (
              <p className={styles.formNote}>
                No merged submission pull requests found yet. Complete projects in the active cohort
                or check that PRs target the correct project branch.
              </p>
            ) : (
              <ul className={styles.onboardingChecklist}>
                {summary.entries.map((entry) => (
                  <li key={`${entry.cohortId}-${entry.projectSlug}`} className={styles.dashboardProjectItem}>
                    <strong>{entry.cohortId}</strong> · {entry.phaseLabel} — {entry.projectTitle}
                    <br />
                    <a href={entry.prUrl} target="_blank" rel="noopener noreferrer">
                      {entry.prTitle}
                    </a>
                    {entry.deployUrl ? (
                      <>
                        {' '}
                        ·{' '}
                        <a href={entry.deployUrl} target="_blank" rel="noopener noreferrer">
                          Deploy
                        </a>
                      </>
                    ) : null}
                    {' '}
                    · merged {formatDate(entry.mergedAt)} · base{' '}
                    <code>{entry.baseRef}</code>
                  </li>
                ))}
              </ul>
            )}

            <div className={styles.participantActions}>
              {enrolled ? (
                <Link href="/dashboard" className={styles.primaryBtn}>
                  Current cohort dashboard
                </Link>
              ) : (
                <Link href="/apply" className={styles.primaryBtn}>
                  Apply
                </Link>
              )}
              <Link href="/program" className={styles.secondaryBtn}>
                Browse program
              </Link>
            </div>
          </>
            )
          }
        />
      </article>
    </PageFrame>
  );
}
