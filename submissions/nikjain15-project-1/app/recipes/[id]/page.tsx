'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { RecipeModal } from '@/components/RecipeModal';
import { Avatar } from '@/components/TaskCard';
import { Button, ErrorNote } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { markUnstuck, thankPublicly } from '@/lib/recipes';
import { useCohort } from '@/lib/use-cohort';
import { useRecipes } from '@/lib/use-recipes';
import type { Member, Recipe } from '@/lib/types';

export default function RecipeDetailPage() {
  return (
    <AppShell>
      <RecipeDetail />
    </AppShell>
  );
}

function RecipeDetail() {
  // Client component: useParams is synchronous. Don't "fix" this to the promise form.
  const { id } = useParams<{ id: string }>();
  const { user, memberName } = useAuth();
  const { members } = useCohort();
  const { recipes, ready } = useRecipes();

  const [editing, setEditing] = useState(false);

  const recipe = recipes.find((r) => r.id === id);
  const author = members.find((m) => m.uid === recipe?.authorUid);

  const actor = useMemo(
    () => ({
      uid: user!.uid,
      // From the member doc, not the Firebase User — the rules check actorName against it.
      name: memberName ?? user!.displayName ?? user!.email?.split('@')[0] ?? 'member',
      photoURL: user!.photoURL,
    }),
    [user, memberName]
  );

  if (!ready) return <p className="text-sm text-zinc-400">Loading…</p>;

  if (!recipe) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-zinc-300">
          That recipe isn’t here. What the cohort figured out still is, though.
        </p>
        <Link href="/recipes" className="mt-3 inline-block text-xs text-emerald-400 hover:underline">
          Back to recipes
        </Link>
      </div>
    );
  }

  const isAuthor = recipe.authorUid === user!.uid;

  return (
    <>
      <Link href="/recipes" className="text-xs text-zinc-400 hover:text-zinc-400">
        ← recipes
      </Link>

      <div className="mt-2 flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          {/* Their words, verbatim. Not a tidied-up summary — the phrasing is what the
              next person will recognise their own problem in. */}
          <h1 className="text-sm font-medium text-zinc-100">{recipe.problem}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {author && <Avatar member={author} size={16} />}
            <span className="text-xs text-zinc-400">{author?.displayName ?? 'a member'}</span>
            {recipe.createdAt && (
              <span className="text-xs text-zinc-400">
                {recipe.createdAt.toDate().toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
            {recipe.turns > 0 && (
              <span className="text-xs text-zinc-400">
                fought it for {recipe.turns} {recipe.turns === 1 ? 'turn' : 'turns'}
              </span>
            )}
          </div>
        </div>

        {isAuthor && <Button onClick={() => setEditing(true)}>Edit</Button>}
      </div>

      {/* Verbatim, in mono, and as text — never dangerouslySetInnerHTML. This body is
          pasted from a session and can contain anything. */}
      <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-300">
        {recipe.body}
      </pre>

      <Steal recipe={recipe} uid={actor.uid} isAuthor={isAuthor} members={members} />

      {editing && (
        <RecipeModal actor={actor} recipe={recipe} onClose={() => setEditing(false)} />
      )}
    </>
  );
}

/**
 * Steal: copy it, and say so.
 *
 * The copy is the useful half; appending your uid is the half that pays the author back.
 * It arrives as a thank-you — "you unstuck 3 people" — never as a score, and the author
 * cannot add to it themselves (the rules deny that, so the button isn't offered to them).
 */
function Steal({
  recipe,
  uid,
  isAuthor,
  members,
}: {
  recipe: Recipe;
  uid: string;
  isAuthor: boolean;
  members: Member[];
}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [thanking, setThanking] = useState(false);

  const unstuck = recipe.unstuckUids.length;
  const already = recipe.unstuckUids.includes(uid);
  const names = recipe.unstuckUids
    .map((u) => members.find((m) => m.uid === u)?.displayName)
    .filter(Boolean);
  const authorName = members.find((m) => m.uid === recipe.authorUid)?.displayName ?? 'the author';
  // Explicit public-thanks consent is a SEPARATE, opt-in choice from the private unstuck credit.
  const thankedPublicly = (recipe.publicThanksUids ?? []).includes(uid);

  async function thankPub() {
    setError('');
    setThanking(true);
    try {
      await thankPublicly(recipe.id, uid);
    } catch (err) {
      console.error('recipes: thankPublicly failed', err);
      setError('Couldn’t post the public thank-you just now. Try again later.');
    } finally {
      setThanking(false);
    }
  }

  async function steal() {
    setError('');

    // Copy first: the clipboard is the point, and it must not depend on the write.
    // clipboard API needs a secure context — over plain http it simply isn't there.
    try {
      await navigator.clipboard.writeText(recipe.body);
      setCopied(true);
    } catch {
      setError('Couldn’t reach the clipboard — select the text above and copy it. Still counted.');
    }

    try {
      await markUnstuck(recipe.id, uid);
    } catch (err) {
      console.error('recipes: markUnstuck failed', err);
      setError('Copied, but crediting the author didn’t go through. Try Steal again later.');
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      {isAuthor ? (
        <p className="text-xs text-zinc-400">
          {unstuck === 0
            ? 'Yours. Nobody’s needed it yet — that’s fine, it’s here when they do.'
            : `Yours. You unstuck ${unstuck} ${unstuck === 1 ? 'person' : 'people'} with this${
                names.length ? `: ${names.join(', ')}` : ''
              }.`}
        </p>
      ) : (
        <>
          <Button variant="primary" onClick={steal} disabled={already && copied}>
            {already ? 'Copy again' : 'Steal'}
          </Button>
          <span className="text-xs text-zinc-400">
            {copied
              ? `Copied. ${authorName} sees this helped — just them, not the cohort.`
              : already
                ? 'You’ve marked this one as what unstuck you.'
                : 'Copies it, and privately tells the author it helped.'}
          </span>
        </>
      )}

      {/* The one PUBLIC moment — never automatic. Only after being helped, and only if the helped
          person deliberately chooses it, with the consequence stated plainly first. This is the
          consent the broker gates its public "unstuck" post on; without it, nothing names you. */}
      {!isAuthor && already && (
        <div className="mt-1 flex w-full flex-wrap items-center gap-2">
          {thankedPublicly ? (
            <span className="text-xs text-emerald-400">
              Public thanks sent — the cohort will see {authorName} unstuck you.
            </span>
          ) : (
            <>
              <Button variant="quiet" onClick={thankPub} disabled={thanking}>
                {thanking ? 'Posting…' : `Thank ${authorName} publicly`}
              </Button>
              <span className="text-xs text-zinc-500">
                Optional. Posts a thank-you to the whole cohort, naming you and {authorName}.
              </span>
            </>
          )}
        </div>
      )}

      {unstuck > 0 && !isAuthor && (
        <span className="text-xs text-emerald-400">{unstuck} unstuck</span>
      )}

      <ErrorNote>{error}</ErrorNote>
    </div>
  );
}
