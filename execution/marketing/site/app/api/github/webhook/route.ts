import { logApi, logApiError } from '@/lib/api-log';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { ingestMergedPullRequest } from '@/lib/submission-write-server';
import {
  parseGithubWebhookPayload,
  verifyGithubWebhookSignature,
} from '@/lib/submission-ingest-server';

export const runtime = 'nodejs';

const ROUTE = 'POST /api/github/webhook';

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rate = checkRateLimit(`webhook:${ip}`, 120, 60_000);
  if (!rate.allowed) {
    return Response.json(
      { error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
    );
  }

  const secret = process.env.GITHUB_WEBHOOK_SECRET?.trim();
  if (!secret) {
    logApi(ROUTE, 'error', 'GITHUB_WEBHOOK_SECRET not configured');
    return Response.json({ error: 'Webhook not configured.' }, { status: 503 });
  }

  const payload = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (!verifyGithubWebhookSignature(payload, signature, secret)) {
    logApi(ROUTE, 'warn', 'Invalid webhook signature', { ip });
    return Response.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let event: {
    action?: string;
    pull_request?: {
      merged?: boolean;
      merged_at?: string | null;
      number?: number;
      html_url?: string;
      title?: string;
    };
    repository?: { full_name?: string };
  };

  const eventName = request.headers.get('x-github-event');

  try {
    event = parseGithubWebhookPayload(payload) as typeof event;
  } catch {
    logApi(ROUTE, 'warn', 'Invalid webhook payload', { ip, eventName });
    return Response.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  if (eventName === 'ping') {
    return Response.json({ ok: true, ping: true });
  }

  if (eventName !== 'pull_request') {
    return Response.json({ ok: true, ignored: true, reason: 'not pull_request' });
  }

  if (event.action !== 'closed' || !event.pull_request?.merged) {
    return Response.json({ ok: true, ignored: true, reason: 'not merged close' });
  }

  const repoFullName = event.repository?.full_name;
  const pr = event.pull_request;
  if (!repoFullName || !pr?.html_url || !pr.title || !pr.number) {
    return Response.json({ error: 'Incomplete payload.' }, { status: 400 });
  }

  try {
    const result = await ingestMergedPullRequest({
      repoFullName,
      prTitle: pr.title,
      prNumber: pr.number,
      prHtmlUrl: pr.html_url,
      merged: true,
      mergedAt: pr.merged_at ? new Date(pr.merged_at) : new Date(),
      source: 'webhook',
    });

    logApi(ROUTE, 'info', 'Webhook processed', {
      repo: repoFullName,
      pr: pr.number,
      ingested: result.ingested,
      projectSlug: result.projectSlug,
      handle: result.handle,
    });

    return Response.json({ ok: true, ...result });
  } catch (err) {
    logApiError(ROUTE, err, { repo: repoFullName, pr: pr.number });
    return Response.json({ error: 'Ingest failed.' }, { status: 500 });
  }
}
