'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import type { ParticipantMe } from '@/lib/participant-status';
import { isAdmitted, isApplicantInFlight } from '@/lib/participant-status';
import { readApplicationApiError } from '@/lib/read-application-api-error';
import { useParticipantStatus } from '@/lib/use-participant-status';
import { programProjects } from '@/content/program';
import styles from '../page.module.css';

const DEFAULT_TAKE_HOME =
  'https://github.com/rogerSuperBuilderAlpha/admissions-task-board-fall26';

function SignedInBar({
  profile,
  onSignOut,
}: {
  profile: { githubHandle: string; githubUrl: string; photoUrl: string | null };
  onSignOut: () => void;
}) {
  return (
    <div className={styles.signedInBar}>
      {profile.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.photoUrl}
          alt=""
          width={32}
          height={32}
          className={styles.signedInAvatar}
        />
      ) : null}
      <div className={styles.signedInMeta}>
        <span>
          Signed in as{' '}
          <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
            @{profile.githubHandle}
          </a>
        </span>
        <button type="button" className={styles.signOutBtn} onClick={onSignOut}>
          Use a different account
        </button>
      </div>
    </div>
  );
}

function AdmittedDashboard({ me }: { me: ParticipantMe }) {
  const name = me.roster?.displayName ?? `${me.application?.firstName} ${me.application?.lastName}`;
  const stats = me.cohortStats;
  const submissionBySlug = new Map(me.submissions.map((s) => [s.projectSlug, s]));
  const submittedCount = me.submissions.filter((s) => s.merged).length;

  return (
    <div className={styles.participantPanel}>
      <div className={styles.calloutSuccess}>
        <p>
          <strong>You&apos;re admitted — Fall 2026.</strong> Welcome, {name.split(' ')[0]}.
        </p>
      </div>

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
          {stats.enrolledCount > 0 ? (
            <>
              {stats.enrolledCount} enrolled · {stats.peerReviewCount} peer reviews per Phase 1
              project
            </>
          ) : (
            'Enrollment filling'
          )}
        </dd>
        <dt>Status</dt>
        <dd>Enrolled participant</dd>
      </dl>

      <h2 className={styles.participantHeading}>Your submissions</h2>
      <p className={styles.formNote} style={{ marginTop: 0 }}>
        {submittedCount} of {programProjects.length} program weeks with merged PRs on file.
      </p>
      <ul className={styles.onboardingChecklist}>
        {programProjects.map((project) => {
          const entry = submissionBySlug.get(project.slug);
          return (
            <li key={project.slug}>
              <strong>{project.phaseLabel}</strong> — {project.title}
              {entry?.merged ? (
                <>
                  {' '}
                  ·{' '}
                  <a href={entry.prUrl} target="_blank" rel="noopener noreferrer">
                    merged PR
                  </a>
                  {entry.deployUrl ? (
                    <>
                      {' '}
                      ·{' '}
                      <a href={entry.deployUrl} target="_blank" rel="noopener noreferrer">
                        deploy
                      </a>
                    </>
                  ) : null}
                </>
              ) : (
                <> · not submitted yet</>
              )}
            </li>
          );
        })}
      </ul>

      <h2 className={styles.participantHeading}>What to do next</h2>
      <ol className={styles.successSteps}>
        <li>
          Read the <Link href="/program/onboarding">Week 1 onboarding</Link> expectations.
        </li>
        <li>
          Browse the full <Link href="/program">program journey</Link> — submissions are PRs, not
          forms.
        </li>
        <li>Accept your cohort org invite when it arrives (check GitHub notifications).</li>
        <li>Confirm Cursor + Claude Code tooling before kickoff (Sep 8).</li>
      </ol>

      <div className={styles.participantActions}>
        <Link href="/program/onboarding" className={styles.primaryBtn}>
          Start onboarding
        </Link>
        <Link href="/program" className={styles.secondaryBtn}>
          View all projects
        </Link>
      </div>

      <p className={styles.formNote}>
        Questions: cohort@hult.edu · Tuition and week-1 refund details in{' '}
        <Link href="/overview">program overview</Link>.
      </p>
    </div>
  );
}

