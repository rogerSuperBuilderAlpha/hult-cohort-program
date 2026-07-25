'use client';

/**
 * Rally's core comms data layer — client-side Firestore, realtime via onSnapshot.
 *
 * Firestore IS the realtime bus (tech-spec §8): no custom websockets. Listeners are scoped
 * to the open channel and to the signed-in user's own channel list, never the whole message
 * corpus — that scoping is what keeps read costs sane at cohort scale. Every write here goes
 * through firestore.rules exactly as in the browser; the rules, not this file, are the
 * security boundary.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { User as AuthUser } from 'firebase/auth';
import { auth, db } from '@cohort/core/firebase';
import { DEFAULT_CHANNELS } from '@cohort/core/cohort';

export type ChannelView = {
  id: string;
  slug: string;
  name: string;
  kind: 'channel' | 'dm';
  isPrivate: boolean;
  memberUids: string[];
};

export type MessageView = {
  id: string;
  authorUid: string;
  body: string;
  parentId: string | null;
  createdAtMs: number | null;
  editedAtMs: number | null;
  replyCount?: number;
  /** uid → emoji. One reaction per person; counts are the map size, never inflatable. */
  reactions: Record<string, string>;
};

function tsToMs(v: unknown): number | null {
  return v instanceof Timestamp ? v.toMillis() : null;
}

/**
 * Create the profile doc on first sign-in; backfill the GitHub login when we learn it.
 * Transactional and idempotent — onAuthStateChanged and the sign-in path both call this and
 * would otherwise race to create the same doc. `handle` is the login or null, never a guess.
 */
export async function ensureProfile(user: AuthUser, githubLogin: string | null): Promise<void> {
  const ref = doc(db, 'profiles', user.uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) {
      const patch: Record<string, string> = {};
      // BACKFILL ONLY. The identity key (githubLogin/handle) is write-once in the rules — it may be
      // learned from null on first sign-in, but never repointed. So only fill it when it's still
      // null; never overwrite an already-set value (that both violates the freeze and would be the
      // exact repoint the freeze exists to stop). `handle` is the login or null, never a guess.
      if (githubLogin && snap.data().githubLogin == null) {
        patch.githubLogin = githubLogin;
        patch.handle = githubLogin;
      }
      if (Object.keys(patch).length > 0) tx.update(ref, patch);
      return;
    }
    tx.set(ref, {
      uid: user.uid,
      handle: githubLogin ?? null,
      displayName: user.displayName ?? githubLogin ?? user.email?.split('@')[0] ?? 'member',
      avatarUrl: user.photoURL ?? null,
      githubLogin: githubLogin ?? null,
      createdAt: serverTimestamp(),
    });
  });
}

export type MyProfile = {
  uid: string;
  displayName: string;
  handle: string | null;
  githubLogin: string | null;
  avatarUrl: string | null;
};

/** Live view of your own profile doc (for the profile/settings screen). Null until it loads. */
export function subscribeMyProfile(uid: string, cb: (p: MyProfile | null) => void): () => void {
  return onSnapshot(doc(db, 'profiles', uid), (snap) => {
    if (!snap.exists()) return cb(null);
    const d = snap.data();
    cb({
      uid,
      displayName: d.displayName ?? uid,
      handle: (d.handle as string | null) ?? null,
      githubLogin: (d.githubLogin as string | null) ?? null,
      avatarUrl: (d.avatarUrl as string | null) ?? null,
    });
  });
}

/**
 * Update your own display name. The rule allows a self-update as long as `uid` is unchanged; a
 * patch that touches only `displayName` leaves it intact. Trimmed and bounded (1–60 chars) so a
 * name can't be blank or an abuse vector. No-ops on an empty name.
 */
export async function updateMyDisplayName(uid: string, displayName: string): Promise<void> {
  const name = displayName.trim().slice(0, 60);
  if (!name) return;
  await updateDoc(doc(db, 'profiles', uid), { displayName: name });
}

