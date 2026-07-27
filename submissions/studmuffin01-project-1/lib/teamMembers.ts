export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  email: string;
  /** Full display name for task assignee matching (First Last). */
  name: string;
}

export interface NewTeamMemberInput {
  firstName: string;
  lastName: string;
  department: string;
  email: string;
}

export const TEAM_MEMBERS_STORAGE_KEY = "initiara-team-members";
export const MEMBER_NAME_MAX_LENGTH = 60;
export const MEMBER_FIRST_NAME_MAX_LENGTH = 40;
export const MEMBER_LAST_NAME_MAX_LENGTH = 40;
export const MEMBER_DEPARTMENT_MAX_LENGTH = 60;
export const MEMBER_EMAIL_MAX_LENGTH = 120;
export const MAX_TEAM_MEMBERS = 50;

export function sanitizeMemberName(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, MEMBER_NAME_MAX_LENGTH);
}

export function sanitizeMemberField(value: string, maxLength: number): string {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function sanitizeMemberEmail(value: string): string {
  return value.trim().toLowerCase().slice(0, MEMBER_EMAIL_MAX_LENGTH);
}

export function buildMemberDisplayName(firstName: string, lastName: string): string {
  return sanitizeMemberName([firstName.trim(), lastName.trim()].filter(Boolean).join(" "));
}

function splitLegacyName(name: string): { firstName: string; lastName: string } {
  const sanitized = sanitizeMemberName(name);
  if (!sanitized) {
    return { firstName: "", lastName: "" };
  }

  const parts = sanitized.split(" ");
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function createMemberId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `member-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeTeamMember(record: Record<string, unknown>): TeamMember | null {
  const id =
    typeof record.id === "string" && record.id.trim() ? record.id.trim() : createMemberId();

  let firstName =
    typeof record.firstName === "string"
      ? sanitizeMemberField(record.firstName, MEMBER_FIRST_NAME_MAX_LENGTH)
      : "";
  let lastName =
    typeof record.lastName === "string"
      ? sanitizeMemberField(record.lastName, MEMBER_LAST_NAME_MAX_LENGTH)
      : "";
  const department =
    typeof record.department === "string"
      ? sanitizeMemberField(record.department, MEMBER_DEPARTMENT_MAX_LENGTH)
      : "";
  const email =
    typeof record.email === "string" ? sanitizeMemberEmail(record.email) : "";

  let name = buildMemberDisplayName(firstName, lastName);

  if (!name && typeof record.name === "string") {
    name = sanitizeMemberName(record.name);
    if (name && !firstName) {
      const legacy = splitLegacyName(name);
      firstName = legacy.firstName;
      lastName = legacy.lastName;
    }
  }

  if (!name) {
    return null;
  }

  if (!firstName) {
    const legacy = splitLegacyName(name);
    firstName = legacy.firstName;
    lastName = lastName || legacy.lastName;
  }

  return {
    id,
    firstName,
    lastName,
    department,
    email,
    name,
  };
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

    const member = normalizeTeamMember(item as Record<string, unknown>);
    if (member) {
      members.push(member);
    }
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

export function createTeamMember(input: NewTeamMemberInput): TeamMember | null {
  const firstName = sanitizeMemberField(input.firstName, MEMBER_FIRST_NAME_MAX_LENGTH);
  const lastName = sanitizeMemberField(input.lastName, MEMBER_LAST_NAME_MAX_LENGTH);
  const department = sanitizeMemberField(input.department, MEMBER_DEPARTMENT_MAX_LENGTH);
  const email = sanitizeMemberEmail(input.email);
  const name = buildMemberDisplayName(firstName, lastName);

  if (!name) {
    return null;
  }

  return {
    id: createMemberId(),
    firstName,
    lastName,
    department,
    email,
    name,
  };
}

function pickNonEmpty(...values: (string | undefined)[]): string {
  for (const value of values) {
    if (value?.trim()) {
      return value.trim();
    }
  }

  return "";
}

/** Merge roster entries by id, keeping non-empty field values from either source. */
export function mergeTeamMembers(local: TeamMember[], remote: TeamMember[]): TeamMember[] {
  const localById = new Map(local.map((member) => [member.id, member]));
  const merged: TeamMember[] = [];
  const consumedIds = new Set<string>();

  for (const remoteMember of remote) {
    const localMember = localById.get(remoteMember.id);
    const firstName = pickNonEmpty(remoteMember.firstName, localMember?.firstName);
    const lastName = pickNonEmpty(remoteMember.lastName, localMember?.lastName);
    const department = pickNonEmpty(remoteMember.department, localMember?.department);
    const email = pickNonEmpty(remoteMember.email, localMember?.email);
    const name =
      buildMemberDisplayName(firstName, lastName) ||
      pickNonEmpty(remoteMember.name, localMember?.name);

    if (!name) {
      continue;
    }

    consumedIds.add(remoteMember.id);
    merged.push({
      id: remoteMember.id,
      firstName,
      lastName,
      department,
      email,
      name,
    });
  }

  for (const localMember of local) {
    if (consumedIds.has(localMember.id) || !localMember.name.trim()) {
      continue;
    }

    merged.push(localMember);
  }

  return merged.slice(0, MAX_TEAM_MEMBERS);
}

export function isDuplicateMember(
  members: TeamMember[],
  input: NewTeamMemberInput,
  excludeMemberId?: string
): boolean {
  const name = buildMemberDisplayName(input.firstName, input.lastName);
  const email = sanitizeMemberEmail(input.email);

  return members.some((member) => {
    if (excludeMemberId && member.id === excludeMemberId) {
      return false;
    }

    if (email && member.email && member.email === email) {
      return true;
    }

    return Boolean(name) && member.name.toLowerCase() === name.toLowerCase();
  });
}
