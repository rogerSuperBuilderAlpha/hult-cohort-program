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
  '/rsvp',
  '/contribute',
  '/status',
  '/changelog',
  '/p/ryanroper79-alt',
  '/p/raven-dubgub',
  '/p/gge513',
  '/p/CodingWCal',
  '/p/studmuffin01',
];

const externalLinks = [
  'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/186',
  'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/201',
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
    const res = await fetch(`${baseUrl}/builders`, { redirect: 'manual', headers: { 'User-Agent': 'hult-cohort-smoke/1.0' } });
    const ok = res.status >= 300 && res.status < 400;
    checks.push({
      name: 'Redirect /builders → /work',
      ok,
      detail: `${res.status} (expect redirect)`,
    });
  } catch (err) {
    checks.push({
      name: 'Redirect /builders → /work',
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    });
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
    const climateNetwork =
      html.includes('Climate Builder Network') &&
      html.includes('Small Island Developing States') &&
      !html.includes('Meet the builders') &&
      !html.includes('Ryan R. Roper featured');
    checks.push({
      name: 'Climate Builder Network homepage',
      ok: climateNetwork,
      detail: climateNetwork ? 'Branding + scope freeze OK' : 'Homepage content check failed',
    });
  } catch (err) {
    checks.push({
      name: 'Climate Builder Network homepage',
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  try {
    const res = await fetchStatus(`${baseUrl}/p/studmuffin01`);
    const html = await res.text();
    checks.push({
      name: 'Private profile /p/studmuffin01',
      ok: res.ok && html.includes('Private profile'),
      detail: res.ok ? 'Private placeholder detected' : `${res.status}`,
    });
  } catch (err) {
    checks.push({
      name: 'Private profile /p/studmuffin01',
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  try {
    const res = await fetchStatus(`${baseUrl}/work`);
    const html = await res.text();
    checks.push({
      name: 'Work page island bandwidth note',
      ok: res.ok && html.includes('Island conditions'),
      detail: res.ok ? 'Artifact note present' : `${res.status}`,
    });
  } catch (err) {
    checks.push({
      name: 'Work page island bandwidth note',
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
