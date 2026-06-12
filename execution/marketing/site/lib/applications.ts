export type ApplicationConfirmations = {
  githubAge: boolean;
  tuitionAffordable: boolean;
  publicWork: boolean;
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
  cohort: 'fall26';
  status: 'submitted';
};

const REQUIRED: (keyof Omit<ApplicationInput, 'hultStudentId' | 'confirmations'>)[] = [
  'firstName',
  'lastName',
  'email',
  'githubUrl',
  'motivation',
  'project1Idea',
  'timezone',
  'campus',
  'referralSource',
];

export function parseGithubHandle(url: string): string | null {
  const match = url.trim().match(/^https:\/\/github\.com\/([a-zA-Z0-9-]+)\/?$/i);
  return match ? match[1].toLowerCase() : null;
}

function parseConfirmations(body: Record<string, string>): ApplicationConfirmations {
  if (body.confirmGithubAge !== 'on') {
    throw new Error('You must confirm your GitHub account meets the minimum requirements.');
  }
  if (body.confirmTuition !== 'on') {
    throw new Error('You must confirm tuition and tooling costs.');
  }
  if (body.confirmPublicWork !== 'on') {
    throw new Error('You must confirm your work will be public on GitHub.');
  }
  return {
    githubAge: true,
    tuitionAffordable: true,
    publicWork: true,
  };
}

export function validateApplication(body: Record<string, string>): ApplicationInput {
  for (const field of REQUIRED) {
    if (!body[field]?.trim()) {
      throw new Error(`Missing field: ${field}`);
    }
  }
  if (!parseGithubHandle(body.githubUrl)) {
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
    githubUrl: body.githubUrl.trim(),
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
  const handle = parseGithubHandle(input.githubUrl);
  if (!handle) throw new Error('Invalid GitHub URL');

  return {
    ...input,
    id,
    githubHandle: handle,
    cohort: 'fall26',
    status: 'submitted',
  };
}

export function takeHomeRepoUrl(): string {
  return (
    process.env.NEXT_PUBLIC_TAKE_HOME_REPO_URL ||
    'https://github.com/rogerSuperBuilderAlpha/admissions-task-board-fall26'
  );
}
