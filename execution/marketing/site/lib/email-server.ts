import { logApi } from '@/lib/api-log';
import {
  ADMISSION_EMAIL_SUBJECT,
  APPLICATION_EMAIL_SUBJECT,
  buildAdmissionConfirmationHtml,
  buildApplicationConfirmationHtml,
} from '@/lib/email-templates.mjs';
import { getEmailConfig, sendMailgunEmail } from '@/lib/mailgun.mjs';

type ApplicationEmailParams = {
  email: string;
  firstName: string;
  takeHomeRepoUrl: string;
};

type AdmissionEmailParams = {
  email: string;
  firstName: string;
  githubHandle: string;
};

function requireMailgun() {
  const config = getEmailConfig();
  if (!config) {
    logApi('email', 'info', 'Email not configured — skipping send', {
      hint: 'Set EMAIL_API_KEY, EMAIL_PROVIDER=mailgun, EMAIL_DOMAIN, EMAIL_FROM, EMAIL_FROM_NAME',
    });
    return null;
  }
  return config;
}

/** Template #1 — execution/templates/emails.md (application received) */
export async function sendApplicationConfirmationEmail(
  params: ApplicationEmailParams
): Promise<void> {
  const config = requireMailgun();
  if (!config) return;

  await sendMailgunEmail({
    to: params.email,
    subject: APPLICATION_EMAIL_SUBJECT,
    html: buildApplicationConfirmationHtml({
      firstName: params.firstName,
      takeHomeRepoUrl: params.takeHomeRepoUrl,
      fromName: config.fromName,
    }),
    config,
  });
}

/** Template #2 — execution/templates/emails.md (admissions decision — admitted) */
export async function sendAdmissionConfirmationEmail(
  params: AdmissionEmailParams
): Promise<void> {
  const config = requireMailgun();
  if (!config) return;

  await sendMailgunEmail({
    to: params.email,
    subject: ADMISSION_EMAIL_SUBJECT,
    html: buildAdmissionConfirmationHtml({
      firstName: params.firstName,
      githubHandle: params.githubHandle,
      fromName: config.fromName,
    }),
    config,
  });
}
