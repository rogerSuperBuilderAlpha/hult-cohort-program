import { positioning } from '@/data/cohort';

export type PartnerInquiry = {
  name: string;
  email: string;
  organisation: string;
  participantHandle?: string;
  message: string;
};

function optionalEmail(value: unknown): string | undefined {
  const trimmed = String(value ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error('Valid email is required.');
  }
  return trimmed;
}

export function validatePartnerInquiry(body: Record<string, unknown>): PartnerInquiry {
  const name = String(body.name ?? '').trim();
  if (name.length < 2) throw new Error('Contact name is required.');

  const email = optionalEmail(body.email);
  if (!email) throw new Error('Email is required.');

  const organisation = String(body.organisation ?? '').trim();
  if (organisation.length < 2) throw new Error('Organization is required.');

  const message = String(body.message ?? '').trim();
  if (message.length < 20 || message.length > 2000) {
    throw new Error('Message is required — 20–2000 characters.');
  }

  const participantHandle = String(body.participantHandle ?? '').trim().replace(/^@/, '') || undefined;

  return { name, email, organisation, participantHandle, message };
}

function issueBody(input: PartnerInquiry, notifyEmail: string) {
  return [
    '## Partner introduction — Hult Climate Builder Network',
    '',
    `**Organization:** ${input.organisation}`,
    `**Contact:** ${input.name}`,
    `**Email:** ${input.email}`,
    `**Participant:** ${input.participantHandle ? `@${input.participantHandle}` : '_not specified_'}`,
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
  const notifyEmail = process.env.PARTNER_NOTIFY_EMAIL?.trim() ?? process.env.PLACEMENT_LEAD_EMAIL?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() ?? 'onboarding@resend.dev';

  if (resendKey && notifyEmail) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [notifyEmail],
        replyTo: input.email,
        subject: `[Cohort intro] ${input.organisation}`,
        text: issueBody(input, notifyEmail),
      }),
    });
    if (res.ok) return { mode: 'resend', ok: true };
  }

  const token = process.env.GITHUB_TOKEN?.trim();
  const repo = process.env.PARTNER_GITHUB_REPO?.trim() ?? 'ryanroper79-alt/hult-cohort-program';
  const title = `[Cohort intro] ${input.organisation}`;

  if (token) {
    const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        body: issueBody(input, notifyEmail ?? '(unset)'),
        labels: ['partner-inquiry'],
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { html_url?: string };
      if (data.html_url) return { mode: 'github', issueUrl: data.html_url };
    }
  }

  console.info('[partner:intro]', JSON.stringify({ ...input, receivedAt: new Date().toISOString() }));
  return {
    mode: 'github-fallback',
    issueUrl:
      'https://github.com/ryanroper79-alt/hult-cohort-program/issues/new?labels=partner-inquiry',
  };
}
