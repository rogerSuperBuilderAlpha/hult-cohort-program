import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { app, _resetForTests } from '../src/server.js';
import { _seedDeveloper } from '../src/store.js';

let server;

before(() => {
  process.env.NODE_ENV = 'test';
  server = app.listen(0);
});

beforeEach(() => {
  _resetForTests();
  _seedDeveloper({
    id: 'dev-test',
    handle: 'alice',
    api_key: 'test_key',
    sandbox: false,
  });
});

async function api(method, path, body, key = 'test_key') {
  const port = server.address().port;
  const res = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = res.headers.get('content-type')?.includes('json') ? await res.json() : await res.text();
  return { status: res.status, body: json };
}

describe('Ludwitt/Hult API', () => {
  it('registers an app', async () => {
    const { status, body } = await api('POST', '/v1/developer/apps', {
      title: 'Learn SQL',
      description: 'A'.repeat(100),
      topic: 'SQL',
      launch_url: 'https://app.example.com/launch',
      repo_url: 'https://github.com/alice/learn-sql',
    });
    assert.equal(status, 201);
    assert.ok(body.app_id);
    assert.ok(body.api_key);
  });

  it('records events and returns qualified user count', async () => {
    const reg = await api('POST', '/v1/developer/apps', {
      title: 'Learn SQL',
      description: 'B'.repeat(100),
      topic: 'SQL',
      launch_url: 'https://app.example.com',
      repo_url: 'https://github.com/alice/learn-sql',
    });
    const app_id = reg.body.app_id;

    await api('POST', `/v1/apps/${app_id}/events`, {
      event: 'lesson_started',
      user_id: 'external-user-1',
      session_id: 'sess-1',
    });
    await api('POST', `/v1/apps/${app_id}/events`, {
      event: 'session_heartbeat',
      user_id: 'external-user-2',
      session_id: 'sess-2',
    });

    const metrics = await api('GET', `/v1/apps/${app_id}/metrics`);
    assert.equal(metrics.body.unique_users, 2);
    assert.equal(metrics.body.qualified_users, 1);
  });

  it('blocks cohort member user_ids from counting', async () => {
    const reg = await api('POST', '/v1/developer/apps', {
      title: 'Learn SQL',
      description: 'C'.repeat(100),
      topic: 'SQL',
      launch_url: 'https://app.example.com',
      repo_url: 'https://github.com/alice/learn-sql',
    });
    const app_id = reg.body.app_id;

    await api('POST', `/v1/apps/${app_id}/events`, {
      event: 'lesson_started',
      user_id: 'alice-friend',
      session_id: 'sess-x',
    });

    const metrics = await api('GET', `/v1/apps/${app_id}/metrics`);
    assert.equal(metrics.body.qualified_users, 0);
  });
});
