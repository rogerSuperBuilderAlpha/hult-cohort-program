'use client';

import { useState } from 'react';
import { expectationsAcknowledgment } from '@/content/expectations-acknowledgment';
import styles from '../app/page.module.css';

type Props = {
  getIdToken: () => Promise<string | null>;
  onSigned?: () => void;
};

export function ExpectationsAcknowledgmentPanel({ getIdToken, onSigned }: Props) {
  const [showcaseOptOut, setShowcaseOptOut] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm) {
      setError('Check the confirmation box to continue.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError('');
    const idToken = await getIdToken();
    if (!idToken) {
      setStatus('error');
      setError('Session expired. Refresh and sign in again.');
      return;
    }

    try {
      const res = await fetch('/api/me/acknowledgment', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: true, showcaseOptOut }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? 'Could not save acknowledgment.');
      }
      setStatus('done');
      onSigned?.();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Could not save acknowledgment.');
    }
  }

  if (status === 'done') {
    return (
      <div className={styles.calloutSuccess}>
        <p style={{ margin: 0 }}>
          <strong>Expectations Acknowledgment signed.</strong> Week 1 pass criteria updated on your
          dashboard.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.callout} onSubmit={submit}>
      <h2 className={styles.participantHeading} style={{ marginTop: 0 }}>
        {expectationsAcknowledgment.title}
      </h2>
      <p className={styles.formNote}>{expectationsAcknowledgment.intro}</p>
      <ol className={styles.introList}>
        {expectationsAcknowledgment.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={showcaseOptOut}
          onChange={(e) => setShowcaseOptOut(e.target.checked)}
        />
        {expectationsAcknowledgment.showcaseOptOutLabel}
      </label>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          required
          checked={confirm}
          onChange={(e) => setConfirm(e.target.checked)}
        />
        {expectationsAcknowledgment.confirmLabel}
      </label>
      {status === 'error' && error ? <p className={styles.formError}>{error}</p> : null}
      <button type="submit" className={styles.primaryBtn} disabled={status === 'loading'}>
        {status === 'loading' ? 'Saving…' : 'Sign acknowledgment'}
      </button>
    </form>
  );
}
