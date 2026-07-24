import type { Profile } from "@/lib/types";

export function parseAdminEmails(raw: string | undefined): Set<string> {
  if (!raw?.trim()) return new Set();
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function resolveRoleForEmail(
  email: string,
  adminEmails: Set<string>,
): Profile["role"] {
  return adminEmails.has(email.trim().toLowerCase()) ? "admin" : "member";
}

export function isAdminProfile(profile: Pick<Profile, "role"> | null): boolean {
  return profile?.role === "admin";
}
