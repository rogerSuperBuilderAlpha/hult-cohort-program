/** Canonical public site URL (no trailing slash). */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`;

  return 'https://site-nine-rouge-68.vercel.app';
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

export const SITE_TAGLINE = 'CS for Business · Summer Pilot 2026';

export const GITHUB_REPO_URL =
  'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program';

/** Open computational lab — coordination research students can join via pull request. */
export const ALGORITHMACY_LAB_URL =
  'https://github.com/rogerSuperBuilderAlpha/algorithmacy-lab';

/** First global conference on algorithmacy; Hult is a research sponsor. */
export const ALGORITHMACY_CONFERENCE_URL = 'https://algorithmacy.org';

export const DEFAULT_OG_DESCRIPTION =
  'For-credit CS for Business pilot: build on GitHub, peer review, and ship verifiable work in six weeks.';
