import { randomUUID } from 'crypto';

const developers = new Map();
const apps = new Map();
const events = [];

const blockedUserIds = new Set(['cohort-member-1', 'cohort-member-2']);

const defaultDev = {
  id: 'dev-1',
  handle: 'student-demo',
  api_key: 'sandbox_key_demo',
  sandbox: true,
};

developers.set(defaultDev.api_key, defaultDev);

if (process.env.NODE_ENV !== 'production') {
  developers.set('prod_key_demo', {
    ...defaultDev,
    id: 'dev-2',
    api_key: 'prod_key_demo',
    sandbox: false,
  });
}

function seedFromEnv() {
  const devKey = process.env.LUDWITT_DEV_KEY?.trim();
  const handle = process.env.LUDWITT_STUDENT_HANDLE?.trim() || 'jj-javascript';
  if (!devKey) return;

  const developerId = 'dev-env';
  developers.set(devKey, {
    id: developerId,
    handle,
    api_key: devKey,
    sandbox: false,
  });

  const appId = process.env.LUDWITT_SEED_APP_ID?.trim();
  const jwtSecret = process.env.LUDWITT_SEED_JWT_SECRET?.trim();
  if (!appId || !jwtSecret) return;

  apps.set(appId, {
    app_id: appId,
    developer_id: developerId,
    api_key: process.env.LUDWITT_SEED_APP_KEY?.trim() || `app_${appId.replace(/-/g, '')}`,
    jwt_secret: jwtSecret,
    status: 'active',
    title: process.env.LUDWITT_SEED_APP_TITLE?.trim() || 'Git Arcade',
    description:
      process.env.LUDWITT_SEED_APP_DESCRIPTION?.trim() ||
      'A gamified way to learn Git and terminal commands through timed challenges graded on repository state, not exact command text.',
    topic: process.env.LUDWITT_SEED_APP_TOPIC?.trim() || 'Git and terminal fundamentals',
    launch_url: process.env.LUDWITT_SEED_LAUNCH_URL?.trim() || '',
    repo_url: process.env.LUDWITT_SEED_REPO_URL?.trim() || '',
    icon_url: process.env.LUDWITT_SEED_ICON_URL?.trim() || '',
    student_handle: handle,
  });
}

seedFromEnv();

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
  const normalizedUser = String(user_id ?? '').trim().toLowerCase();
  if (!normalizedUser) return false;
  if (blockedUserIds.has(normalizedUser)) return true;

  const normalizedHandle = String(student_handle ?? '').trim().toLowerCase();
  if (!normalizedHandle) return false;
  return normalizedUser === normalizedHandle;
}

function csvCell(value) {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
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
    rows.push(
      [app.app_id, app.student_handle, m.unique_users, m.qualified_users]
        .map(csvCell)
        .join(',')
    );
  }
  return rows;
};

export function _resetForTests() {
  apps.clear();
  events.length = 0;
  developers.clear();
  developers.set(defaultDev.api_key, { ...defaultDev });
  developers.set('prod_key_demo', {
    ...defaultDev,
    id: 'dev-2',
    api_key: 'prod_key_demo',
    sandbox: false,
  });
}

export function _seedDeveloper(dev) {
  developers.set(dev.api_key, dev);
}

export function _blockUser(id) {
  blockedUserIds.add(id);
}
