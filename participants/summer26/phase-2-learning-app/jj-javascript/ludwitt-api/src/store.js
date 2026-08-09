import { createClient } from '@libsql/client';
import { randomUUID } from 'crypto';

const developers = new Map();
const blockedUserIds = new Set(['cohort-member-1', 'cohort-member-2']);

const QUALIFYING_EVENTS = ['lesson_started', 'lesson_completed', 'quiz_submitted'];

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

function seedDevelopersFromEnv() {
  const devKey = process.env.LUDWITT_DEV_KEY?.trim();
  const handle = process.env.LUDWITT_STUDENT_HANDLE?.trim() || 'jj-javascript';
  if (!devKey) return;

  developers.set(devKey, {
    id: 'dev-env',
    handle,
    api_key: devKey,
    sandbox: false,
  });
}

seedDevelopersFromEnv();

let dbClient = null;
let readyPromise = null;

function createDbClient() {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (url) {
    return createClient({ url, authToken: authToken || undefined });
  }

  if (process.env.NODE_ENV === 'production') {
    console.warn('TURSO_DATABASE_URL not set; using file:/tmp/ludwitt.db (run scripts/provision-turso.sh)');
    return createClient({ url: 'file:/tmp/ludwitt.db' });
  }

  return createClient({ url: ':memory:' });
}

function getDb() {
  if (!dbClient) dbClient = createDbClient();
  return dbClient;
}

async function ensureSchema(db) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS apps (
      app_id TEXT PRIMARY KEY,
      developer_id TEXT NOT NULL,
      api_key TEXT NOT NULL,
      jwt_secret TEXT NOT NULL,
      status TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      topic TEXT NOT NULL,
      launch_url TEXT NOT NULL,
      repo_url TEXT NOT NULL,
      icon_url TEXT DEFAULT '',
      student_handle TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_id TEXT NOT NULL,
      event TEXT NOT NULL,
      user_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      metadata TEXT,
      ts INTEGER NOT NULL
    )
  `);

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_events_app_id ON events(app_id)`);
}

async function seedAppFromEnv(db) {
  const devKey = process.env.LUDWITT_DEV_KEY?.trim();
  const handle = process.env.LUDWITT_STUDENT_HANDLE?.trim() || 'jj-javascript';
  const appId = process.env.LUDWITT_SEED_APP_ID?.trim();
  const jwtSecret = process.env.LUDWITT_SEED_JWT_SECRET?.trim();
  if (!devKey || !appId || !jwtSecret) return;

  const existing = await db.execute({
    sql: 'SELECT app_id FROM apps WHERE app_id = ?',
    args: [appId],
  });

  const launchUrl = process.env.LUDWITT_SEED_LAUNCH_URL?.trim() || '';
  const fields = {
    developer_id: 'dev-env',
    api_key: process.env.LUDWITT_SEED_APP_KEY?.trim() || `app_${appId.replace(/-/g, '')}`,
    jwt_secret: jwtSecret,
    status: 'active',
    title: process.env.LUDWITT_SEED_APP_TITLE?.trim() || 'Git Arcade',
    description:
      process.env.LUDWITT_SEED_APP_DESCRIPTION?.trim() ||
      'A gamified way to learn Git and terminal commands through timed challenges graded on repository state, not exact command text.',
    topic: process.env.LUDWITT_SEED_APP_TOPIC?.trim() || 'Git and terminal fundamentals',
    launch_url: launchUrl,
    repo_url: process.env.LUDWITT_SEED_REPO_URL?.trim() || '',
    icon_url: process.env.LUDWITT_SEED_ICON_URL?.trim() || '',
    student_handle: handle,
  };

  if (existing.rows.length > 0) {
    await db.execute({
      sql: `UPDATE apps SET launch_url = ?, repo_url = ?, title = ?, description = ?, topic = ?, icon_url = ?
            WHERE app_id = ?`,
      args: [
        fields.launch_url,
        fields.repo_url,
        fields.title,
        fields.description,
        fields.topic,
        fields.icon_url,
        appId,
      ],
    });
    return;
  }

  await db.execute({
    sql: `INSERT INTO apps (
      app_id, developer_id, api_key, jwt_secret, status, title, description,
      topic, launch_url, repo_url, icon_url, student_handle
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      appId,
      fields.developer_id,
      fields.api_key,
      fields.jwt_secret,
      fields.status,
      fields.title,
      fields.description,
      fields.topic,
      fields.launch_url,
      fields.repo_url,
      fields.icon_url,
      fields.student_handle,
    ],
  });
}

export function ready() {
  if (!readyPromise) {
    readyPromise = (async () => {
      const db = getDb();
      await ensureSchema(db);
      await seedAppFromEnv(db);
    })();
  }
  return readyPromise;
}

function rowToApp(row) {
  return {
    app_id: row.app_id,
    developer_id: row.developer_id,
    api_key: row.api_key,
    jwt_secret: row.jwt_secret,
    status: row.status,
    title: row.title,
    description: row.description,
    topic: row.topic,
    launch_url: row.launch_url,
    repo_url: row.repo_url,
    icon_url: row.icon_url ?? '',
    student_handle: row.student_handle,
  };
}

export function authenticateDeveloper(apiKey) {
  return developers.get(apiKey) || null;
}

export async function registerApp(developerId, meta) {
  await ready();
  const db = getDb();
  const app_id = randomUUID();
  const api_key = `app_${randomUUID().replace(/-/g, '')}`;
  const jwt_secret = randomUUID();

  await db.execute({
    sql: `INSERT INTO apps (
      app_id, developer_id, api_key, jwt_secret, status, title, description,
      topic, launch_url, repo_url, icon_url, student_handle
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      app_id,
      developerId,
      api_key,
      jwt_secret,
      'pending_review',
      meta.title,
      meta.description,
      meta.topic,
      meta.launch_url,
      meta.repo_url,
      meta.icon_url ?? '',
      meta.student_handle,
    ],
  });

  return { app_id, api_key, jwt_secret };
}

