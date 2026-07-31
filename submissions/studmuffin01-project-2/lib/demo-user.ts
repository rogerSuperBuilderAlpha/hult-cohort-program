import type { Member, WorkspaceState } from "@/lib/types";

export const DEMO_USER_KEY = "fireside-demo-user";

export type DemoUserProfile = {
  name: string;
  email: string;
};

export function setDemoUser(profile: DemoUserProfile): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(DEMO_USER_KEY, JSON.stringify(profile));
}

export function getDemoUser(): DemoUserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DEMO_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DemoUserProfile>;
    const name = typeof parsed.name === "string" ? parsed.name.trim() : "";
    if (!name) return null;
    return {
      name,
      email:
        typeof parsed.email === "string" && parsed.email.trim()
          ? parsed.email.trim()
          : "",
    };
  } catch {
    return null;
  }
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "YO";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function handleFromProfile(profile: DemoUserProfile): string | undefined {
  const local = profile.email.split("@")[0]?.trim();
  if (local) {
    return local
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "")
      .slice(0, 24);
  }
  return undefined;
}

/** Apply the signed-in demo profile onto the current workspace member. */
export function applyDemoUserToWorkspace(
  state: WorkspaceState,
  profile: DemoUserProfile | null = getDemoUser()
): WorkspaceState {
  if (!profile) return state;

  const handle = handleFromProfile(profile);
  const initials = initialsFromName(profile.name);

  return {
    ...state,
    members: state.members.map((member: Member) =>
      member.id === state.currentUserId
        ? {
            ...member,
            name: profile.name,
            initials,
            ...(handle ? { handle } : {}),
          }
        : member
    ),
  };
}
