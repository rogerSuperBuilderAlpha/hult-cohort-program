import { describe, expect, it } from 'vitest';
import { parseProfileSignIn, profileToUserId } from '@/lib/auth/profile-sign-in';

describe('parseProfileSignIn', () => {
  it('accepts valid profile', () => {
    const p = parseProfileSignIn({
      name: 'Jane Doe',
      companyName: 'Island Retail Ltd',
      email: 'Jane@Example.com',
      username: 'jane_doe',
    });
    expect(p.email).toBe('jane@example.com');
    expect(profileToUserId(p.username)).toBe('external-jane_doe');
  });

  it('rejects missing fields', () => {
    expect(() => parseProfileSignIn({ name: 'A' })).toThrow(/email/i);
  });

  it('allows optional company', () => {
    const p = parseProfileSignIn({
      name: 'Ryan Roper',
      email: 'ryan@example.com',
      username: 'ryan_r',
    });
    expect(p.companyName).toBeNull();
  });

  it('rejects cohort handle in username', () => {
    expect(() =>
      parseProfileSignIn({
        name: 'Test',
        companyName: 'Co',
        email: 't@t.com',
        username: 'ryanroper79',
      })
    ).toThrow(/different username/);
  });
});
