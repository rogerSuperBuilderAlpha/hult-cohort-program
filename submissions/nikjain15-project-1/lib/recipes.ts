import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { logPulse } from './pulse';
import type { Recipe } from './types';

type Actor = { uid: string; name: string; photoURL: string | null };

/**
 * The recipe bank — what the cohort has figured out.
 *
 * Week 1 reads notes a member attached by hand; extracting them from a session
 * automatically is the week-2 PR. Everything here works without that, and without
 * GitHub: a recipe is human-written text, so nothing on this surface is model output
 * and nothing here needs narration consent.
 */
export function subscribeToRecipes(onData: (recipes: Recipe[]) => void): () => void {
  // Ordered by time server-side; "most unstuck" is a client-side sort. Ranking by
  // array length isn't expressible as a Firestore order, and at cohort scale the whole
  // collection is a handful of documents.
  return onSnapshot(query(collection(db, 'recipes'), orderBy('createdAt', 'desc')), (snap) =>
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Recipe))
  );
}

export async function createRecipe(
  actor: Actor,
  input: { problem: string; body: string; turns: number; taskId?: string | null }
): Promise<string> {
  const ref = await addDoc(collection(db, 'recipes'), {
    problem: input.problem,
    body: input.body,
    turns: input.turns,
    taskId: input.taskId ?? null,
    authorUid: actor.uid,
    // Empty at creation, and the rules enforce it: a recipe cannot be born ranked.
    unstuckUids: [],
    createdAt: serverTimestamp(),
  });

  await logPulse({
    kind: 'recipe_banked',
    actorUid: actor.uid,
    actorName: actor.name,
    actorPhotoURL: actor.photoURL,
    // The problem, not the author — that's what the bank is indexed by, and what
    // someone scanning the feed can recognise as their own.
    subject: input.problem,
  });

  return ref.id;
}

export async function updateRecipe(
  recipeId: string,
  patch: Partial<Pick<Recipe, 'problem' | 'body' | 'turns'>>
) {
  await updateDoc(doc(db, 'recipes', recipeId), patch);
}

/**
 * "This unstuck me."
 *
 * arrayUnion so it's idempotent under concurrent writers and a double-click can't
 * double-count. The rules deny this to the author of the recipe — unstuckUids is the
 * only ranking in the product, so the one person who benefits cannot touch it. Callers
 * must not offer the control to the author; this would fail on the wire if they did.
 */
export async function markUnstuck(recipeId: string, uid: string) {
  await updateDoc(doc(db, 'recipes', recipeId), { unstuckUids: arrayUnion(uid) });
}
