import { positioning, showcaseEvent } from '@/data/cohort';

export type ShowcaseRsvp = {
  name: string;
  email: string;
  company?: string;
  attending: 'yes' | 'maybe';
};

export function validateShowcaseRsvp(body: Record<string, unknown>): ShowcaseRsvp {
  const name = String(body.name ?? '').trim();
  if (name.length < 2) throw new Error('Name is required.');

  const email = String(body.email ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Valid email is required.');
  }

  const company = String(body.company ?? '').trim() || undefined;
  const attending = body.attending === 'maybe' ? 'maybe' : 'yes';

  return { name, email, company, attending };
}

function issueBody(input: ShowcaseRsvp, notifyEmail: string) {
  return [
    '## Showcase RSVP — Hult Summer Pilot 2026',
    '',
    `**Event:** ${showcaseEvent.title}`,
    `**When:** ${showcaseEvent.when}`,
    '',
    `**Name:** ${input.name}`,
    `**Email:** ${input.email}`,
    `**Company:** ${input.company ?? '_not provided_'}`,
    `**Attendance:** ${input.attending === 'yes' ? 'Yes — count me in' : 'Maybe'}`,
    '',
    '---',
    `Submitted via /rsvp on ${positioning.productionDomain}`,
    `Notify: ${notifyEmail}`,
  ].join('\n');
}

export type RsvpSubmitResult =
  | { mode: 'github'; issueUrl: string }
  | { mode: 'resend'; ok: true }
  | { mode: 'log'; ok: true };

export async function submitShowcaseRsvp(input: ShowcaseRsvp): Promise<RsvpSubmitResult> {
  const notifyEmail =
    process.env.PLACEMENT_LEAD_EMAIL?.trim() ??
    process.env.PARTNER_NOTIFY_EMAIL?.trim() ??
    'ryan@cealgreen.com';
  const resendKey = process.env.RESEND_API_KEY?.trim();
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
        replyTo: input.email,
        subject: `[Showcase RSVP] ${input.name}${input.company ? ` — ${input.company}` : ''}`,
        text: issueBody(input, notifyEmail),
      }),
    });
    if (res.ok) return { mode: 'resend', ok: true };
  }

  const token = process.env.GITHUB_TOKEN?.trim();
  const repo = process.env.PARTNER_GITHUB_REPO?.trim() ?? 'ryanroper79-alt/hult-cohort-program';
  const title = `[Showcase RSVP] ${input.name}`;

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
        body: issueBody(input, notifyEmail),
        labels: ['showcase-rsvp'],
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { html_url?: string };
      if (data.html_url) return { mode: 'github', issueUrl: data.html_url };
    }
  }

  console.info('[showcase:rsvp]', JSON.stringify({ ...input, notifyEmail, receivedAt: new Date().toISOString() }));
  return { mode: 'log', ok: true };
}
