export type ApplicationInput = {
  email: string;
  githubUrl: string;
  motivation: string;
  project1Idea: string;
  timezone: string;
  campus: string;
  referralSource: string;
  hultStudentId?: string;
};

export type ApplicationRecord = ApplicationInput & {
  id: string;
  githubHandle: string;
  cohort: 'fall26';
  status: 'submitted';
  submittedAt: string;
  updatedAt: string;
};

const REQUIRED: (keyof ApplicationInput)[] = [
  'githubUrl',
  'motivation',
  'project1Idea',
  'timezone',
  'campus',
  'referralSource',
  'email',
];

export function parseGithubHandle(url: string): string | null {
  const match = url.trim().match(/^https:\/\/github\.com\/([a-zA-Z0-9-]+)\/?$/i);
  return match ? match[1].toLowerCase() : null;
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
  return {
    email: body.email.trim(),
    githubUrl: body.githubUrl.trim(),
    motivation: body.motivation.trim(),
    project1Idea: body.project1Idea.trim(),
    timezone: body.timezone.trim(),
    campus: body.campus.trim(),
    referralSource: body.referralSource.trim(),
    hultStudentId: body.hultStudentId?.trim() || undefined,
  };
}

export function buildApplicationRecord(input: ApplicationInput, id: string): ApplicationRecord {
  const now = new Date().toISOString();
  const handle = parseGithubHandle(input.githubUrl);
  if (!handle) throw new Error('Invalid GitHub URL');

  return {
    ...input,
    id,
    githubHandle: handle,
    cohort: 'fall26',
    status: 'submitted',
    submittedAt: now,
    updatedAt: now,
  };
}
