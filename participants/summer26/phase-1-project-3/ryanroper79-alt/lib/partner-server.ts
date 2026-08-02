import { positioning } from '@/data/cohort';

export type PartnerInquiry = {
  name: string;
  organisation: string;
  engagementModel: 'hire' | 'sponsor' | 'pilot' | 'other';
  message: string;
};

const ENGAGEMENT_LABELS: Record<PartnerInquiry['engagementModel'], string> = {
  hire: 'Hire a builder',
  sponsor: 'Sponsor a build',
  pilot: 'Co-develop a pilot',
  other: 'Other',
};

export function validatePartnerInquiry(body: Record<string, unknown>): PartnerInquiry {
  const name = String(body.name ?? '').trim();
  if (name.length < 2) throw new Error('Name is required.');

  const organisation = String(body.organisation ?? '').trim();
  const message = String(body.message ?? '').trim();
  if (message.length < 20 || message.length > 2000) {
    throw new Error('Message is required — 20–2000 characters.');
  }

  const model = String(body.engagementModel ?? 'other') as PartnerInquiry['engagementModel'];
  if (!['hire', 'sponsor', 'pilot', 'other'].includes(model)) {
    throw new Error('Select an engagement model.');
  }

  return { name, organisation, message, engagementModel: model };
}

function issueBody(input: PartnerInquiry, notifyEmail: string) {
  return [
    '## Partner inquiry — Summer Pilot 2026',
    '',
    `**Name:** ${input.name}`,
    `**Organisation:** ${input.organisation || '_not provided_'}`,
    `**Engagement model:** ${ENGAGEMENT_LABELS[input.engagementModel]}`,
    '',
    '### Message',
    input.message,
    '',
    '---',
    `Submitted via /partners on ${positioning.productionDomain}`,
    `Notify: ${notifyEmail}`,
  ].join('\n');
}

export type PartnerSubmitResult =
  | { mode: 'github'; issueUrl: string }
  | { mode: 'resend'; ok: true }
  | { mode: 'github-fallback'; issueUrl: string };

export async function submitPartnerInquiry(input: PartnerInquiry): Promise<PartnerSubmitResult> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const notifyEmail = process.env.PARTNER_NOTIFY_EMAIL?.trim() ?? 'ryan@cealgreen.com';
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() ?? 'onboarding@resend.dev';

  if (resendKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [notifyEmail],
        subject: `[Partner inquiry] ${ENGAGEMENT_LABELS[input.engagementModel]} — ${input.name}`,
        text: issueBody(input, notifyEmail),
      }),
    });
    if (res.ok) return { mode: 'resend', ok: true };
  }

  const token = process.env.GITHUB_TOKEN?.trim();
  const repo = process.env.PARTNER_GITHUB_REPO?.trim() ?? 'ryanroper79-alt/hult-cohort-program';
  const title = `[Partner inquiry] ${ENGAGEMENT_LABELS[input.engagementModel]} — ${input.name}`;

  if (token) {
    const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, body: issueBody(input, notifyEmail), labels: ['partner-inquiry'] }),
    });
    if (res.ok) {
      const data = (await res.json()) as { html_url?: string };
      if (data.html_url) return { mode: 'github', issueUrl: data.html_url };
    }
  }

  const fallback =
    'https://github.com/ryanroper79-alt/hult-cohort-program/issues/new?labels=partner-inquiry&title=%5BPartner%20inquiry%5D';
  return { mode: 'github-fallback', issueUrl: fallback };
}
