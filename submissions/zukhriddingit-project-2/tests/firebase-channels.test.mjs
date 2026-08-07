import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { FirebaseAdapter } from '../src/adapters/firebase.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const channelDoc = (id, data) => ({ id, data: () => data });
const snapshot = (...docs) => ({ docs });

function listenerFirebase() {
  const listeners = [];
  const queryCalls = [];
  const unsubscribeCalls = [];
  const firebase = {
    collection: (_db, path) => ({ kind: 'collection', path }),
    where: (fieldPath, operator, value) => ({ kind: 'where', fieldPath, operator, value }),
    orderBy: (fieldPath, direction) => ({ kind: 'orderBy', fieldPath, direction }),
    query: (collection, ...constraints) => {
      const query = { collection, constraints };
      queryCalls.push(query);
      return query;
    },
    onSnapshot: (query, next, error) => {
      const listener = { query, next, error, unsubscribed: false };
      listeners.push(listener);
      return () => {
        listener.unsubscribed = true;
        unsubscribeCalls.push(listener);
      };
    }
  };
  return { firebase, listeners, queryCalls, unsubscribeCalls };
}

function membershipFirebase(workspaceMode) {
  const documents = new Map();
  const writes = [];
  if (workspaceMode !== undefined) documents.set('settings/workspace', { accessMode: workspaceMode });

  const adapter = new FirebaseAdapter({});
  adapter.db = {};
  adapter.getStoredIdentity = () => ({
    githubHandle: 'visitor', displayName: 'GitHub Visitor', email: 'visitor@example.test', avatarUrl: ''
  });
  adapter.fb = {
    doc: (_db, ...segments) => segments.join('/'),
    getDoc: async (reference) => ({
      exists: () => documents.has(reference),
      data: () => documents.get(reference)
    }),
    setDoc: async (reference, data, options) => {
      writes.push({ reference, data, options });
      documents.set(reference, data);
    },
    serverTimestamp: () => 'server-timestamp'
  };
  return { adapter, writes };
}

test('Firebase membership uses Firestore open mode and does not create a stale request when workspace setup is missing', async () => {
  const user = { uid: 'visitor', displayName: 'GitHub Visitor', email: 'visitor@example.test', photoURL: '' };
  const missing = membershipFirebase(undefined);
  const open = membershipFirebase('open');
  const request = membershipFirebase('request');

  assert.equal(await missing.adapter.checkMembership(user), null);
  assert.deepEqual(missing.writes, []);

  const openProfile = await open.adapter.checkMembership(user);
  assert.equal(openProfile.role, 'member');
  assert.equal(openProfile.active, true);
  assert.deepEqual(open.writes.map((write) => write.reference), ['members/visitor']);

  assert.equal(await request.adapter.checkMembership(user), null);
  assert.deepEqual(request.writes.map((write) => write.reference), ['access_requests/visitor']);
});

test('Firebase channel listeners use two rule-compatible queries and merge their snapshots', () => {
  const { firebase, listeners, queryCalls, unsubscribeCalls } = listenerFirebase();
  const adapter = new FirebaseAdapter({});
  adapter.db = {};
  adapter.fb = firebase;
  adapter.currentUser = { uid: 'member-1' };
  const published = [];

  const cleanup = adapter.subscribeChannels((channels) => published.push(channels));

  assert.equal(listeners.length, 2);
  assert.deepEqual(queryCalls.map((call) => call.constraints), [
    [
      { kind: 'where', fieldPath: 'type', operator: '==', value: 'public' },
      { kind: 'orderBy', fieldPath: 'sort', direction: 'asc' }
    ],
    [
      { kind: 'where', fieldPath: 'memberIds', operator: 'array-contains', value: 'member-1' },
      { kind: 'orderBy', fieldPath: 'sort', direction: 'asc' }
    ]
  ]);

  listeners[0].next(snapshot(
    channelDoc('archived-public', { type: 'public', archived: true, sort: 1 }),
    channelDoc('overlap', { type: 'public', memberIds: ['member-1'], sort: 10 }),
    channelDoc('general', { type: 'public', sort: 30 })
  ));
  listeners[1].next(snapshot(
    channelDoc('archived-private', { type: 'private', memberIds: ['member-1'], archived: true, sort: 15 }),
    channelDoc('private-review', { type: 'private', memberIds: ['member-1'], sort: 20 }),
    channelDoc('overlap', { type: 'public', memberIds: ['member-1'], sort: 10 })
  ));

  assert.deepEqual(published.at(-1).map((channel) => channel.id), ['overlap', 'private-review', 'general']);
  assert.equal(new Set(published.at(-1).map((channel) => channel.id)).size, 3);
  assert.ok(published.at(-1).every((channel) => !channel.archived));

  // Updating only the public listener leaves the member-only snapshot intact.
  listeners[0].next(snapshot(channelDoc('general', { type: 'public', sort: 30 })));
  assert.deepEqual(published.at(-1).map((channel) => channel.id), ['overlap', 'private-review', 'general']);
  assert.deepEqual(adapter.cachedChannels, published.at(-1));

  cleanup();
  assert.equal(unsubscribeCalls.length, 2);
  assert.ok(listeners.every((listener) => listener.unsubscribed));
});

