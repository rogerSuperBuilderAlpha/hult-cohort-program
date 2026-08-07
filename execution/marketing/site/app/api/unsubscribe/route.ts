import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import { logApiError } from '@/lib/api-log';
import {
  addSuppression,
  normalizeEmail,
  verifyUnsubscribeToken,
} from '@/lib/blast-server.mjs';

export const runtime = 'nodejs';

const ROUTE = 'unsubscribe';

function page(title: string, message: string, status: number) {
  const html = `<!doctype html><html><head><meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title></head>
    <body style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:520px;margin:80px auto;padding:0 20px;color:#1a1a1a">
      <h1 style="font-size:20px">${title}</h1>
      <p style="color:#555;line-height:1.5">${message}</p>
    </body></html>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function unsubscribe(email: string | null, token: string | null): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized || !verifyUnsubscribeToken(normalized, token)) return false;
  if (!isAdminConfigured()) throw new Error('Firebase Admin not configured');
  await addSuppression(getAdminDb(), normalized, 'unsubscribe', { source: 'link' });
  return true;
}

/** Link click from the email footer. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    const ok = await unsubscribe(url.searchParams.get('e'), url.searchParams.get('t'));
    if (!ok) return page('Invalid unsubscribe link', 'This link is invalid or has expired.', 400);
    return page(
      'You’re unsubscribed',
      'You will no longer receive marketing emails from the Hult Cohort program. Transactional messages about an active application may still be sent.',
      200
    );
  } catch (err) {
    logApiError(`GET /api/${ROUTE}`, err);
    return page('Something went wrong', 'Please email cohort@hult.edu to be removed.', 500);
  }
}

/** RFC 8058 one-click unsubscribe (List-Unsubscribe-Post) from the mail client. */
export async function POST(request: Request) {
  const url = new URL(request.url);
  try {
    const ok = await unsubscribe(url.searchParams.get('e'), url.searchParams.get('t'));
    return Response.json({ ok }, { status: ok ? 200 : 400 });
  } catch (err) {
    logApiError(`POST /api/${ROUTE}`, err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
