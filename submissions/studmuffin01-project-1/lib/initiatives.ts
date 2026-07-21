/**
 * Initiative definitions for the executive summary table and detail pages.
 */

export interface Initiative {
  slug: string;
  title: string;
  deadline: string;
}

export const INITIATIVE_TITLE_MAX_LENGTH = 120;
export const EXECUTIVE_SUMMARY_MIN_ROW_COUNT = 3;
export const CUSTOM_INITIATIVES_STORAGE_KEY = "initiara-custom-initiatives";
export const CUSTOM_INITIATIVES_SCHEMA_VERSION = 2;
export const CUSTOM_INITIATIVES_VERSION_KEY = "initiara-custom-initiatives-version";
export const MAX_CUSTOM_INITIATIVES_STORAGE_BYTES = 100_000;

/** Built-in Summer Pilot initiatives (fixed order after any user-created rows). */
export const DEFAULT_INITIATIVES: Initiative[] = [
  {
    slug: "week-1-project-management-platform",
    title: "Week 1 - Project Management Platform",
    deadline: "TBD",
  },
  {
    slug: "week-2-internal-communications-platform",
    title: "Week 2 - Internal Communications Platform",
    deadline: "TBD",
  },
  {
    slug: "week-3-vibe-marketing-platform",
    title: "Week 3 - Vibe Marketing Platform",
    deadline: "TBD",
  },
  {
    slug: "week-4-learning-engineer-integration-to-ludwitt",
    title: "Week 4 - Learning Engineer Integration To Ludwitt",
    deadline: "TBD",
  },
  {
    slug: "week-5-startup-entrepreneurship",
    title: "Week 5 - Startup/Entrepreneurship",
    deadline: "TBD",
  },
  {
    slug: "week-6-open-source-swarm",
    title: "Week 6 - Open Source Swarm",
    deadline: "TBD",
  },
];

/** @deprecated Use DEFAULT_INITIATIVES or mergeInitiatives() for the live list. */
export const initiatives = DEFAULT_INITIATIVES;

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
    deadline: "TBD",
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
    const deadline =
      typeof record.deadline === "string" && record.deadline.trim().length > 0
        ? record.deadline.trim()
        : "TBD";

    if (!slug || !title) {
      continue;
    }

    parsed.push({ slug, title, deadline });
  }

  return parsed;
}

const DEFAULT_INITIATIVE_SLUGS = new Set(DEFAULT_INITIATIVES.map((initiative) => initiative.slug));
const DEFAULT_INITIATIVE_TITLES = new Set(DEFAULT_INITIATIVES.map((initiative) => initiative.title));
const GENERIC_INITIATIVE_LABEL = /^INITIATIVE \d+$/i;

/** Keep only user-created initiatives (exclude built-in curriculum rows). */
export function normalizeCustomInitiatives(customInitiatives: Initiative[]): Initiative[] {
  return customInitiatives
    .filter(
      (initiative) =>
        !DEFAULT_INITIATIVE_SLUGS.has(initiative.slug) &&
        !DEFAULT_INITIATIVE_TITLES.has(initiative.title) &&
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
      localStorage.removeItem(CUSTOM_INITIATIVES_STORAGE_KEY);
      writeCustomInitiativesSchemaVersion(CUSTOM_INITIATIVES_SCHEMA_VERSION);
      return [];
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

export function mergeInitiatives(
  customInitiatives: Initiative[],
  defaults: Initiative[] = DEFAULT_INITIATIVES
): Initiative[] {
  return [...customInitiatives, ...defaults];
}

export function getAllInitiatives(customInitiatives?: Initiative[]): Initiative[] {
  return mergeInitiatives(customInitiatives ?? loadCustomInitiatives());
}

export function getAllInitiativeSlugs(customInitiatives?: Initiative[]): Set<string> {
  return new Set(getAllInitiatives(customInitiatives).map((initiative) => initiative.slug));
}

export function getInitiativeBySlug(
  slug: string,
  allInitiatives?: Initiative[]
): Initiative | undefined {
  const list = allInitiatives ?? getAllInitiatives();
  return list.find((initiative) => initiative.slug === slug);
}

export function getInitiativeAnchorId(slug: string): string {
  return `initiative-${slug}`;
}

/** Row count for the Executive Summary table (minimum three, grows with more initiatives). */
export function getExecutiveSummaryRowCount(initiativeCount: number): number {
  return Math.max(EXECUTIVE_SUMMARY_MIN_ROW_COUNT, initiativeCount);
}