test('starter-channel seeding checks only for an existing public channel', async () => {
  const queryCalls = [];
  const adapter = new FirebaseAdapter({});
  adapter.db = {};
  adapter.currentProfile = { role: 'admin', uid: 'admin-1' };
  adapter.fb = {
    collection: (_db, path) => ({ kind: 'collection', path }),
    where: (fieldPath, operator, value) => ({ kind: 'where', fieldPath, operator, value }),
    limit: (value) => ({ kind: 'limit', value }),
    query: (collection, ...constraints) => {
      const query = { collection, constraints };
      queryCalls.push(query);
      return query;
    },
    getDocs: async () => ({ empty: false }),
    doc: () => ({ kind: 'doc' }),
    writeBatch: () => ({ set() {}, commit: async () => {} }),
    serverTimestamp: () => 'timestamp'
  };

  await adapter.ensureStarterChannels();

  assert.deepEqual(queryCalls, [{
    collection: { kind: 'collection', path: 'channels' },
    constraints: [
      { kind: 'where', fieldPath: 'type', operator: '==', value: 'public' },
      { kind: 'limit', value: 1 }
    ]
  }]);
});

test('channel rules read root documents from resource data, retain private membership, and require numeric sort', async () => {
  const rules = await read('firestore.rules');
  const channelBlock = rules.slice(rules.indexOf('match /channels/{channelId}'), rules.indexOf('match /conversations/'));

  assert.match(rules, /function canReadChannelData\(channel\) \{[\s\S]*channel\.type == 'public'[\s\S]*channel\.memberIds is list[\s\S]*request\.auth\.uid in channel\.memberIds/);
  assert.match(rules, /function canListChannelData\(channel\) \{[\s\S]*channel\.keys\(\)\.hasAll\(\['type'\]\)[\s\S]*channel\.type == 'public'[\s\S]*request\.auth\.uid in channel\.memberIds/);
  assert.match(rules, /function canReadChannel\(channelId\) \{[\s\S]*get\(\/databases\/\$\(database\)\/documents\/channels\/\$\(channelId\)\)\.data/);
  assert.match(channelBlock, /allow read: if canReadChannelData\(resource\.data\);/);
  assert.match(channelBlock, /allow list: if canListChannelData\(resource\.data\);/);
  assert.match(rules, /function canPostChannel\(channelId\) \{[\s\S]*channelDoc\(channelId\)\.data\.postingRoles is list[\s\S]*role\(\) in channelDoc\(channelId\)\.data\.postingRoles/);
  assert.match(channelBlock, /allow create: if[\s\S]*request\.resource\.data\.sort is number/);
  assert.match(channelBlock, /allow update: if request\.resource\.data\.sort is number/);
  assert.match(channelBlock, /match \/messages\/\{messageId\} \{[\s\S]*allow read: if canReadChannel\(channelId\);/);
});

test('Firestore composite indexes support both channel listener queries', async () => {
  const { indexes } = JSON.parse(await read('firestore.indexes.json'));
  const required = [
    {
      collectionGroup: 'channels',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'type', order: 'ASCENDING' },
        { fieldPath: 'sort', order: 'ASCENDING' }
      ]
    },
    {
      collectionGroup: 'channels',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'memberIds', arrayConfig: 'CONTAINS' },
        { fieldPath: 'sort', order: 'ASCENDING' }
      ]
    }
  ];

  for (const index of required) {
    assert.ok(indexes.some((candidate) => isDeepStrictEqual(candidate, index)), `Missing channel index: ${JSON.stringify(index)}`);
  }
});
