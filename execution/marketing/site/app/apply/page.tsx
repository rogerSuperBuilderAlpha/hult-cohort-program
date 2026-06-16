'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
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
      ? 'Take-home assigned — clock is running.'
      : 'Application on file — start your take-home now.';

  return (
    <div className={styles.participantPanel}>
      <div className={styles.callout}>
        <p>
          <strong>{headline}</strong> Complete the take-home PR to finish admissions review.
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
        <li>Decision within 48 hours of your take-home PR.</li>
      </ol>
    </div>
  );
}

function AccountSection({
  handle,
  onSignOut,
  onDelete,
  onDeleted,
}: {
  handle: string;
  onSignOut: () => void;
  onDelete: () => Promise<{ ok: boolean; error?: string }>;
  onDeleted: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const canDelete = confirmText.trim().toLowerCase() === handle.toLowerCase();

  async function runDelete() {
    if (!canDelete || deleting) return;
    setDeleting(true);
    setError('');
    const result = await onDelete();
    if (!result.ok) {
      setError(result.error || 'Could not delete your account.');
      setDeleting(false);
      return;
    }
    onDeleted();
  }

  return (
    <section className={styles.accountSection}>
      <h2 className={styles.participantHeading}>Account</h2>
      <div className={styles.participantActions} style={{ marginTop: 0 }}>
        <button type="button" className={styles.secondaryBtn} onClick={onSignOut}>
          Sign out
        </button>
      </div>

      <div className={styles.dangerZone}>
        <h3 className={styles.dangerZoneTitle}>Delete account</h3>
        <p className={styles.formNote} style={{ marginTop: 0 }}>
          Permanently removes your application, roster membership, submissions, written reviews, and
          votes from this platform, plus your sign-in record. Public GitHub repos, PRs, and issues
          you created remain on GitHub under your account. This cannot be undone.
        </p>

        {!confirmOpen ? (
          <button
            type="button"
            className={styles.dangerBtn}
            onClick={() => setConfirmOpen(true)}
          >
            Delete my account
          </button>
        ) : (
          <div className={styles.dangerConfirm}>
            <label className={styles.reviewLinkLabel} htmlFor="delete-confirm">
              Type your handle <code>{handle}</code> to confirm:
            </label>
            <input
              id="delete-confirm"
              type="text"
              className={styles.reviewLinkInput}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={handle}
              autoComplete="off"
            />
            <div className={styles.participantActions} style={{ marginTop: 12 }}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmText('');
                  setError('');
                }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.dangerBtn}
                disabled={!canDelete || deleting}
                onClick={() => void runDelete()}
              >
                {deleting ? 'Deleting…' : 'Permanently delete'}
              </button>
            </div>
          </div>
        )}
        {error ? <p className={styles.formError}>{error}</p> : null}
      </div>
    </section>
  );
}

function AdmittedPendingPanel() {
  return (
    <div className={styles.participantPanel}>
      <div className={styles.callout}>
        <p>
          <strong>Admitted — roster pending.</strong> Your application is approved; staff are
          adding you to the cohort roster. Participant features unlock once your roster row is
          active (usually within one business day). Check back here or email cohort@hult.edu.
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

  useEffect(() => {
    if (enrolled) router.replace('/dashboard');
  }, [enrolled, router]);

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
    ? 'You are admitted to Fall 2026. Your roster row is being finalized — participant tools unlock shortly.'
    : 'Step 1: sign in with GitHub, then complete this form. Step 2: fix the repo and open a PR within 48 hours. Admissions is PR-native — same loop as the program.';

  return (
    <main className={styles.main}>
      <SiteHeader links={[{ href: '/program', label: 'Program' }, { href: '/', label: 'Home' }]} />

      <article className={styles.overview}>
        <p className={styles.eyebrow}>
          Fall 2026 · {enrolled ? 'Redirecting…' : pendingRoster ? 'Admitted' : 'Applications open June 15'}
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
              By signing in you agree to the{' '}
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

            <AccountSection
              handle={me?.githubHandle ?? ''}
              onSignOut={() => void signOut()}
              onDelete={deleteAccount}
              onDeleted={() => void refresh()}
            />
          </>
        )}

        {!enrolled && !pendingRoster && (
          <p className={styles.formNote}>
            Tuition $10,000 + ~$400/mo tooling. Week-1 full refund. After week 1, free re-enrollment
            instead of cash refund. See <Link href="/overview">program overview</Link>.
          </p>
        )}
      </article>
    </main>
  );
}
