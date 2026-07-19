import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, type Firestore } from 'firebase-admin/firestore';
import { runBroker, introDocId, type BrokerRunResult } from './broker-job';
import type { HelperKnowledge, StuckSignal } from './broker';

/**
 * The broker's Firestore half — the ONLY code in the product that writes with the Admin
 * SDK. **Server-side only**, and rule-exempt by nature, which is exactly why it exists:
 * `introductions` and `intro_made` events are deliberately impossible to create from a
 * client, so the trusted job has to be the one to do it.
 *
 * Credentials, in order:
 * - `FIREBASE_SERVICE_ACCOUNT` (the JSON Nik generates in the Firebase console) — prod.
 * - `FIRESTORE_EMULATOR_HOST` — the emulator needs no credential, which is what makes
 *   every piece of this testable before the key exists.
 * - Neither → null, and the caller says so loudly. Degrade, never pretend.
 *
 * The privacy asymmetry, held here the same way it's held everywhere else:
 * - stuck signals come ONLY from visible activity (an aging in_progress card, an explicit
 *   "I'm stuck" opt-in on the member's own task) — `gather` never reads "last seen",
 *   never subtracts anyone from a member list;
 * - everything written lands in `introductions` (helper-only by rule) or, once help has
 *   VISIBLY landed (the stuck person marked themselves unstuck by the helper's recipe),
 *   the one public `intro_made` thank-you.
 */

/**
 * An in_progress card older than this reads as "visibly fighting". Activity, not
 * absence: the card exists because they started it. Never surfaced as a number to
 * anyone — it only decides whether a private offer gets drafted.
 */
export const AGING_WIP_HOURS = 48;

export function adminDb(): Firestore | null {
  // Check for the DEFAULT app specifically, not `getApps().length`. busDb() may have created the
  // named 'bus' app (when SHARED_FIREBASE_SERVICE_ACCOUNT is set), which makes getApps() non-empty
  // even though Pulse's own default app was never initialized. Keying on length then skipped the
  // init and called getFirestore() on a missing default app — throwing, so every bus route 500'd
  // instead of degrading to 503, exactly when SHARED is set but FIREBASE_SERVICE_ACCOUNT is not.
  const hasDefault = getApps().some((a) => a.name === '[DEFAULT]');
  if (!hasDefault) {
    const svc = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (svc) {
      try {
        initializeApp({ credential: cert(JSON.parse(svc) as Parameters<typeof cert>[0]) });
      } catch {
        // A malformed key is "not configured", not a crash — the route reports it.
        return null;
      }
    } else if (process.env.FIRESTORE_EMULATOR_HOST) {
      initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? 'demo-pulse' });
    } else {
      return null;
    }
  }
  return getFirestore();
}

/**
 * The shared cross-app "context bus" (see lib/shared-context-contract.ts). In production this is a
 * dedicated Firebase project every cohort app writes to, selected by SHARED_FIREBASE_SERVICE_ACCOUNT
 * as its OWN named Admin app ('bus') so it never collides with Pulse's default app. Until that env
 * is set, the bus transparently falls back to Pulse's own database — the same degrade-don't-crash
 * rule as everything else: shared context works within Pulse today and flips to the real cross-app
 * bus the moment the key lands. Null only if no credential exists at all.
 */
export function busDb(): Firestore | null {
  const svc = process.env.SHARED_FIREBASE_SERVICE_ACCOUNT;
  if (svc) {
    try {
      const existing = getApps().find((a) => a.name === 'bus');
      const app = existing ?? initializeApp({ credential: cert(JSON.parse(svc) as Parameters<typeof cert>[0]) }, 'bus');
      return getFirestore(app);
    } catch {
      // A malformed shared key must not take the agent down — fall back to the primary db.
      return adminDb();
    }
  }
  return adminDb();
}

type MemberRow = { uid: string; displayName: string; photoURL: string | null; handle: string | null };

/**
 * Read one run's inputs from what's visibly on record. Whole-collection reads on
 * purpose: the cohort is ~65 people and the job runs every ~15 minutes — six small
 * reads beat a lattice of composite indexes, and there is no scale cliff to design for.
 */