/**
 * Join (or, for the first person ever, create) each default public channel. The channel id
 * is the slug, so the room is a single shared doc the whole cohort converges on. A
 * transaction makes create-or-join atomic so two people arriving at once don't clobber the
 * member list or double-create.
 */
export async function ensureDefaultChannels(uid: string): Promise<void> {
  for (const { slug, name } of DEFAULT_CHANNELS) {
    const ref = doc(db, 'channels', slug);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) {
        tx.set(ref, {
          slug,
          name,
          kind: 'channel',
          isPrivate: false,
          creatorUid: uid,
          memberUids: [uid],
          createdAt: serverTimestamp(),
        });
        return;
      }
      const members: string[] = snap.data().memberUids ?? [];
      if (!members.includes(uid)) {
        tx.update(ref, { memberUids: [...members, uid] });
      }
    });
  }
}

/**
 * Open (or, first time, create) a 1:1 DM between the caller and another member. The channel id
 * is derived from the sorted uid pair, so both people converge on the SAME private channel and
 * a DM is never double-created. Private + kind:'dm', so the rules keep it to exactly these two.
 */
export async function createOrOpenDm(myUid: string, otherUid: string): Promise<string> {
  const pair = [myUid, otherUid].sort();
  const id = `dm_${pair[0]}_${pair[1]}`;
  const ref = doc(db, 'channels', id);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      tx.set(ref, {
        slug: id,
        name: 'Direct message',
        kind: 'dm',
        isPrivate: true,
        creatorUid: myUid,
        memberUids: pair,
        createdAt: serverTimestamp(),
      });
    }
  });
  return id;
}

/** Live list of channels the user belongs to, oldest first (default rooms lead). */
export function subscribeChannels(uid: string, cb: (channels: ChannelView[]) => void): () => void {
  const q = query(
    collection(db, 'channels'),
    where('memberUids', 'array-contains', uid),
    orderBy('createdAt', 'asc'),
  );
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => ({
        id: d.id,
        slug: d.data().slug,
        name: d.data().name,
        kind: d.data().kind,
        isPrivate: d.data().isPrivate,
        memberUids: d.data().memberUids ?? [],
      })),
    );
  });
}

/**
 * Live messages for a channel, most-recent `max` first on the wire then reversed to chronological
 * order for display. Ordering `desc` + a bounded `limit` keeps the read cost fixed AND always
 * includes the newest messages (an `asc` limit would pin you to the oldest and silently drop new
 * ones past the cap). `cb` also reports `hasMore` — whether the window is full, i.e. older
 * messages exist — so the UI can offer "Load earlier". Raising `max` loads further back.
 */
export function subscribeMessages(
  channelId: string,
  cb: (messages: MessageView[], hasMore: boolean) => void,
  max = 50,
): () => void {
  const q = query(
    collection(db, 'channels', channelId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(max),
  );
  return onSnapshot(q, (snap) => {
    const hasMore = snap.docs.length === max;
    const all = snap.docs
      .map((d) => ({
        id: d.id,
        authorUid: d.data().authorUid,
        body: d.data().body,
        parentId: (d.data().parentId as string | null) ?? null,
        createdAtMs: tsToMs(d.data().createdAt),
        editedAtMs: tsToMs(d.data().editedAt),
        reactions: (d.data().reactions as Record<string, string>) ?? {},
      }))
      .reverse(); // desc → chronological (asc) for display
    const replyCounts = new Map<string, number>();
    for (const m of all) if (m.parentId) replyCounts.set(m.parentId, (replyCounts.get(m.parentId) ?? 0) + 1);
    cb(all.filter((m) => !m.parentId).map((m) => ({ ...m, replyCount: replyCounts.get(m.id) ?? 0 })), hasMore);
  });
}

/** Live replies to one message (a thread). */
export function subscribeThread(
  channelId: string,
  parentId: string,
  cb: (messages: MessageView[]) => void,
): () => void {
  const q = query(
    collection(db, 'channels', channelId, 'messages'),
    where('parentId', '==', parentId),
    orderBy('createdAt', 'asc'),
    limit(200),
  );
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => ({
        id: d.id,
        authorUid: d.data().authorUid,
        body: d.data().body,
        parentId: parentId,
        createdAtMs: tsToMs(d.data().createdAt),
        editedAtMs: tsToMs(d.data().editedAt),
        reactions: (d.data().reactions as Record<string, string>) ?? {},
      })),
    );
  });
}

