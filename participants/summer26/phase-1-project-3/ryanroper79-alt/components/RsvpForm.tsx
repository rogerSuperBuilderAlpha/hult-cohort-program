'use client';

import { useState } from 'react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export function RsvpForm() {
  const [state, setState] = useState<FormState>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('submitting');
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          company: data.get('company'),
          attending: data.get('attending'),
          _honeypot: data.get('_honeypot'),
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'RSVP failed.');
      setState('success');
      form.reset();
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'RSVP failed.');
    }
  }

  if (state === 'success') {
    return (
      <div className="rounded-lg border border-ceal-leaf bg-ceal-panel p-6" role="status">
        <p className="font-display text-xl text-ceal-mangrove">RSVP recorded</p>
        <p className="mt-2 text-ceal-muted">We will send event details to your inbox before the showcase.</p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="mt-4 rounded-md border border-ceal-mangrove px-4 py-2 text-sm font-semibold text-ceal-mangrove focus-ring"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div className="hidden" aria-hidden="true">
        <input name="_honeypot" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <label htmlFor="rsvp-name" className="block text-sm font-medium text-ceal-ink">
          Name *
        </label>
        <input
          id="rsvp-name"
          name="name"
          required
          className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring"
        />
      </div>
      <div>
        <label htmlFor="rsvp-email" className="block text-sm font-medium text-ceal-ink">
          Email *
        </label>
        <input
          id="rsvp-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring"
        />
      </div>
      <div>
        <label htmlFor="rsvp-company" className="block text-sm font-medium text-ceal-ink">
          Company <span className="text-ceal-muted">(optional)</span>
        </label>
        <input
          id="rsvp-company"
          name="company"
          className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring"
        />
      </div>
      <div>
        <label htmlFor="rsvp-attending" className="block text-sm font-medium text-ceal-ink">
          Attendance *
        </label>
        <select
          id="rsvp-attending"
          name="attending"
          defaultValue="yes"
          className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring"
        >
          <option value="yes">Yes — count me in</option>
          <option value="maybe">Maybe</option>
        </select>
      </div>
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={state === 'submitting'}
        className="rounded-md bg-ceal-sun px-5 py-3 font-semibold text-ceal-ink focus-ring hover:bg-ceal-sunGlow disabled:opacity-60"
      >
        {state === 'submitting' ? 'Sending…' : 'Submit RSVP'}
      </button>
    </form>
  );
}
