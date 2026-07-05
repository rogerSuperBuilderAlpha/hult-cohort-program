import { getAdminAuth } from './admin';
import { resolveGithubHandle } from './github-handle';

export type GithubSession = {
  firebaseUid: string;
  githubHandle: string;
  githubUrl: string;
  githubUid: string;
  email?: string;
};

export async function verifyGithubIdToken(idToken: string): Promise<GithubSession> {
  const auth = await getAdminAuth();
  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    throw new Error('Your GitHub session expired. Sign in again.');
  }

  const firebaseUid = decoded.uid;
  const email = decoded.email;

  const user = await auth.getUser(firebaseUid);
  const github = user.providerData.find((p) => p.providerId === 'github.com');
  if (!github) {
    throw new Error('Sign in with GitHub to apply.');
  }

  const githubHandle = await resolveGithubHandle({
    federatedId: github.uid,
    rawId: github.uid,
  });
  if (!githubHandle) {
    throw new Error(
      'We could not verify your GitHub username. Try again in a moment. If it keeps failing, email cohort@hult.edu.'
    );
  }

  const githubUid = github.uid?.trim();
  if (!githubUid) {
    throw new Error('GitHub identity missing from sign-in.');
  }

  return {
    firebaseUid,
    githubHandle,
    githubUrl: `https://github.com/${githubHandle}`,
    githubUid,
    email: email ?? github.email ?? user.email,
  };
}

export function bearerTokenFromRequest(request: Request): string | null {
  const header = request.headers.get('authorization')?.trim();
  if (!header?.toLowerCase().startsWith('bearer ')) return null;
  const token = header.slice(7).trim();
  return token || null;
}
