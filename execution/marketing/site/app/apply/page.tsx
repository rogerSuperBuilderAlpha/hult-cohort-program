'use client';

import Link from 'next/link';
import { useState } from 'react';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { submitApplicationClient } from '@/lib/submit-application-client';
import styles from '../page.module.css';

export default function ApplyPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Submission failed');
      }

      if (json.storage === 'firestore-client') {
        if (!isFirebaseConfigured()) {
          throw new Error('Firebase is not configured.');
        }
        const { validateApplication } = await import('@/lib/applications');
        const input = validateApplication(data);
        await submitApplicationClient(input, json.id);
      }

      setStatus('success');
      setMessage(
        'Application received. Check your email for the 48-hour take-home repo link and PR instructions.'
      );
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
          Step 1: this form. Step 2: fix the repo and open a PR within 48 hours. Admissions is
          PR-native — same loop as the program.
        </p>

        {status === 'success' ? (
          <div className={styles.calloutSuccess}>{message}</div>
        ) : (
          <form className={styles.applyForm} onSubmit={onSubmit}>
            <label>
              GitHub profile URL
              <input name="githubUrl" type="url" required placeholder="https://github.com/you" />
            </label>
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
              <input name="referralSource" type="text" required />
            </label>
            <label>
              Email
              <input name="email" type="email" required />
            </label>

            {status === 'error' && <p className={styles.formError}>{message}</p>}

            <button type="submit" className={styles.primaryBtn} disabled={status === 'loading'}>
              {status === 'loading' ? 'Submitting…' : 'Submit application'}
            </button>
          </form>
        )}

        <p className={styles.formNote}>
          Tuition $10,000 + ~$400/mo tooling. Week-1 full refund. After week 1, free re-enrollment
          instead of cash refund. See <Link href="/overview">program overview</Link>.
        </p>
      </article>
    </main>
  );
}
