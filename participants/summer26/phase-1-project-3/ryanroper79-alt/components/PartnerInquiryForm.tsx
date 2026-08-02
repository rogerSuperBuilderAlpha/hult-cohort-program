'use client';

import { useState } from 'react';
import Link from 'next/link';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export function PartnerInquiryForm() {
  const [state, setState] = useState<FormState>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('submitting');
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch('/api/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          organisation: data.get('organisation'),
          participantHandle: data.get('participantHandle'),
          message: data.get('message'),
          _honeypot: data.get('_honeypot'),
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Submission failed.');
      setState('success');
      form.reset();
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Submission failed.');
    }
  }

  if (state === 'success') {
    return (
      <div className="rounded-lg border border-ceal-leaf bg-ceal-panel p-8" role="status">
        <h3 className="font-display text-xl text-ceal-mangrove">Introduction request received</h3>
        <p className="mt-3 text-ceal-muted">We reply within 2 business days when notification is configured.</p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="mt-6 rounded-md border border-ceal-mangrove px-4 py-2 text-sm font-semibold text-ceal-mangrove focus-ring"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form id="inquiry" onSubmit={onSubmit} className="mt-8 space-y-5">
      <div className="hidden" aria-hidden="true">
        <input name="_honeypot" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="partner-org" className="block text-sm font-medium text-ceal-ink">
            Organization *
          </label>
          <input
            id="partner-org"
            name="organisation"
            required
            className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring"
          />
        </div>
        <div>
          <label htmlFor="partner-name" className="block text-sm font-medium text-ceal-ink">
            Contact name *
          </label>
          <input
            id="partner-name"
            name="name"
            required
            className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring"
          />
        </div>
      </div>

      <div>
        <label htmlFor="partner-email" className="block text-sm font-medium text-ceal-ink">
          Email *
        </label>
        <input
          id="partner-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring"
        />
      </div>

      <div>
        <label htmlFor="partner-participant" className="block text-sm font-medium text-ceal-ink">
          Participant handle <span className="text-ceal-muted">(optional)</span>
        </label>
        <input
          id="partner-participant"
          name="participantHandle"
          placeholder="@handle from /work or /p/handle"
          className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring"
        />
      </div>

      <div>
        <label htmlFor="partner-message" className="block text-sm font-medium text-ceal-ink">
          Message *
        </label>
        <textarea
          id="partner-message"
          name="message"
          required
          rows={5}
          minLength={20}
          maxLength={2000}
          placeholder="What climate or resilience problem are you exploring, and which shipped artifact did you inspect?"
          className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring"
        />
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
        {state === 'submitting' ? 'Sending…' : 'Request introduction'}
      </button>

      <p className="text-xs text-ceal-muted">
        Browse profiles on{' '}
        <Link href="/work" className="text-ceal-leaf underline focus-ring rounded">
          /work
        </Link>
        .
      </p>
    </form>
  );
}
