'use client';

import { useState } from 'react';

const JOIN_FALLBACK =
  'https://github.com/ryanroper79-alt/hult-cohort-program/issues/new?labels=join-request&title=%5BJoin%20request%5D';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

type SuccessPayload = { mode: 'github'; issueUrl: string };

export function JoinForm() {
  const [state, setState] = useState<FormState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessPayload | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('submitting');
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: data.get('handle'),
          headline: data.get('headline'),
          github: data.get('github'),
          site: data.get('site'),
          linkedin: data.get('linkedin'),
          _honeypot: data.get('_honeypot'),
        }),
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error ?? 'Submission failed.');
      }

      if (payload.mode === 'github' && payload.issueUrl) {
        setSuccess({ mode: 'github', issueUrl: payload.issueUrl });
      } else if (payload.mailto) {
        setSuccess({ mode: 'github', issueUrl: JOIN_FALLBACK });
      } else {
        setSuccess({ mode: 'github', issueUrl: JOIN_FALLBACK });
      }

      setState('success');
      form.reset();
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Submission failed.');
    }
  }

  if (state === 'success' && success) {
    return (
      <div className="rounded-lg border border-ceal-leaf bg-ceal-panel p-8" role="status">
        <h2 className="font-display text-2xl text-ceal-mangrove">Request received</h2>
        {success.mode === 'github' ? (
          <p className="mt-4 text-ceal-muted">
            Your join request is tracked on GitHub. We paste approved entries into the roster and
            redeploy — usually within a day during review week.
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-4">
          <a
            href={success.issueUrl}
            className="inline-block rounded-md bg-ceal-sun px-5 py-3 font-semibold text-ceal-ink focus-ring hover:bg-ceal-sunGlow"
            target="_blank"
            rel="noopener noreferrer"
          >
            View join request →
          </a>
          <button
            type="button"
            onClick={() => {
              setState('idle');
              setSuccess(null);
            }}
            className="rounded-md border border-ceal-mangrove px-5 py-3 font-semibold text-ceal-mangrove focus-ring hover:bg-ceal-panel"
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="join-honeypot">Leave blank</label>
        <input id="join-honeypot" name="_honeypot" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="join-handle" className="block font-mono text-xs uppercase tracking-wider text-ceal-muted">
          GitHub handle *
        </label>
        <input
          id="join-handle"
          name="handle"
          required
          autoComplete="username"
          placeholder="your-handle"
          className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-ceal-ink focus-ring"
        />
        <p className="mt-2 text-sm text-ceal-muted">Used as your profile URL: /p/your-handle</p>
      </div>

      <div>
        <label htmlFor="join-headline" className="block font-mono text-xs uppercase tracking-wider text-ceal-muted">
          One-line headline *
        </label>
        <textarea
          id="join-headline"
          name="headline"
          required
          rows={3}
          maxLength={240}
          placeholder="One human-written line — what you build and where you work from."
          className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-ceal-ink focus-ring"
        />
      </div>

      <fieldset className="space-y-4 rounded-lg border border-ceal-line p-5">
        <legend className="px-1 font-mono text-xs uppercase tracking-wider text-ceal-muted">
          Links (optional)
        </legend>
        <div>
          <label htmlFor="join-github" className="block text-sm font-medium text-ceal-ink">
            GitHub profile URL
          </label>
          <input
            id="join-github"
            name="github"
            type="url"
            inputMode="url"
            placeholder="https://github.com/your-handle"
            className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-ceal-ink focus-ring"
          />
        </div>
        <div>
          <label htmlFor="join-site" className="block text-sm font-medium text-ceal-ink">
            Personal site
          </label>
          <input
            id="join-site"
            name="site"
            type="url"
            inputMode="url"
            placeholder="https://"
            className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-ceal-ink focus-ring"
          />
        </div>
        <div>
          <label htmlFor="join-linkedin" className="block text-sm font-medium text-ceal-ink">
            LinkedIn
          </label>
          <input
            id="join-linkedin"
            name="linkedin"
            type="url"
            inputMode="url"
            placeholder="https://linkedin.com/in/..."
            className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-ceal-ink focus-ring"
          />
        </div>
      </fieldset>

      {error ? (
        <p className="rounded-md border border-ceal-sun bg-ceal-sunGlow/30 px-4 py-3 text-sm text-ceal-ink" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="inline-block rounded-md bg-ceal-sun px-5 py-3 font-semibold text-ceal-ink focus-ring hover:bg-ceal-sunGlow disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === 'submitting' ? 'Submitting…' : 'Submit join request'}
      </button>
    </form>
  );
}