async function gather(db: Firestore): Promise<{ signals: StuckSignal[]; helpers: HelperKnowledge[] }> {
  const [tasksSnap, recipesSnap, membersSnap, introsSnap, cohortSnap, linksSnap] = await Promise.all([
    db.collection('tasks').get(),
    db.collection('recipes').get(),
    db.collection('members').get(),
    db.collection('introductions').get(),
    db.collection('cohortMembers').get(),
    db.collection('githubLinks').get(),
  ]);

  const now = Date.now();
  const members = membersSnap.docs.map((d) => d.data() as MemberRow);

  /* ---- stuck signals: explicit opt-in first, then visibly-aging work ---- */
  const signals: StuckSignal[] = [];
  for (const doc of tasksSnap.docs) {
    const t = doc.data() as {
      title?: string;
      status?: string;
      assigneeUid?: string | null;
      createdAt?: { toMillis(): number } | null;
      stuckSince?: unknown;
      evidence?: { files?: string[] } | null;
    };
    if (!t.assigneeUid || typeof t.title !== 'string') continue;

    // The dignified signal: the member flagged their own card. Zero inference.
    if (t.stuckSince) {
      signals.push({ stuckUid: t.assigneeUid, problem: t.title, files: t.evidence?.files ?? [], source: 'opt_in' });
      continue;
    }

    // Visible fighting: an in_progress card that's been open a while. createdAt is the
    // honest floor (there is no "entered in_progress at" timestamp) — it can only make
    // the job SLOWER to offer help, never claim someone fought longer than they did.
    const ageMs = t.createdAt ? now - t.createdAt.toMillis() : 0;
    if (t.status === 'in_progress' && ageMs >= AGING_WIP_HOURS * 3_600_000) {
      signals.push({ stuckUid: t.assigneeUid, problem: t.title, files: t.evidence?.files ?? [], source: 'aging_wip' });
    }
  }

  /* ---- helper knowledge: banked recipes, shipped files and titles ---- */
  const recipesByAuthor = new Map<string, { id: string; problem: string }[]>();
  for (const doc of recipesSnap.docs) {
    const r = doc.data() as { authorUid?: string; problem?: string };
    if (!r.authorUid || typeof r.problem !== 'string') continue;
    recipesByAuthor.set(r.authorUid, [...(recipesByAuthor.get(r.authorUid) ?? []), { id: doc.id, problem: r.problem }]);
  }

  const doneByUid = new Map<string, { titles: string[]; files: string[] }>();
  for (const doc of tasksSnap.docs) {
    const t = doc.data() as {
      title?: string; status?: string; creatorUid?: string; assigneeUid?: string | null;
      evidence?: { files?: string[] } | null;
    };
    if (t.status !== 'done' || typeof t.title !== 'string') continue;
    for (const uid of new Set([t.creatorUid, t.assigneeUid].filter((u): u is string => !!u))) {
      const held = doneByUid.get(uid) ?? { titles: [], files: [] };
      held.titles.push(t.title);
      held.files.push(...(t.evidence?.files ?? []));
      doneByUid.set(uid, held);
    }
  }

  // The pre-index knows what a member's merged PRs touched, keyed by handle.
  const filesByHandle = new Map<string, string[]>();
  for (const doc of cohortSnap.docs) {
    const c = doc.data() as { evidence?: { files?: string[] } | null };
    filesByHandle.set(doc.id.toLowerCase(), c.evidence?.files ?? []);
  }

  const activeIntros = new Map<string, number>();
  for (const doc of introsSnap.docs) {
    const i = doc.data() as { helperUid?: string; state?: string };
    if (!i.helperUid || i.state === 'dismissed') continue;
    activeIntros.set(i.helperUid, (activeIntros.get(i.helperUid) ?? 0) + 1);
  }

  // brokerOptOut is a forward-compatible read: the Settings control may ship after the
  // job. Absent → false (offers are private and dismissible; helping is default-on).
  const optedOut = new Set<string>();
  for (const doc of linksSnap.docs) {
    const l = doc.data() as { brokerOptOut?: boolean };
    if (l.brokerOptOut === true) optedOut.add(doc.id);
  }

  const helpers: HelperKnowledge[] = members.map((m) => {
    const done = doneByUid.get(m.uid) ?? { titles: [], files: [] };
    const preIndexed = m.handle ? (filesByHandle.get(m.handle.toLowerCase()) ?? []) : [];
    return {
      uid: m.uid,
      recipes: recipesByAuthor.get(m.uid) ?? [],
      shippedFiles: [...done.files, ...preIndexed],
      shippedTitles: done.titles,
      brokerOptOut: optedOut.has(m.uid),
      activeIntros: activeIntros.get(m.uid) ?? 0,
    };
  });

  return { signals, helpers };
}

