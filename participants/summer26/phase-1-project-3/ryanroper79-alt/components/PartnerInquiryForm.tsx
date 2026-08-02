'use client';

import { useState } from 'react';

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
          organisation: data.get('organisation'),
          engagementModel: data.get('engagementModel'),
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
        <h3 className="font-display text-xl text-ceal-mangrove">Inquiry received</h3>
        <p className="mt-3 text-ceal-muted">
          We reply within 2 business days. You can stay on this page — no redirect required.
        </p>
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
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <div className="hidden" aria-hidden="true">
        <input name="_honeypot" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="partner-name" className="block text-sm font-medium text-ceal-ink">
            Name *
          </label>
          <input
            id="partner-name"
            name="name"
            required
            className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring dark:bg-ceal-ink/20"
          />
        </div>
        <div>
          <label htmlFor="partner-org" className="block text-sm font-medium text-ceal-ink">
            Organisation
          </label>
          <input
            id="partner-org"
            name="organisation"
            className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring dark:bg-ceal-ink/20"
          />
        </div>
      </div>

      <div>
        <label htmlFor="partner-model" className="block text-sm font-medium text-ceal-ink">
          Engagement model *
        </label>
        <select
          id="partner-model"
          name="engagementModel"
          required
          className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring dark:bg-ceal-ink/20"
        >
          <option value="hire">Hire a builder</option>
          <option value="sponsor">Sponsor a build</option>
          <option value="pilot">Co-develop a pilot</option>
          <option value="other">Other</option>
        </select>
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
          placeholder="Describe the Caribbean/SIDS infrastructure problem or hiring need."
          className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring dark:bg-ceal-ink/20"
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
        {state === 'submitting' ? 'Sending…' : 'Send inquiry'}
      </button>
    </form>
  );
}
