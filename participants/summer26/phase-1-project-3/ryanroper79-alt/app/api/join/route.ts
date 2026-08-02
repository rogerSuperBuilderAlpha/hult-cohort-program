import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { submitJoinRequest, validateJoinRequest } from '@/lib/join-server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rate = checkRateLimit(`join:${ip}`, 6, 60_000);

  if (!rate.allowed) {
    return Response.json(
      { error: 'Too many requests. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (String(body._honeypot ?? '').trim()) {
    return Response.json({ ok: true, mode: 'noop' });
  }

  try {
    const input = validateJoinRequest(body);
    const result = await submitJoinRequest(input);

    if (result.mode === 'github') {
      return Response.json({ ok: true, mode: 'github', issueUrl: result.issueUrl });
    }

    return Response.json({
      ok: true,
      mode: 'mailto',
      mailto: result.mailto,
      message: 'Form endpoint not configured — use the email fallback below.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to submit join request.';
    return Response.json({ error: message }, { status: 400 });
  }
}
