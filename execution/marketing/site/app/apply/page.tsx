'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { AccountSection } from '@/components/AccountSection';
import { ApplyNextCohortSection } from '@/components/ApplyNextCohortSection';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import {
  isApplicantInFlight,
  isAdmittedPendingRoster,
  isEnrolled,
} from '@/lib/participant-status';
import { readApplicationApiError } from '@/lib/read-application-api-error';
import { useParticipantStatus } from '@/lib/use-participant-status';
import styles from '../page.module.css';

const DEFAULT_TAKE_HOME =
  'https://github.com/rogerSuperBuilderAlpha/admissions-task-board-fall26';

function SignedInBar({
  handle,
  photoUrl,
  onSignOut,
}: {
  handle: string | null;
  photoUrl: string | null;
  onSignOut: () => void;
}) {
  return (
    <div className={styles.signedInBar}>
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" width={32} height={32} className={styles.signedInAvatar} />
      ) : null}
      <div className={styles.signedInMeta}>
        <span>
          Signed in as{' '}
          {handle ? (
            <a
              href={`https://github.com/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              @{handle}
            </a>
          ) : (
            <span aria-hidden="true">…</span>
          )}
        </span>
        <button type="button" className={styles.signOutBtn} onClick={onSignOut}>
          Use a different account
        </button>
      </div>
    </div>
  );
}

function TakeHomeSteps({
  takeHomeUrl,
  handle,
  status,
}: {
  takeHomeUrl: string;
  handle: string;
  status: 'submitted' | 'take-home-sent';
}) {
  const headline =
    status === 'take-home-sent'
      ? 'Take-home assignment issued.'
      : 'Application received — proceed to the take-home.';

  return (
    <div className={styles.participantPanel}>
      <div className={styles.callout}>
        <p>
          <strong>{headline}</strong> Submit your take-home pull request to complete the admissions
          review.
        </p>
      </div>
      <ol className={styles.successSteps}>
        <li>
          Open the repository:{' '}
          <a href={takeHomeUrl} target="_blank" rel="noopener noreferrer">
            {takeHomeUrl}
          </a>
        </li>
        <li>
          Fork the repository to your GitHub account, clone your fork locally, resolve the reported
          defects, run <code>npm test</code> until all tests pass, and implement the optional DELETE
          endpoint.
        </li>
        <li>
          Open a pull request to the upstream repository titled{' '}
          <code>[Admissions] Fix task board — {handle}</code> from branch{' '}
          <code>admissions/{handle}</code>.
        </li>
        <li>Complete the submission template in full, including tooling notes and test evidence.</li>
        <li>A decision will be issued within 48 hours of your take-home pull request.</li>
      </ol>
    </div>
  );
}

function AdmittedPendingPanel() {
  return (
    <div className={styles.participantPanel}>
      <div className={styles.callout}>
        <p>
          <strong>Admitted — enrollment pending.</strong> Your application has been approved. Staff
          are completing your enrollment in the cohort roster. Participant features will become
          available once enrollment is confirmed, typically within one business day. Contact{' '}
          <a href="mailto:cohort@hult.edu">cohort@hult.edu</a> if this status persists.
        </p>
      </div>
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
  const router = useRouter();
  const { configured, profile, loading, authError, signIn, signOut, deleteAccount, getIdToken } =
    useGithubAuth();
  const { me, loading: statusLoading, error: statusError, refresh } = useParticipantStatus(
    getIdToken,
    Boolean(profile)
  );
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const enrolled = isEnrolled(me);
  const pendingRoster = isAdmittedPendingRoster(me);
  const inFlight = isApplicantInFlight(me);
  const takeHomeUrl = me?.application?.takeHomeRepoUrl || DEFAULT_TAKE_HOME;
  const terminalApplication =
    me?.application?.status === 'waitlisted' || me?.application?.status === 'rejected';
  const showAccountSection = Boolean(me?.githubHandle) && !terminalApplication;

  useEffect(() => {
    if (enrolled) router.replace('/dashboard');
  }, [enrolled, router]);

  if (profile && (statusLoading || enrolled)) {
    return (
      <main className={styles.main} id="main-content">
        <SiteHeader links={[{ href: '/program', label: 'Program' }, { href: '/', label: 'Home' }]} />
        <article className={styles.overview}>
          <p className={styles.formNote}>
            {enrolled ? 'Redirecting to your dashboard…' : 'Loading your account…'}
          </p>
        </article>
      </main>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile || enrolled || pendingRoster || inFlight) return;

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

  const pageTitle = enrolled ? 'Apply' : pendingRoster ? 'Admitted' : 'Apply';
  const pageLead = pendingRoster
    ? 'You have been admitted to the Summer Pilot. Enrollment is being finalized; participant tools will become available shortly.'
    : 'Complete the application form with your engineering account. If admitted to the take-home stage, you will have 48 hours to complete a focused technical assignment using the same review workflow used in the program.';

  return (
    <main className={styles.main} id="main-content">
      <SiteHeader links={[{ href: '/program', label: 'Program' }, { href: '/', label: 'Home' }]} />

      <article className={styles.overview}>
        <p className={styles.eyebrow}>
          Summer Pilot 2026 · {enrolled ? 'Redirecting…' : pendingRoster ? 'Admitted' : 'Applications open June 15'}
        </p>
        <h1 className={styles.sectionTitle}>{pageTitle}</h1>
        <p className={styles.overviewLead}>{pageLead}</p>

        {!configured ? (
          <div className={styles.callout}>
            Applications are temporarily unavailable. Platform services are not configured on this
            deployment.
          </div>
        ) : loading || (profile && statusLoading) ? (
          <p className={styles.formNote}>Loading your account…</p>
        ) : !profile ? (
          <div className={styles.authGate}>
            <p className={styles.authGateLead}>
              Sign in to begin your application. Your application is linked to this account — the
              same engineering identity you will use for program submissions.
            </p>
            <button type="button" className={styles.githubSignInBtn} onClick={() => void signIn()}>
              Sign in with GitHub
            </button>
            {authError && <p className={styles.formError}>{authError}</p>}
            <p className={styles.formNote}>
              We access your public GitHub username only. Repository access is not requested at
              application time. By signing in, you agree to the{' '}
              <Link href="/terms">Terms of Service</Link> and{' '}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        ) : (
          <>
            <SignedInBar
              handle={me?.githubHandle ?? null}
              photoUrl={profile.photoUrl}
              onSignOut={() => void signOut()}
            />
            {statusError && <p className={styles.formError}>{statusError}</p>}

            {pendingRoster ? (
              <AdmittedPendingPanel />
            ) : me?.application?.status === 'take-home-submitted' ? (
              <StatusMessage
                title="Take-home submitted."
                body="Your admissions pull request is under review. A decision will be issued within 48 hours."
              />
            ) : me?.application?.status === 'waitlisted' ? (
              <StatusMessage
                title="Waitlisted."
                body="You will be notified by email if a place becomes available. For questions, contact cohort@hult.edu."
              />
            ) : me?.application?.status === 'rejected' ? (
              <StatusMessage
                title="Not admitted this cycle."
                body="Thank you for your application. You may reapply in a future cohort."
              />
            ) : inFlight && me ? (
              <TakeHomeSteps
                takeHomeUrl={takeHomeUrl}
                handle={me.githubHandle}
                status={
                  me.application?.status === 'take-home-sent' ? 'take-home-sent' : 'submitted'
                }
              />
            ) : (
              <form className={styles.applyForm} onSubmit={onSubmit}>
                <input type="hidden" name="githubHandle" value={me?.githubHandle ?? ''} />
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
                  <span className={styles.githubLockedValue}>@{me?.githubHandle ?? '…'}</span>
                  <span className={styles.githubLockedNote}>Linked to your sign-in — not editable</span>
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
                  <legend>Required confirmations</legend>
                  <label className={styles.checkboxLabel}>
                    <input name="confirmTooling" type="checkbox" required />
                    I confirm I can cover approximately $400 per month for Cursor and Claude Code for
                    the six-week pilot, and that I am registered (or will register) for this elective
                    through Hult.
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input name="confirmPublicWork" type="checkbox" required />
                    I understand that my code, reviews, and project work will be visible for
                    assessment and partner review.
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input name="confirmPolicies" type="checkbox" required />
                    I agree to the{' '}
                    <Link href="/terms">Terms of Service</Link> and{' '}
                    <Link href="/privacy">Privacy Policy</Link>.
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

            {showAccountSection && me ? (
              <AccountSection
                handle={me.githubHandle}
                onSignOut={() => void signOut()}
                onDelete={deleteAccount}
                onDeleted={() => void refresh()}
              />
            ) : null}
          </>
        )}

        {!enrolled && !pendingRoster && (
          <p className={styles.formNote}>
            Register for the course through Hult and complete this platform apply + take-home. Tooling
            runs ~$400/month. Details: <Link href="/start">program intro</Link>.
          </p>
        )}

        <ApplyNextCohortSection />
      </article>
    </main>
  );
}
