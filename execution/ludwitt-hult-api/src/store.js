import { randomUUID } from 'crypto';

const developers = new Map();
const apps = new Map();
const events = [];

// Cohort roster blocklist — user_ids belonging to cohort members
const blockedUserIds = new Set(['cohort-member-1', 'cohort-member-2']);

const defaultDev = {
  id: 'dev-1',
  handle: 'student-demo',
  api_key: 'sandbox_key_demo',
  sandbox: true,
};

developers.set(defaultDev.api_key, defaultDev);
developers.set('prod_key_demo', { ...defaultDev, id: 'dev-2', api_key: 'prod_key_demo', sandbox: false });

export function authenticateDeveloper(apiKey) {
  return developers.get(apiKey) || null;
}

export function registerApp(developerId, meta) {
  const app_id = randomUUID();
  const api_key = `app_${randomUUID().replace(/-/g, '')}`;
  const jwt_secret = randomUUID();
  const record = {
    app_id,
    developer_id: developerId,
    api_key,
    jwt_secret,
    status: 'pending_review',
    ...meta,
  };
  apps.set(app_id, record);
  return { app_id, api_key, jwt_secret };
}

export function getApp(app_id) {
  return apps.get(app_id) || null;
}

export function isBlockedUser(user_id, student_handle) {
  if (blockedUserIds.has(user_id)) return true;
  if (user_id.includes(student_handle)) return true;
  return false;
}

const QUALIFYING_EVENTS = new Set(['lesson_started', 'lesson_completed', 'quiz_submitted']);

export function recordEvent(app_id, { event, user_id, session_id, metadata, sandbox }) {
  if (sandbox || event.startsWith('sandbox.')) return;
  events.push({
    app_id,
    event,
    user_id,
    session_id,
    metadata,
    ts: Date.now(),
  });
}

export function getMetrics(app_id) {
  const appEvents = events.filter((e) => e.app_id === app_id);
  const users = new Set(appEvents.map((e) => e.user_id));
  const qualified = new Set(
    appEvents.filter((e) => QUALIFYING_EVENTS.has(e.event)).map((e) => e.user_id)
  );
  return {
    unique_users: users.size,
    qualified_users: qualified.size,
  };
}

getMetrics.exportSnapshot = function exportSnapshot() {
  const header = 'app_id,student_handle,unique_users,qualified_users';
  const rows = [header];
  for (const app of apps.values()) {
    const m = getMetrics(app.app_id);
    rows.push(`${app.app_id},${app.student_handle},${m.unique_users},${m.qualified_users}`);
  }
  return rows;
};

export function _resetForTests() {
  apps.clear();
  events.length = 0;
  developers.clear();
  developers.set(defaultDev.api_key, { ...defaultDev });
}

export function _seedDeveloper(dev) {
  developers.set(dev.api_key, dev);
}

export function _blockUser(id) {
  blockedUserIds.add(id);
}
