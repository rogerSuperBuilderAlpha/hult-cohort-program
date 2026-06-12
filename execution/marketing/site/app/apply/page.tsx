'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import styles from '../page.module.css';

const DEFAULT_TAKE_HOME =
  'https://github.com/rogerSuperBuilderAlpha/admissions-task-board-fall26';

export default function ApplyPage() {
  const { configured, profile, loading, authError, signIn, signOut, getIdToken } = useGithubAuth();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [takeHomeUrl, setTakeHomeUrl] = useState(DEFAULT_TAKE_HOME);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;

    setStatus('loading');
    setMessage('');

    const idToken = await getIdToken();
    if (!idToken) {
      setStatus('error');
      setMessage('Your GitHub session expired. Sign in again.');
      return;
    }

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Submission failed');
      }

      setTakeHomeUrl(json.takeHomeRepoUrl || DEFAULT_TAKE_HOME);
      setStatus('success');
      form.reset();
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>Hult</span>
          <span className={styles.logoSub}>Cohort</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/program">Program</Link>
          <Link href="/">Home</Link>
        </nav>
      </header>

      <article className={styles.overview}>
        <p className={styles.eyebrow}>Fall 2026 · Applications open June 15</p>
        <h1 className={styles.sectionTitle}>Apply</h1>
        <p className={styles.overviewLead}>
          Step 1: sign in with GitHub, then complete this form. Step 2: fix the repo and open a PR
          within 48 hours. Admissions is PR-native — same loop as the program.
        </p>

        {status === 'success' ? (
          <div className={styles.calloutSuccess}>
            <p>
              <strong>Application received.</strong> Your next step is the 48-hour take-home — do
              not wait for email; start now.
            </p>
            <ol className={styles.successSteps}>
              <li>
                Open the repo:{' '}
                <a href={takeHomeUrl} target="_blank" rel="noopener noreferrer">
                  {takeHomeUrl}
                </a>
              </li>
              <li>
                Clone, fix the bugs, run <code>npm test</code> until green, implement optional
                DELETE.
              </li>
              <li>
                Open a PR titled <code>[Admissions] Fix task board — {'{your-github-handle}'}</code>{' '}
                on branch <code>admissions/{'{your-github-handle}'}</code>.
              </li>
              <li>Fill the PR template completely, including agent usage.</li>
            </ol>
            <p className={styles.formNote}>
              Questions: cohort@hult.edu · We review take-home PRs within 48 hours of submission.
            </p>
          </div>
        ) : !configured ? (
          <div className={styles.callout}>
            Applications are temporarily unavailable. Firebase is not configured on this deployment.
          </div>
        ) : loading ? (
          <p className={styles.formNote}>Checking GitHub session…</p>
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
                <button type="button" className={styles.signOutBtn} onClick={() => void signOut()}>
                  Use a different account
                </button>
              </div>
            </div>

            <form className={styles.applyForm} onSubmit={onSubmit}>
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
                  <input name="confirmGithubAge" type="checkbox" required />
                  My GitHub account is at least 6 months old with at least 5 commits on any repo.
                </label>
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

              {status === 'error' && <p className={styles.formError}>{message}</p>}

              <button type="submit" className={styles.primaryBtn} disabled={status === 'loading'}>
                {status === 'loading' ? 'Submitting…' : 'Submit application'}
              </button>
            </form>
          </>
        )}

        <p className={styles.formNote}>
          Tuition $10,000 + ~$400/mo tooling. Week-1 full refund. After week 1, free re-enrollment
          instead of cash refund. See <Link href="/overview">program overview</Link>.
        </p>
      </article>
    </main>
  );
}
