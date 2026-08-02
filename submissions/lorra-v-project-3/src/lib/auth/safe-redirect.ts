/**
 * Normalize post-login redirect targets.
 * Rejects open redirects and wildcard patterns.
 */
export function safeRedirectPath(
  next: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!next) return fallback;

  let path = next.trim();
  try {
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