/** Post a message (or a reply, when parentId is set) as yourself. */
export async function sendMessage(
  channelId: string,
  authorUid: string,
  body: string,
  parentId: string | null = null,
): Promise<string> {
  const ref = await addDoc(collection(db, 'channels', channelId, 'messages'), {
    authorUid,
    body,
    parentId,
    createdAt: serverTimestamp(),
    editedAt: null,
  });
  return ref.id;
}

/**
 * Edit your own message body. Sets an `editedAt` marker so the UI can show "(edited)". The rule
 * only lets the author touch body/editedAt (never authorUid/createdAt/reactions), so this is the
 * one shape a client edit can take. Body is trimmed and bounded to match the composer + rule.
 */
export async function editMessage(channelId: string, messageId: string, body: string): Promise<void> {
  const text = body.trim().slice(0, 4000);
  if (!text) return;
  const ref = doc(db, 'channels', channelId, 'messages', messageId);
  await updateDoc(ref, { body: text, editedAt: serverTimestamp() });
}

/** Delete your own message. Rules permit delete only when you are the author. */
export async function deleteMessage(channelId: string, messageId: string): Promise<void> {
  await deleteDoc(doc(db, 'channels', channelId, 'messages', messageId));
}

/**
 * Toggle the caller's reaction on a message. One emoji per person: clicking the same emoji you
 * already have removes it; a different one replaces it. Written as a single self-keyed field
 * update (`reactions.<uid>`), which is exactly what the rule permits — no read needed, and
 * nobody can touch anyone else's reaction.
 */
export async function toggleReaction(
  channelId: string,
  messageId: string,
  uid: string,
  emoji: string,
  current: string | undefined,
): Promise<void> {
  const ref = doc(db, 'channels', channelId, 'messages', messageId);
  await updateDoc(ref, {
    [`reactions.${uid}`]: current === emoji ? deleteField() : emoji,
  });
}

/** Live profiles map for rendering author names/avatars. Small cohort → one listener is fine. */
export function subscribeProfiles(cb: (profiles: Record<string, { displayName: string; avatarUrl: string | null }>) => void): () => void {
  return onSnapshot(collection(db, 'profiles'), (snap) => {
    const map: Record<string, { displayName: string; avatarUrl: string | null }> = {};
    for (const d of snap.docs) map[d.id] = { displayName: d.data().displayName ?? d.id, avatarUrl: d.data().avatarUrl ?? null };
    cb(map);
  });
}

/** Live latest message in a channel (for a cheap unread indicator). */
export function subscribeLatestMessage(
  channelId: string,
  cb: (latest: { authorUid: string; createdAtMs: number | null } | null) => void,
): () => void {
  const q = query(collection(db, 'channels', channelId, 'messages'), orderBy('createdAt', 'desc'), limit(1));
  return onSnapshot(q, (snap) => {
    const d = snap.docs[0];
    cb(d ? { authorUid: d.data().authorUid, createdAtMs: tsToMs(d.data().createdAt) } : null);
  });
}

/**
 * Whether a channel shows as unread for a user. Pure so it's unit-testable: unread iff there's
 * a latest message, it isn't the user's own (your own message never marks a channel unread —
 * kindness rule: no self-nagging), and it's newer than your read bookmark.
 */
export function hasUnread(
  latest: { authorUid: string; createdAtMs: number | null } | null,
  lastReadMs: number | null,
  uid: string,
): boolean {
  if (!latest || latest.createdAtMs == null) return false;
  if (latest.authorUid === uid) return false;
  return lastReadMs == null || latest.createdAtMs > lastReadMs;
}

