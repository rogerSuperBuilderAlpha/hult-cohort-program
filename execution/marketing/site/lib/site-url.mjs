/** Canonical public site URL (no trailing slash). Shared by mailer scripts and site-config. */

const FALLBACK_SITE_URL = 'https://site-nine-rouge-68.vercel.app';

let warnedFallback = false;

function warnFallback(reason) {
  if (warnedFallback) return;
  warnedFallback = true;
  console.warn(
    `[site-url] NEXT_PUBLIC_SITE_URL unset — using fallback ${FALLBACK_SITE_URL} (${reason}). ` +
      'Set NEXT_PUBLIC_SITE_URL=https://cohorts.algorithmacy.org in Vercel production and local shells.'
  );
}

/** @returns {string} */
export function siteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    warnFallback('VERCEL_URL present but NEXT_PUBLIC_SITE_URL empty');
    return `https://${vercel.replace(/\/$/, '')}`;
  }

  warnFallback('no env set');
  return FALLBACK_SITE_URL;
}

export { FALLBACK_SITE_URL };