export async function getApp(app_id) {
  await ready();
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM apps WHERE app_id = ?',
    args: [app_id],
  });
  if (result.rows.length === 0) return null;
  return rowToApp(result.rows[0]);
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

export async function recordEvent(app_id, { event, user_id, session_id, metadata, sandbox }) {
  if (sandbox || event.startsWith('sandbox.')) return;
  await ready();
  const db = getDb();
  await db.execute({
    sql: 'INSERT INTO events (app_id, event, user_id, session_id, metadata, ts) VALUES (?, ?, ?, ?, ?, ?)',
    args: [app_id, event, user_id, session_id, JSON.stringify(metadata ?? {}), Date.now()],
  });
}

export async function getMetrics(app_id) {
  await ready();
  const db = getDb();

  const uniqueResult = await db.execute({
    sql: 'SELECT COUNT(DISTINCT user_id) AS count FROM events WHERE app_id = ?',
    args: [app_id],
  });

  const placeholders = QUALIFYING_EVENTS.map(() => '?').join(', ');
  const qualifiedResult = await db.execute({
    sql: `SELECT COUNT(DISTINCT user_id) AS count FROM events WHERE app_id = ? AND event IN (${placeholders})`,
    args: [app_id, ...QUALIFYING_EVENTS],
  });

  return {
    unique_users: Number(uniqueResult.rows[0]?.count ?? 0),
    qualified_users: Number(qualifiedResult.rows[0]?.count ?? 0),
  };
}

getMetrics.exportSnapshot = async function exportSnapshot() {
  await ready();
  const db = getDb();
  const appsResult = await db.execute('SELECT app_id, student_handle FROM apps');
  const header = 'app_id,student_handle,unique_users,qualified_users';
  const rows = [header];

  for (const app of appsResult.rows) {
    const m = await getMetrics(app.app_id);
    rows.push(
      [app.app_id, app.student_handle, m.unique_users, m.qualified_users].map(csvCell).join(',')
    );
  }
  return rows;
};

export async function _resetForTests() {
  dbClient = createClient({ url: ':memory:' });
  readyPromise = null;
  developers.clear();
  developers.set(defaultDev.api_key, { ...defaultDev });
  developers.set('prod_key_demo', {
    ...defaultDev,
    id: 'dev-2',
    api_key: 'prod_key_demo',
    sandbox: false,
  });
  blockedUserIds.clear();
  blockedUserIds.add('cohort-member-1');
  blockedUserIds.add('cohort-member-2');
  await ready();
}

export function _seedDeveloper(dev) {
  developers.set(dev.api_key, dev);
}

export function _blockUser(id) {
  blockedUserIds.add(id);
}
