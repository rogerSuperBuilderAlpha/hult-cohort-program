'use client';

import { useState } from 'react';
import type { ExtractionResult } from '@/app/api/extract-recipe/route';
import { RecipeModal, type RecipeDraft } from '@/components/RecipeModal';
import { selectRecipeOffer, type RecipeOffer as Offer } from '@/lib/sense';
import type { Member, PulseEvent, Recipe } from '@/lib/types';

type Actor = { uid: string; name: string; photoURL: string | null };

/**
 * "That one took a while. Keep what worked?" — Layer 2's offer, at the moment of relief.
 *
 * Shown once per hard ship, on Home, to its actor only. The rules, from the design:
 * - **One offer, dismissible, never repeated for the same work.** "not now" writes a
 *   localStorage tombstone and the offer is gone for good. Presentation state, not
 *   consent state — same reasoning as the other one-time beats.
 * - **Silence is always fine.** No badge, no count, no second ask. Banking is
 *   generosity, not a chore.
 * - **The draft is assistive, never autonomous.** "Draft it for me" pre-fills the same
 *   modal "Bank it" always used; the human edits and confirms, or walks away.
 */

/** The tombstone for a dismissed (or already-drafted) offer. Scoped by member: two
 * accounts in one browser must not dismiss each other's moments. */
export function offerDismissKey(uid: string, eventId: string): string {
  return `pulse:recipeOffer:${uid}:${eventId}`;
}

export function isOfferDismissed(uid: string, eventId: string): boolean {
  try {
    return !!localStorage.getItem(offerDismissKey(uid, eventId));
  } catch {
    // Private mode etc. — the offer may repeat across visits. Harmless, still one at a time.
    return false;
  }
}

function dismissOffer(uid: string, eventId: string): void {
  try {
    localStorage.setItem(offerDismissKey(uid, eventId), '1');
  } catch {
    // Storage unavailable — it shows again next visit. Harmless.
  }
}

const THIN_NOTE = 'Not enough in the evidence to draft from. Tell it in your words.';

/**
 * Map the live feed to the one offer, or null. The same shape as `findPostedRow`: the
 * clock and localStorage reads live here, behind a plain function the memo calls, and
 * `selectRecipeOffer` (pure, tested) makes every actual decision.
 */
export function findRecipeOffer(
  events: readonly PulseEvent[],
  recipes: readonly Recipe[],
  uid: string
): Offer | null {
  const now = Date.now();
  return selectRecipeOffer({
    ships: events.map((e) => ({
      id: e.id,
      kind: e.kind,
      actorUid: e.actorUid,
      taskId: e.taskId,
      subject: e.subject,
      evidence: e.evidence,
      ageMs: now - e.createdAt.toDate().getTime(),
    })),
    uid,
    bankedTaskIds: new Set(recipes.map((r) => r.taskId).filter((t): t is string => t !== null)),
    dismissed: (eventId) => isOfferDismissed(uid, eventId),
  });
}

export function RecipeOfferCard({
  actor,
  offer,
  members,
  onGone,
}: {
  actor: Actor;
  offer: Offer;
  /** The cohort — passed to the modal so the peer-name gate can run on the model draft. */
  members: Member[];
  /** The offer resolved — dismissed, or banked. The parent stops rendering it. */
  onGone: () => void;
}) {
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<RecipeDraft | null>(null);

  const draftIt = async () => {
    if (drafting) return;
    setDrafting(true);

    // Every failure — no PR to read, route down, thin evidence — lands on the SAME calm
    // place: the modal opens empty with one quiet line, and banking works exactly as it
    // always did. The draft is a convenience; losing it must cost nothing.
    let result: ExtractionResult | null = null;
    if (offer.prNumber !== null) {
      try {
        const res = await fetch('/api/extract-recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prNumber: offer.prNumber, prTitle: offer.title }),
        });
        if (res.ok) result = (await res.json()) as ExtractionResult;
      } catch {
        result = null;
      }
    }

    setDraft(
      result && !result.thin
        ? { problem: result.problem, body: result.body, taskId: offer.taskId }
        : { problem: '', body: '', taskId: offer.taskId, note: THIN_NOTE }
    );
    setDrafting(false);
  };

  const notNow = () => {
    dismissOffer(actor.uid, offer.eventId);
    onGone();
  };

  return (
    <>
      <section className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-base text-zinc-100">That one took a while. Keep what worked?</h2>
        <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{offer.title}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* Green: banking is the motivating action this card exists for. */}
          <button
            disabled={drafting}
            onClick={() => void draftIt()}
            className="inline-flex min-h-11 items-center rounded bg-emerald-500 px-3 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-400 disabled:opacity-60"
          >
            {drafting ? 'Drafting…' : 'Draft it for me'}
          </button>
          <button
            onClick={notNow}
            className="min-h-11 px-2 text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-300"
          >
            not now
          </button>
        </div>
      </section>

      {draft && (
        <RecipeModal
          actor={actor}
          draft={draft}
          members={members}
          onClose={() => setDraft(null)}
          onCreated={() => {
            // Banked. The same tombstone as a dismissal: this work's moment is kept,
            // and the offer must never come back for it.
            dismissOffer(actor.uid, offer.eventId);
            setDraft(null);
            onGone();
          }}
        />
      )}
    </>
  );
}
