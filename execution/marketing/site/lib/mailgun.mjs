/**
 * Shared Mailgun client for Next.js (email-server.ts) and staff CLI scripts.
 */

/** @returns {import('./mailgun-types').EmailConfig | null} */
export function getEmailConfig() {
  const apiKey = process.env.EMAIL_API_KEY?.trim();
  if (!apiKey) return null;

  const provider = (process.env.EMAIL_PROVIDER?.trim().toLowerCase() || 'mailgun');
  const domain = process.env.EMAIL_DOMAIN?.trim() || '';
  const fromEmail = process.env.EMAIL_FROM?.trim() || 'cohort@hult.edu';
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || 'Hult Cohort';
  const apiBase =
    process.env.EMAIL_API_BASE?.trim()?.replace(/\/$/, '') || 'https://api.mailgun.net/v3';

  if (provider !== 'mailgun' || !domain) return null;

  return { provider: 'mailgun', apiKey, domain, fromEmail, fromName, apiBase };
}

/**
 * @param {{ to: string; subject: string; html: string; config: NonNullable<ReturnType<typeof getEmailConfig>> }} params
 */
export async function sendMailgunEmail({ to, subject, html, config }) {
  const body = new URLSearchParams({
    from: `${config.fromName} <${config.fromEmail}>`,
    to,
    subject,
    html,
  });

  const res = await fetch(`${config.apiBase}/${config.domain}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${config.apiKey}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mailgun failed (${res.status}): ${text}`);
  }
}

export function siteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return 'https://site-nine-rouge-68.vercel.app';
}
