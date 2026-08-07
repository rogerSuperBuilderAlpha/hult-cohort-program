/**
 * Check required production environment variables (names only — never prints secrets).
 * Usage: node scripts/check-production-env.mjs
 */

const REQUIRED_PUBLIC = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_COHORT_REPO',
  'NEXT_PUBLIC_COHORT_ORG',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const REQUIRED_SERVER = ['GITHUB_TOKEN', 'GITHUB_WEBHOOK_SECRET'];

const FIREBASE_ADMIN = ['FIREBASE_SERVICE_ACCOUNT_JSON', 'FIREBASE_SERVICE_ACCOUNT_PATH'];

const RECOMMENDED = [
  'NEXT_PUBLIC_TAKE_HOME_REPO_URL',
  'EMAIL_API_KEY',
  'EMAIL_DOMAIN',
  'EMAIL_FROM',
  'COHORT_ID',
];

function isSet(name) {
  return Boolean(process.env[name]?.trim());
}

function checkGroup(label, names, options = {}) {
  const { requireOneOf } = options;
  if (requireOneOf) {
    const ok = names.some(isSet);
    console.log(`${ok ? '✓' : '✗'} ${label}: need one of ${names.join(' | ')}`);
    return ok;
  }

  let allOk = true;
  for (const name of names) {
    const ok = isSet(name);
    if (!ok) allOk = false;
    console.log(`${ok ? '✓' : '✗'} ${name}`);
  }
  return allOk;
}

console.log('Production env check (current shell)\n');

const publicOk = checkGroup('Public client vars', REQUIRED_PUBLIC);
const adminOk = checkGroup('Firebase Admin', FIREBASE_ADMIN, { requireOneOf: true });
const serverOk = checkGroup('Server secrets', REQUIRED_SERVER);

console.log('\nRecommended:');
for (const name of RECOMMENDED) {
  console.log(`${isSet(name) ? '✓' : '○'} ${name}`);
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
if (siteUrl) {
  console.log(`\nCanonical URL: ${siteUrl.replace(/\/$/, '')}`);
} else {
  console.log('\nCanonical URL: (unset — falls back to VERCEL_URL or site-nine-rouge-68.vercel.app)');
}

const ok = publicOk && adminOk && serverOk;
console.log(ok ? '\nAll required vars present in this shell.' : '\nMissing required vars in this shell.');
process.exit(ok ? 0 : 1);
