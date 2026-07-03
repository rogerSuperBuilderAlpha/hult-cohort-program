/**
 * Provider-agnostic mail dispatcher. Set EMAIL_PROVIDER to pick a backend:
 *   mailgun (default) — lib/mailgun.mjs
 *   ses               — lib/ses.mjs   (Amazon SES — cheapest at cohort scale)
 *
 * Both transactional email (lib/email-server.ts) and the blast tool (scripts/blast.mjs)
 * route through sendEmail() so switching providers is a one-line env change.
 */

import { getEmailConfig, sendMailgunEmail } from './mailgun.mjs';
import { getSesConfig, sendSesEmail } from './ses.mjs';

export function mailerProvider() {
  return (process.env.EMAIL_PROVIDER?.trim().toLowerCase() || 'mailgun');
}

/** Resolved config for the active provider, or null if that provider isn't configured. */
export function getMailerConfig() {
  return mailerProvider() === 'ses' ? getSesConfig() : getEmailConfig();
}

/** True when the active provider has enough env to actually send. */
export function isMailerConfigured() {
  return Boolean(getMailerConfig());
}

/**
 * Send a single message via the active provider.
 * Returns { sent } or { skipped } — never throws on "not configured".
 * @param {{ to: string; subject: string; html: string; headers?: Record<string,string> }} params
 */
export async function sendEmail({ to, subject, html, headers }) {
  if (mailerProvider() === 'ses') {
    const config = getSesConfig();
    if (!config) return { skipped: true, reason: 'ses-not-configured' };
    await sendSesEmail({ to, subject, html, headers, config });
    return { sent: true, provider: 'ses' };
  }

  const config = getEmailConfig();
  if (!config) return { skipped: true, reason: 'mailgun-not-configured' };
  await sendMailgunEmail({ to, subject, html, headers, config });
  return { sent: true, provider: 'mailgun' };
}
