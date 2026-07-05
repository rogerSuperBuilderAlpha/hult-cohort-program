import { logApi } from '@/lib/api-log';
import {
  ADMISSION_EMAIL_SUBJECT,
  APPLICATION_EMAIL_SUBJECT,
  APPLICATION_NOTIFICATION_SUBJECT,
  buildAdmissionConfirmationHtml,
  buildApplicationConfirmationHtml,
  buildApplicationNotificationHtml,
} from '@/lib/email-templates.mjs';
import { getMailerConfig, sendEmail } from '@/lib/mailer.mjs';

/** Staff address(es) notified on each new application. Comma-separated env override. */
const ADMISSIONS_NOTIFY_EMAIL =
  process.env.ADMISSIONS_NOTIFY_EMAIL?.trim() || 'roger@ludwitt.com';

type ApplicationEmailParams = {
  email: string;
  firstName: string;
  takeHomeRepoUrl: string;
};

type ApplicationNotificationParams = {
  firstName: string;
  lastName: string;
  email: string;
  githubHandle: string;
  githubUrl: string;
  campus: string;
  timezone: string;
  referralSource: string;
  motivation: string;
  project1Idea: string;
};

type AdmissionEmailParams = {
  email: string;
  firstName: string;
  githubHandle: string;
};

/** Resolve the active provider config (mailgun or ses); null if unconfigured. */
function requireMailer() {
  const config = getMailerConfig();
  if (!config) {
    logApi('email', 'warn', 'Email not configured — skipping send', {
      provider: process.env.EMAIL_PROVIDER?.trim() || 'mailgun',
      hint: 'Set EMAIL_PROVIDER (mailgun|ses) and its provider env (see lib/mailer.mjs / lib/ses.mjs)',
    });
    return null;
  }
  return config;
}

/** Template #1 — execution/templates/emails.md (application received) */
export async function sendApplicationConfirmationEmail(
  params: ApplicationEmailParams
): Promise<void> {
  const config = requireMailer();
  if (!config) return;

  await sendEmail({
    to: params.email,
    subject: APPLICATION_EMAIL_SUBJECT,
    html: buildApplicationConfirmationHtml({
      firstName: params.firstName,
      takeHomeRepoUrl: params.takeHomeRepoUrl,
      fromName: config.fromName,
    }),
  });
}

/** Staff notification — sent to admissions team on each new application. */
export async function sendApplicationNotificationEmail(
  params: ApplicationNotificationParams
): Promise<void> {
  const config = requireMailer();
  if (!config) return;

  await sendEmail({
    to: ADMISSIONS_NOTIFY_EMAIL,
    subject: `${APPLICATION_NOTIFICATION_SUBJECT} — ${params.firstName} ${params.lastName}`,
    html: buildApplicationNotificationHtml(params),
  });
}

/** Template #2 — execution/templates/emails.md (admissions decision — admitted) */
export async function sendAdmissionConfirmationEmail(
  params: AdmissionEmailParams
): Promise<void> {
  const config = requireMailer();
  if (!config) return;

  await sendEmail({
    to: params.email,
    subject: ADMISSION_EMAIL_SUBJECT,
    html: buildAdmissionConfirmationHtml({
      firstName: params.firstName,
      githubHandle: params.githubHandle,
      fromName: config.fromName,
    }),
  });
}
