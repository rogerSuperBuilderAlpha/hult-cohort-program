/**
 * Phase 6 smoke checks — run against production or local preview.
 * Usage: node --experimental-strip-types scripts/smoke-test.mts [baseUrl]
 */
const baseUrl = (process.argv[2] ?? 'https://cealgreen-projects.vercel.app').replace(/\/$/, '');

const routes = [
  '/',
  '/work',
  '/join',
  '/partners',
  '/partners/readme',
  '/vote',
  '/p/ryanroper79-alt',
  '/p/raven-dubgub',
  '/p/gge513',
  '/p/CodingWCal',
];

const externalLinks = [
  'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/186',
  'https://www.cealgreen.com',
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

  try {
    const res = await fetchStatus(`${baseUrl}/`);
    const html = await res.text();
    const cohortFirst =
      html.includes('CARICOM committed to 47%') &&
      html.includes('Hult Cohort · Summer Pilot 2026') &&
      !html.includes('Request a feasibility report') &&
      !html.includes('Pending');
    const hasOldTemplate = html.includes('Build the software your cohort actually runs on');
    checks.push({
      name: 'Cohort-first homepage content',
      ok: cohortFirst && !hasOldTemplate,
      detail: cohortFirst ? 'Cohort-first hero detected' : 'Homepage content unrecognized',
    });
  } catch (err) {
    checks.push({
      name: 'Cohort-first homepage content',
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    });
  }

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
