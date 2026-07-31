import { FORTH_BASE_URL } from "@/lib/forth";

/** Allow only http(s) URLs, optionally restricted to known demo hosts. */
export function isSafeHttpUrl(raw: string | undefined | null): boolean {
  if (!raw || typeof raw !== "string") return false;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (url.username || url.password) return false;
    return true;
  } catch {
    return false;
  }
}

function forthOrigin(): string {
  try {
    return new URL(FORTH_BASE_URL).origin;
  } catch {
    return "https://forth-bice.vercel.app";
  }
}

/** Task / ticket links must be safe http(s) on the Forth origin. */
export function safeExternalHref(raw: string | undefined | null): string | null {
  if (!raw || !isSafeHttpUrl(raw)) return null;
  try {
    const url = new URL(raw);
    if (url.origin !== forthOrigin()) return null;
    return raw;
  } catch {
    return null;
  }
}