/** Mark a channel read up to now (personal — never broadcast). */
export async function markChannelRead(channelId: string, uid: string): Promise<void> {
  await setDoc(doc(db, 'channels', channelId, 'reads', uid), { lastReadAt: serverTimestamp() });
}

/** Live per-channel lastReadAt for the signed-in user, for unread badges. */
export function subscribeReads(channelId: string, uid: string, cb: (lastReadMs: number | null) => void): () => void {
  return onSnapshot(doc(db, 'channels', channelId, 'reads', uid), (snap) => cb(tsToMs(snap.data()?.lastReadAt)));
}

// ---------------------------------------------------------------------------
// Recognition + pulse + XP (the motivation layer). Points are server-written; the client
// only reads them and calls the confirm/decline routes with its ID token.
// ---------------------------------------------------------------------------

export type RecognitionView = {
  id: string;
  helperUid: string;
  helpedUid: string;
  kind: string;
  points: number;
  status: string;
  createdAtMs: number | null;
};

export type PulseView = {
  id: string;
  actorUid: string;
  verb: string;
  object: string;
  points: number;
  createdAtMs: number | null;
};

/** Recognitions awaiting THIS user's confirm (they are the helped peer). Opt-in, never noisy. */
export function subscribeMyPendingRecognitions(uid: string, cb: (r: RecognitionView[]) => void): () => void {
  const q = query(
    collection(db, 'recognitions'),
    where('helpedUid', '==', uid),
    where('status', '==', 'suggested'),
  );
  return onSnapshot(q, (snap) => cb(snap.docs.map(toRecognition)));
}

/** The live cohort pulse — recognition/progress moments, newest first, capped. */
export function subscribePulse(cb: (p: PulseView[]) => void): () => void {
  const q = query(collection(db, 'pulseEvents'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snap) =>
    cb(
      snap.docs.map((d) => ({
        id: d.id,
        actorUid: d.data().actorUid,
        verb: d.data().verb,
        object: d.data().object,
        points: d.data().points ?? 0,
        createdAtMs: tsToMs(d.data().createdAt),
      })),
    ),
  );
}

/** Live XP total for a user — computed by reducing the append-only ledger, never stored. */
export function subscribeXpTotal(uid: string, cb: (total: number) => void): () => void {
  const q = query(collection(db, 'xpEvents'), where('profileUid', '==', uid));
  return onSnapshot(q, (snap) => cb(snap.docs.reduce((sum, d) => sum + (d.data().points ?? 0), 0)));
}

function toRecognition(d: { id: string; data: () => Record<string, unknown> }): RecognitionView {
  const x = d.data();
  return {
    id: d.id,
    helperUid: x.helperUid as string,
    helpedUid: x.helpedUid as string,
    kind: x.kind as string,
    points: (x.points as number) ?? 0,
    status: x.status as string,
    createdAtMs: tsToMs(x.createdAt),
  };
}

