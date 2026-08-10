import express from 'express';
import jwt from 'jsonwebtoken';
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

function storeError(res, err) {
  console.error(err);
  return res.status(500).json({ error: 'internal error' });
}

// Register app
app.post('/v1/developer/apps', requireDevKey, async (req, res) => {
  const { title, description, topic, launch_url, repo_url, icon_url } = req.body;
  if (!title || !description || description.length < 100 || !topic || !launch_url || !repo_url) {
    return res.status(400).json({ error: 'missing or invalid fields' });
  }
  try {
    const creds = await registerApp(req.developer.id, {
      title,
      description,
      topic,
      launch_url,
      repo_url,
      icon_url,
      student_handle: req.developer.handle,
    });
    res.status(201).json(creds);
  } catch (err) {
    return storeError(res, err);
  }
});

// Launch token (for testing — production would be user-facing launcher)
app.post('/v1/auth/launch-token', requireDevKey, async (req, res) => {
  const { app_id, user_id, email } = req.body;
  try {
    const appRecord = await getApp(app_id);
    if (!appRecord || appRecord.developer_id !== req.developer.id) {
      return res.status(404).json({ error: 'app not found' });
    }
    const token = jwt.sign({ sub: user_id, email, app_id }, appRecord.jwt_secret, {
      expiresIn: '1h',
    });
    res.json({ token, launch_url: `${appRecord.launch_url}?token=${token}` });
  } catch (err) {
    return storeError(res, err);
  }
});

// Events
app.post('/v1/apps/:app_id/events', requireDevKey, async (req, res) => {
  const { app_id } = req.params;
  try {
    const appRecord = await getApp(app_id);
    if (!appRecord) return res.status(404).json({ error: 'app not found' });

    const { event, user_id, session_id, metadata } = req.body;
    if (!event || !user_id || !session_id) {
      return res.status(400).json({ error: 'event, user_id, session_id required' });
    }

    if (isBlockedUser(user_id, appRecord.student_handle)) {
      return res.status(202).json({ accepted: true, counted: false });
    }

    await recordEvent(app_id, {
      event,
      user_id,
      session_id,
      metadata,
      sandbox: req.developer.sandbox,
    });
    res.status(202).json({ accepted: true, counted: !req.developer.sandbox });
  } catch (err) {
    return storeError(res, err);
  }
});

// Metrics
app.get('/v1/apps/:app_id/metrics', requireDevKey, async (req, res) => {
  const { app_id } = req.params;
  try {
    const appRecord = await getApp(app_id);
    if (!appRecord || appRecord.developer_id !== req.developer.id) {
      return res.status(404).json({ error: 'app not found' });
    }
    const metrics = await getMetrics(app_id);
    res.json(metrics);
  } catch (err) {
    return storeError(res, err);
  }
});

// Admin snapshot export
app.get('/v1/admin/cohorts/:cohort_id/snapshots/:date', async (req, res) => {
  const adminKey = process.env.ADMIN_KEY?.trim();
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd && !adminKey) {
    return res.status(503).json({ error: 'admin export not configured' });
  }
  const expected = adminKey || 'dev-admin-key';
  if (req.headers.authorization !== `Bearer ${expected}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const rows = (await getMetrics.exportSnapshot?.()) || [];
    res.type('text/csv').send(rows.join('\n'));
  } catch (err) {
    return storeError(res, err);
  }
});

app.get('/health', (_req, res) => res.json({ ok: true, service: 'ludwitt-hult-api' }));

export { app, _resetForTests };
