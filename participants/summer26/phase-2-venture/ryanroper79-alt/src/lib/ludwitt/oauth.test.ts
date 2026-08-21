import { describe, expect, it } from 'vitest';
import { buildAuthorizeUrl, createOAuthState, isOAuthConfigured } from '@/lib/ludwitt/oauth';

describe('ludwitt oauth', () => {
  it('buildAuthorizeUrl includes client and redirect', () => {
    process.env.LUDWITT_CLIENT_ID = 'le_test';
    process.env.LUDWITT_CLIENT_SECRET = 'secret';
    const url = buildAuthorizeUrl({
      redirectUri: 'https://example.com/auth/callback',
      state: 'abc',
    });
    expect(url).toContain('client_id=le_test');
    expect(url).toContain('redirect_uri=');
    expect(url).toContain('state=abc');
  });

  it('isOAuthConfigured requires id and secret', () => {
    delete process.env.LUDWITT_CLIENT_ID;
    delete process.env.LUDWITT_CLIENT_SECRET;
    expect(isOAuthConfigured()).toBe(false);
    process.env.LUDWITT_CLIENT_ID = 'le_test';
    process.env.LUDWITT_CLIENT_SECRET = 'secret';
    expect(isOAuthConfigured()).toBe(true);
  });

  it('createOAuthState is non-empty', () => {
    expect(createOAuthState().length).toBeGreaterThan(10);
  });
});
