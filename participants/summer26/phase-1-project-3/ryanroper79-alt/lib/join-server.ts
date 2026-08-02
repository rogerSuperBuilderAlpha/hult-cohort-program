import { positioning } from '@/data/cohort';

export type JoinRequest = {
  handle: string;
  headline: string;
  github?: string;
  site?: string;
  linkedin?: string;
};

const HANDLE_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

function optionalUrl(value: unknown, label: string): string | undefined {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error(`${label} must use http or https.`);
    }
    return url.toString();
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }
}

export function validateJoinRequest(body: Record<string, unknown>): JoinRequest {
  const handle = String(body.handle ?? '').trim();
  if (!handle || !HANDLE_RE.test(handle)) {
    throw new Error('Enter a valid GitHub handle (letters, numbers, hyphens).');
  }

  const headline = String(body.headline ?? '').trim();
  if (headline.length < 10 || headline.length > 240) {
    throw new Error('Headline is required — one human line, 10–240 characters.');
  }

  return {
    handle,
    headline,
    github: optionalUrl(body.github, 'GitHub URL'),
    site: optionalUrl(body.site, 'Site URL'),
    linkedin: optionalUrl(body.linkedin, 'LinkedIn URL'),
  };
}

function issueBody(input: JoinRequest, notifyEmail: string): string {
  const github = input.github ?? `https://github.com/${input.handle}`;

  return [
    '## Join request — Summer Pilot 2026 showcase',
    '',
    `**Handle:** @${input.handle}`,
    `**Headline:** ${input.headline}`,
    '',
    '### Links',
    `- GitHub: ${github}`,
    `- Site: ${input.site ?? '_not provided_'}`,
    `- LinkedIn: ${input.linkedin ?? '_not provided_'}`,
    '',
    '---',
    `Submitted via /join on ${positioning.productionDomain}`,
    `Notify: ${notifyEmail}`,
    '',
    '_Paste into data/participants.ts and redeploy to publish the profile._',
  ].join('\n');
}

export type JoinSubmitResult =
  | { mode: 'github'; issueUrl: string }
  | { mode: 'mailto'; mailto: string; subject: string };

export async function submitJoinRequest(input: JoinRequest): Promise<JoinSubmitResult> {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repo = process.env.JOIN_GITHUB_REPO?.trim() ?? 'ryanroper79-alt/hult-cohort-program';
  const notifyEmail = process.env.JOIN_NOTIFY_EMAIL?.trim() ?? 'ryan@cealgreen.com';

  if (!token) {
    const subject = encodeURIComponent(`Join request — @${input.handle}`);
    const body = encodeURIComponent(
      [
        `Handle: @${input.handle}`,
        `Headline: ${input.headline}`,
        `GitHub: ${input.github ?? `https://github.com/${input.handle}`}`,
        input.site ? `Site: ${input.site}` : '',
        input.linkedin ? `LinkedIn: ${input.linkedin}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    );

    return {
      mode: 'mailto',
      mailto: `mailto:${notifyEmail}?subject=${subject}&body=${body}`,
      subject: `Join request — @${input.handle}`,
    };
  }

  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      title: `[Join request] @${input.handle}`,
      body: issueBody(input, notifyEmail),
    }),
  });

  if (!res.ok) {
    throw new Error('Unable to open join request — try again or email us directly.');
  }

  const data = (await res.json()) as { html_url?: string };
  if (!data.html_url) {
    throw new Error('Join request submitted but no issue URL returned.');
  }

  return { mode: 'github', issueUrl: data.html_url };
}