/**
 * CREATE-IF-ABSENT at the derived address, in a transaction. An existing doc — whatever
 * its state — is left untouched: overwriting a dismissal would resurrect a declined ask,
 * and "one ask, once" outranks freshness.
 */
async function upsertIntro(
  db: Firestore,
  id: string,
  draft: { stuckUid: string; helperUid: string; recipeId: string | null; problem: string }
): Promise<void> {
  const ref = db.collection('introductions').doc(id);
  await db.runTransaction(async (tx) => {
    const existing = await tx.get(ref);
    if (existing.exists) return;
    tx.set(ref, {
      stuckUid: draft.stuckUid,
      helperUid: draft.helperUid,
      recipeId: draft.recipeId,
      problem: draft.problem,
      state: 'suggested',
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}

/**
 * The one public moment. An intro the helper SENT, whose recipe the stuck person then
 * marked themselves unstuck by, is help that visibly landed — consent implied by
 * accepting it. Publish the resolved thank-you, once, addressed by the intro id so
 * re-runs converge instead of spamming.
 *
 * Everything else stays silent forever: suggested and dismissed intros produce nothing,
 * and a sent intro whose recipe never helped produces nothing — an unresolved story is
 * not the cohort's business.
 */
export async function publishIntroMade(db: Firestore): Promise<number> {
  const [introsSnap, membersSnap] = await Promise.all([
    db.collection('introductions').where('state', '==', 'sent').get(),
    db.collection('members').get(),
  ]);
  const members = new Map(membersSnap.docs.map((d) => [d.id, d.data() as MemberRow]));

  let published = 0;
  for (const introDoc of introsSnap.docs) {
    const intro = introDoc.data() as {
      stuckUid: string; helperUid: string; recipeId: string | null; problem?: string;
    };
    if (!intro.recipeId) continue;

    const recipe = await db.collection('recipes').doc(intro.recipeId).get();
    // The gate is EXPLICIT public-thanks consent, not the private "this unstuck me" credit. Marking
    // a recipe unstuck helps the author and the broker privately; it must never on its own name the
    // stuck person to all 64 members. Only when the stuck person deliberately opted into a public
    // thank-you (thankPublicly) do we publish the one `intro_made` post — so a quiet member is never
    // outed as having-been-stuck without knowingly choosing it ("never punish the quiet").
    const publicThanks = (recipe.data()?.publicThanksUids ?? []) as string[];
    if (!publicThanks.includes(intro.stuckUid)) continue;

    const helper = members.get(intro.helperUid);
    const stuck = members.get(intro.stuckUid);
    if (!helper || !stuck) continue; // a name we can't verify is a sentence we don't write

    const eventRef = db.collection('pulse').doc(`intro_${introDoc.id}`);
    await db.runTransaction(async (tx) => {
      const existing = await tx.get(eventRef);
      if (existing.exists) return;
      tx.set(eventRef, {
        kind: 'intro_made',
        actorUid: intro.helperUid,
        actorName: helper.displayName,
        actorPhotoURL: helper.photoURL ?? null,
        subject: intro.problem ?? '',
        otherUid: intro.stuckUid,
        otherName: stuck.displayName,
        projectId: null,
        taskId: null,
        narrative: null,
        proposedNarrative: null,
        evidence: null,
        editedAt: null,
        kudos: [],
        createdAt: FieldValue.serverTimestamp(),
      });
      published += 1;
    });
  }
  return published;
}

export type BrokerJobResult = BrokerRunResult & { introMade: number };

/** One scheduled tick: match → upsert → publish any resolved thank-yous. */
export async function runBrokerJob(db: Firestore): Promise<BrokerJobResult> {
  const run = await runBroker({
    gather: () => gather(db),
    upsert: (id, draft) => upsertIntro(db, id, draft),
  });
  const introMade = await publishIntroMade(db);
  return { ...run, introMade };
}

export { introDocId };