async function authedPost(path: string, body?: unknown): Promise<Response> {
  const token = await auth.currentUser?.getIdToken();
  return fetch(path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function authedGet(path: string): Promise<Response> {
  const token = await auth.currentUser?.getIdToken();
  return fetch(path, { headers: token ? { authorization: `Bearer ${token}` } : {} });
}

/** Helped peer confirms → server awards XP + posts to the pulse. */
export async function confirmRecognition(id: string): Promise<boolean> {
  const res = await authedPost(`/api/recognitions/${id}/confirm`);
  return res.ok;
}

/** Helped peer declines → quietly closed, no points. */
export async function declineRecognition(id: string): Promise<boolean> {
  const res = await authedPost(`/api/recognitions/${id}/decline`);
  return res.ok;
}

export type CommitmentView = {
  id: string;
  authorUid: string;
  text: string;
  status: string;
  dueAtMs: number | null;
  pmTaskUrl: string | null;
  createdAtMs: number | null;
};

/** My open + recently-kept commitments, so Home can show what I owe and what I've kept. */
export function subscribeMyCommitments(uid: string, cb: (c: CommitmentView[]) => void): () => void {
  const q = query(collection(db, 'commitments'), where('authorUid', '==', uid));
  return onSnapshot(q, (snap) =>
    cb(
      snap.docs
        .map((d) => ({
          id: d.id,
          authorUid: d.data().authorUid,
          text: d.data().text,
          status: d.data().status,
          dueAtMs: (d.data().dueAt as number | null) ?? null,
          pmTaskUrl: (d.data().pmTaskUrl as string | null) ?? null,
          createdAtMs: tsToMs(d.data().createdAt),
        }))
        .sort((a, b) => (a.createdAtMs ?? 0) - (b.createdAtMs ?? 0)),
    ),
  );
}

/** "Track it": record a commitment (+ a linked PM task when configured). Returns the task URL. */
export async function trackCommitment(
  sourceMsgRef: string,
  text: string,
  dueAt: number | null = null,
): Promise<{ ok: boolean; pmTaskUrl: string | null }> {
  const res = await authedPost('/api/commitments/track', { sourceMsgRef, text, dueAt });
  if (!res.ok) return { ok: false, pmTaskUrl: null };
  const data = (await res.json()) as { pmTaskUrl: string | null };
  return { ok: true, pmTaskUrl: data.pmTaskUrl };
}

/** Fire post-message detection (best-effort — comms never blocks on it). */
export async function runDetection(sourceMsgRef: string, body: string): Promise<void> {
  try {
    await authedPost('/api/detect', { sourceMsgRef, body });
  } catch {
    // Detection is an enhancement; its failure must never surface to the person messaging.
  }
}

// ---------------------------------------------------------------------------
// Quests + leaderboard (neighbors-only). Points/quests are server-written; the client reads
// its own quests and asks the server for its neighbor window.
// ---------------------------------------------------------------------------

export type QuestView = { id: string; kind: string; title: string; rewardPts: number; status: string };

export type LeaderRow = { uid: string; total: number; rank: number };
export type LeaderboardView = {
  me: LeaderRow | null;
  neighbors: LeaderRow[];
  /** Present only when the caller opted into the "full board" — the celebratory top, never the bottom. */
  leaders?: LeaderRow[];
  teamTotal: number;
  teamGoal: { target: number; current: number };
  participants: number;
};

/** Seed this user's starter quests server-side (idempotent; safe on every sign-in). */
export async function provisionMe(): Promise<void> {
  try {
    await authedPost('/api/provision');
  } catch {
    // Provisioning is an enhancement; sign-in must never fail because it did.
  }
}

/** My quests, live. Personal — never anyone else's. */
export function subscribeMyQuests(uid: string, cb: (q: QuestView[]) => void): () => void {
  const qy = query(collection(db, 'quests'), where('profileUid', '==', uid));
  return onSnapshot(qy, (snap) =>
    cb(
      snap.docs.map((d) => ({
        id: d.id,
        kind: d.data().kind,
        title: d.data().title,
        rewardPts: d.data().rewardPts ?? 0,
        status: d.data().status,
      })),
    ),
  );
}

/**
 * Fetch the leaderboard (server-computed). Neighbors-only by default; pass `includeTop` to also
 * get the celebratory top of the board (the opt-in "full board"). The bottom is never returned.
 */
export async function fetchLeaderboard(includeTop = false): Promise<LeaderboardView | null> {
  try {
    const res = await authedGet(`/api/leaderboard${includeTop ? '?top=1' : ''}`);
    if (!res.ok) return null;
    return (await res.json()) as LeaderboardView;
  } catch {
    return null;
  }
}

export type BriefItemView = { kind: string; text: string };
export type BriefView = { items: BriefItemView[]; quiet: string };

/** "Catch me up": the ≤3 things that need you + a quiet line. Deterministic, always available. */
export async function fetchBrief(): Promise<BriefView | null> {
  try {
    const res = await authedGet('/api/brief');
    if (!res.ok) return null;
    return (await res.json()) as BriefView;
  } catch {
    return null;
  }
}

export type AskResult = { available: boolean; answer: string | null };

/** Ask Rally about a channel. Returns {available:false} when the model is off (degrades). */
export async function askRally(channelId: string, question: string): Promise<AskResult> {
  try {
    const res = await authedPost('/api/ask', { channelId, question });
    if (res.status === 503) return { available: false, answer: null };
    if (!res.ok) return { available: false, answer: null };
    return (await res.json()) as AskResult;
  } catch {
    return { available: false, answer: null };
  }
}

// ---------------------------------------------------------------------------
// Rally assistant (Home). Conversation + memory are server-written and private to the user;
// the client subscribes to render them and POSTs new messages to the tool-use route.
// ---------------------------------------------------------------------------

export type AssistantProposal =
  | { kind: 'commitment'; text: string }
  | { kind: 'message'; channel: string; body: string }
  | { kind: 'recognition'; teammate: string; note: string }
  | { kind: 'dispatch'; app: string; intent: string };

export type AssistantMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  proposals: AssistantProposal[];
  createdAtMs: number;
};

/** Live view of the user's own assistant conversation (server-written, self-readable). */
export function subscribeAssistantThread(uid: string, cb: (msgs: AssistantMessage[]) => void): () => void {
  const q = query(collection(db, 'assistantThreads', uid, 'messages'), orderBy('createdAt', 'asc'), limit(60));
  return onSnapshot(q, (snap) =>
    cb(
      snap.docs.map((d) => ({
        id: d.id,
        role: d.data().role as 'user' | 'assistant',
        content: (d.data().content as string) ?? '',
        proposals: (d.data().proposals as AssistantProposal[]) ?? [],
        createdAtMs: (d.data().createdAt as number) ?? 0,
      })),
    ),
  );
}

/** Live view of what Rally has remembered about the user. */
export function subscribeAssistantMemory(uid: string, cb: (notes: string[]) => void): () => void {
  return onSnapshot(doc(db, 'assistantMemory', uid), (snap) => cb(snap.exists() ? ((snap.data().notes as string[]) ?? []) : []));
}

/** Send a message to the Rally assistant. Returns its reply + any proposals to confirm. */
export async function askAssistant(
  message: string,
): Promise<{ available: boolean; reply: string | null; proposals: AssistantProposal[] }> {
  try {
    const res = await authedPost('/api/assistant', { message });
    if (!res.ok) return { available: false, reply: null, proposals: [] };
    return (await res.json()) as { available: boolean; reply: string | null; proposals: AssistantProposal[] };
  } catch {
    return { available: false, reply: null, proposals: [] };
  }
}

/** Hand a task to another app's agent in the cohort suite (cross-app dispatch). */
export async function dispatchToApp(toApp: string, intent: string): Promise<boolean> {
  try {
    const res = await authedPost('/api/assistant/dispatch', { toApp, intent });
    return res.ok;
  } catch {
    return false;
  }
}

/** Pull any cross-app requests other apps addressed to Rally and run them. Returns how many ran. */
export async function checkAssistantInbox(): Promise<number> {
  try {
    const res = await authedPost('/api/assistant/inbox');
    if (!res.ok) return 0;
    return ((await res.json()) as { handled: number }).handled ?? 0;
  } catch {
    return 0;
  }
}

export type SharedContext = {
  handle: string | null;
  memory: { app: string; text: string; createdAt: number }[];
  activity: { app: string; kind: string; summary: string; createdAt: number }[];
};

/** Your shared memory + interaction history across all cohort apps (read back by the server). */
export async function fetchSharedContext(): Promise<SharedContext> {
  try {
    const res = await authedGet('/api/assistant/memory');
    if (!res.ok) return { handle: null, memory: [], activity: [] };
    return (await res.json()) as SharedContext;
  } catch {
    return { handle: null, memory: [], activity: [] };
  }
}

/** Right to be forgotten: erase all your shared record + local assistant data. Returns success. */
export async function forgetMyHistory(): Promise<boolean> {
  try {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch('/api/assistant/memory', {
      method: 'DELETE',
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });
    return res.ok;
  } catch {
    return false;
  }
}
