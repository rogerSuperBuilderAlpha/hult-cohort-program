'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { Button, ErrorNote } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { saveConsent, setNarrationOptIn } from '@/lib/github-link';
import type { GitHubLink } from '@/lib/types';

/**
 * /connect — the only gate (spec §5.3).
 *
 * This screen buys autonomy, so it has to say what it's buying in the words a surprised
 * person would use later. "Pulse will post without asking" appears verbatim and above the
 * choices, not in fine print: if someone is startled by their first auto-published
 * sentence, this consent was a trick.
 *
 * Deliberately NOT wrapped in AppShell. It's a full-page decision point — nav here invites
 * you to wander off mid-decision, and the shell's chrome makes a checkpoint look like a
 * settings tab.
 */

/** Firebase codes are not user-facing English. Never show one; never show a bare "oops". */
function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'The GitHub window closed before it finished. Nothing was saved.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the GitHub window. Allow pop-ups for this site and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'That GitHub account uses a different email here. Sign in with that email first, then connect.';
    case 'auth/credential-already-in-use':
      return 'That GitHub account is already connected to another Pulse account.';
    case 'auth/configuration-not-found':
      return 'GitHub sign-in isn’t configured yet. You can still add tasks yourself.';
    case 'permission-denied':
      return 'We couldn’t save that choice — you may have been signed out. Sign in and try again.';
    case 'unavailable':
      return 'We couldn’t reach the server. Check your connection and try again.';
    default:
      return 'GitHub didn’t let us in. You may have declined the permission prompt. Nothing was saved.';
  }
}

export default function ConnectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/signin');
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  // The redirect is in flight. Rendering the child here would run its hooks against
  // `user!.uid` with no user — the crash that already bit us at prerender.
  if (!user) return null;

  return <Consent uid={user.uid} />;
}

/**
 * Every hook that needs a user lives below the gate, so `uid` is a plain string here and
 * there is no `user!` anywhere in the tree.
 */
