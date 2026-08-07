'use strict';

const crypto = require('node:crypto');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');

initializeApp();
const db = getFirestore();

const PM_WEBHOOK_SECRET = defineSecret('PM_WEBHOOK_SECRET');
const GITHUB_WEBHOOK_SECRET = defineSecret('GITHUB_WEBHOOK_SECRET');
const PM_CHANNEL_ID = defineString('PM_CHANNEL_ID', { default: 'ship-room' });
const GITHUB_CHANNEL_ID = defineString('GITHUB_CHANNEL_ID', { default: 'ship-room' });

function safeText(value, max = 500) {
  return String(value || '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
}

function safeUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function secureEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function reject(res, status, message) {
  res.status(status).json({ ok: false, error: message });
}

async function postSystemMessage(channelId, message) {
  const channelRef = db.collection('channels').doc(channelId);
  const messageRef = channelRef.collection('messages').doc();
  const batch = db.batch();
  batch.set(messageRef, {
    senderId: message.senderId,
    senderName: message.senderName,
    senderHandle: message.senderHandle || '',
    senderRole: 'system',
    content: safeText(message.content, 5000),
    signalType: message.signalType || 'update',
    task: message.task || null,
    attachment: null,
    reactions: {},
    threadCount: 0,
    createdAt: FieldValue.serverTimestamp(),
    clientCreatedAt: Date.now()
  });
  batch.set(channelRef, {
    lastMessageAt: FieldValue.serverTimestamp(),
    lastMessagePreview: safeText(message.content, 140)
  }, { merge: true });
  await batch.commit();
  return messageRef.id;
}

exports.pmWebhook = onRequest({
  region: 'us-central1',
  secrets: [PM_WEBHOOK_SECRET],
  cors: false,
  maxInstances: 10
}, async (req, res) => {
  if (req.method !== 'POST') return reject(res, 405, 'POST required');
  const signature = req.get('x-relay-signature') || '';
  const body = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
  const digest = crypto.createHmac('sha256', PM_WEBHOOK_SECRET.value()).update(body).digest('hex');
  const expected = `sha256=${digest}`;
  const validSignature = secureEqual(signature, expected) || secureEqual(signature, digest);
  if (!validSignature) return reject(res, 401, 'Invalid webhook signature');

  const payload = req.body || {};
  const title = safeText(payload.title || payload.task?.title, 180);
  if (!title) return reject(res, 400, 'A task title is required');
  const status = safeText(payload.status || payload.task?.status || payload.event || 'Task updated', 60);
  const assignee = safeText(payload.assignee || payload.task?.assignee, 100);
  const actor = safeText(payload.actor || payload.user?.name, 100);
  const url = safeUrl(payload.url || payload.task?.url);
  const channelId = safeText(payload.channelId || PM_CHANNEL_ID.value(), 100);
  const content = safeText(payload.message || `${actor || 'The project board'} updated **${title}**${assignee ? ` for @${assignee.replace(/^@/, '')}` : ''}.`, 5000);

  try {
    const messageId = await postSystemMessage(channelId, {
      senderId: 'system:pm',
      senderName: 'Project board',
      senderHandle: 'pm-bot',
      content,
      signalType: status.toLowerCase().includes('done') ? 'win' : 'update',
      task: {
        title,
        status,
        url,
        provider: safeText(payload.provider || 'PM platform', 80),
        subtitle: safeText(payload.subtitle || [assignee && `Owner: ${assignee}`, actor && `Updated by ${actor}`].filter(Boolean).join(' · '), 160)
      }
    });
    res.status(202).json({ ok: true, channelId, messageId });
  } catch (error) {
    logger.error('PM webhook failed', error);
    reject(res, 500, 'Could not post the task update');
  }
});

exports.githubWebhook = onRequest({
  region: 'us-central1',
  secrets: [GITHUB_WEBHOOK_SECRET],
  cors: false,
  maxInstances: 10
}, async (req, res) => {
  if (req.method !== 'POST') return reject(res, 405, 'POST required');
  const signature = req.get('x-hub-signature-256') || '';
  const expected = `sha256=${crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET.value()).update(req.rawBody || Buffer.from(JSON.stringify(req.body || {}))).digest('hex')}`;
  if (!secureEqual(signature, expected)) return reject(res, 401, 'Invalid GitHub signature');

  const event = req.get('x-github-event') || 'unknown';
  const payload = req.body || {};
  const repo = safeText(payload.repository?.full_name || 'GitHub repository', 180);
  let content = '';
  let task = null;
  let signalType = 'update';

  if (event === 'pull_request') {
    const pr = payload.pull_request || {};
    const action = safeText(payload.action, 40);
    content = `**${safeText(pr.user?.login || 'A contributor', 80)}** ${action} PR #${pr.number}: **${safeText(pr.title, 220)}** in \`${repo}\`.`;
    task = { title: `PR #${pr.number} · ${safeText(pr.title, 180)}`, status: action, url: safeUrl(pr.html_url), provider: 'GitHub', subtitle: repo };
    signalType = ['closed', 'merged'].includes(action) || pr.merged ? 'win' : 'update';
  } else if (event === 'issues') {
    const issue = payload.issue || {};
    const action = safeText(payload.action, 40);
    content = `**${safeText(issue.user?.login || 'A contributor', 80)}** ${action} issue #${issue.number}: **${safeText(issue.title, 220)}** in \`${repo}\`.`;
    task = { title: `Issue #${issue.number} · ${safeText(issue.title, 180)}`, status: action, url: safeUrl(issue.html_url), provider: 'GitHub', subtitle: repo };
  } else if (event === 'push') {
    const count = Array.isArray(payload.commits) ? payload.commits.length : 0;
    const branch = safeText(String(payload.ref || '').replace('refs/heads/', ''), 100);
    content = `**${safeText(payload.pusher?.name || 'A contributor', 80)}** pushed ${count} commit${count === 1 ? '' : 's'} to \`${repo}/${branch}\`.`;
    task = { title: `${count} commit${count === 1 ? '' : 's'} pushed to ${branch}`, status: 'push', url: safeUrl(payload.compare), provider: 'GitHub', subtitle: repo };
  } else {
    res.status(202).json({ ok: true, ignored: event });
    return;
  }

  try {
    const channelId = safeText(GITHUB_CHANNEL_ID.value(), 100);
    const messageId = await postSystemMessage(channelId, {
      senderId: 'system:github',
      senderName: 'GitHub',
      senderHandle: 'github-bot',
      content,
      signalType,
      task
    });
    res.status(202).json({ ok: true, event, channelId, messageId });
  } catch (error) {
    logger.error('GitHub webhook failed', error);
    reject(res, 500, 'Could not post the GitHub update');
  }
});

exports.health = onRequest({ region: 'us-central1', cors: true }, (_req, res) => {
  res.status(200).json({ ok: true, service: 'relay65-functions' });
});
