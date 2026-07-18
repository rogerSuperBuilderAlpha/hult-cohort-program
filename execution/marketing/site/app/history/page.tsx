'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import type { UserHistorySummary } from '@/lib/history-types';
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
  const { configured, profile, loading, authError, signIn, getIdToken } = useGithubAuth();
  const [summary, setSummary] = useState<UserHistorySummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    void (async () => {
      const idToken = await getIdToken();
      if (!idToken) return;
      try {
        const res = await fetch('/api/history', {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const json = (await res.json()) as UserHistorySummary & { error?: string };
        if (!res.ok) throw new Error(json.error || 'Could not load history.');
        if (!cancelled) setSummary(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load history.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile, getIdToken]);

  return (
    <main className={styles.main}>
      <SiteHeader
        links={[
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/program', label: 'Program' },
          { href: '/', label: 'Home' },
        ]}
      />

      <article className={styles.overview}>
        <p className={styles.eyebrow}>Work track record</p>
        <h1 className={styles.sectionTitle}>Submission history</h1>
        <p className={styles.overviewLead}>
          Merged submission pull requests across cohort terms, discovered from GitHub.
        </p>

        {!configured ? (
          <div className={styles.callout}>History unavailable — platform services not configured.</div>
        ) : loading ? (
          <p className={styles.formNote}>Loading…</p>
        ) : !profile ? (
          <div className={styles.authGate}>
            <p className={styles.authGateLead}>Sign in with GitHub to view your submission history.</p>
            <button type="button" className={styles.githubSignInBtn} onClick={() => void signIn()}>
              Sign in with GitHub
            </button>
            {authError ? <p className={styles.formError}>{authError}</p> : null}
          </div>
        ) : error ? (
          <p className={styles.formError}>{error}</p>
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
              <Link href="/dashboard" className={styles.primaryBtn}>
                Current cohort dashboard
              </Link>
              <Link href="/program" className={styles.secondaryBtn}>
                Browse program
              </Link>
            </div>
          </>
        )}
      </article>
    </main>
  );
}
