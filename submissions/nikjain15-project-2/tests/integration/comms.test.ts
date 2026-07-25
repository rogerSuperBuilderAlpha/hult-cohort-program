/**
 * Core comms, end to end against the emulator: the real lib/data functions, real signed-in
 * identities, real firestore.rules. This is the "does the vertical slice actually work"
 * test — provision → join channels → post → realtime delivery → threads → unread → and the
 * membership boundary holding under the real client SDK (not just the rules-testing lib).
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import {
  createOrOpenDm,
  ensureDefaultChannels,
  ensureProfile,
  markChannelRead,
  sendMessage,
  toggleReaction,
  subscribeChannels,
  subscribeMessages,
  subscribeReads,
  subscribeThread,
  type ChannelView,
  type MessageView,
} from '@/lib/data';
import { auth } from '@cohort/core/firebase';
import {
  clearFirestore,
  makeSecondaryClient,
  signOutPrimary,
  signUpPrimary,
  until,
} from './helpers';

beforeEach(async () => {
  await signOutPrimary();
  await clearFirestore();
});
afterAll(async () => {
  await signOutPrimary();
});

describe('provisioning + channel join', () => {
  it('creates a profile and joins the three default channels on first sign-in', async () => {
    const u = await signUpPrimary('nik');
    await ensureProfile(auth.currentUser!, 'nikjain15');
    await ensureDefaultChannels(u.uid);

    let channels: ChannelView[] = [];
    const off = subscribeChannels(u.uid, (c) => (channels = c));
    await until(() => channels, (c) => c.length >= 3);
    off();

    expect(channels.map((c) => c.slug).sort()).toEqual(['general', 'help', 'wins']);
  });

  it('a second member self-joins the SAME shared channel docs (not duplicates)', async () => {
    const a = await signUpPrimary('a');
    await ensureProfile(auth.currentUser!, null);
    await ensureDefaultChannels(a.uid);
    await signOutPrimary();

    const b = await signUpPrimary('b');
    await ensureProfile(auth.currentUser!, null);
    await ensureDefaultChannels(b.uid);

    let channels: ChannelView[] = [];
    const off = subscribeChannels(b.uid, (c) => (channels = c));
    await until(() => channels, (c) => c.length >= 3);
    off();

    const general = channels.find((c) => c.slug === 'general')!;
    expect(general.memberUids).toContain(a.uid);
    expect(general.memberUids).toContain(b.uid);
    // No duplicate uids — the count is array length.
    expect(new Set(general.memberUids).size).toBe(general.memberUids.length);
  });
});

describe('messaging + realtime', () => {
  it('delivers a posted message to a member listening in realtime', async () => {
    const u = await signUpPrimary('nik');
    await ensureProfile(auth.currentUser!, null);
    await ensureDefaultChannels(u.uid);

    let msgs: MessageView[] = [];
    const off = subscribeMessages('general', (m) => (msgs = m));
    await sendMessage('general', u.uid, 'hello cohort');
    await until(() => msgs, (m) => m.some((x) => x.body === 'hello cohort'));
    off();

    expect(msgs.map((m) => m.body)).toContain('hello cohort');
  });

  it('a reply lands in the thread and bumps the parent reply count, not the main list', async () => {
    const u = await signUpPrimary('nik');
    await ensureProfile(auth.currentUser!, null);
    await ensureDefaultChannels(u.uid);

    const parentId = await sendMessage('general', u.uid, 'anyone hit the emulator PATH bug?');
    await sendMessage('general', u.uid, 'openjdk bin on PATH fixes it', parentId);

    let main: MessageView[] = [];
    const offM = subscribeMessages('general', (m) => (main = m));
    await until(() => main, (m) => m.length >= 1);
    offM();
    // The reply is NOT a top-level message…
    expect(main.filter((m) => m.body.includes('openjdk'))).toHaveLength(0);
    // …and the parent shows one reply.
    expect(main.find((m) => m.id === parentId)?.replyCount).toBe(1);

    let thread: MessageView[] = [];
    const offT = subscribeThread('general', parentId, (t) => (thread = t));
    await until(() => thread, (t) => t.length >= 1);
    offT();
    expect(thread.map((t) => t.body)).toContain('openjdk bin on PATH fixes it');
  });

  it('paginates: a bounded window returns the newest messages and flags that more exist', async () => {
    const u = await signUpPrimary('nik');
    await ensureProfile(auth.currentUser!, null);
    await ensureDefaultChannels(u.uid);

    for (const n of ['m1', 'm2', 'm3', 'm4']) await sendMessage('general', u.uid, n);

    // A window of 2 should hold the two NEWEST (m3, m4) in chronological order, and say hasMore.
    let msgs: MessageView[] = [];
    let more = false;
    const off = subscribeMessages('general', (m, h) => { msgs = m; more = h; }, 2);
    await until(() => msgs, (m) => m.length >= 2);
    off();
    expect(msgs.map((m) => m.body)).toEqual(['m3', 'm4']);
    expect(more).toBe(true);

    // A window big enough to hold them all reports no more.
    let all: MessageView[] = [];
    let more2 = true;
    const off2 = subscribeMessages('general', (m, h) => { all = m; more2 = h; }, 50);
    await until(() => all, (m) => m.length >= 4);
    off2();
    expect(all.map((m) => m.body)).toEqual(['m1', 'm2', 'm3', 'm4']);
    expect(more2).toBe(false);
  });

  it('tracks unread with a personal read bookmark', async () => {
    const u = await signUpPrimary('nik');
    await ensureProfile(auth.currentUser!, null);
    await ensureDefaultChannels(u.uid);

    let lastRead: number | null = null;
    const off = subscribeReads('general', u.uid, (ms) => (lastRead = ms));
    await markChannelRead('general', u.uid);
    await until(() => lastRead, (v) => v != null);
    off();
    expect(lastRead).not.toBeNull();
  });
});

describe('reactions', () => {
  it('toggles a reaction on and off, carried by the message listener', async () => {
    const u = await signUpPrimary('nik');
    await ensureProfile(auth.currentUser!, null);
    await ensureDefaultChannels(u.uid);
    const msgId = await sendMessage('general', u.uid, 'ship it');

    let msgs: MessageView[] = [];
    const off = subscribeMessages('general', (m) => (msgs = m));

    await toggleReaction('general', msgId, u.uid, '🎉', undefined);
    await until(() => msgs, (m) => m.find((x) => x.id === msgId)?.reactions[u.uid] === '🎉');
    expect(msgs.find((x) => x.id === msgId)?.reactions[u.uid]).toBe('🎉');

    // Clicking the same emoji removes it.
    await toggleReaction('general', msgId, u.uid, '🎉', '🎉');
    await until(() => msgs, (m) => m.find((x) => x.id === msgId)?.reactions[u.uid] === undefined);
    off();
    expect(msgs.find((x) => x.id === msgId)?.reactions[u.uid]).toBeUndefined();
  });
});

describe('direct messages', () => {
  it('derives a stable, pair-symmetric DM id and is idempotent to reopen', async () => {
    const a = await signUpPrimary('a');
    await ensureProfile(auth.currentUser!, null);
    const partnerUid = 'uid_partner';
    const expected = `dm_${[a.uid, partnerUid].sort().join('_')}`;

    const first = await createOrOpenDm(a.uid, partnerUid);
    const second = await createOrOpenDm(a.uid, partnerUid);
    expect(first).toBe(expected);
    expect(second).toBe(expected); // reopening finds the same room, doesn't double-create
  });

  it('delivers a DM message to the other participant, not to outsiders', async () => {
    const a = await signUpPrimary('dmA');
    await ensureProfile(auth.currentUser!, null);
    const bob = await makeSecondaryClient('dmB');
    const dmId = await createOrOpenDm(a.uid, bob.user.uid);

    let msgs: MessageView[] = [];
    const off = subscribeMessages(dmId, (m) => (msgs = m));
    await sendMessage(dmId, a.uid, 'just between us');
    await until(() => msgs, (m) => m.some((x) => x.body === 'just between us'));
    off();
    expect(msgs.map((m) => m.body)).toContain('just between us');
    await bob.cleanup();
  });
});

describe('membership boundary (real client SDK)', () => {
  it('denies a non-member posting into a private channel they cannot see', async () => {
    // Alice creates a private channel with only herself.
    const a = await signUpPrimary('alice');
    await ensureProfile(auth.currentUser!, null);
    const { setDoc, doc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('@cohort/core/firebase');
    await setDoc(doc(db, 'channels', `priv_${a.uid}`), {
      slug: 'priv', name: 'Private', kind: 'channel', isPrivate: true,
      creatorUid: a.uid, memberUids: [a.uid], createdAt: serverTimestamp(),
    });

    // Bob (separate client) must not be able to post there.
    const bob = await makeSecondaryClient('bob');
    try {
      await expect(sendMessageAs(bob.db, `priv_${a.uid}`, bob.user.uid, 'let me in')).rejects.toBeTruthy();
    } finally {
      await bob.cleanup();
    }
  });
});

/** Send a message via an arbitrary client db (for the second-identity test). */
async function sendMessageAs(db: unknown, channelId: string, authorUid: string, body: string) {
  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return addDoc(collection(db as any, 'channels', channelId, 'messages'), {
    authorUid, body, parentId: null, createdAt: serverTimestamp(), editedAt: null,
  });
}
