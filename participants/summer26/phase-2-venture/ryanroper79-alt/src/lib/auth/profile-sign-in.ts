const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_-]{3,30}$/;

export type ProfileSignInInput = {
  name?: string;
  companyName?: string;
  email?: string;
  username?: string;
};

export type ProfileSignIn = {
  name: string;
  companyName: string | null;
  email: string;
  username: string;
};

export function greetingFirstName(profile: {
  name?: string | null;
  username?: string | null;
  email?: string | null;
} | null): string {
  if (!profile) return 'Guest';
  const first = profile.name?.trim().split(/\s+/)[0];
  if (first) return first;
  if (profile.username) return profile.username;
  if (profile.email && !profile.email.startsWith('event@')) {
    return profile.email.split('@')[0] ?? 'Guest';
  }
  return 'Guest';
}

export function profileIsComplete(profile: {
  name?: string | null;
  email?: string | null;
  username?: string | null;
} | null): boolean {
  return Boolean(profile?.name?.trim() && profile?.email?.trim() && profile?.username?.trim());
}

function trim(value: unknown, max: number): string {
  return String(value ?? '')
    .trim()
    .slice(0, max);
}

export function parseProfileSignIn(input: ProfileSignInInput): ProfileSignIn {
  const name = trim(input.name, 120);
  const companyName = trim(input.companyName, 200);
  const email = trim(input.email, 254).toLowerCase();
  const username = trim(input.username, 30);

  if (!name) throw new Error('Name is required');
  if (!email || !EMAIL_RE.test(email)) throw new Error('Valid email address is required');
  if (!username || !USERNAME_RE.test(username)) {
    throw new Error('Username must be 3–30 characters (letters, numbers, _ or -)');
  }
  if (/ryanroper79/i.test(username)) {
    throw new Error('Please choose a different username');
  }

  return { name, companyName: companyName || null, email, username };
}

export function profileToUserId(username: string): string {
  return `external-${username.toLowerCase()}`;
}
