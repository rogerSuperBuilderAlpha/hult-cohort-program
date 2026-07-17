'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { RecipeModal } from '@/components/RecipeModal';
import { Avatar } from '@/components/TaskCard';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { byMostUnstuck, byNewest, searchRecipes } from '@/lib/recipe-index';
import { useCohort } from '@/lib/use-cohort';
import { useRecipes } from '@/lib/use-recipes';
import type { Member, Recipe } from '@/lib/types';

export default function RecipesPage() {
  return (
    <AppShell>
      {/* useSearchParams suspends; without this the whole route bails to client-only. */}
      <Suspense fallback={<p className="text-sm text-zinc-400">Loading…</p>}>
        <RecipesView />
      </Suspense>
    </AppShell>
  );
}

function RecipesView() {
  const { user, memberName } = useAuth();
  const { members } = useCohort();
  const { recipes, ready } = useRecipes();
  const router = useRouter();
  const params = useSearchParams();

  const [creating, setCreating] = useState(false);

  const term = params.get('q') ?? '';
  const sort = params.get('sort') === 'newest' ? 'newest' : 'unstuck';

  const actor = useMemo(
    () => ({
      uid: user!.uid,
      // From the member doc, not the Firebase User — the rules check actorName against it.
      name: memberName ?? user!.displayName ?? user!.email?.split('@')[0] ?? 'member',
      photoURL: user!.photoURL,
    }),
    [user, memberName]
  );

  const memberByUid = useMemo(() => new Map(members.map((m) => [m.uid, m])), [members]);

  const visible = useMemo(
    () => searchRecipes(recipes, term).sort(sort === 'newest' ? byNewest : byMostUnstuck),
    [recipes, term, sort]
  );

  const steals = recipes.reduce((n, r) => n + r.unstuckUids.length, 0);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value || (key === 'sort' && value === 'unstuck')) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `/recipes?${qs}` : '/recipes', { scroll: false });
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start gap-3">
        <div>
          <h1 className="text-sm font-medium text-zinc-100">What the cohort has figured out</h1>
          <p className="mt-1 text-xs text-zinc-400">
            {ready ? (
              <>
                {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} · {steals}{' '}
                {steals === 1 ? 'steal' : 'steals'}
              </>
            ) : (
              'Counting…'
            )}
          </p>
        </div>
        <div className="ml-auto">
          <Button variant="primary" onClick={() => setCreating(true)}>
            Bank what worked
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          value={term}
          onChange={(e) => setParam('q', e.target.value)}
          placeholder="Search by problem"
          aria-label="Search by problem"
          className="max-w-xs"
        />
        <div className="flex items-center gap-1">
          {(['unstuck', 'newest'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setParam('sort', option)}
              aria-pressed={sort === option}
              className={`min-h-11 rounded px-3 text-xs transition-colors ${
                sort === option
                  ? 'bg-zinc-900 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {option === 'unstuck' ? 'most unstuck' : 'newest'}
            </button>
          ))}
        </div>
      </div>

      {!ready ? (
        <p className="text-sm text-zinc-400">Loading recipes…</p>
      ) : visible.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-6 py-12 text-center">
          {term ? (
            <p className="text-sm text-zinc-400">
              Nothing banked for “{term}” yet. You might be the first one here.
            </p>
          ) : (
            // The likely state in week 1, and it's written to be an invitation rather
            // than an apology for an empty table.
            <>
              <p className="text-sm text-zinc-300">Nothing banked yet.</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
                When you finish something hard, keep what worked — someone else is about to
                hit it.
              </p>
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((recipe) => (
            <RecipeRow
              key={recipe.id}
              recipe={recipe}
              authorName={memberByUid.get(recipe.authorUid)?.displayName ?? 'a member'}
              author={memberByUid.get(recipe.authorUid)}
            />
          ))}
        </ul>
      )}

      {creating && (
        <RecipeModal
          actor={actor}
          onClose={() => setCreating(false)}
          onCreated={(id) => router.push(`/recipes/${id}`)}
        />
      )}
    </>
  );
}

function RecipeRow({
  recipe,
  author,
  authorName,
}: {
  recipe: Recipe;
  author?: Member;
  authorName: string;
}) {
  const unstuck = recipe.unstuckUids.length;

  return (
    <li className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      {/* The problem is the headline. The author is a footnote — indexed by problem,
          not by person, or the bank becomes a reputation board. */}
      <Link href={`/recipes/${recipe.id}`} className="text-sm text-zinc-100 hover:underline">
        {recipe.problem}
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        {author && <Avatar member={author} size={16} />}
        <span className="text-xs text-zinc-400">{authorName}</span>
        {recipe.turns > 0 && (
          <span className="text-xs text-zinc-400">
            {recipe.turns} {recipe.turns === 1 ? 'turn' : 'turns'}
          </span>
        )}
        {unstuck > 0 && (
          // Green: unstuck is the number worth chasing, and it counts people helped.
          <span className="text-xs text-emerald-400">{unstuck} unstuck</span>
        )}
      </div>
    </li>
  );
}
