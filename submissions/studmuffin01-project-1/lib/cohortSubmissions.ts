/**
 * Cohort submission types and calculations for initiative summary tables.
 */

import { initiatives } from "@/lib/initiatives";

export const COHORT_ROW_COUNT = 67;
export const COHORT_NAME_MAX_LENGTH = 30;
export const MAX_STORAGE_BYTES = 1_000_000;

export const SUBMISSION_FIELDS = [
  "pullRequestMerged",
  "firstReviewSubmitted",
  "secondReviewSubmitted",
  "firstVoteSubmitted",
  "secondVoteSubmitted",
] as const;

export type SubmissionField = (typeof SUBMISSION_FIELDS)[number];

export interface RowSubmission {
  name: string;
  pullRequestMerged: boolean;
  firstReviewSubmitted: boolean;
  secondReviewSubmitted: boolean;
  firstVoteSubmitted: boolean;
  secondVoteSubmitted: boolean;
}

export type InitiativeSubmissions = Record<number, RowSubmission>;
export type AllSubmissions = Record<string, InitiativeSubmissions>;

export const COHORT_SUBMISSIONS_STORAGE_KEY = "initiara-cohort-submissions";

const VALID_INITIATIVE_SLUGS = new Set(initiatives.map((initiative) => initiative.slug));

export function sanitizeCohortName(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").slice(0, COHORT_NAME_MAX_LENGTH);
}

export function emptyRowSubmission(): RowSubmission {
  return {
    name: "",
    pullRequestMerged: false,
    firstReviewSubmitted: false,
    secondReviewSubmitted: false,
    firstVoteSubmitted: false,
    secondVoteSubmitted: false,
  };
}

const EMPTY_ROW = emptyRowSubmission();

export function getRowSubmission(
  submissions: InitiativeSubmissions,
  rowNumber: number
): RowSubmission {
  return submissions[rowNumber] ?? EMPTY_ROW;
}

export function calculateRowStatus(row: RowSubmission): number {
  const completed = SUBMISSION_FIELDS.filter((field) => row[field]).length;
  return Math.round((completed / SUBMISSION_FIELDS.length) * 100);
}

function rowHasAnySubmission(row: RowSubmission): boolean {
  return row.name.length > 0 || SUBMISSION_FIELDS.some((field) => row[field]);
}

/** Rows with activity, as a percentage of 67 cohort rows (one decimal place). */
export function calculateCohortSubmissionPercent(
  submissions: InitiativeSubmissions | undefined
): number {
  let rowsWithEntries = 0;

  for (let rowNumber = 1; rowNumber <= COHORT_ROW_COUNT; rowNumber++) {
    const row = getRowSubmission(submissions ?? {}, rowNumber);
    if (rowHasAnySubmission(row)) {
      rowsWithEntries++;
    }
  }

  return Math.round((rowsWithEntries / COHORT_ROW_COUNT) * 1000) / 10;
}

export function loadCohortSubmissions(): AllSubmissions {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(COHORT_SUBMISSIONS_STORAGE_KEY);
    if (!raw) return {};
    if (raw.length > MAX_STORAGE_BYTES) return {};
    return parseCohortSubmissions(JSON.parse(raw));
  } catch {
    return {};
  }
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function parseRowSubmission(value: unknown): RowSubmission {
  if (typeof value !== "object" || value === null) {
    return emptyRowSubmission();
  }

  const row = value as Record<string, unknown>;

  return {
    name: typeof row.name === "string" ? sanitizeCohortName(row.name) : "",
    pullRequestMerged: isBoolean(row.pullRequestMerged) ? row.pullRequestMerged : false,
    firstReviewSubmitted: isBoolean(row.firstReviewSubmitted) ? row.firstReviewSubmitted : false,
    secondReviewSubmitted: isBoolean(row.secondReviewSubmitted) ? row.secondReviewSubmitted : false,
    firstVoteSubmitted: isBoolean(row.firstVoteSubmitted) ? row.firstVoteSubmitted : false,
    secondVoteSubmitted: isBoolean(row.secondVoteSubmitted) ? row.secondVoteSubmitted : false,
  };
}

function parseCohortSubmissions(raw: unknown): AllSubmissions {
  if (typeof raw !== "object" || raw === null) {
    return {};
  }

  const parsed: AllSubmissions = {};

  for (const [slug, initiativeData] of Object.entries(raw)) {
    if (!VALID_INITIATIVE_SLUGS.has(slug)) {
      continue;
    }

    if (typeof initiativeData !== "object" || initiativeData === null) {
      continue;
    }

    const rows: InitiativeSubmissions = {};

    for (const [rowKey, rowValue] of Object.entries(initiativeData)) {
      const rowNumber = Number(rowKey);
      if (!Number.isInteger(rowNumber) || rowNumber < 1 || rowNumber > COHORT_ROW_COUNT) {
        continue;
      }

      rows[rowNumber] = parseRowSubmission(rowValue);
    }

    if (Object.keys(rows).length > 0) {
      parsed[slug] = rows;
    }
  }

  return parsed;
}

export function saveCohortSubmissions(submissions: AllSubmissions): void {
  if (typeof window === "undefined") return;

  try {
    const serialized = JSON.stringify(submissions);
    if (serialized.length > MAX_STORAGE_BYTES) return;
    localStorage.setItem(COHORT_SUBMISSIONS_STORAGE_KEY, serialized);
  } catch {
    // Ignore quota or serialization errors.
  }
}
