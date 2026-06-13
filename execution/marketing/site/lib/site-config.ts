/** Canonical public site URL (no trailing slash). */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`;

  return 'https://site-nine-rouge-68.vercel.app';
}

export const SITE_NAME = 'Hult Cohort Developer Program';

export const SITE_TAGLINE = 'Dare Mighty Things · Fall 2026';

export const GITHUB_REPO_URL =
  'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program';

export const DEFAULT_OG_DESCRIPTION =
  'Hult International Business School developer cohort — one semester, six production projects, GitHub-native proof of work. Apply Fall 2026.';
