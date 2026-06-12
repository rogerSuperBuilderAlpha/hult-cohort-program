import { firebaseConfig } from './config';

export type GithubSession = {
  firebaseUid: string;
  githubHandle: string;
  githubUrl: string;
  githubUid: string;
  email?: string;
};

type LookupResponse = {
  users?: Array<{
    localId: string;
    email?: string;
    providerUserInfo?: Array<{
      providerId: string;
      displayName?: string;
      federatedId?: string;
    }>;
  }>;
  error?: { message?: string };
};

function githubHandleFromClaims(name: unknown): string | null {
  if (typeof name !== 'string') return null;
  const handle = name.trim();
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(handle)) return null;
  return handle.toLowerCase();
}

export async function verifyGithubIdToken(idToken: string): Promise<GithubSession> {
  const apiKey = firebaseConfig.apiKey?.trim();
  if (!apiKey) {
    throw new Error('Applications are temporarily unavailable.');
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );

  const data = (await res.json()) as LookupResponse;
  if (!res.ok || !data.users?.[0]) {
    throw new Error('Your GitHub session expired. Sign in again.');
  }

  const user = data.users[0];
  const github = user.providerUserInfo?.find((p) => p.providerId === 'github.com');
  if (!github) {
    throw new Error('Sign in with GitHub to apply.');
  }

  const githubHandle = githubHandleFromClaims(github.displayName);
  if (!githubHandle) {
    throw new Error('Could not read your GitHub username. Try signing out and back in.');
  }

  const githubUid = github.federatedId?.trim();
  if (!githubUid) {
    throw new Error('GitHub identity missing from sign-in.');
  }

  return {
    firebaseUid: user.localId,
    githubHandle,
    githubUrl: `https://github.com/${githubHandle}`,
    githubUid,
    email: user.email,
  };
}

export function bearerTokenFromRequest(request: Request): string | null {
  const header = request.headers.get('authorization')?.trim();
  if (!header?.toLowerCase().startsWith('bearer ')) return null;
  const token = header.slice(7).trim();
  return token || null;
}
