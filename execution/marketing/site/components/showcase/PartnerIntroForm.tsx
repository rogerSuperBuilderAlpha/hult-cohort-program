'use client';

import { useState } from 'react';
import styles from '@/app/showcase/showcase.module.css';

type Props = {
  handles: string[];
};

export function PartnerIntroForm({ handles }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  function toggleHandle(handle: string) {
    setSelected((prev) =>
      prev.includes(handle) ? prev.filter((h) => h !== handle) : [...prev, handle]
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch('/api/partner-intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerName: data.get('partnerName'),
          company: data.get('company'),
          email: data.get('email'),
          message: data.get('message'),
          studentHandles: selected,
          _honeypot: data.get('_honeypot'),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Request failed');
      setStatus('ok');
      form.reset();
      setSelected([]);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Request failed');
    }
  }

  return (
    <form className={styles.introForm} onSubmit={onSubmit}>
      <input type="text" name="_honeypot" className={styles.honeypot} tabIndex={-1} autoComplete="off" />

      <div className={styles.formRow}>
        <label>
          Your name
          <input name="partnerName" required autoComplete="name" />
        </label>
        <label>
          Company
          <input name="company" required autoComplete="organization" />
        </label>
      </div>

      <label>
        Work email
        <input name="email" type="email" required autoComplete="email" />
      </label>

      <fieldset className={styles.studentPick}>
        <legend>Students to meet (select one or more)</legend>
        <div className={styles.chipGrid}>
          {handles.map((handle) => (
            <button
              key={handle}
              type="button"
              className={selected.includes(handle) ? styles.chipActive : styles.chip}
              onClick={() => toggleHandle(handle)}
            >
              @{handle}
            </button>
          ))}
        </div>
      </fieldset>

      <label>
        Message
        <textarea
          name="message"
          required
          minLength={20}
          rows={5}
          placeholder="Role, stack, timeline, and why these builders fit."
        />
      </label>

      {status === 'ok' ? (
        <p className={styles.success}>Request sent — placement lead will follow up.</p>
      ) : null}
      {status === 'error' ? <p className={styles.error}>{error}</p> : null}

      <button type="submit" className={styles.primaryBtn} disabled={status === 'loading' || selected.length === 0}>
        {status === 'loading' ? 'Sending…' : 'Request intro'}
      </button>
    </form>
  );
}
