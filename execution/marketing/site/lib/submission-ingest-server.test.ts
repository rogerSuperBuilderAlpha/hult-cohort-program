import { createHmac } from 'crypto';
import { describe, expect, it } from 'vitest';
import { verifyGithubWebhookSignature } from './submission-ingest-server';

describe('verifyGithubWebhookSignature', () => {
  const secret = 'test-webhook-secret';
  const body = '{"action":"closed","pull_request":{"merged":true}}';

  it('accepts a valid sha256 signature', () => {
    const digest = createHmac('sha256', secret).update(body).digest('hex');
    expect(verifyGithubWebhookSignature(body, `sha256=${digest}`, secret)).toBe(true);
  });

  it('rejects missing, wrong, or malformed signatures', () => {
    expect(verifyGithubWebhookSignature(body, null, secret)).toBe(false);
    expect(verifyGithubWebhookSignature(body, 'sha256=deadbeef', secret)).toBe(false);
    expect(verifyGithubWebhookSignature(body, 'sha1=abc', secret)).toBe(false);
  });
});
