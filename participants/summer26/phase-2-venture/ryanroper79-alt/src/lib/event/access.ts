/** Shared presentation / cohort access — no Ludwitt login required. */

export function isEventModeEnabled(): boolean {
  if (process.env.EVENT_MODE?.trim() === 'true') return true;
  return getEventEndsAt() != null;
}

export function getEventEndsAt(): Date | null {
  const raw = process.env.EVENT_ENDS_AT?.trim();
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isEventWindowOpen(): boolean {
  const endsAt = getEventEndsAt();
  if (!endsAt) return process.env.EVENT_MODE?.trim() === 'true';
  return new Date() < endsAt;
}

export function getEventAccessCode(): string | null {
  const code = process.env.EVENT_ACCESS_CODE?.trim();
  return code || null;
}

export function verifyEventAccessCode(code: string | null | undefined): boolean {
  const expected = getEventAccessCode();
  if (!expected || !code) return false;
  return code.trim() === expected;
}

export function eventSessionMaxAgeSec(): number {
  const configured = parseInt(process.env.EVENT_SESSION_HOURS || '12', 10);
  return Math.max(1, configured) * 60 * 60;
}

export function getEventJoinUrl(baseUrl: string): string | null {
  const code = getEventAccessCode();
  if (!code || !isEventModeEnabled()) return null;
  return `${baseUrl.replace(/\/$/, '')}/event/join?code=${encodeURIComponent(code)}`;
}
