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
    "https://fireside-studmuffin01.vercel.app";
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Production canonical origin when env is unset (OG / sitemap / metadataBase). */
export const DEFAULT_SITE_ORIGIN = "https://lighthouse-studmuffin01.vercel.app";

export function siteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(
    /\/$/,
    ""
  );
  if (vercelHost) {
    return vercelHost.startsWith("http") ? vercelHost : `https://${vercelHost}`;
  }

  return process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : DEFAULT_SITE_ORIGIN;
}

export function siteUrl(path = ""): string {
  const base = siteOrigin();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function githubProfileUrl(handle: string): string {
  return `https://github.com/${handle}`;
}
