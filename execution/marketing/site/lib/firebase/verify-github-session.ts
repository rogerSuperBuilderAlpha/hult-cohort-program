import { firebaseConfig } from './config';
import { resolveGithubHandle } from './github-handle';

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
      screenName?: string;
      federatedId?: string;
      rawId?: string;
    }>;
  }>;
  error?: { message?: string };
};

export async function verifyGithubIdToken(
  idToken: string,
  handleHint?: string
): Promise<GithubSession> {
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

  const hint = handleHint?.trim().toLowerCase();
  const githubHandle = await resolveGithubHandle(idToken, github, hint);
  if (!githubHandle) {
    throw new Error(
      'We could not verify your GitHub username. Sign out, sign in again, and retry. If it keeps failing, email cohort@hult.edu.'
    );
  }

  const githubUid = github.federatedId?.trim() || github.rawId?.trim();
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
