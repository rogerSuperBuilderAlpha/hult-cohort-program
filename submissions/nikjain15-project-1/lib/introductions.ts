import { collection, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { nextIntroState, type IntroAction } from './intro-state';
import type { Introduction } from './types';

export { nextIntroState, selectHelperIntro, type IntroAction } from './intro-state';

/**
 * Introductions — the helper's side of the Broker, and nobody else's.
 *
 * LAYER-2-3-DESIGN.md, Layer 3. An introduction says "someone is stuck on what you
 * solved." It is the most sensitive doc in the product, and `firestore.rules` enforces
 * the asymmetry this module lives inside: the query below can only ever return intros
 * where YOU are the helper, because `read` is denied to everyone else — the cohort has no
 * "who's stuck" list, the stuck person is never told they were flagged, and only the one
 * chosen helper sees the offer.
 *
 * The docs themselves are written server-side by the trusted broker job (Admin SDK); a
 * client cannot create one. This module only READS them and moves the helper's own
 * `state` — the two things a client is allowed to do.
 */

/**
 * Live introductions addressed to this helper.
 *
 * The `where('helperUid', '==', uid)` isn't just a filter — it's what makes the query
 * legal. `read` is allowed only when `resource.data.helperUid` is you, so a query that
 * didn't constrain to your own uid would be rejected wholesale. Dismissed intros are left
 * to the caller to filter, so a helper can't be re-offered something they waved off.
 */
export function subscribeToIntroductions(
  helperUid: string,
  onData: (intros: Introduction[]) => void
): () => void {
  return onSnapshot(
    query(
      collection(db, 'introductions'),
      where('helperUid', '==', helperUid),
      orderBy('createdAt', 'desc')
    ),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Introduction)),
    // Degrade quietly: a helper offer failing to load must never surface an alarm, and
    // certainly never a hint that there was something to load.
    () => onData([])
  );
}

/**
 * Persist a helper's move. Writes only `state` — the one field the rules let a helper
 * change — so it cannot rewrite who the intro is about. A no-op transition (a re-tap on an
 * already-resolved intro) writes nothing. The transition rule itself is in `intro-state.ts`.
 */
export async function actOnIntroduction(intro: Introduction, action: IntroAction): Promise<void> {
  const next = nextIntroState(intro.state, action);
  if (next === null) return;
  await updateDoc(doc(db, 'introductions', intro.id), { state: next });
}