function TakeHomeSteps({ takeHomeUrl, handle }: { takeHomeUrl: string; handle: string }) {
  return (
    <div className={styles.participantPanel}>
      <div className={styles.callout}>
        <p>
          <strong>Application on file.</strong> Complete the take-home PR to finish admissions
          review.
        </p>
      </div>
      <ol className={styles.successSteps}>
        <li>
          Open the repo:{' '}
          <a href={takeHomeUrl} target="_blank" rel="noopener noreferrer">
            {takeHomeUrl}
          </a>
        </li>
        <li>
          Clone, fix the bugs, run <code>npm test</code> until green, implement optional DELETE.
        </li>
        <li>
          Open a PR titled <code>[Admissions] Fix task board — {handle}</code> on branch{' '}
          <code>admissions/{handle}</code>.
        </li>
        <li>Fill the PR template completely, including agent usage.</li>
      </ol>
    </div>
  );
}

function StatusMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className={styles.participantPanel}>
      <div className={styles.callout}>
        <p>
          <strong>{title}</strong> {body}
        </p>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  const { configured, profile, loading, authError, signIn, signOut, getIdToken } = useGithubAuth();
  const { me, loading: statusLoading, error: statusError, refresh } = useParticipantStatus(
    getIdToken,
    Boolean(profile)
  );
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const admitted = isAdmitted(me);
  const inFlight = isApplicantInFlight(me);
  const takeHomeUrl = me?.application?.takeHomeRepoUrl || DEFAULT_TAKE_HOME;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile || admitted || inFlight) return;

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    setSubmitStatus('loading');
    setSubmitMessage('');

    const idToken = await getIdToken();
    if (!idToken) {
      setSubmitStatus('error');
      setSubmitMessage('Your GitHub session expired. Sign in again.');
      return;
    }

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(await readApplicationApiError(res));
      }

      await refresh();
      form.reset();
      setSubmitStatus('idle');
    } catch (err) {
      setSubmitStatus('error');
      setSubmitMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  const pageTitle = admitted ? 'Dashboard' : 'Apply';
  const pageLead = admitted
    ? 'You are enrolled in the Fall 2026 cohort. Everything below is your participant hub — not an application form.'
    : 'Step 1: sign in with GitHub, then complete this form. Step 2: fix the repo and open a PR within 48 hours. Admissions is PR-native — same loop as the program.';

  return (
    <main className={styles.main}>
      <SiteHeader links={[{ href: '/program', label: 'Program' }, { href: '/', label: 'Home' }]} />

      <article className={styles.overview}>
        <p className={styles.eyebrow}>
          Fall 2026 · {admitted ? 'Enrolled participant' : 'Applications open June 15'}
        </p>
        <h1 className={styles.sectionTitle}>{pageTitle}</h1>
        <p className={styles.overviewLead}>{pageLead}</p>

        {!configured ? (
          <div className={styles.callout}>
            Applications are temporarily unavailable. Firebase is not configured on this deployment.
          </div>
        ) : loading || (profile && statusLoading) ? (
          <p className={styles.formNote}>Loading your account…</p>
        ) : !profile ? (
          <div className={styles.authGate}>
            <p className={styles.authGateLead}>
              Sign in with GitHub first. Your application is tied to the account you use — the same
              identity you will ship PRs from all semester.
            </p>
            <button type="button" className={styles.githubSignInBtn} onClick={() => void signIn()}>
              Sign in with GitHub
            </button>
            {authError && <p className={styles.formError}>{authError}</p>}
            <p className={styles.formNote}>
              We read your public GitHub username only. No repo access is requested at apply time.
            </p>
          </div>
        ) : (
          <>
            <SignedInBar profile={profile} onSignOut={() => void signOut()} />
            {statusError && <p className={styles.formError}>{statusError}</p>}

            {admitted && me ? (
              <AdmittedDashboard me={me} />
            ) : me?.application?.status === 'take-home-submitted' ? (
              <StatusMessage
                title="Take-home submitted."
                body="We are reviewing your admissions PR. You will hear back within 48 hours."
              />
            ) : me?.application?.status === 'waitlisted' ? (
              <StatusMessage
                title="Waitlisted."
                body="We will email you if a spot opens. Questions: cohort@hult.edu."
              />
            ) : me?.application?.status === 'rejected' ? (
              <StatusMessage
                title="Not admitted this cycle."
                body="Thank you for applying. You may reapply in a future cohort."
              />
            ) : inFlight && me ? (
              <TakeHomeSteps takeHomeUrl={takeHomeUrl} handle={me.githubHandle} />
            ) : (
              <form className={styles.applyForm} onSubmit={onSubmit}>
                <input type="hidden" name="githubHandle" value={profile.githubHandle} />
                <div className={styles.nameRow}>
                  <label>
                    First name
                    <input name="firstName" type="text" required autoComplete="given-name" />
                  </label>
                  <label>
                    Last name
                    <input name="lastName" type="text" required autoComplete="family-name" />
                  </label>
                </div>
                <label>
                  Email
                  <input name="email" type="email" required autoComplete="email" />
                </label>
                <div className={styles.githubLocked}>
                  <span className={styles.githubLockedLabel}>GitHub account</span>
                  <span className={styles.githubLockedValue}>@{profile.githubHandle}</span>
                  <span className={styles.githubLockedNote}>From your sign-in — not editable</span>
                </div>
                <label>
                  Why this program (200 words max)
                  <textarea name="motivation" required rows={5} maxLength={1500} />
                </label>
                <label>
                  Project 1 PM platform idea (100 words)
                  <textarea name="project1Idea" required rows={3} maxLength={800} />
                </label>
                <label>
                  Timezone
                  <input name="timezone" type="text" required placeholder="America/New_York" />
                </label>
                <label>
                  Preferred campus
                  <select name="campus" required defaultValue="">
                    <option value="" disabled>
                      Select…
                    </option>
                    <option value="boston">Boston</option>
                    <option value="london">London</option>
                    <option value="san-francisco">San Francisco</option>
                    <option value="dubai">Dubai</option>
                    <option value="online">Online</option>
                  </select>
                </label>
                <label>
                  Hult student ID (optional)
                  <input name="hultStudentId" type="text" placeholder="If applicable" />
                </label>
                <label>
                  How did you hear about us?
                  <select name="referralSource" required defaultValue="">
                    <option value="" disabled>
                      Select…
                    </option>
                    <option value="hult-email">Hult email / bulletin</option>
                    <option value="founder-network">Founder network</option>
                    <option value="cursor-boston">Cursor Boston</option>
                    <option value="social">Social media</option>
                    <option value="friend">Friend / colleague</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <fieldset className={styles.confirmFieldset}>
                  <legend>Confirmations (required)</legend>
                  <label className={styles.checkboxLabel}>
                    <input name="confirmTuition" type="checkbox" required />
                    I can pay $10,000 tuition and ~$400/month for Cursor + Claude Code for at least 4
                    months.
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input name="confirmPublicWork" type="checkbox" required />
                    I understand my code, reviews, and projects will be public on GitHub.
                  </label>
                </fieldset>

                <label className={styles.honeypot} aria-hidden="true">
                  Website
                  <input name="_honeypot" type="text" tabIndex={-1} autoComplete="off" />
                </label>

                {submitStatus === 'error' && <p className={styles.formError}>{submitMessage}</p>}

                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={submitStatus === 'loading'}
                >
                  {submitStatus === 'loading' ? 'Submitting…' : 'Submit application'}
                </button>
              </form>
            )}
          </>
        )}

        {!admitted && (
          <p className={styles.formNote}>
            Tuition $10,000 + ~$400/mo tooling. Week-1 full refund. After week 1, free re-enrollment
            instead of cash refund. See <Link href="/overview">program overview</Link>.
          </p>
        )}
      </article>
    </main>
  );
}
