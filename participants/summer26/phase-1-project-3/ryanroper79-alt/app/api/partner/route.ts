import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { submitPartnerInquiry, validatePartnerInquiry } from '@/lib/partner-server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rate = checkRateLimit(`partner:${ip}`, 4, 60_000);

  if (!rate.allowed) {
    return Response.json({ error: 'Too many requests.' }, { status: 429 });
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
    const input = validatePartnerInquiry(body);
    const result = await submitPartnerInquiry(input);

    if (result.mode === 'resend') {
      return Response.json({ ok: true, mode: 'confirmed' });
    }
    if (result.mode === 'github') {
      return Response.json({ ok: true, mode: 'github', issueUrl: result.issueUrl });
    }
    return Response.json({ ok: true, mode: 'fallback', issueUrl: result.issueUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to submit inquiry.';
    return Response.json({ error: message }, { status: 400 });
  }
}
