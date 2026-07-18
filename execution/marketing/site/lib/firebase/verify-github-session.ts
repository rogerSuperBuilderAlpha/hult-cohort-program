import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth } from './admin';
import { resolveGithubHandle } from './github-handle';
import { githubIdentityRef } from '@/lib/firestore-paths';
import { logApi } from '@/lib/api-log';

export type GithubSession = {
  firebaseUid: string;
  githubHandle: string;
  githubUrl: string;
  githubUid: string;
  email?: string;
};

async function readIdentityHandle(githubUserId: string): Promise<string | null> {
  try {
    const cached = await githubIdentityRef(githubUserId).get();
    const handle = cached.exists ? (cached.data()?.githubHandle as string | undefined) : undefined;
    return handle ?? null;
  } catch (err) {
    logApi('auth', 'warn', 'GitHub identity cache read failed', {
      githubUserId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/**
 * Resolve GitHub login from numeric id. Cross-request cache (1h) + request dedupe
 * so every API call doesn't re-read githubIdentities.
 */
const resolveGithubHandleCached = cache(async (githubUserId: string): Promise<string | null> => {
  const fromCache = unstable_cache(
    () => readIdentityHandle(githubUserId),
    ['github-identity', githubUserId],
    { revalidate: 3600, tags: [`github-identity:${githubUserId}`] }
  );
  const cachedHandle = await fromCache();
  if (cachedHandle) return cachedHandle;

  const handle = await resolveGithubHandle({ federatedId: githubUserId, rawId: githubUserId });
  if (!handle) return null;

  try {
    await githubIdentityRef(githubUserId).set(
      { githubHandle: handle, githubUserId, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    logApi('auth', 'warn', 'GitHub identity cache write failed', {
      githubUserId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return handle;
});

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

  const githubUid = github.uid?.trim();
  if (!githubUid) {
    throw new Error('GitHub identity missing from sign-in.');
  }

  const githubHandle = await resolveGithubHandleCached(githubUid);
  if (!githubHandle) {
    throw new Error(
      'We could not verify your GitHub username. Try again in a moment. If it keeps failing, email cohort@hult.edu.'
    );
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
