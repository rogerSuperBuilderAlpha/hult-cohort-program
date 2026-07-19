/**
 * Amazon SES backend — HTTP API via @aws-sdk/client-sesv2 (no SMTP connection to babysit).
 * Mirrors the shape of mailgun.mjs so lib/mailer.mjs can dispatch between them.
 *
 * Required env when EMAIL_PROVIDER=ses:
 *   AWS_REGION (or SES_REGION), EMAIL_FROM, EMAIL_FROM_NAME
 *   AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY   (standard AWS SDK credential chain)
 * Optional:
 *   SES_CONFIGURATION_SET  — attach for open/click/bounce tracking
 */

import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

/** @returns {import('./mailer').SesConfig | null} */
export function getSesConfig() {
  const region = process.env.AWS_REGION?.trim() || process.env.SES_REGION?.trim() || '';
  const fromEmail = process.env.EMAIL_FROM?.trim() || '';
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || 'Hult Cohort';
  const configurationSet = process.env.SES_CONFIGURATION_SET?.trim() || undefined;

  if (!region || !fromEmail) return null;

  return { provider: 'ses', region, fromEmail, fromName, configurationSet };
}

let client;
/** @param {NonNullable<ReturnType<typeof getSesConfig>>} config */
function getClient(config) {
  if (!client) client = new SESv2Client({ region: config.region });
  return client;
}

/**
 * @param {{ to: string; subject: string; html: string; headers?: Record<string,string>;
 *           config: NonNullable<ReturnType<typeof getSesConfig>> }} params
 */
export async function sendSesEmail({ to, subject, html, headers, config }) {
  const messageHeaders = headers
    ? Object.entries(headers).map(([Name, Value]) => ({ Name, Value: String(Value) }))
    : undefined;

  const command = new SendEmailCommand({
    FromEmailAddress: `${config.fromName} <${config.fromEmail}>`,
    Destination: { ToAddresses: [to] },
    ConfigurationSetName: config.configurationSet,
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Html: { Data: html, Charset: 'UTF-8' } },
        ...(messageHeaders ? { Headers: messageHeaders } : {}),
      },
    },
  });

  await getClient(config).send(command);
}
