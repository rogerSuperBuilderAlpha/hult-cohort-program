/**
 * Normalize post-login redirect targets.
 * Rejects Supabase wildcard patterns like `/**` that would 404.
 */
export function safeRedirectPath(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback;

  let path = next.trim();
  try {
    // Absolute URLs → use pathname only (same-origin assumed by callers)
    if (/^https?:\/\//i.test(path)) {
      path = new URL(path).pathname;
    }
  } catch {
    return fallback;
  }

  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//")) return fallback;
  if (path.includes("*")) return fallback;
  if (path.includes("\\")) return fallback;
  if (/[\x00-\x1f]/.test(path)) return fallback;

  return path;
}
