import type { CrmContact, CrmContactInput } from '@/lib/crm/types';

const MAX_LEN = 500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimOrNull(value: unknown, max = MAX_LEN): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.slice(0, max);
}

export function normalizeCrmContact(input: CrmContactInput | undefined | null): CrmContact {
  const email = trimOrNull(input?.email, 254);
  if (email && !EMAIL_RE.test(email)) {
    throw new Error('Invalid email address format');
  }

  return {
    companyName: trimOrNull(input?.companyName, 200),
    address: trimOrNull(input?.address),
    email,
    phone: trimOrNull(input?.phone, 40),
  };
}

export function hasAnyContactField(contact: CrmContact): boolean {
  return Boolean(contact.companyName || contact.address || contact.email || contact.phone);
}

/** Minimum identity for live presentation / sheet rows */
export function hasEventContact(contact: CrmContact): boolean {
  return Boolean(contact.email && contact.companyName);
}
