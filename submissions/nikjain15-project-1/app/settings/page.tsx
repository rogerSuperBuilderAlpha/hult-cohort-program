'use client';

import { deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Button, ErrorNote, Field, Input, Textarea } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { COHORT_REPO } from '@/lib/github';
import {
  disconnectGitHub,
  setCreateTasksFromBranches,
  setExcludedRepos,
  setMode,
  setNarration,
  subscribeToLink,
  subscribeToMyPosts,
} from '@/lib/github-link';
import type { GitHubLink } from '@/lib/types';

/**
 * Settings — every promise /connect made, in one reachable place.
 *
 * Consent says three things: you can turn it off, you can make it ask first, you can
 * delete anything it posted. If any of those is unreachable, consent was a trick. That is
 * the whole reason this screen exists, and why it ships beside the consent screen.
 *
 * Pulse never argues (§6.1): there is no "are you sure?" anywhere below, including on
 * disconnect. The human is right. What we owe them is a plain statement of what a control
 * does BEFORE they press it, and an honest report of what happened after — not friction.
 */
export default function SettingsPage() {
  // Every hook lives in the child. AppShell holds the auth gate, so `user` is only
  // non-null inside it — reading user!.uid out here crashes at prerender.
  return (
    <AppShell>
      <SettingsView />
    </AppShell>
  );
}

/**
 * The publish bargain, as ONE axis.
 *
 * `auto` and `ask_first` are the two values `mode` already has; `off` is the third state
 * the spec's table describes ("sensing runs, nothing publishes"). Modelled as a single
 * choice rather than two toggles, because two toggles can disagree and then neither the
 * product nor the person knows what was actually agreed to.
 */
type Publish = GitHubLink['mode'] | 'off';

const PUBLISH_OPTIONS: { value: Publish; label: string; hint: string }[] = [
  {
    value: 'auto',
    label: 'Let Pulse post without asking',
    hint: 'The bargain. Pulse writes as you the moment it sees the work, and every post shows what it inferred and from what.',
  },
  {
    value: 'ask_first',
    label: 'Ask me first instead',
    hint: 'Restores the approval queue. Nothing goes out under your name until you say so.',
  },
  {
    value: 'off',
    label: 'Off',
    hint: 'Sensing keeps running — your board still builds itself. Pulse just never writes a sentence as you.',
  },
];

