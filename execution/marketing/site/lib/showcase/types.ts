import type { SubmissionEntry } from '@/lib/submissions-types';

export type ShowcaseProfile = {
  handle: string;
  displayName: string;
  campus: string | null;
  bio: string | null;
  githubUrl: string;
  photoUrl: string | null;
  isPrivate: boolean;
  submissions: SubmissionEntry[];
};

export type PmProjectSnapshot = {
  slug: string;
  title: string;
  phaseLabel: string;
  mergedCount: number;
  totalEnrolled: number;
};

export type PmSnapshot = {
  cohortId: string;
  enrolledCount: number;
  available: boolean;
  updatedAt: string;
  projects: PmProjectSnapshot[];
};

export type PartnerIntroInput = {
  partnerName: string;
  company: string;
  email: string;
  studentHandles: string[];
  message: string;
};
