'use client';

import { useState } from 'react';
import { createRecipe, updateRecipe } from '@/lib/recipes';
import type { Recipe } from '@/lib/types';
import { Button, ErrorNote, Field, Input, Modal, Textarea } from './ui';

type Actor = { uid: string; name: string; photoURL: string | null };

/**
 * Bank what worked.
 *
 * Week 1 this is the only way a recipe exists — you paste the session that got you
 * unstuck. Pulling it out of the session automatically is the week-2 PR, and the shape
 * of the doc is the same either way, so that PR replaces this modal's input rather than
 * this modal's model.
 */
export function RecipeModal({
  actor,
  recipe,
  onClose,
  onCreated,
}: {
  actor: Actor;
  recipe?: Recipe | null;
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  const [problem, setProblem] = useState(recipe?.problem ?? '');
  const [body, setBody] = useState(recipe?.body ?? '');
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
        const id = await createRecipe(actor, input);
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
