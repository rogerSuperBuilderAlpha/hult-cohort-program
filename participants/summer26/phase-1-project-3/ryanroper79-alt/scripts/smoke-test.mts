/**
 * Phase 6 smoke checks — run against production or local preview.
 * Usage: node --experimental-strip-types scripts/smoke-test.mts [baseUrl]
 */
const baseUrl = (process.argv[2] ?? 'https://hult-cohort-program-iota.vercel.app').replace(/\/$/, '');

const routes = [
  '/',
  '/work',
  '/join',
  '/partners',
  '/p/ryanroper79-alt',
  '/p/raven-dubgub',
  '/p/gge513',
];

const externalLinks = [
  'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/186',
  'https://www.linkedin.com/in/ryanroper1/',
  'https://peteranthonygales.craft.me/s3ywHY5a1ppmyU',
  'https://github.com/ryanroper79-alt',
];

type Check = { name: string; ok: boolean; detail: string };

const checks: Check[] = [];

async function fetchStatus(url: string, method: 'GET' | 'HEAD' = 'GET') {
  const res = await fetch(url, {
    method,
    redirect: 'follow',
    headers: { 'User-Agent': 'hult-cohort-smoke/1.0' },
  });
  return res;
}

async function main() {
  console.log(`Smoke test base URL: ${baseUrl}\n`);

  // HTTPS + routes
  for (const route of routes) {
    const url = `${baseUrl}${route}`;
    try {
      const res = await fetchStatus(url);
      const ok = res.status >= 200 && res.status < 400;
      checks.push({
        name: `Route ${route}`,
        ok,
        detail: `${res.status} ${res.statusText}`,
      });
    } catch (err) {
      checks.push({
        name: `Route ${route}`,
        ok: false,
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // OG image route
  try {
    const res = await fetchStatus(`${baseUrl}/p/ryanroper79-alt/opengraph-image`);
    const contentType = res.headers.get('content-type') ?? '';
    checks.push({
      name: 'OG image /p/ryanroper79-alt/opengraph-image',
      ok: res.ok && contentType.includes('image'),
      detail: `${res.status} content-type=${contentType}`,
    });
  } catch (err) {
    checks.push({
      name: 'OG image',
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  // Homepage markers for standalone app (not template site)
  try {
    const res = await fetchStatus(`${baseUrl}/`);
    const html = await res.text();
    const hasStandalone =
      html.includes('Energy sovereignty requires digital sovereignty') ||
      html.includes('Request a feasibility report') ||
      html.includes('Build curve');
    const hasOldTemplate = html.includes('Build the software your cohort actually runs on');
    checks.push({
      name: 'Standalone app homepage content',
      ok: hasStandalone && !hasOldTemplate,
      detail: hasOldTemplate
        ? 'Still serving template site — repoint Vercel root or redeploy standalone app'
        : hasStandalone
          ? 'Standalone pitch detected'
          : 'Homepage content unrecognized',
    });
  } catch (err) {
    checks.push({
      name: 'Standalone app homepage content',
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  // External links — GET (some sites reject HEAD, e.g. LinkedIn)
  for (const url of externalLinks) {
    try {
      const res = await fetchStatus(url, 'GET');
      checks.push({
        name: `External ${url}`,
        ok: res.status >= 200 && res.status < 400,
        detail: `${res.status}`,
      });
    } catch (err) {
      checks.push({
        name: `External ${url}`,
        ok: false,
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Print results
  let failed = 0;
  for (const c of checks) {
    const mark = c.ok ? '✓' : '✗';
    console.log(`${mark} ${c.name} — ${c.detail}`);
    if (!c.ok) failed += 1;
  }

  console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
  if (failed > 0) process.exit(1);
}

main();
