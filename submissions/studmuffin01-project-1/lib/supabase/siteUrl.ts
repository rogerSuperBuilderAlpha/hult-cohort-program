const DEFAULT_DEV_SITE_URL = "http://localhost:3000";

/** Env-only site URL (for diagnostics / health). Empty string if unset. */
export function getConfiguredSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? "";
}

/** Site URL for auth email links — env, then request origin, then browser, then dev default. */
export function getSiteUrl(origin?: string): string {
  const configured = getConfiguredSiteUrl();
  if (configured) {
    return configured;
  }

  if (origin) {
    return origin.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return DEFAULT_DEV_SITE_URL;
}

export function getAuthCallbackUrl(origin?: string): string {
  return `${getSiteUrl(origin)}/auth/callback`;
}
