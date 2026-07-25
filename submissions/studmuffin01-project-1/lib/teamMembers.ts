export interface TeamMember {
  id: string;
  name: string;
}

export const TEAM_MEMBERS_STORAGE_KEY = "initiara-team-members";
export const MEMBER_NAME_MAX_LENGTH = 60;
export const MAX_TEAM_MEMBERS = 50;

export function sanitizeMemberName(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, MEMBER_NAME_MAX_LENGTH);
}

function createMemberId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `member-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function parseTeamMembers(raw: unknown): TeamMember[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const members: TeamMember[] = [];

  for (const item of raw) {
    if (typeof item !== "object" || item === null) {
      continue;
    }

    const record = item as Record<string, unknown>;
    const id = typeof record.id === "string" && record.id.trim() ? record.id.trim() : createMemberId();
    const name = typeof record.name === "string" ? sanitizeMemberName(record.name) : "";

    if (!name) {
      continue;
    }

    members.push({ id, name });
  }

  return members.slice(0, MAX_TEAM_MEMBERS);
}

export function loadTeamMembers(): TeamMember[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(TEAM_MEMBERS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    return parseTeamMembers(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveTeamMembers(members: TeamMember[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(TEAM_MEMBERS_STORAGE_KEY, JSON.stringify(members.slice(0, MAX_TEAM_MEMBERS)));
  } catch {
    // Ignore quota errors.
  }
}

export function createTeamMember(name: string): TeamMember | null {
  const sanitizedName = sanitizeMemberName(name);
  if (!sanitizedName) {
    return null;
  }

  return {
    id: createMemberId(),
    name: sanitizedName,
  };
}
