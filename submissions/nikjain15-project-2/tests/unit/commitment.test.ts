import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { detectCommitment } from '@/lib/detect-commitment';
import { verifyGithubSignature } from '@/lib/webhook';

describe('commitment detection (deterministic baseline)', () => {
  it('detects a first-person promise', () => {
    const d = detectCommitment("I'll open the PR by Friday");
    expect(d).not.toBeNull();
    expect(d?.dueHint).toMatch(/friday/i);
  });

  it('captures the due hint when present, null when not', () => {
    expect(detectCommitment('I will write the tests tomorrow')?.dueHint).toMatch(/tomorrow/i);
    expect(detectCommitment('I will write the tests')?.dueHint).toBeNull();
  });

  it('is not fooled by a question', () => {
    expect(detectCommitment('should I open the PR?')).toBeNull();
  });

  it('ignores a message with no promise', () => {
    expect(detectCommitment('the build is green')).toBeNull();
  });
});

describe('github webhook signature', () => {
  const secret = 'shh';
  const body = JSON.stringify({ action: 'closed', issue: { number: 7 } });
  const good = 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');

  it('accepts a correctly signed body', () => {
    expect(verifyGithubSignature(body, good, secret)).toBe(true);
  });

  it('rejects a tampered body', () => {
    expect(verifyGithubSignature(body + 'x', good, secret)).toBe(false);
  });

  it('rejects a missing or wrong signature', () => {
    expect(verifyGithubSignature(body, null, secret)).toBe(false);
    expect(verifyGithubSignature(body, 'sha256=deadbeef', secret)).toBe(false);
  });

  it('rejects when no secret is configured', () => {
    expect(verifyGithubSignature(body, good, '')).toBe(false);
  });
});
