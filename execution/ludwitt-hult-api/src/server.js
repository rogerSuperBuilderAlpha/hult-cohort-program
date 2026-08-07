import express from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import {
  registerApp,
  getApp,
  recordEvent,
  getMetrics,
  authenticateDeveloper,
  isBlockedUser,
  _resetForTests,
} from './store.js';

const app = express();

app.use(express.json());

function requireDevKey(req, res, next) {
  const header = req.headers.authorization || '';
  const key = header.replace(/^Bearer\s+/i, '');
  const dev = authenticateDeveloper(key);
  if (!dev) return res.status(401).json({ error: 'invalid api key' });
  req.developer = dev;
  next();
}

// Register app
app.post('/v1/developer/apps', requireDevKey, (req, res) => {
  const { title, description, topic, launch_url, repo_url, icon_url } = req.body;
  if (!title || !description || description.length < 100 || !topic || !launch_url || !repo_url) {
    return res.status(400).json({ error: 'missing or invalid fields' });
  }
  const creds = registerApp(req.developer.id, {
    title,
    description,
    topic,
    launch_url,
    repo_url,
    icon_url,
    student_handle: req.developer.handle,
  });
  res.status(201).json(creds);
});

// Launch token (for testing — production would be user-facing launcher)
app.post('/v1/auth/launch-token', requireDevKey, (req, res) => {
  const { app_id, user_id, email } = req.body;
  const appRecord = getApp(app_id);
  if (!appRecord || appRecord.developer_id !== req.developer.id) {
    return res.status(404).json({ error: 'app not found' });
  }
  const token = jwt.sign(
    { sub: user_id, email, app_id },
    appRecord.jwt_secret,
    { expiresIn: '1h' }
  );
  res.json({ token, launch_url: `${appRecord.launch_url}?token=${token}` });
});

// Events
app.post('/v1/apps/:app_id/events', requireDevKey, (req, res) => {
  const { app_id } = req.params;
  const appRecord = getApp(app_id);
  if (!appRecord) return res.status(404).json({ error: 'app not found' });

  const { event, user_id, session_id, metadata } = req.body;
  if (!event || !user_id || !session_id) {
    return res.status(400).json({ error: 'event, user_id, session_id required' });
  }

  if (isBlockedUser(user_id, appRecord.student_handle)) {
    return res.status(202).json({ accepted: true, counted: false });
  }

  recordEvent(app_id, { event, user_id, session_id, metadata, sandbox: req.developer.sandbox });
  res.status(202).json({ accepted: true, counted: !req.developer.sandbox });
});

// Metrics
app.get('/v1/apps/:app_id/metrics', requireDevKey, (req, res) => {
  const { app_id } = req.params;
  const appRecord = getApp(app_id);
  if (!appRecord || appRecord.developer_id !== req.developer.id) {
    return res.status(404).json({ error: 'app not found' });
  }
  const metrics = getMetrics(app_id);
  res.json(metrics);
});

// Admin snapshot export
app.get('/v1/admin/cohorts/:cohort_id/snapshots/:date', (req, res) => {
  const adminKey = process.env.ADMIN_KEY || 'dev-admin-key';
  if (req.headers.authorization !== `Bearer ${adminKey}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const rows = getMetrics.exportSnapshot?.() || [];
  res.type('text/csv').send(rows.join('\n'));
});

app.get('/health', (_req, res) => res.json({ ok: true, service: 'ludwitt-hult-api' }));

export { app, _resetForTests };
