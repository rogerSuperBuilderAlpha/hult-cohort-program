import { PITCHRISE_URL } from '@/content/pitchrise';

const FALLBACK_SITE_URL = 'https://site-nine-rouge-68.vercel.app';

/** Production origin for canonical, Open Graph, sitemap, and robots URLs. */
export const CANONICAL_SITE_ORIGIN = 'https://cohorts.algorithmacy.org';

/** Absolute URL on the production host, without a trailing slash. */
export function canonicalUrl(path = '/'): string {
  if (path === '/' || path === '') return CANONICAL_SITE_ORIGIN;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${CANONICAL_SITE_ORIGIN}${suffix.replace(/\/$/, '')}`;
}

/** Public brand used in titles, Open Graph, and Twitter tags. */
export const METADATA_SITE_NAME = 'Algorithmacy Cohorts';

/** Host of the Ludwitt platform. The public hostname stays pitchrise.ludwitt.com. */
export const PITCHRISE_HOST = new URL(PITCHRISE_URL).host;

/** Shared preview sentence for titles, Open Graph, Twitter, and JSON-LD. */
export const RUNS_ON_LUDWITT_LINE = `The program runs on Ludwitt (${PITCHRISE_HOST}).`;

let warnedSiteUrlFallback = false;

function warnSiteUrlFallback(reason: string): void {
  if (warnedSiteUrlFallback) return;
  warnedSiteUrlFallback = true;
  console.warn(
    `[site-config] NEXT_PUBLIC_SITE_URL unset — using fallback (${reason}). ` +
      'Set NEXT_PUBLIC_SITE_URL=https://cohorts.algorithmacy.org in Vercel production.'
  );
}

/** Canonical public site URL (no trailing slash). */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    warnSiteUrlFallback('VERCEL_URL present but NEXT_PUBLIC_SITE_URL empty');
    return `https://${vercel.replace(/\/$/, '')}`;
  }

  warnSiteUrlFallback('no env set');
  return FALLBACK_SITE_URL;
}

/**
 * Human-readable site label for legal copy and public-facing prose.
 * Prefers NEXT_PUBLIC_SITE_DISPLAY_HOST; on *.vercel.app deployments uses SITE_NAME
 * so preview URLs are not surfaced in policy text.
 */
export function getSiteDisplayLabel(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_DISPLAY_HOST?.trim();
  if (fromEnv) return fromEnv.replace(/^https?:\/\//, '').replace(/\/$/, '');

  try {
    const host = new URL(getSiteUrl()).host;
    if (host.endsWith('.vercel.app')) return SITE_NAME;
    return host;
  } catch {
    return SITE_NAME;
  }
}

export const SITE_NAME = 'Hult Cohort Developer Program';

export const SITE_TAGLINE = 'Open community · Fall 2026';

export const GITHUB_REPO_URL =
  'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program';

/** Open computational lab — coordination research students can join via pull request. */
export const ALGORITHMACY_LAB_URL =
  'https://github.com/rogerSuperBuilderAlpha/algorithmacy-lab';

/** First global conference on algorithmacy; Hult is a research sponsor. */
export const ALGORITHMACY_CONFERENCE_URL = 'https://algorithmacy.org';

export const DEFAULT_OG_DESCRIPTION =
  `Open-access community program: build, deploy, review, and operate production-grade software in six weeks. ${RUNS_ON_LUDWITT_LINE}`;

export const OG_IMAGE_ALT = `${METADATA_SITE_NAME}. ${RUNS_ON_LUDWITT_LINE}`;

export function withRunsOnLudwitt(description: string): string {
  const trimmed = description.trim();
  if (trimmed.includes(PITCHRISE_HOST)) return trimmed;
  return `${trimmed} ${RUNS_ON_LUDWITT_LINE}`;
}
