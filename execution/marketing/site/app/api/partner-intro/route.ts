import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { logApiError } from '@/lib/api-log';
import { savePartnerIntro, validatePartnerIntro } from '@/lib/showcase/partner-intro-server';

export const runtime = 'nodejs';

const ROUTE = 'POST /api/partner-intro';

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rate = checkRateLimit(`partner-intro:${ip}`, 8, 60_000);
  if (!rate.allowed) {
    return Response.json(
      { error: 'Too many requests. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
    );
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (String(body._honeypot ?? '').trim()) {
      return Response.json({ ok: true, id: 'noop' });
    }

    const input = validatePartnerIntro(body);
    const { id } = await savePartnerIntro(input);
    return Response.json({ ok: true, id });
  } catch (err) {
    if (err instanceof Error && err.message) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    logApiError(ROUTE, err);
    return Response.json({ error: 'Unable to save intro request.' }, { status: 500 });
  }
}
