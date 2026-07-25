/** Emails that should receive admin role (PRD §2). */
export const ADMIN_EMAILS = [
  "admin@conexus.local",
  "lorrainevillaroel@gmail.com",
];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
