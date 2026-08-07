/**
 * Cohort / self identifiers that must never launch into a learner session.
 * Checked as case-insensitive substrings against launch JWT `sub` and `email`.
 * Add more handles here as needed — do not scatter checks elsewhere.
 */
export const BLOCKED_IDENTIFIER_SUBSTRINGS = [
  "lorra-v",
] as const;

export function containsBlockedIdentifier(value: string): boolean {
  const lower = value.toLowerCase();
  return BLOCKED_IDENTIFIER_SUBSTRINGS.some((blocked) =>
    lower.includes(blocked.toLowerCase()),
  );
}
