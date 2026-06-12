import { getAdminAuth } from './admin';

export type GithubSession = {
  firebaseUid: string;
  githubHandle: string;
  githubUrl: string;
  githubUid: string;
  email?: string;
};

function githubHandleFromClaims(name: unknown): string | null {
  if (typeof name !== 'string') return null;
  const handle = name.trim();
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(handle)) return null;
  return handle.toLowerCase();
}

export async function verifyGithubIdToken(idToken: string): Promise<GithubSession> {
  const decoded = await getAdminAuth().verifyIdToken(idToken);

  if (decoded.firebase?.sign_in_provider !== 'github.com') {
    throw new Error('Sign in with GitHub to apply.');
  }

  const githubIds = decoded.firebase?.identities?.['github.com'] as string[] | undefined;
  const githubUid = githubIds?.[0];
  if (!githubUid) {
    throw new Error('GitHub identity missing from sign-in.');
  }

  const githubHandle = githubHandleFromClaims(decoded.name);
  if (!githubHandle) {
    throw new Error('Could not read GitHub username from sign-in.');
  }

  return {
    firebaseUid: decoded.uid,
    githubHandle,
    githubUrl: `https://github.com/${githubHandle}`,
    githubUid,
    email: decoded.email,
  };
}

export function bearerTokenFromRequest(request: Request): string | null {
  const header = request.headers.get('authorization')?.trim();
  if (!header?.toLowerCase().startsWith('bearer ')) return null;
  const token = header.slice(7).trim();
  return token || null;
}