function SettingsView() {
  const { user } = useAuth();
  const uid = user!.uid;

  // undefined = still loading, null = no link doc at all.
  const [link, setLink] = useState<GitHubLink | null | undefined>(undefined);
  const [posts, setPosts] = useState<
    { id: string; narrative: string | null; subject: string; kind: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [disconnected, setDisconnected] = useState<number | null>(null);

  useEffect(() => subscribeToLink(uid, setLink), [uid]);
  useEffect(() => subscribeToMyPosts(uid, setPosts), [uid]);

  const handle = link?.handle || null;

  /**
   * The consent record lives on the uid-keyed link doc, and that's what this reads.
   *
   * It used to read cohortMembers/{handle} — the doc the rules gate on — but that doc only
   * exists for someone who has already pushed to the cohort repo, about 8 of 65 people.
   * For everyone else the switch read false forever and couldn't be turned on. `setNarration`
   * writes here first and mirrors to the public doc when there is one.
   */
  const narrationOptIn = link?.narrationOptIn === true;

  /** One place where a write's failure becomes a sentence, never a raw Firebase code. */
  const run = useCallback(async (whatFailed: string, fn: () => Promise<void>) => {
    setError(null);
    try {
      await fn();
    } catch {
      setError(whatFailed);
    }
  }, []);

  if (link === undefined) {
    return <p className="text-sm text-zinc-400">Loading your settings…</p>;
  }

  // No link, they declined at /connect, or they disconnected. Don't render a page full of
  // controls for a connection that isn't there — say so, and point at the two things that
  // still work: connecting, and the board, which never depended on this.
  if (!link || link.status !== 'connected') {
    return <NotConnected declined={link?.status === 'declined'} deleted={disconnected} />;
  }

  const publish: Publish = narrationOptIn ? link.mode : 'off';

  const choosePublish = (next: Publish) =>
    run(
      next === 'off'
        ? "We couldn't turn posting off. Nothing changed — Pulse is still set to what it was."
        : "We couldn't save that. Nothing changed — Pulse is still set to what it was.",
      async () => {
        if (next === 'off') {
          await setNarration(uid, handle, false);
          return;
        }
        // Mode first, opt-in second: flipping the gate open before the mode is right
        // would leave a window where Pulse publishes under the setting they just left.
        await setMode(uid, next);
        if (!narrationOptIn) await setNarration(uid, handle, true);
      }
    );

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-sm font-medium text-zinc-100">Settings</h1>
        <p className="mt-1 text-xs text-zinc-400">
          Connected as {handle ?? 'your GitHub account'}. Everything Pulse promised you could
          change is on this page.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      {/* No handle is a real limit, but NOT on these controls — the consent record is
          keyed by uid and saves fine without one. What it actually blocks is Pulse finding
          your work at all, so say that instead of disabling switches that work. */}
      {!handle && (
        <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
          <p className="text-xs text-zinc-400">
            Pulse doesn&apos;t know your GitHub username yet, so it can&apos;t find your work. These
            settings still save.{' '}
            <Link href="/connect" className="text-zinc-200 underline underline-offset-2">
              Link GitHub
            </Link>{' '}
            and it will. Your board works either way.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <PublishCard value={publish} onChange={choosePublish} disabled={false} />

        <BranchTasksCard uid={uid} link={link} onError={setError} />

        <ReposCard uid={uid} link={link} onError={setError} />

        <PostsCard posts={posts} onError={setError} />

        <DisconnectCard
          onDisconnect={() =>
            run('Disconnect didn’t finish. Nothing was deleted — try again.', async () => {
              setDisconnected(await disconnectGitHub(uid, handle));
            })
          }
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ shell bits */

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h2 className="text-sm font-medium text-zinc-100">{title}</h2>
      {description && <p className="mt-1 text-xs text-zinc-400">{description}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function NotConnected({ declined, deleted }: { declined: boolean; deleted: number | null }) {
  const router = useRouter();

  return (
    <div className="max-w-2xl">
      <h1 className="text-sm font-medium text-zinc-100">Settings</h1>

      {/* The report, not a confirmation. They already decided; this is what happened. */}
      {deleted !== null && (
        <p className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-xs text-zinc-400">
          GitHub is disconnected. Pulse has stopped reading, and{' '}
          {deleted === 1 ? '1 post it wrote as you was' : `${deleted} posts it wrote as you were`}{' '}
          deleted from every feed. Your tasks and projects are untouched.
        </p>
      )}

      <p className="mt-3 text-sm text-zinc-400">
        {declined
          ? 'You told Pulse not to read your GitHub, so there is nothing here to change yet.'
          : 'Pulse isn’t connected to your GitHub, so there is nothing here to change yet.'}
      </p>
      <p className="mt-1 text-xs text-zinc-400">
        Your board, your projects and your tasks work exactly the same either way — they never
        depended on this.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {/* Buttons, not <Button> inside <Link> — an anchor wrapping a button is invalid
            markup and screen readers announce the pair twice. */}
        <Button variant="primary" onClick={() => router.push('/connect')}>
          Connect GitHub
        </Button>
        <Button onClick={() => router.push('/board')}>Go to your board</Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------- 1 + 2. the publish bargain */

function PublishCard({
  value,
  onChange,
  disabled,
}: {
  value: Publish;
  onChange: (next: Publish) => void;
  disabled: boolean;
}) {
  return (
    <Card
      title="What Pulse may post as you"
      description="One choice, not three switches that can contradict each other."
    >
      <fieldset disabled={disabled} className="flex flex-col gap-1">
        <legend className="sr-only">What Pulse may post as you</legend>
        {PUBLISH_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex min-h-11 cursor-pointer items-start gap-3 rounded p-2 hover:bg-zinc-800/40"
          >
            <input
              type="radio"
              name="publish"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="mt-0.5 h-4 w-4 accent-zinc-400"
            />
            <span>
              <span className="block text-sm text-zinc-100">{opt.label}</span>
              <span className="mt-0.5 block text-xs text-zinc-400">{opt.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>
    </Card>
  );
}

/* ----------------------------------------------- 3. tasks from branches */

function BranchTasksCard({
  uid,
  link,
  onError,
}: {
  uid: string;
  link: GitHubLink;
  onError: (msg: string | null) => void;
}) {
  // Default on: the board building itself is the product. Off is a deliberate act.
  const on = link.createTasksFromBranches !== false;

  const toggle = async () => {
    onError(null);
    try {
      await setCreateTasksFromBranches(uid, !on);
    } catch {
      onError("We couldn't save that. Nothing changed.");
    }
  };

  return (
    <Card title="Let Pulse create tasks from branches">
      <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded p-2 hover:bg-zinc-800/40">
        <input
          type="checkbox"
          checked={on}
          onChange={toggle}
          className="mt-0.5 h-4 w-4 accent-zinc-400"
        />
        <span>
          <span className="block text-sm text-zinc-100">
            New branches become cards on your board
          </span>
          <span className="mt-0.5 block text-xs text-zinc-400">
            Off means Pulse only moves cards you already made — it infers status, never new work.
          </span>
        </span>
      </label>
    </Card>
  );
}

/* ------------------------------------------------------- 4. repos Pulse watches */

function ReposCard({
  uid,
  link,
  onError,
}: {
  uid: string;
  link: GitHubLink;
  onError: (msg: string | null) => void;
}) {
  const [draft, setDraft] = useState('');
  const excluded = link.excludedRepos ?? [];

  // The one repo Pulse reads today, plus anything already excluded so a past choice is
  // never invisible — an exclusion you can't see is an exclusion you can't undo.
  const known = [COHORT_REPO, ...excluded.filter((r) => r !== COHORT_REPO)];

  const save = async (next: string[]) => {
    onError(null);
    try {
      await setExcludedRepos(uid, next);
    } catch {
      onError("We couldn't save that. Your repo list is unchanged.");
    }
  };

  const toggle = (repo: string, watch: boolean) =>
    save(watch ? excluded.filter((r) => r !== repo) : [...excluded, repo]);

  const add = async () => {
    const repo = draft.trim();
    if (!repo || excluded.includes(repo)) return;
    setDraft('');
    await save([...excluded, repo]);
  };

  return (
    <Card
      title="Repos Pulse watches"
      description="Excluding a repo stops Pulse reading it. It does not disconnect you, and it deletes nothing."
    >
      <ul className="flex flex-col gap-1">
        {known.map((repo) => (
          <li key={repo}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded p-2 hover:bg-zinc-800/40">
              <input
                type="checkbox"
                checked={!excluded.includes(repo)}
                onChange={(e) => toggle(repo, e.target.checked)}
                className="h-4 w-4 accent-zinc-400"
              />
              <span className="break-all text-sm text-zinc-100">{repo}</span>
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-end gap-2">
        <div className="flex-1">
          <Field label="Exclude another repo" hint="owner/name. Use this to rule out a repo before Pulse ever reads it.">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void add();
                }
              }}
              placeholder="owner/name"
            />
          </Field>
        </div>
        <Button onClick={() => void add()} disabled={!draft.trim()}>
          Exclude
        </Button>
      </div>
    </Card>
  );
}

/* --------------------------------------- 5. everything Pulse has posted as you */

function PostsCard({
  posts,
  onError,
}: {
  posts: { id: string; narrative: string | null; subject: string; kind: string }[];
  onError: (msg: string | null) => void;
}) {
  return (
    <Card
      title="Everything Pulse has posted as you"
      description="Reword any of these, or delete it. Deleting removes it from every feed, not just yours."
    >
      {posts.length === 0 ? (
        <p className="text-xs text-zinc-400">Pulse hasn&apos;t posted anything as you yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {posts.map((post) => (
            <PostRow key={post.id} post={post} onError={onError} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function PostRow({
  post,
  onError,
}: {
  post: { id: string; narrative: string | null; subject: string; kind: string };
  onError: (msg: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.narrative ?? '');

  // The rules permit the actor to change `narrative` and `editedAt` and nothing else —
  // any extra key here and the whole write is denied.
  const save = async () => {
    onError(null);
    try {
      await updateDoc(doc(db, 'pulse', post.id), {
        narrative: draft.trim() || null,
        editedAt: serverTimestamp(),
      });
      setEditing(false);
    } catch {
      onError("We couldn't save your wording. The post is unchanged.");
    }
  };

  const remove = async () => {
    onError(null);
    try {
      await deleteDoc(doc(db, 'pulse', post.id));
    } catch {
      onError("We couldn't delete that post. It's still there — try again.");
    }
  };

  return (
    <li className="rounded border border-zinc-800 p-3">
      <p className="text-xs text-zinc-400">
        {post.kind.replace(/_/g, ' ')} · {post.subject}
      </p>

      {editing ? (
        <div className="mt-2 flex flex-col gap-2">
          <Field label="Your wording" hint="Leave it empty to keep the post as facts only.">
            <Textarea rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} />
          </Field>
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => void save()}>
              Save my wording
            </Button>
            <Button
              onClick={() => {
                setDraft(post.narrative ?? '');
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-zinc-100">
            {post.narrative ?? (
              <span className="text-zinc-400">Facts only — Pulse wrote no sentence here.</span>
            )}
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              onClick={() => {
                setDraft(post.narrative ?? '');
                setEditing(true);
              }}
            >
              Edit wording
            </Button>
            <Button variant="danger" onClick={() => void remove()}>
              Delete post
            </Button>
          </div>
        </>
      )}
    </li>
  );
}

/* ------------------------------------------------------------ 6. disconnect */

function DisconnectCard({ onDisconnect }: { onDisconnect: () => void }) {
  return (
    <Card title="Disconnect GitHub">
      <p className="text-xs text-zinc-400">Disconnecting does this, immediately:</p>
      <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-xs text-zinc-400">
        <li>Pulse stops reading your GitHub.</li>
        <li>Every post Pulse wrote as you is deleted, from every feed.</li>
        <li>Pulse stops writing sentences about you.</li>
      </ul>
      <p className="mt-2 text-xs text-zinc-400">
        It does <span className="text-zinc-100">not</span> touch your tasks or projects. Your board
        and everything on it stays exactly as it is — you&apos;re leaving the sensing, not the
        cohort.
      </p>
      {/* No "are you sure?" — §6.1. Pulse never argues; the human is right. */}
      <div className="mt-3">
        <Button variant="danger" onClick={onDisconnect}>
          Disconnect GitHub
        </Button>
      </div>
    </Card>
  );
}
