/**
 * Rally assistant admin — memory + conversation persistence and the SAFE tool executors, against
 * a real Firestore (Admin SDK on the emulator). Proves the assistant remembers across turns,
 * reads only the caller's own data, and that `remember` writes to a private, per-user notebook.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { adminDb } from '@/lib/admin';
import { loadMemory, loadThread, runSafeTool, saveTurn } from '@/lib/assistant-admin';
import { clearFirestore } from './helpers';
import { FieldValue, type Firestore } from 'firebase-admin/firestore';

let db: Firestore;

beforeEach(async () => {
  const got = adminDb();
  if (!got) throw new Error('admin db unavailable');
  db = got;
  await clearFirestore();
});
afterEach(async () => {
  await clearFirestore();
});

describe('assistant memory + thread', () => {
  it('persists a turn (user before assistant) and reads it back in order', async () => {
    await saveTurn(db, 'u1', 'hi', 'hello — what can I do for you?', [], 1000);
    const thread = await loadThread(db, 'u1');
    expect(thread.map((m) => m.role)).toEqual(['user', 'assistant']);
    expect(thread[0].content).toBe('hi');
    expect(thread[1].content).toContain('hello');
  });

  it('remember writes to the caller\'s own private memory and accumulates', async () => {
    expect(await runSafeTool(db, 'u1', 'remember', { note: 'prefers mornings' }, 1, null)).toContain('Saved');
    await runSafeTool(db, 'u1', 'remember', { note: 'working on the API' }, 2, null);
    expect(await loadMemory(db, 'u1')).toEqual(['prefers mornings', 'working on the API']);
    // Another user's memory is untouched — memory is per-user.
    expect(await loadMemory(db, 'u2')).toEqual([]);
  });

  it('my_commitments lists only the caller\'s open commitments', async () => {
    await db.collection('commitments').add({ authorUid: 'u1', text: 'open one', status: 'open', dueAt: null, createdAt: FieldValue.serverTimestamp() });
    await db.collection('commitments').add({ authorUid: 'u1', text: 'done one', status: 'done', dueAt: null, createdAt: FieldValue.serverTimestamp() });
    await db.collection('commitments').add({ authorUid: 'u2', text: 'someone else', status: 'open', dueAt: null, createdAt: FieldValue.serverTimestamp() });
    const out = await runSafeTool(db, 'u1', 'my_commitments', {}, 1, null);
    expect(out).toContain('open one');
    expect(out).not.toContain('done one');
    expect(out).not.toContain('someone else');
  });

  it('find_teammate matches by name/handle and excludes the caller', async () => {
    await db.collection('profiles').doc('u1').set({ uid: 'u1', displayName: 'Me', githubLogin: 'me' });
    await db.collection('profiles').doc('u2').set({ uid: 'u2', displayName: 'Linus Torvalds', githubLogin: 'ltorvalds' });
    const out = await runSafeTool(db, 'u1', 'find_teammate', { query: 'torv' }, 1, null);
    expect(out).toContain('Linus Torvalds');
    expect(out).not.toContain('Me');
  });

  it('summarize_channel refuses a channel the caller is not in', async () => {
    await db.collection('channels').doc('secret').set({ name: 'secret', memberUids: ['u2'], kind: 'channel' });
    const out = await runSafeTool(db, 'u1', 'summarize_channel', { channel: 'secret' }, 1, null);
    expect(out.toLowerCase()).toContain("you're not in");
  });
});
