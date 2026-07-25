'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, ErrorNote, Field, Input } from '@/components/ui';
import { normaliseHandle } from '@/lib/opt-out';

/**
 * `/opt-out` — DESIGN-SPEC §5.0.
 *
 * **No auth gate, and that is the entire point.** "Someone who wants out shouldn't have to
 * create an account to leave." So there is no `useAuth()` here, no redirect, no session —
 * a stranger who has never opened Pulse can land on this page from the landing footer and
 * be gone in one field and one button.
 *
 * ⚠️ **This page does not verify identity, and it says so on itself rather than only here.**
 * The spec asked for GitHub OAuth confirmation; every OAuth path available to this app runs
 * through Firebase Auth and creates an account, which is the one thing the requirement
 * forbids. Rather than fake a check or gate removal behind the wall the spec deletes, the
 * request is honoured immediately and the page states plainly what wasn't checked.
 *
 * The asymmetry is what makes that safe: an unverified opt-out can only ever *remove* a
 * handle — it can't add one, alter anyone's facts, or write a word about anybody. The worst
 * case is someone hides a peer's already-public GitHub facts from one page, which is
 * reversible by asking. The alternative failure — a person who wants out being told to sign
 * up first — is not.
 */
export default function OptOutPage() {
  const [handle, setHandle] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [removed, setRemoved] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const clean = normaliseHandle(handle);
    if (!clean) {
      setError(
        'That doesn’t look like a GitHub handle. It’s the last part of your profile URL — letters, numbers and hyphens.',
      );
      return;
    }

    setState('sending');
    setError(null);

    try {
      const res = await fetch('/api/opt-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: clean }),
      });

      if (!res.ok) {
        // Plain language, never a raw Firebase code — and never a bare "something went
        // wrong" on the one page where being stuck is the whole problem.
        setError(
          'Pulse couldn’t record that just now. Nothing was saved. Try again in a moment — and if it keeps failing, this page is broken and you should say so in the cohort Discord.',
        );
        setState('idle');
        return;
      }

      setRemoved(clean);
      setState('done');
    } catch {
      setError(
        'Pulse couldn’t reach its database — you may be offline. Nothing was saved. Try again when you’re back.',
      );
      setState('idle');
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-20">
      <header className="mb-10 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden />
        <span className="text-sm font-medium text-zinc-100">Pulse</span>
      </header>

      {state === 'done' && removed ? <Done handle={removed} /> : null}

      {state !== 'done' && (
        <section>
          <h1 className="text-2xl font-medium tracking-tight text-zinc-100">
            Remove yourself from Pulse.
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            Pulse reads the cohort&rsquo;s public GitHub repo and shows what it finds — pull request
            numbers, filenames, nothing else. If you&rsquo;d rather it didn&rsquo;t show yours, say
            so here. No account, no sign-in, no reason needed.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {/* Explicit htmlFor/id via Field — never a wrapping <label>, which folds the hint
                text into the control's accessible name. */}
            <Field
              label="Your GitHub handle"
              hint="The last part of your profile URL — github.com/your-handle."
            >
              <Input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="your-github-handle"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                disabled={state === 'sending'}
                className="min-h-11"
              />
            </Field>

            <ErrorNote>{error}</ErrorNote>

            {/* Quiet, not green: green is the motivating action, and Pulse has no business
                cheering someone for leaving. Not red either — this is nobody's debt. */}
            <Button type="submit" disabled={!handle.trim() || state === 'sending'}>
              {state === 'sending' ? 'Removing…' : 'Remove me'}
            </Button>
          </form>

          <Honesty />
        </section>
      )}

      <p className="mt-12 border-t border-zinc-800 pt-6 text-xs text-zinc-400">
        <Link href="/" className="underline underline-offset-2 hover:text-zinc-400">
          Back to Pulse
        </Link>
      </p>
    </main>
  );
}

/**
 * Said before the button, not after — a disclosure that arrives once the thing is done is
 * a receipt, not a disclosure.
 */
function Honesty() {
  return (
    <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h2 className="text-sm font-medium text-zinc-100">What this actually does</h2>
      <ul className="mt-3 space-y-2 text-xs leading-relaxed text-zinc-400">
        <li>
          Pulse records the handle and stops showing it. That record is permanent, so the
          next time Pulse reads the repo it won&rsquo;t add you back.
        </li>
        <li>
          <strong className="font-medium text-zinc-300">Pulse does not check that this is you.</strong>{' '}
          Confirming would mean making you sign in, and the whole point is that leaving
          shouldn&rsquo;t cost you an account. Anyone can remove any handle here — including
          yours, by someone else. That&rsquo;s a real gap, and it&rsquo;s the one we chose: this
          form can only ever <em>hide</em> a handle. It can&rsquo;t add one, change anyone&rsquo;s
          facts, or write a sentence about anybody.
        </li>
        <li>
          Pulse has never written anything about you. It shows public facts — your pull
          request numbers and the files they touched. AI summaries about a person only happen
          if that person connects their own account, so there was no summary of you to delete.
        </li>
        <li>
          This only covers Pulse. <strong className="font-medium text-zinc-300">GitHub still
          shows your work</strong> — it&rsquo;s public there, and Pulse has no say over it. Pulse
          can only stop showing it here.
        </li>
      </ul>
    </div>
  );
}

function Done({ handle }: { handle: string }) {
  return (
    <section>
      <h1 className="text-2xl font-medium tracking-tight text-zinc-100">
        @{handle} is removed.
      </h1>
      <p className="mt-3 text-sm text-zinc-400">
        Done. No account was made, and nothing was asked of you.
      </p>

      <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-sm font-medium text-zinc-100">What happens next</h2>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-zinc-400">
          <li>
            The landing page rebuilds on a 15-minute cycle, so @{handle} may still appear
            there for a few minutes. It won&rsquo;t come back after that.
          </li>
          <li>
            Pulse won&rsquo;t re-add the handle when it next reads the repo, even if you open a
            new pull request.
          </li>
          <li>
            <strong className="font-medium text-zinc-300">Nobody checked that this was you.</strong>{' '}
            If someone removed your handle and you want it back, or you changed your mind, ask
            in the cohort Discord — reversing this takes one line in the database, but it
            isn&rsquo;t self-serve today.
          </li>
          <li>
            <strong className="font-medium text-zinc-300">GitHub still shows your work.</strong>{' '}
            Your pull requests are public there and always were. Pulse only stopped showing
            them here.
          </li>
        </ul>
      </div>
    </section>
  );
}
