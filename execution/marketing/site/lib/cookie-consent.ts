export const COOKIE_CONSENT_KEY = 'cookie-consent';

export type CookieConsentValue = 'accepted' | 'declined';

export function getStoredConsent(): CookieConsentValue | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  if (raw === 'accepted' || raw === 'declined') return raw;
  return null;
}

export function storeConsent(value: CookieConsentValue): void {
  window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: value }));
}