function Consent({ uid }: { uid: string }) {
  const router = useRouter();
  const { signInWithGithub } = useAuth();

  const [handle, setHandle] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  /**
   * The handle is the GitHub login and nothing else — it's the join key against the public
   * cohort repo. It is NOT on the Firebase `User`; sign-in reads it from the credential and
   * persists it onto the member doc, so that doc is the only place to read it back.
   *
   * If it isn't there, it stays null. Never the email local-part: "nikjain1588@gmail.com"
   * produced handle "nikjain1588" for a GitHub login of "nikjain15", the join silently
   * never matched, and a guessed handle can also collide with a real member's login and
   * attach one person's work to another.
   */
  const fetchHandle = useCallback(async () => {
    const snap = await getDoc(doc(db, 'members', uid));
    const stored = snap.exists() ? (snap.data().handle as string | null | undefined) : null;
    return stored ?? null;
  }, [uid]);

  const readHandle = useCallback(async () => {
    const value = await fetchHandle();
    setHandle(value);
    return value;
  }, [fetchHandle]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      // A failure here is not worth an error: null is the honest answer, and the page
      // then offers the GitHub link instead of asserting a handle it doesn't have.
      const value = await fetchHandle().catch(() => null);
      if (!cancelled) setHandle(value);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchHandle]);

  /** Link GitHub from here — §4: "anyone who signed up by email can link GitHub later at /connect". */
  async function linkGithub() {
    setError('');
    setBusy(true);
    try {
      await signInWithGithub();
      await readHandle();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function choose(status: GitHubLink['status'], mode: GitHubLink['mode']) {
    setError('');
    setBusy(true);
    try {
      // Re-read rather than trust state: they may have linked GitHub in this session.
      const current = await readHandle().catch(() => handle);
      await saveConsent(uid, { status, mode, handle: current ?? null });

      if (status === 'connected' && current) {
        // The narration gate (§3.5): a model may not write a sentence about someone who
        // hasn't asked for it. Best-effort — a member who has never pushed has no
        // cohortMembers doc yet, and that must not fail the consent they just gave.
        await setNarrationOptIn(current, true).catch(() => {});
      }

      // Declining lands on the board, not home: the manual board IS the product for
      // anyone who says no, and it must be fully functional.
      router.replace(status === 'declined' ? '/board' : '/');
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-4 py-12">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden />
        <span className="text-sm font-medium text-zinc-100">Pulse</span>
      </div>

      <h1 className="text-sm font-medium text-zinc-100">Connect GitHub</h1>
      <p className="mt-1 text-[13px] text-zinc-400">
        Nobody updates Pulse. It reads your work and keeps your board honest on its own — this is
        the one time it asks.
      </p>

      {/*
        The verbatim sentence the spec requires, at the top of the decision and in the
        loudest type on the page. If this is fine print, the consent is a trick.
      */}
      <p className="mt-5 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-100">
        Pulse will post without asking.
      </p>

      <div className="mt-4 space-y-3">
        <Block
          title="It will, without asking"
          items={[
            'create tasks from your branches',
            'move cards when you push',
            'post a sentence about what you shipped',
          ]}
          emphasiseLast
        />
        <Block
          title="It reads"
          items={['commit messages', 'PR titles', 'filenames', 'branch names', 'public repos only']}
          emphasiseLast
        />
        <Block title="It never reads" items={['your code', 'private repos']} />
        <Block
          title="You can always"
          items={[
            'edit or delete anything it posted',
            'turn it off',
            'make it ask first — all in Settings',
          ]}
          emphasiseLast
        />
      </div>

      <div className="mt-5">
        <HandleNote handle={handle} busy={busy} onLink={linkGithub} />
      </div>

      {error && (
        <div className="mt-4">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      {/* Three choices. Green marks the motivating one and nothing else on this page. */}
      <div className="mt-5 flex flex-col gap-2">
        <Button variant="primary" disabled={busy} onClick={() => choose('connected', 'auto')}>
          Let it run
        </Button>
        <Button disabled={busy} onClick={() => choose('connected', 'ask_first')}>
          Let it run, but ask me first
        </Button>
        <Button disabled={busy} onClick={() => choose('declined', 'ask_first')}>
          Not now — I&rsquo;ll add tasks myself
        </Button>
      </div>

      <p className="mt-4 text-[11px] text-zinc-500">
        Saying no gives you the full board — projects, tasks, assignees, due dates — with nothing
        automatic. You can change any of this later in{' '}
        <Link href="/settings" className="text-zinc-400 underline underline-offset-4 hover:text-zinc-200">
          Settings
        </Link>
        .
      </p>
    </main>
  );
}

/** One of the spec's four blocks. Same shape for all four — the contrast is the point. */
function Block({
  title,
  items,
  emphasiseLast = false,
}: {
  title: string;
  items: string[];
  emphasiseLast?: boolean;
}) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
      <h2 className="text-[11px] text-zinc-500">{title}</h2>
      <ul className="mt-2 space-y-1">
        {items.map((item, i) => (
          <li
            key={item}
            className={`text-[13px] ${
              emphasiseLast && i === items.length - 1
                ? 'font-medium text-zinc-100'
                : 'text-zinc-400'
            }`}
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Who Pulse will look for. An email/password account has no GitHub login yet, and there is
 * no honest way to guess one — so it says so plainly and offers the only thing that fixes
 * it, rather than inventing a handle that would silently match nobody.
 */
function HandleNote({
  handle,
  busy,
  onLink,
}: {
  handle: string | null;
  busy: boolean;
  onLink: () => void;
}) {
  if (handle) {
    return (
      <p className="text-xs text-zinc-500">
        Pulse will watch <span className="text-zinc-300">@{handle}</span>.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
      <p className="text-[13px] text-zinc-400">
        We don&rsquo;t know your GitHub username yet — you signed up with an email, and guessing it
        from that would attach the wrong person&rsquo;s work to you.
      </p>
      <div className="mt-3">
        <Button disabled={busy} onClick={onLink}>
          {busy ? 'Working…' : 'Sign in with GitHub to link it'}
        </Button>
      </div>
      <p className="mt-2 text-[11px] text-zinc-500">
        Without it, Pulse can&rsquo;t find your work — but the board below still works by hand.
      </p>
    </div>
  );
}
