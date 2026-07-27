/**
 * Initiative definitions for the executive summary table and detail pages.
 */

export interface Initiative {
  slug: string;
  title: string;
  deadline: string;
  archived?: boolean;
}

export const INITIATIVE_TITLE_MAX_LENGTH = 120;
export const EXECUTIVE_SUMMARY_MIN_ROW_COUNT = 3;
export const CUSTOM_INITIATIVES_STORAGE_KEY = "initiara-custom-initiatives";
export const CUSTOM_INITIATIVES_SCHEMA_VERSION = 3;
export const CUSTOM_INITIATIVES_VERSION_KEY = "initiara-custom-initiatives-version";
export const MAX_CUSTOM_INITIATIVES_STORAGE_BYTES = 100_000;

/** Legacy Summer Pilot curriculum slugs — stripped from stored custom initiatives. */
const LEGACY_CURRICULUM_SLUGS = new Set([
  "week-1-project-management-platform",
  "week-2-internal-communications-platform",
  "week-3-vibe-marketing-platform",
  "week-4-learning-engineer-integration-to-ludwitt",
  "week-5-startup-entrepreneurship",
  "week-6-open-source-swarm",
]);

/** Legacy Summer Pilot curriculum titles — stripped from stored custom initiatives. */
const LEGACY_CURRICULUM_TITLES = new Set([
  "Week 1 - Project Management Platform",
  "Week 2 - Internal Communications Platform",
  "Week 3 - Vibe Marketing Platform",
  "Week 4 - Learning Engineer Integration To Ludwitt",
  "Week 5 - Startup/Entrepreneurship",
  "Week 6 - Open Source Swarm",
]);

const GENERIC_INITIATIVE_LABEL = /^INITIATIVE \d+$/i;

export function sanitizeInitiativeTitle(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, INITIATIVE_TITLE_MAX_LENGTH);
}

function slugifyTitle(title: string): string {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "initiative";

  return `${base}-${Date.now().toString(36)}`;
}

export function createInitiative(title: string): Initiative {
  const sanitizedTitle = sanitizeInitiativeTitle(title);

  return {
    slug: slugifyTitle(sanitizedTitle),
    title: sanitizedTitle,
    deadline: "",
  };
}

function parseCustomInitiatives(raw: unknown): Initiative[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const parsed: Initiative[] = [];

  for (const item of raw) {
    if (typeof item !== "object" || item === null) {
      continue;
    }

    const record = item as Record<string, unknown>;
    const slug = typeof record.slug === "string" ? record.slug.trim() : "";
    const title =
      typeof record.title === "string" ? sanitizeInitiativeTitle(record.title) : "";
    const rawDeadline =
      typeof record.deadline === "string" ? record.deadline.trim() : "";
    const deadline =
      rawDeadline.length > 0 && rawDeadline.toUpperCase() !== "TBD" ? rawDeadline : "";

    if (!slug || !title) {
      continue;
    }

    const archived = record.archived === true;

    parsed.push({ slug, title, deadline, archived: archived || undefined });
  }

  return parsed;
}

export function filterActiveInitiatives(initiatives: Initiative[]): Initiative[] {
  return initiatives.filter((initiative) => !initiative.archived);
}

export function filterArchivedInitiatives(initiatives: Initiative[]): Initiative[] {
  return initiatives.filter((initiative) => initiative.archived);
}

/** Keep only user-created initiatives (exclude legacy curriculum placeholders). */
export function normalizeCustomInitiatives(customInitiatives: Initiative[]): Initiative[] {
  return customInitiatives
    .filter(
      (initiative) =>
        !LEGACY_CURRICULUM_SLUGS.has(initiative.slug) &&
        !LEGACY_CURRICULUM_TITLES.has(initiative.title) &&
        !GENERIC_INITIATIVE_LABEL.test(initiative.title)
    );
}

function readCustomInitiativesSchemaVersion(): number {
  if (typeof window === "undefined") {
    return CUSTOM_INITIATIVES_SCHEMA_VERSION;
  }

  const raw = localStorage.getItem(CUSTOM_INITIATIVES_VERSION_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

function writeCustomInitiativesSchemaVersion(version: number): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(CUSTOM_INITIATIVES_VERSION_KEY, String(version));
}

export function loadCustomInitiatives(): Initiative[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedVersion = readCustomInitiativesSchemaVersion();
    if (storedVersion !== CUSTOM_INITIATIVES_SCHEMA_VERSION) {
      writeCustomInitiativesSchemaVersion(CUSTOM_INITIATIVES_SCHEMA_VERSION);
    }

    const raw = localStorage.getItem(CUSTOM_INITIATIVES_STORAGE_KEY);
    if (!raw) return [];
    if (raw.length > MAX_CUSTOM_INITIATIVES_STORAGE_BYTES) return [];

    const parsed = parseCustomInitiatives(JSON.parse(raw));
    const normalized = normalizeCustomInitiatives(parsed);
    if (normalized.length !== parsed.length) {
      saveCustomInitiatives(normalized);
    }

    return normalized;
  } catch {
    return [];
  }
}

export function saveCustomInitiatives(customInitiatives: Initiative[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const serialized = JSON.stringify(customInitiatives);
    if (serialized.length > MAX_CUSTOM_INITIATIVES_STORAGE_BYTES) return;
    localStorage.setItem(CUSTOM_INITIATIVES_STORAGE_KEY, serialized);
    writeCustomInitiativesSchemaVersion(CUSTOM_INITIATIVES_SCHEMA_VERSION);
  } catch {
    // Ignore quota or serialization errors.
  }
}

/** Validates slug keys in persisted JSON (custom slugs are not always in localStorage). */
export function isInitiativeSlugKey(slug: string): boolean {
  return slug.length > 0 && slug.length <= 80 && /^[a-z0-9-]+$/.test(slug);
}

export function getInitiativeAnchorId(slug: string): string {
  return `initiative-${slug}`;
}

/** Row count for the Executive Summary table (minimum three, grows with more initiatives). */
export function getExecutiveSummaryRowCount(initiativeCount: number): number {
  return Math.max(EXECUTIVE_SUMMARY_MIN_ROW_COUNT, initiativeCount);
}
