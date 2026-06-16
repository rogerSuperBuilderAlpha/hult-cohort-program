import { cohortId } from '@/lib/cohort-config';
import { requireActiveRosterMember } from '@/lib/enrollment-server';
import {
  bearerTokenFromRequest,
  verifyGithubIdToken,
} from '@/lib/firebase/verify-github-session';
import { isAdminConfigured } from '@/lib/firebase/admin';

export type EnrolledSession = {
  githubHandle: string;
  cohortId: string;
};

export type EnrolledGuardResult =
  | { ok: true; session: EnrolledSession }
  | { ok: false; response: Response };

export async function requireEnrolledSession(request: Request): Promise<EnrolledGuardResult> {
  if (!isAdminConfigured()) {
    return {
      ok: false,
      response: Response.json({ error: 'Service temporarily unavailable.' }, { status: 503 }),
    };
  }

  const idToken = bearerTokenFromRequest(request);
  if (!idToken) {
    return {
      ok: false,
      response: Response.json({ error: 'Sign in with GitHub.' }, { status: 401 }),
    };
  }

  let githubHandle: string;
  try {
    const session = await verifyGithubIdToken(idToken);
    githubHandle = session.githubHandle;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid sign-in.';
    return {
      ok: false,
      response: Response.json({ error: message }, { status: 401 }),
    };
  }

  const enrolled = await requireActiveRosterMember(githubHandle);
  if (!enrolled) {
    return {
      ok: false,
      response: Response.json({ error: 'Enrolled participants only.' }, { status: 403 }),
    };
  }

  return {
    ok: true,
    session: { githubHandle, cohortId: cohortId() },
  };
}

export async function requireGithubSession(request: Request): Promise<
  | { ok: true; githubHandle: string }
  | { ok: false; response: Response }
> {
  if (!isAdminConfigured()) {
    return {
      ok: false,
      response: Response.json({ error: 'Service temporarily unavailable.' }, { status: 503 }),
    };
  }

  const idToken = bearerTokenFromRequest(request);
  if (!idToken) {
    return {
      ok: false,
      response: Response.json({ error: 'Sign in with GitHub.' }, { status: 401 }),
    };
  }

  try {
    const session = await verifyGithubIdToken(idToken);
    return { ok: true, githubHandle: session.githubHandle };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid sign-in.';
    return {
      ok: false,
      response: Response.json({ error: message }, { status: 401 }),
    };
  }
}
