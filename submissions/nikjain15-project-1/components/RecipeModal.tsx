'use client';

import { useState } from 'react';
import { createRecipe, updateRecipe } from '@/lib/recipes';
import type { Recipe } from '@/lib/types';
import { Button, ErrorNote, Field, Input, Modal, Textarea } from './ui';

type Actor = { uid: string; name: string; photoURL: string | null };

/**
 * A model-written draft to start from — Layer 2's "Draft it for me", pre-filling this
 * modal from a merged PR's public evidence. The human edits and confirms; nothing here
 * publishes on its own, which is what keeps facts-vs-narrative intact. `taskId` links
 * the banked recipe back to the shipped card so the feed's recipe chip can point at it.
 * `note` is the calm one-liner for a thin draft ("not enough in the evidence").
 */
export type RecipeDraft = {
  problem: string;
  body: string;
  taskId: string | null;
  note?: string;
};

/**
 * Bank what worked.
 *
 * Week 1 this was paste-only — you typed the problem and pasted the session. Layer 2
 * adds `draft`: extraction pre-fills these same fields and the human still edits and
 * taps Bank it. The shape of the doc never changed, so the write path didn't either.
 */
export function RecipeModal({
  actor,
  recipe,
  draft,
  onClose,
  onCreated,
}: {
  actor: Actor;
  recipe?: Recipe | null;
  draft?: RecipeDraft | null;
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  const [problem, setProblem] = useState(recipe?.problem ?? draft?.problem ?? '');
  const [body, setBody] = useState(recipe?.body ?? draft?.body ?? '');
  const [turns, setTurns] = useState(String(recipe?.turns ?? ''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const valid = problem.trim().length > 0 && body.trim().length > 0;

  async function save() {
    if (!valid || saving) return;
    setSaving(true);
    setError('');

    try {
      const parsed = Number.parseInt(turns, 10);
      const input = {
        problem: problem.trim(),
        body: body.trim(),
        // Unknown is 0, not a guess. The number is context for the next person —
        // "this took eleven goes" is permission to not get it first try.
        turns: Number.isFinite(parsed) && parsed > 0 ? parsed : 0,
      };

      if (recipe) {
        await updateRecipe(recipe.id, input);
        onClose();
      } else {
        // taskId rides only on CREATE — it's the link back to the shipped card the draft
        // came from. Folding it into `input` would also send it through updateRecipe on
        // the edit path and silently null an existing recipe's link.
        const id = await createRecipe(actor, { ...input, taskId: draft?.taskId ?? null });
        onCreated?.(id);
      }
    } catch (err) {
      console.error('recipes: save failed', err);
      setError('That didn’t save. Your text is still here — try again.');
      setSaving(false);
    }
  }

  return (
    <Modal title={recipe ? 'Edit recipe' : 'Bank what worked'} onClose={onClose}>
      <div className="space-y-4">
        {draft?.note && (
          // A thin draft, said calmly. Never an apology, never an error code — the
          // fields below work exactly as they always did.
          <p className="text-xs text-zinc-400">{draft.note}</p>
        )}
        <Field label="The problem" hint="In your words. This is how someone finds it.">
          <Input
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Firebase rules denied a read that should have passed"
          />
        </Field>

        <Field label="What worked" hint="Paste the session. Verbatim beats tidy.">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            placeholder="…"
          />
        </Field>

        <Field label="Turns" hint="Optional. How long you fought it.">
          <Input
            value={turns}
            onChange={(e) => setTurns(e.target.value)}
            inputMode="numeric"
            placeholder="11"
          />
        </Field>

        <ErrorNote>{error}</ErrorNote>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={!valid || saving}>
            {saving ? 'Saving…' : recipe ? 'Save' : 'Bank it'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
