'use client';

import { useState } from 'react';
import { createRecipe, updateRecipe } from '@/lib/recipes';
import { checkRecipeBody } from '@/lib/sense';
import type { Member, Recipe } from '@/lib/types';
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
  members,
  requireEdit = false,
  onClose,
  onCreated,
}: {
  actor: Actor;
  recipe?: Recipe | null;
  draft?: RecipeDraft | null;
  /** When true (the agent draft path), "Bank it" stays locked until the human has changed
   * the draft — publishing raw model text as your own words needs at least one human touch. */
  requireEdit?: boolean;
  /**
   * The cohort, passed only when the text started as a MODEL draft (`draft` present) so the
   * peer-name gate can run. A model draft is written from attacker-controlled commit/PR text
   * and could name a teammate in cohort-read prose — the one publish path `checkNarrative`
   * doesn't cover. A human typing their own recipe is ungated: it's their own words.
   */
  members?: Member[];
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  const [problem, setProblem] = useState(recipe?.problem ?? draft?.problem ?? '');
  const [body, setBody] = useState(recipe?.body ?? draft?.body ?? '');
  const [turns, setTurns] = useState(String(recipe?.turns ?? ''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const valid = problem.trim().length > 0 && body.trim().length > 0;

  // Require-one-edit: on the agent draft path, the draft must be changed before it can be
  // banked. Any edit to either field counts.
  const edited =
    !requireEdit || !draft
      ? true
      : problem.trim() !== (draft.problem ?? '').trim() || body.trim() !== (draft.body ?? '').trim();

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

      // The peer-name gate — only on a MODEL draft being banked. No facts-only fallback:
      // a draft that names a teammate is blocked and stays here to edit, never redacted and
      // published. The author, not the model, decides if a teammate's name belongs in
      // something posted as them.
      if (draft && members) {
        const others = members
          .filter((m) => m.uid !== actor.uid)
          .map((m) => ({ handle: m.handle, displayName: m.displayName }));
        const check = checkRecipeBody(input.problem, input.body, { handle: null, displayName: actor.name }, others);
        if (!check.ok && check.reason === 'names_another_member') {
          setError(
            `This names ${check.member}. A recipe is your own words about your own work — take their name out and you can bank it.`
          );
          setSaving(false);
          return;
        }
      }

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
        {requireEdit && (
          // The agent drafted this. Say plainly where it goes and that a human must touch it.
          <p className="text-xs text-zinc-400">
            Pulse drafted this from your work. It posts to the cohort under your name — edit it
            first, then bank it.
          </p>
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
          <Button variant="primary" onClick={save} disabled={!valid || saving || !edited}>
            {saving ? 'Saving…' : recipe ? 'Save' : 'Bank it'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
