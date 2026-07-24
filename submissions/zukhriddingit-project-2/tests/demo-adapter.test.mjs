import test from 'node:test';
import assert from 'node:assert/strict';
import { DemoAdapter } from '../src/adapters/demo.js';

class MemoryStorage {
  #data = new Map();
  getItem(key) { return this.#data.has(key) ? this.#data.get(key) : null; }
  setItem(key, value) { this.#data.set(key, String(value)); }
  removeItem(key) { this.#data.delete(key); }
  clear() { this.#data.clear(); }
}

globalThis.localStorage = new MemoryStorage();

function adapter() {
  localStorage.clear();
  return new DemoAdapter({ cohortCapacity: 65 });
}

test('demo workspace exposes channels, members, and seeded messages', async () => {
  const app = adapter();
  await app.init();
  let channels = [];
  let members = [];
  let messages = [];
  app.subscribeChannels((value) => { channels = value; });
  app.subscribeMembers((value) => { members = value; });
  app.subscribeMessages({ type: 'channel', id: 'ship-room' }, (value) => { messages = value; });
  assert.ok(channels.length >= 6);
  assert.ok(members.length >= 10);
  assert.ok(messages.some((message) => message.signalType === 'decision'));
});

test('channel messages persist, react, thread, mention, and search', async () => {
  const app = adapter();
  const target = { type: 'channel', id: 'general', name: 'general' };
  const message = await app.sendMessage(target, {
    content: 'BURST-TEST update for @mayacodes',
    signalType: 'update'
  });
  assert.equal(message.signalType, 'update');
  assert.ok(app.data.notifications.some((item) => item.recipientId === 'm-maya' && item.messageId === message.id));

  await app.toggleReaction(target, message, 'ship');
  const stored = app.data.messages.general.find((item) => item.id === message.id);
  assert.deepEqual(stored.reactions.ship, [app.currentUser.uid]);

  const reply = await app.sendThreadReply(target, message, 'Thread reply works.');
  assert.ok(reply.id.startsWith('reply-'));
  assert.equal(stored.threadCount, 1);

  const results = await app.search('burst-test');
  assert.equal(results[0].id, message.id);

  const reloaded = new DemoAdapter({ cohortCapacity: 65 });
  assert.ok(reloaded.data.messages.general.some((item) => item.id === message.id));
});

test('channels can be created, updated, and archived', async () => {
  const app = adapter();
  const created = await app.createChannel({ name: 'launch-lab', emoji: '🧪', description: 'Test launches', postingRoles: [] });
  assert.equal(created.name, 'launch-lab');
  await app.updateChannel(created.id, { description: 'Validated launches' });
  assert.equal(app.data.channels.find((item) => item.id === created.id).description, 'Validated launches');
  await app.archiveChannel(created.id);
  let visible = [];
  app.subscribeChannels((value) => { visible = value; });
  assert.ok(!visible.some((item) => item.id === created.id));
});

test('deterministic one-to-one DMs support messages', async () => {
  const app = adapter();
  const conversation = await app.createConversation('m-ana');
  assert.equal(conversation.id, 'demo-zukhriddingit__m-ana');
  const message = await app.sendMessage({ type: 'dm', id: conversation.id }, { content: 'Private hello', signalType: 'message' });
  assert.equal(app.data.messages[conversation.id][0].id, message.id);
  assert.ok(app.data.notifications.some((item) => item.type === 'dm' && item.recipientId === 'm-ana'));
});

test('current participant can mark activity read and file a report', async () => {
  const app = adapter();
  await app.markAllNotificationsRead();
  assert.ok(app.data.notifications.filter((item) => item.recipientId === app.currentUser.uid).every((item) => item.read));
  const target = { type: 'channel', id: 'general', name: 'general' };
  const message = app.data.messages.general[0];
  await app.reportMessage(target, message, 'Test report reason');
  assert.equal(app.data.reports.length, 1);
  assert.equal(app.data.reports[0].messageSnapshot.id, message.id);
});
