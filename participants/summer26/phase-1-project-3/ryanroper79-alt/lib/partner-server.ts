import { positioning } from '@/data/cohort';
import {
  interestTypes,
  problemDomains,
  partnerSolutions,
  type InterestType,
  type ProblemDomain,
} from '@/data/solutions';
import { participants } from '@/data/participants';

export type PartnerInquiry = {
  name: string;
  email: string;
  organisation: string;
  website?: string;
  linkedin?: string;
  interestType: InterestType;
  builderHandle?: string;
  problemDomain: ProblemDomain;
  solutionSlug?: string;
  message: string;
};

const INTEREST_LABELS = Object.fromEntries(interestTypes.map((t) => [t.value, t.label])) as Record<
  InterestType,
  string
>;
const DOMAIN_LABELS = Object.fromEntries(problemDomains.map((d) => [d.value, d.label])) as Record<
  ProblemDomain,
  string
>;

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

function optionalEmail(value: unknown): string | undefined {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error('Email must be valid.');
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

  const interestType = String(body.interestType ?? 'general') as InterestType;
  if (!interestTypes.some((t) => t.value === interestType)) {
    throw new Error('Select an interest type.');
  }

  const problemDomain = String(body.problemDomain ?? 'other') as ProblemDomain;
  if (!problemDomains.some((d) => d.value === problemDomain)) {
    throw new Error('Select a problem domain.');
  }

  const builderHandle = String(body.builderHandle ?? '').trim() || undefined;
  if (builderHandle && !participants.some((p) => p.handle === builderHandle)) {
    throw new Error('Unknown builder selected.');
  }

  const solutionSlug = String(body.solutionSlug ?? '').trim() || undefined;
  if (solutionSlug && !partnerSolutions.some((s) => s.slug === solutionSlug)) {
    throw new Error('Unknown solution selected.');
  }

  return {
    name,
    email,
    organisation,
    website: optionalUrl(body.website, 'Website'),
    linkedin: optionalUrl(body.linkedin, 'LinkedIn'),
    interestType,
    builderHandle,
    problemDomain,
    solutionSlug,
    message,
  };
}

function labelBuilder(handle?: string) {
  if (!handle) return '_not specified_';
  return participants.find((p) => p.handle === handle)?.displayName ?? `@${handle}`;
}

function labelSolution(slug?: string) {
  if (!slug) return '_not specified_';
  return partnerSolutions.find((s) => s.slug === slug)?.title ?? slug;
}

function issueBody(input: PartnerInquiry, notifyEmail: string) {
  return [
    '## Partner enquiry — Hult Summer Pilot 2026',
    '',
    `**Organization:** ${input.organisation}`,
    `**Contact:** ${input.name}`,
    `**Email:** ${input.email}`,
    `**Website:** ${input.website ?? '_not provided_'}`,
    `**LinkedIn:** ${input.linkedin ?? '_not provided_'}`,
    `**Interest type:** ${INTEREST_LABELS[input.interestType]}`,
    `**Builder:** ${labelBuilder(input.builderHandle)}`,
    `**Problem domain:** ${DOMAIN_LABELS[input.problemDomain]}`,
    `**Solution:** ${labelSolution(input.solutionSlug)}`,
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
        replyTo: input.email,
        subject: `[Partner enquiry] ${INTEREST_LABELS[input.interestType]} — ${input.organisation}`,
        text: issueBody(input, notifyEmail),
      }),
    });
    if (res.ok) return { mode: 'resend', ok: true };
  }

  const token = process.env.GITHUB_TOKEN?.trim();
  const repo = process.env.PARTNER_GITHUB_REPO?.trim() ?? 'ryanroper79-alt/hult-cohort-program';
  const title = `[Partner enquiry] ${INTEREST_LABELS[input.interestType]} — ${input.organisation}`;

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
        labels: ['partner-inquiry'],
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { html_url?: string };
      if (data.html_url) return { mode: 'github', issueUrl: data.html_url };
    }
  }

  const fallback =
    'https://github.com/ryanroper79-alt/hult-cohort-program/issues/new?labels=partner-inquiry&title=%5BPartner%20enquiry%5D';
  return { mode: 'github-fallback', issueUrl: fallback };
}
