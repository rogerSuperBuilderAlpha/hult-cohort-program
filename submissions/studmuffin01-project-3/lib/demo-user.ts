export const DEMO_USER_KEY = "lighthouse-demo-user";

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
