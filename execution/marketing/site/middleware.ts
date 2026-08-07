import { NextResponse, type NextRequest } from 'next/server';

/**
 * Canonicalize the apply flow to a single host so GitHub OAuth always initiates
 * from one Firebase "authorized domain". The program is served on several
 * domains; whichever one a visitor arrives on, hitting /apply funnels them to
 * cohorts.algorithmacy.org/apply first — then they sign in there.
 *
 * Runs for direct navigations, deep links, and the Apply button's client-side
 * navigation (Next executes middleware on RSC data requests too).
 */

const CANONICAL_APPLY_HOST =
  process.env.NEXT_PUBLIC_CANONICAL_APPLY_HOST?.trim() || 'cohorts.algorithmacy.org';

export function middleware(request: NextRequest) {
  // Only enforce on production deployments — never redirect local dev or Vercel
  // preview builds (VERCEL_ENV is 'preview'/'development' there), so testing works.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    return NextResponse.next();
  }

  const host = (request.headers.get('host') ?? '').toLowerCase();
  if (!host || host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
    return NextResponse.next();
  }
  if (host === CANONICAL_APPLY_HOST) {
    return NextResponse.next();
  }

  const target = new URL(
    request.nextUrl.pathname + request.nextUrl.search,
    `https://${CANONICAL_APPLY_HOST}`
  );
  // 307 (temporary) rather than 308 so the canonical host stays changeable via
  // env without browsers having cached a permanent redirect.
  return NextResponse.redirect(target, 307);
}

export const config = {
  matcher: ['/apply', '/apply/:path*'],
};
