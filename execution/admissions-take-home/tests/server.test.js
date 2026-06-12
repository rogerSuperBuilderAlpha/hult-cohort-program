import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

describe('PATCH /api/tasks/:id', () => {
  let server;
  let port;

  before(async () => {
    const { app } = await import('../src/server.js');
    await new Promise((resolve) => {
      server = app.listen(0, resolve);
    });
    port = server.address().port;
  });

  after(async () => {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  });

  it('returns 404 until applicant fixes req.params.id (starter bug)', async () => {
    await fetch(`http://127.0.0.1:${port}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test' }),
    });
    const res = await fetch(`http://127.0.0.1:${port}/api/tasks/1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });
    assert.equal(res.status, 404, 'expected starter bug — fix server.js PATCH handler');
  });
});
