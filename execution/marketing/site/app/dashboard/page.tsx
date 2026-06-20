'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { AccountSection } from '@/components/AccountSection';
import { programProjects } from '@/content/program';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import type { ParticipantMe } from '@/lib/participant-status';
import { isEnrolled, isAdmittedPendingRoster, isApplicantInFlight } from '@/lib/participant-status';
import { formatScheduleDate } from '@/lib/program-schedule';
import { useParticipantStatus } from '@/lib/use-participant-status';
import { GITHUB_REPO_URL } from '@/lib/site-config';
import type { DashboardSummary } from '@/lib/dashboard-server';
import styles from '../page.module.css';

function ParticipantDashboard({
  me,
  summary,
  getIdToken,
  signOut,
  deleteAccount,
  onAccountDeleted,
}: {
  me: ParticipantMe;
  summary: DashboardSummary;
  getIdToken: () => Promise<string | null>;
  signOut: () => void;
  deleteAccount: () => Promise<{ ok: boolean; error?: string }>;
  onAccountDeleted: () => void;
}) {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [downloadError, setDownloadError] = useState('');
  const name = me.roster?.displayName ?? `${me.application?.firstName ?? ''} ${me.application?.lastName ?? ''}`.trim();
  const greetingName = name.split(/\s+/).filter(Boolean)[0] || me.githubHandle;
  const stats = me.cohortStats;
  const active = summary.schedule.activeProject;
  const submittedCount = summary.projects.filter((p) => p.submissionMerged).length;

  async function downloadMyData() {
    setDownloadStatus('loading');
    setDownloadError('');
    const idToken = await getIdToken();
    if (!idToken) {
      setDownloadStatus('error');
      setDownloadError('Your session expired. Sign in again.');
      return;
    }
    try {
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error('Could not fetch your data.');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `hult-cohort-data-${me.githubHandle}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setDownloadStatus('idle');
    } catch (err) {
      setDownloadStatus('error');
      setDownloadError(err instanceof Error ? err.message : 'Download failed.');
    }
  }

  return (
    <div className={styles.participantPanel}>
      <div className={styles.calloutSuccess}>
        <p>
          <strong>Fall 2026 participant dashboard.</strong> Welcome, {greetingName}.
        </p>
      </div>

      {summary.schedule.cohortWeek ? (
        <p className={styles.formNote}>
          Cohort week {summary.schedule.cohortWeek}
          {active ? (
            <>
              {' '}
              · Active focus:{' '}
              <Link href={`/program/${active.slug}`}>
                {active.phaseLabel} — {active.title}
              </Link>
            </>
          ) : (
            ' · Between project windows — see upcoming deadlines below'
          )}
        </p>
      ) : null}

      <dl className={styles.dl}>
        <dt>GitHub</dt>
        <dd>
          <a href={`https://github.com/${me.githubHandle}`} target="_blank" rel="noopener noreferrer">
            @{me.githubHandle}
          </a>
        </dd>
        <dt>Campus</dt>
        <dd>{me.roster?.campus ?? me.application?.campus ?? '—'}</dd>
        <dt>Cohort</dt>
        <dd>
          {stats.available && stats.enrolledCount > 0 ? (
            <>{stats.enrolledCount} enrolled</>
          ) : (
            'Enrollment in progress'
          )}
        </dd>
        <dt>Status</dt>
        <dd>Enrolled</dd>
      </dl>

      <h2 className={styles.participantHeading}>Project progress</h2>
      <p className={styles.formNote} style={{ marginTop: 0 }}>
        {submittedCount} of {programProjects.length} projects with merged submission pull requests.
      </p>
      <ul className={styles.onboardingChecklist}>
        {summary.projects.map((project) => {
          const meta = programProjects.find((p) => p.slug === project.slug);
          const isActiveProject = active?.slug === project.slug;
          return (
            <li
              key={project.slug}
              className={isActiveProject ? styles.dashboardProjectActive : styles.dashboardProjectItem}
            >
              <Link href={`/program/${project.slug}`}>
                <strong>{project.phaseLabel}</strong> — {project.title}
              </Link>
              {isActiveProject ? <span className={styles.activeProjectBadge}>Active this week</span> : null}
              {project.submissionMerged ? ' · submission merged' : ' · not submitted'}
              {project.reviewsRequired != null && project.reviewsRequired > 0 ? (
                <>
                  {' '}
                  · reviews {project.reviewsWritten}/{project.reviewsRequired}
                  · votes {project.votesCast}/{project.reviewsRequired}
                  {project.awaitingMerge && project.awaitingMerge > 0
                    ? ` · ${project.awaitingMerge} peer submission(s) pending merge`
                    : ''}
                </>
              ) : null}
              {meta?.schedule.reviewCloses ? (
                <> · review deadline {formatScheduleDate(meta.schedule.reviewCloses)}</>
              ) : null}
            </li>
          );
        })}
      </ul>

      <h2 className={styles.participantHeading}>Data export</h2>
      <p className={styles.formNote} style={{ marginTop: 0 }}>
        Download a JSON export of data held by this platform. Account deletion is available in the
        Account section. See the <Link href="/privacy">Privacy Policy</Link> for details.
      </p>
      <div className={styles.participantActions} style={{ marginTop: 0, marginBottom: 24 }}>
        <button
          type="button"
          className={styles.secondaryBtn}
          disabled={downloadStatus === 'loading'}
          onClick={() => void downloadMyData()}
        >
          {downloadStatus === 'loading' ? 'Preparing download…' : 'Download my data'}
        </button>
      </div>
      {downloadError ? <p className={styles.formError}>{downloadError}</p> : null}

      <div className={styles.participantActions}>
        {active ? (
          <Link href={`/program/${active.slug}`} className={styles.primaryBtn}>
            Open active project
          </Link>
        ) : (
          <Link href="/program/onboarding" className={styles.primaryBtn}>
            Browse program
          </Link>
        )}
        <Link href="/program" className={styles.secondaryBtn}>
          View all projects
        </Link>
      </div>

      <p className={styles.formNote}>
        The{' '}
        <a href={`${GITHUB_REPO_URL}/blob/main/execution/hult-cohort-mcp/README.md`} target="_blank" rel="noopener noreferrer">
          cohort MCP server
        </a>{' '}
        provides an optional interface for submitting reviews and votes programmatically.
      </p>

      <AccountSection
        handle={me.githubHandle}
        onSignOut={signOut}
        onDelete={deleteAccount}
        onDeleted={onAccountDeleted}
      />
    </div>
  );
}

export default function DashboardPage() {
  const { configured, profile, loading, authError, signIn, signOut, deleteAccount, getIdToken } =
    useGithubAuth();
  const { me, loading: statusLoading, error: statusError, refresh } = useParticipantStatus(
    getIdToken,
    Boolean(profile)
  );
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    if (!profile || !isEnrolled(me)) return;
    let cancelled = false;
    void (async () => {
      const idToken = await getIdToken();
      if (!idToken) return;
      try {
        const res = await fetch('/api/dashboard', {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const json = (await res.json()) as DashboardSummary & { error?: string };
        if (!res.ok) throw new Error(json.error || 'Could not load dashboard.');
        if (!cancelled) setSummary(json);
      } catch (err) {
        if (!cancelled) {
          setSummaryError(err instanceof Error ? err.message : 'Could not load dashboard.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile, me, getIdToken]);

  return (
    <main className={styles.main}>
      <SiteHeader links={[{ href: '/program', label: 'Program' }, { href: '/', label: 'Home' }]} />

      <article className={styles.overview}>
        <p className={styles.eyebrow}>Fall 2026 · Participant dashboard</p>
        <h1 className={styles.sectionTitle}>Dashboard</h1>
        <p className={styles.overviewLead}>
          Submissions, peer reviews, and program progress for the 16-week cohort.
        </p>

        {!configured ? (
          <div className={styles.callout}>Dashboard unavailable — platform services not configured.</div>
        ) : loading || (profile && statusLoading) ? (
          <p className={styles.formNote}>Loading…</p>
        ) : !profile ? (
          <div className={styles.authGate}>
            <p className={styles.authGateLead}>Sign in with GitHub to open your dashboard.</p>
            <button type="button" className={styles.githubSignInBtn} onClick={() => void signIn()}>
              Sign in with GitHub
            </button>
            {authError ? <p className={styles.formError}>{authError}</p> : null}
          </div>
        ) : !isEnrolled(me) ? (
          <div className={styles.callout}>
            {isApplicantInFlight(me) ? (
              <p>
                <strong>Application under review.</strong> Complete your take-home pull request on
                the Apply page.{' '}
                <Link href="/apply">Continue on Apply →</Link>
              </p>
            ) : isAdmittedPendingRoster(me) ? (
              <p>
                <strong>Admitted — enrollment pending.</strong> Staff are finalizing your enrollment.
                Participant tools will become available shortly.{' '}
                <Link href="/apply">Check Apply for status →</Link>
              </p>
            ) : me?.application?.status === 'waitlisted' ? (
              <p>
                <strong>Waitlisted.</strong> You will be notified by email if a place becomes
                available. For questions, contact{' '}
                <a href="mailto:cohort@hult.edu">cohort@hult.edu</a>.
              </p>
            ) : me?.application?.status === 'rejected' ? (
              <p>
                <strong>Not admitted this cycle.</strong> Thank you for your application. You may
                reapply in a future cohort.
              </p>
            ) : (
              <p>
                <strong>Not enrolled.</strong>{' '}
                <Link href="/apply">Apply for Fall 2026 →</Link>
              </p>
            )}
          </div>
        ) : summaryError ? (
          <p className={styles.formError}>{summaryError}</p>
        ) : !summary || !me ? (
          <p className={styles.formNote}>Loading your progress…</p>
        ) : (
          <ParticipantDashboard
            me={me}
            summary={summary}
            getIdToken={getIdToken}
            signOut={() => void signOut()}
            deleteAccount={deleteAccount}
            onAccountDeleted={() => void refresh()}
          />
        )}

        {statusError ? <p className={styles.formError}>{statusError}</p> : null}
      </article>
    </main>
  );
}
