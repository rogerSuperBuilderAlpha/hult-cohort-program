/** Shared caps for public demo forms (intro + RSVP). */
export const MAX_NAME_LEN = 120;
export const MAX_COMPANY_LEN = 160;
export const MAX_EMAIL_LEN = 254;
export const MAX_MESSAGE_LEN = 4000;
export const MAX_STUDENT_HANDLES = 40;

export function clampText(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max);
}
