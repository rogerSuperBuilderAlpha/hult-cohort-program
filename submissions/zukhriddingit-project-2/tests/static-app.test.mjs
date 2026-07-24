import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('interface includes core communication and navigation surfaces', async () => {
  const html = await read('index.html');
  for (const phrase of ['GitHub', 'Channels', 'Direct messages', 'Your threads', 'Mentions', 'Share an update', 'Any GitHub account can enter', 'Workspace setup needed']) {
    assert.match(html, new RegExp(phrase, 'i'));
  }
  assert.doesNotMatch(html, /Access is limited to approved cohort members|An operator needs to approve/i);
});

test('application handles every required core flow', async () => {
  const app = await read('src/app.js');
  for (const token of ['createChannel', 'archiveChannel', 'createConversation', 'sendMessage', 'sendThreadReply', 'toggleReaction', 'search', 'reportMessage']) {
    assert.ok(app.includes(token), `Missing app flow: ${token}`);
  }
});

test('security rules keep DMs participant-only', async () => {
  const rules = await read('firestore.rules');
  const conversationBlock = rules.slice(rules.indexOf('match /conversations/'), rules.indexOf('match /notifications/'));
  assert.match(conversationBlock, /isConversationParticipant/);
  assert.doesNotMatch(conversationBlock, /allow read:[^;]*isStaff/);
});


test('channel documents cannot overwrite the UI target discriminator', async () => {
  const app = await read('src/app.js');
  assert.match(app, /return \{ \.\.\.channel, channelType: [^}]+, type: 'channel' \};/);
  assert.doesNotMatch(app, /\{\s*type:\s*'channel',\s*\.\.\./);
});
