const USERS_KEY = '@learnhub_local_users';
const SESSION_KEY = '@learnhub_local_session';

export interface LocalAccount {
  id: string;
  email: string;
  password: string;
  displayName: string;
}

export interface LocalSession {
  userId: string;
  email: string;
}

function readUsers(): LocalAccount[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LocalAccount[];
  } catch {
    return [];
  }
}

function writeUsers(users: LocalAccount[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function createId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getLocalSession(): LocalSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalSession;
  } catch {
    return null;
  }
}

export function clearLocalSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function localSignUp(
  email: string,
  password: string,
  displayName: string
): { error: string | null; session: LocalSession | null } {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();

  if (users.some((u) => u.email === normalizedEmail)) {
    return { error: 'An account with this email already exists. Try signing in.', session: null };
  }

  const account: LocalAccount = {
    id: createId(),
    email: normalizedEmail,
    password,
    displayName: displayName.trim(),
  };

  users.push(account);
  writeUsers(users);

  const session = { userId: account.id, email: account.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { error: null, session };
}

export function localSignIn(
  email: string,
  password: string
): { error: string | null; session: LocalSession | null } {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  const account = users.find((u) => u.email === normalizedEmail);

  if (!account || account.password !== password) {
    return { error: 'Invalid email or password.', session: null };
  }

  const session = { userId: account.id, email: account.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { error: null, session };
}

export function getLocalDisplayName(userId: string): string | null {
  const users = readUsers();
  return users.find((u) => u.id === userId)?.displayName ?? null;
}

export function localResetPassword(
  email: string,
  newPassword: string
): { error: string | null } {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  const account = users.find((u) => u.email === normalizedEmail);

  if (!account) {
    return { error: 'No account found with this email.' };
  }
  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  account.password = newPassword;
  writeUsers(users);
  return { error: null };
}
