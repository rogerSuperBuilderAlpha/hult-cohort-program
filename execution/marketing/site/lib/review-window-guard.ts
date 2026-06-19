import { getProject, type ProgramProject } from '@/content/program';
import { isReviewWindowOpen, reviewWindowStatus } from '@/lib/program-schedule';
import { requireEnrolledSession } from '@/lib/require-enrolled';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';

export type ReviewRouteGuardResult =
  | {
      ok: true;
      project: ProgramProject;
      githubHandle: string;
    }
  | { ok: false; response: Response };

/** Shared guard for peer review / rating API routes. */
export async function requireReviewRouteAccess(
  request: Request,
  slug: string,
  ratePrefix: string
): Promise<ReviewRouteGuardResult> {
  const ip = clientIp(request);
  const rate = checkRateLimit(`${ratePrefix}:${ip}`, 60, 60_000);
  if (!rate.allowed) {
    return {
      ok: false,
      response: Response.json(
        { error: 'Too many requests. Try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      ),
    };
  }

  const guard = await requireEnrolledSession(request);
  if (!guard.ok) return guard;

  const project = getProject(slug);
  if (!project?.reviews) {
    return {
      ok: false,
      response: Response.json({ error: 'This project has no peer reviews.' }, { status: 404 }),
    };
  }

  const window = reviewWindowStatus(project);
  if (window === 'not-yet') {
    return {
      ok: false,
      response: Response.json({ error: 'Review week has not opened yet.' }, { status: 403 }),
    };
  }
  if (window === 'closed' && !isReviewWindowOpen(project)) {
    return {
      ok: false,
      response: Response.json({ error: 'Review week is closed for this project.' }, { status: 403 }),
    };
  }

  return {
    ok: true,
    project,
    githubHandle: guard.session.githubHandle,
  };
}
