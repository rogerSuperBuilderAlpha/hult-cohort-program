import type { WorkspaceRole } from "./types";

// Client-safe role helpers (no server imports).
export const ROLE_RANK: Record<WorkspaceRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  MANAGER: 2,
  MEMBER: 1,
  GUEST: 0,
};

export const ROLE_LABELS: Record<WorkspaceRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MANAGER: "Manager",
  MEMBER: "Member",
  GUEST: "Guest",
};

export const ASSIGNABLE_ROLES: WorkspaceRole[] = [
  "ADMIN",
  "MANAGER",
  "MEMBER",
  "GUEST",
];

export function atLeast(role: WorkspaceRole, min: WorkspaceRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

export function canManageWorkspace(role: WorkspaceRole): boolean {
  return atLeast(role, "ADMIN");
}

export function canManageProjects(role: WorkspaceRole): boolean {
  return atLeast(role, "MANAGER");
}

export function canEditTasks(role: WorkspaceRole): boolean {
  return atLeast(role, "MEMBER");
}
