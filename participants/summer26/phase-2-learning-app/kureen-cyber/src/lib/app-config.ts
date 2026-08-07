/** App-level flags — Ludwitt is optional while DEMO_MODE is on. */

export function isDemoMode(): boolean {
  const flag = process.env.DEMO_MODE?.trim().toLowerCase();
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;
  // Default: demo when Ludwitt client credentials are missing
  return !(
    process.env.LUDWITT_CLIENT_ID?.trim() &&
    process.env.LUDWITT_CLIENT_SECRET?.trim()
  );
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;
  // Dev fallback so the app boots without extra setup
  return "interview-forge-local-dev-secret-32chars!!";
}

export function getCookieSecure(): boolean {
  return process.env.COOKIE_SECURE === "true";
}
