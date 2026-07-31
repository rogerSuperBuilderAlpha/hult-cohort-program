export function forthUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_FORTH_URL?.replace(/\/$/, "") ||
    "https://forth-bice.vercel.app";
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function firesideUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_FIRESIDE_URL?.replace(/\/$/, "") ||
    "https://hult-cohort-program-henna.vercel.app";
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function siteUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function githubProfileUrl(handle: string): string {
  return `https://github.com/${handle}`;
}
