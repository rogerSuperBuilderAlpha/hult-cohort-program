import { logApi } from '@/lib/api-log';

type ApplicationEmailParams = {
  email: string;
  firstName: string;
  takeHomeRepoUrl: string;
};

type EmailProvider = 'mailgun';

function emailConfig():
  | {
      provider: EmailProvider;
      apiKey: string;
      domain: string;
      fromEmail: string;
      fromName: string;
      apiBase: string;
    }
  | null {
  const apiKey = process.env.EMAIL_API_KEY?.trim();
  if (!apiKey) return null;

  const provider = (process.env.EMAIL_PROVIDER?.trim().toLowerCase() || 'mailgun') as EmailProvider;
  const domain = process.env.EMAIL_DOMAIN?.trim() || '';
  const fromEmail = process.env.EMAIL_FROM?.trim() || 'cohort@hult.edu';
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || 'Hult Cohort';
  const apiBase =
    process.env.EMAIL_API_BASE?.trim()?.replace(/\/$/, '') || 'https://api.mailgun.net/v3';

  if (provider === 'mailgun' && !domain) return null;

  return { provider, apiKey, domain, fromEmail, fromName, apiBase };
}

/** Template #1 — execution/templates/emails.md (application received) */
export async function sendApplicationConfirmationEmail(
  params: ApplicationEmailParams
): Promise<void> {
  const config = emailConfig();
  if (!config) {
    logApi('email', 'info', 'Email not configured — skipping application email', {
      email: params.email,
      hint: 'Set EMAIL_API_KEY, EMAIL_PROVIDER=mailgun, EMAIL_DOMAIN, EMAIL_FROM, EMAIL_FROM_NAME',
    });
    return;
  }

  if (config.provider !== 'mailgun') {
    logApi('email', 'warn', 'Only Mailgun is implemented for apply emails', {
      provider: config.provider,
    });
    return;
  }

  const subject = 'Hult Cohort — application received';
  const html = `
    <p>Hi ${params.firstName},</p>
    <p>We received your application for the Fall 2026 Cohort Developer Program.</p>
    <p><strong>Next step:</strong> Complete the 48-hour take-home.</p>
    <ul>
      <li>Repo: <a href="${params.takeHomeRepoUrl}">${params.takeHomeRepoUrl}</a></li>
      <li>Instructions in README</li>
      <li>Submit via PR with the template filled out</li>
    </ul>
    <p>Questions: cohort@hult.edu</p>
    <p>— ${config.fromName}</p>
  `.trim();

  const body = new URLSearchParams({
    from: `${config.fromName} <${config.fromEmail}>`,
    to: params.email,
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
