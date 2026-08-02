'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  defaultPartnerBuilder,
  featuredBuilder,
} from '@/data/featured-builder';
import {
  interestTypes,
  partnerSolutions,
  problemDomains,
} from '@/data/solutions';
import { builderPickerOptions } from '@/data/roster';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export function PartnerInquiryForm() {
  const [state, setState] = useState<FormState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [defaultSolution, setDefaultSolution] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.hash.replace('#inquiry?', '').split('?').pop() ?? window.location.search);
    const solution = params.get('solution');
    if (solution) setDefaultSolution(solution);
  }, []);

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
          website: data.get('website'),
          linkedin: data.get('linkedin'),
          interestType: data.get('interestType'),
          builderHandle: data.get('builderHandle'),
          problemDomain: data.get('problemDomain'),
          solutionSlug: data.get('solutionSlug'),
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
        <h3 className="font-display text-xl text-ceal-mangrove">Enquiry received</h3>
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
    <form id="inquiry" onSubmit={onSubmit} className="mt-8 space-y-5">
      <div className="hidden" aria-hidden="true">
        <input name="_honeypot" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <p className="text-sm text-ceal-muted">
        Tell us who you are and what you&apos;re looking for. No account required — modelled on the
        cohort partner flow with Caribbean infrastructure focus.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="partner-org" className="block text-sm font-medium text-ceal-ink">
            Organization *
          </label>
          <input
            id="partner-org"
            name="organisation"
            required
            placeholder="Your firm or fund"
            className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring dark:bg-ceal-ink/20"
          />
        </div>
        <div>
          <label htmlFor="partner-website" className="block text-sm font-medium text-ceal-ink">
            Website <span className="text-ceal-muted">(optional)</span>
          </label>
          <input
            id="partner-website"
            name="website"
            type="url"
            placeholder="https://…"
            className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring dark:bg-ceal-ink/20"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="partner-linkedin" className="block text-sm font-medium text-ceal-ink">
            LinkedIn <span className="text-ceal-muted">(optional)</span>
          </label>
          <input
            id="partner-linkedin"
            name="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/…"
            className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring dark:bg-ceal-ink/20"
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
            placeholder="Your name"
            className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring dark:bg-ceal-ink/20"
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
          placeholder="you@organisation.com"
          className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring dark:bg-ceal-ink/20"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="partner-interest" className="block text-sm font-medium text-ceal-ink">
            Interest type *
          </label>
          <select
            id="partner-interest"
            name="interestType"
            required
            defaultValue="investor"
            className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring dark:bg-ceal-ink/20"
          >
            {interestTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="partner-builder" className="block text-sm font-medium text-ceal-ink">
            Builder <span className="text-ceal-muted">(optional)</span>
          </label>
          <select
            id="partner-builder"
            name="builderHandle"
            defaultValue={defaultPartnerBuilder}
            className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring dark:bg-ceal-ink/20"
          >
            <option value="">No specific builder</option>
            <option value={featuredBuilder.handle}>{featuredBuilder.displayName} (recommended)</option>
            {builderPickerOptions
              .filter((p) => p.handle !== featuredBuilder.handle)
              .map((p) => (
                <option key={p.handle} value={p.handle}>
                  {p.displayName}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="partner-domain" className="block text-sm font-medium text-ceal-ink">
            Problem domain *
          </label>
          <select
            id="partner-domain"
            name="problemDomain"
            required
            defaultValue="digital-ai"
            className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring dark:bg-ceal-ink/20"
          >
            {problemDomains.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="partner-solution" className="block text-sm font-medium text-ceal-ink">
            Solution <span className="text-ceal-muted">(optional)</span>
          </label>
          <select
            id="partner-solution"
            name="solutionSlug"
            defaultValue={defaultSolution}
            className="mt-2 w-full rounded-md border border-ceal-line bg-ceal-white px-4 py-3 text-sm focus-ring dark:bg-ceal-ink/20"
          >
            <option value="">No specific solution</option>
            {partnerSolutions.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
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
          placeholder="What are you looking for, and how might Ryan and the cohort help with Caribbean infrastructure or digital/AI delivery?"
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
        {state === 'submitting' ? 'Sending…' : 'Submit enquiry'}
      </button>

      <p className="text-xs text-ceal-muted">
        Prefer to browse first?{' '}
        <Link href="/partners/solutions" className="text-ceal-leaf underline focus-ring rounded">
          View solution catalog
        </Link>{' '}
        ·{' '}
        <Link href="/builders" className="text-ceal-leaf underline focus-ring rounded">
          Meet all builders
        </Link>
      </p>
    </form>
  );
}
