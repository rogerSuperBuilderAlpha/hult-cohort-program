import { describe, expect, it } from 'vitest';
import { greetingFirstName, profileIsComplete } from '@/lib/auth/profile-sign-in';

describe('greetingFirstName', () => {
  it('uses first name from full name', () => {
    expect(greetingFirstName({ name: 'Ryan Roper', email: 'r@x.com', username: 'ryan' })).toBe(
      'Ryan'
    );
  });

  it('avoids generic event email prefix', () => {
    expect(greetingFirstName({ email: 'event@cealgreen.com' })).toBe('Guest');
  });
});

describe('profileIsComplete', () => {
  it('requires name, email, and username', () => {
    expect(profileIsComplete({ name: 'Ryan', email: 'r@x.com', username: 'ryan' })).toBe(true);
    expect(profileIsComplete({ email: 'event@cealgreen.com' })).toBe(false);
  });
});
