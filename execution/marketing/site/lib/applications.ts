import { cohortId } from '@/lib/cohort-config';

export type ApplicationConfirmations = {
  toolingAcknowledged: boolean;
  publicWork: boolean;
  policies: boolean;
};

export type ApplicationInput = {
  firstName: string;
  lastName: string;
  email: string;
  githubUrl: string;
  motivation: string;
  project1Idea: string;
  timezone: string;
  campus: string;
  referralSource: string;
  hultStudentId?: string;
  confirmations: ApplicationConfirmations;
};

export type ApplicationRecord = ApplicationInput & {
  id: string;
  githubHandle: string;
  cohort: string;
  status: 'submitted';
};

const REQUIRED: (keyof Omit<ApplicationInput, 'hultStudentId' | 'confirmations' | 'githubUrl'>)[] =
  [
    'firstName',
    'lastName',
    'email',
    'motivation',
    'project1Idea',
    'timezone',
    'campus',
    'referralSource',
  ];

export function parseGithubUrlHandle(url: string): string | null {
  const match = url.trim().match(/^https:\/\/github\.com\/([a-zA-Z0-9-]+)\/?$/i);
  return match ? match[1].toLowerCase() : null;
}

function parseConfirmations(body: Record<string, string>): ApplicationConfirmations {
  if (body.confirmTooling !== 'on') {
    throw new Error('You must confirm required tooling costs.');
  }
  if (body.confirmPublicWork !== 'on') {
    throw new Error('You must confirm your work will be public on GitHub.');
  }
  if (body.confirmPolicies !== 'on') {
    throw new Error('You must agree to the Terms of Service and Privacy Policy.');
  }
  return {
    toolingAcknowledged: true,
    publicWork: true,
    policies: true,
  };
}

export function validateApplication(
  body: Record<string, string>,
  options: { githubUrl: string }
): ApplicationInput {
  for (const field of REQUIRED) {
    if (!body[field]?.trim()) {
      throw new Error(`Missing field: ${field}`);
    }
  }
  const githubUrl = options.githubUrl.trim();
  if (!parseGithubUrlHandle(githubUrl)) {
    throw new Error('GitHub URL must be https://github.com/{username}');
  }
  const email = body.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email address');
  }

  return {
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    email,
    githubUrl,
    motivation: body.motivation.trim(),
    project1Idea: body.project1Idea.trim(),
    timezone: body.timezone.trim(),
    campus: body.campus.trim(),
    referralSource: body.referralSource.trim(),
    hultStudentId: body.hultStudentId?.trim() || undefined,
    confirmations: parseConfirmations(body),
  };
}

export function buildApplicationRecord(input: ApplicationInput, id: string): ApplicationRecord {
  const handle = parseGithubUrlHandle(input.githubUrl);
  if (!handle) throw new Error('Invalid GitHub URL');

  return {
    ...input,
    id,
    githubHandle: handle,
    cohort: cohortId(),
    status: 'submitted',
  };
}

export function takeHomeRepoUrl(): string {
  return (
    process.env.NEXT_PUBLIC_TAKE_HOME_REPO_URL ||
    'https://github.com/rogerSuperBuilderAlpha/admissions-task-board-fall26'
  );
}
