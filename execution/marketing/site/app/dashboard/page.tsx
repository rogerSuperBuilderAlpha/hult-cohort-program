'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { AccountSection } from '@/components/AccountSection';
import { ExpectationsAcknowledgmentPanel } from '@/components/ExpectationsAcknowledgmentPanel';
import { programProjects } from '@/content/program';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import type { ParticipantMe } from '@/lib/participant-status';
import { isEnrolled, isAdmittedPendingRoster, isApplicantInFlight } from '@/lib/participant-status';
import { formatScheduleDate } from '@/lib/program-schedule';
import { personalizeProgramText } from '@/lib/personalize-program';
import { useParticipantStatus } from '@/lib/use-participant-status';
import { GITHUB_REPO_URL } from '@/lib/site-config';
import type { DashboardSummary } from '@/lib/dashboard-server';
import styles from '../page.module.css';

function ParticipantDashboard({
  me,
  summary,
  survey,
  getIdToken,
  signOut,
  deleteAccount,
  onAccountDeleted,
  onAckSigned,
}: {
  me: ParticipantMe;
  summary: DashboardSummary;
  survey: {
    consented: boolean;
    openWaveId: string | null;
    waves: { id: string; shortLabel: string; status: string; completed: boolean }[];
  } | null;
  getIdToken: () => Promise<string | null>;
  signOut: () => void;
  deleteAccount: () => Promise<{ ok: boolean; error?: string }>;
  onAccountDeleted: () => void;
  onAckSigned: () => void;
}) {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [downloadError, setDownloadError] = useState('');

  const openWaveSummary = survey?.waves.find((w) => w.id === survey.openWaveId) ?? null;
  const surveyActionable = Boolean(openWaveSummary && !openWaveSummary.completed);
  const name = me.roster?.displayName ?? `${me.application?.firstName ?? ''} ${me.application?.lastName ?? ''}`.trim();
  const greetingName = name.split(/\s+/).filter(Boolean)[0] || me.githubHandle;
  const stats = me.cohortStats;
  const active = summary.schedule.activeProject;
  const activeProjects = summary.schedule.activeProjects;
  const activeSlugs = new Set(activeProjects.map((p) => p.slug));
  const submittedCount = summary.projects.filter((p) => p.submissionMerged).length;

  // Platform-tracked pass-gate: merged submission + written reviews (upvotes optional).
  const isTrackedComplete = (p: DashboardSummary['projects'][number]) =>
    p.submissionMerged &&
    (p.reviewsRequired == null ||
      p.reviewsRequired === 0 ||
      (p.reviewsWritten ?? 0) >= p.reviewsRequired);
  const trackedCompleteCount = summary.projects.filter(isTrackedComplete).length;

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
      const res = await fetch('/api/me?include=submissions', {
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
          <strong>Summer Pilot participant dashboard.</strong> Welcome, {greetingName}.
        </p>
      </div>

      {surveyActionable && openWaveSummary ? (
        <div className={styles.callout}>
          <p style={{ marginTop: 0 }}>
            <strong>Research survey open.</strong> The {openWaveSummary.shortLabel.toLowerCase()} survey is
            open now. It is voluntary, takes about 12 minutes, and has no effect on your standing or
            assessment.
          </p>
          <Link href="/research/survey" className={styles.primaryBtn}>
            {survey?.consented ? 'Take the survey' : 'Review and take the survey'}
          </Link>
        </div>
      ) : null}

      {!summary.expectationsAcknowledgmentSigned ? (
        <ExpectationsAcknowledgmentPanel getIdToken={getIdToken} onSigned={onAckSigned} />
      ) : null}

      {summary.schedule.activePhase === 'phase-2' ? (
        <div className={styles.callout}>
          <p style={{ marginTop: 0 }}>
            <strong>External sprint weeks (4–6).</strong> One focus per week: Ludwitt learning
            integration, startup / entrepreneurship, then open-source swarm. Staff verify outcome
            metrics — self-reported counts are not accepted.
          </p>
          <p className={styles.formNote} style={{ marginBottom: 0 }}>
            <Link href="/program/phase-2-learning-app">Week 4 · Ludwitt</Link>
            {' · '}
            <Link href="/program/phase-2-venture">Week 5 · Startup</Link>
            {' · '}
            <Link href="/program/phase-2-open-source">Week 6 · OSS swarm</Link>
          </p>
        </div>
      ) : null}

      {summary.schedule.cohortWeek ? (
        <p className={styles.formNote}>
          Cohort week {summary.schedule.cohortWeek}
          {activeProjects.length > 0 ? (
            <>
              {' '}
              · Active {activeProjects.length > 1 ? 'projects' : 'focus'}:{' '}
              {activeProjects.map((p, i) => (
                <span key={p.slug}>
                  {i > 0 ? ', ' : ''}
                  <Link href={`/program/${p.slug}`}>
                    {p.phaseLabel} — {p.title}
                  </Link>
                </span>
              ))}
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
        Open a project to see its requirements, deadline, and how to submit your pull request.
      </p>
      <ul className={styles.onboardingChecklist}>
        {summary.projects.map((project) => {
          const meta = programProjects.find((p) => p.slug === project.slug);
          const isActiveProject = activeSlugs.has(project.slug);
          return (
            <li
              key={project.slug}
              className={isActiveProject ? styles.dashboardProjectActive : styles.dashboardProjectItem}
            >
              <Link href={`/program/${project.slug}`} className={styles.dashboardProjectLink}>
                <strong>{project.phaseLabel}</strong> — {project.title}
              </Link>
              {isActiveProject ? <span className={styles.activeProjectBadge}>Active this week</span> : null}
              {project.submissionMerged ? ' · submission merged' : ' · not submitted'}
              {project.reviewsRequired != null && project.reviewsRequired > 0 ? (
                <>
                  {' '}
                  · reviews {project.reviewsWritten}/{project.reviewsRequired}
                  · upvotes {project.votesCast}/{project.reviewsRequired} (optional)
                  {project.awaitingMerge && project.awaitingMerge > 0
                    ? ` · ${project.awaitingMerge} peer submission(s) pending merge`
                    : ''}
                </>
              ) : null}
              {project.outcome?.winnerHandle ? (
                <> · winner @{project.outcome.winnerHandle}</>
              ) : null}
              {meta?.schedule.reviewCloses ? (
                <> · review deadline {formatScheduleDate(meta.schedule.reviewCloses)}</>
              ) : null}
            </li>
          );
        })}
      </ul>

      <h2 className={styles.participantHeading}>Completion standing</h2>
      <p className={styles.formNote} style={{ marginTop: 0 }}>
        {trackedCompleteCount} of {summary.projects.length} projects have every platform-tracked
        requirement complete (merged submission, plus all written reviews and votes on contest
        weeks).
      </p>
      <ul className={styles.onboardingChecklist}>
        {summary.projects.map((project) => {
          const meta = programProjects.find((p) => p.slug === project.slug);
          if (!meta) return null;
          const done = isTrackedComplete(project);
          return (
            <li
              key={project.slug}
              className={styles.dashboardProjectItem}
              aria-label={`${meta.title}: ${done ? 'complete' : 'incomplete'}`}
            >
              <span aria-hidden>{done ? '✓' : '○'}</span>{' '}
              <Link href={`/program/${project.slug}`} className={styles.dashboardProjectLink}>
                {meta.title}
              </Link>
              {' — pass gate: '}
              {meta.passGate
                .map((gate) => personalizeProgramText(gate, me.githubHandle, undefined, stats))
                .join('; ')}
            </li>
          );
        })}
      </ul>
      <p className={styles.formNote}>
        Staff-verified gates — Phase 2 outcome metrics (qualified users, investor touches, upstream
        merges) — are confirmed by staff and are not tracked live on this page. Expectations
        Acknowledgment is tracked here once you sign above. Final pass/fail standing is issued after
        week 6. Questions:{' '}
        <a href="mailto:cohort@hult.edu">cohort@hult.edu</a>.
      </p>

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
          <Link href="/program/phase-1-project-1" className={styles.primaryBtn}>
            Browse program
          </Link>
        )}
        <Link href="/program" className={styles.secondaryBtn}>
          View all projects
        </Link>
        <Link href="/history" className={styles.secondaryBtn}>
          Submission history
        </Link>
      </div>

      <p className={styles.formNote}>
        Program documentation for optional programmatic access to reviews and votes is available in
        the{' '}
        <a href={`${GITHUB_REPO_URL}/blob/main/execution/hult-cohort-mcp/README.md`} target="_blank" rel="noopener noreferrer">
          cohort MCP server guide
        </a>
        .
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
  const [survey, setSurvey] = useState<{
    consented: boolean;
    openWaveId: string | null;
    waves: { id: string; shortLabel: string; status: string; completed: boolean }[];
  } | null>(null);
  const [summaryError, setSummaryError] = useState('');

  async function loadBootstrap() {
    const idToken = await getIdToken();
    if (!idToken) {
      setSummaryError('Could not read your session. Refresh the page to try again.');
      return;
    }
    try {
      const res = await fetch('/api/bootstrap', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const json = (await res.json()) as {
        dashboard?: DashboardSummary;
        survey?: typeof survey;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || 'Could not load dashboard.');
      setSummary(json.dashboard ?? null);
      setSurvey(json.survey ?? null);
      setSummaryError('');
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Could not load dashboard.');
    }
  }

  useEffect(() => {
    if (!profile || !isEnrolled(me)) return;
    let cancelled = false;
    void (async () => {
      await loadBootstrap();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [profile, me, getIdToken]);

  return (
    <main className={styles.main}>
      <SiteHeader links={[{ href: '/program', label: 'Program' }, { href: '/', label: 'Home' }]} />

      <article className={styles.overview}>
        <p className={styles.eyebrow}>Summer Pilot 2026 · Participant dashboard</p>
        <h1 className={styles.sectionTitle}>Dashboard</h1>
        <p className={styles.overviewLead}>
          Enrollment record, project progress, and submission status.
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
            ) : me?.enrollment.state === 'inactive' ? (
              <p>
                <strong>Enrollment deactivated.</strong> Your participation in this cohort has
                been paused by staff. If you believe this is an error, contact{' '}
                <a href="mailto:cohort@hult.edu">cohort@hult.edu</a>.
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
                <Link href="/apply">Apply for the Summer Pilot →</Link>
                {' · '}
                <Link href="/history">View your submission history →</Link>
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
            survey={survey}
            getIdToken={getIdToken}
            signOut={() => void signOut()}
            deleteAccount={deleteAccount}
            onAccountDeleted={() => void refresh()}
            onAckSigned={() => {
              void loadBootstrap();
              void refresh();
            }}
          />
        )}

        {statusError ? <p className={styles.formError}>{statusError}</p> : null}
      </article>
    </main>
  );
}
