import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { findForbiddenSourceSecrets, validateRelayConfigSource } from './config-validation.mjs';

const root = resolve(new URL('..', import.meta.url).pathname);
const required = [
  'index.html', 'styles.css', 'config.js', 'config.example.js', 'manifest.webmanifest', 'sw.js',
  'src/app.js', 'src/icons.js', 'src/utils.js', 'src/data.js',
  'src/adapters/demo.js', 'src/adapters/firebase.js',
  'firestore.rules', 'firestore.indexes.json', 'firebase.json',
  'README.md', 'START_HERE.md', 'DEPLOYMENT.md', 'QA_REPORT.md', 'PR_BODY.md', 'SUBMISSION_CHECKLIST.md', 'SECURITY.md',
  'assets/relay65-app-desktop.png', 'assets/relay65-app-mobile.png'
];

const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const read = (path) => readFileSync(join(root, path), 'utf8');

for (const path of required) check(existsSync(join(root, path)), `Missing required file: ${path}`);

const index = read('index.html');
const styles = read('styles.css');
const app = read('src/app.js');
const config = read('config.js');
const example = read('config.example.js');
const firestore = read('firestore.rules');
const adapter = read('src/adapters/firebase.js');
const serviceWorker = read('sw.js');
const firebaseJson = JSON.parse(read('firebase.json'));
const indexes = JSON.parse(read('firestore.indexes.json'));
const manifest = JSON.parse(read('manifest.webmanifest'));
const rewrites = firebaseJson.hosting?.rewrites || [];
const csp = firebaseJson.hosting?.headers
  ?.flatMap((entry) => entry.headers || [])
  .find((header) => header.key === 'Content-Security-Policy')?.value || '';

for (const id of ['auth-screen', 'app', 'channel-list', 'dm-list', 'message-list', 'message-input', 'command-palette', 'thread-panel']) {
  check(index.includes(`id="${id}"`), `index.html is missing #${id}`);
}
check(index.includes('type="module"') && index.includes('src/app.js'), 'index.html must load src/app.js as a module');
check(styles.length > 20_000, 'Visual system appears unexpectedly small');
check(styles.includes('@media') && styles.includes('prefers-reduced-motion'), 'Responsive/reduced-motion CSS is required');
check(app.includes('new DemoAdapter') && app.includes('new FirebaseAdapter'), 'App must preserve both backend adapters');
check(app.includes("keydown") && app.includes("metaKey"), 'Keyboard command palette behavior is missing');

const htmlIds = new Set([...index.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const dynamicIds = new Set(['channel-name-input', 'dm-filter', 'dm-member-picker', 'edit-channel-form', 'new-channel-form', 'report-form', 'task-form']);
for (const match of app.matchAll(/\$\('([^']+)'\)/g)) {
  check(htmlIds.has(match[1]) || dynamicIds.has(match[1]), `App references missing element id: ${match[1]}`);
}
const iconSource = read('src/icons.js');
const iconKeys = new Set([...iconSource.matchAll(/^\s*(?:'([^']+)'|([a-zA-Z][\w-]*))\s*:/gm)].map((match) => match[1] || match[2]));
const iconReferences = new Set([
  ...[...app.matchAll(/\bicon\('([^']+)'\)/g)].map((match) => match[1]),
  ...[...index.matchAll(/data-icon="([^"]+)"/g)].map((match) => match[1])
]);
for (const name of iconReferences) check(iconKeys.has(name), `Missing SVG icon definition: ${name}`);

const configValidation = validateRelayConfigSource(config, { filename: 'config.js' });
for (const error of configValidation.errors) failures.push(`config.js: ${error}`);
check(example.includes('demoMode: false'), 'Production example must show demoMode: false');
check(example.includes('attachmentsEnabled: false'), 'Production example must explicitly disable attachments for Spark');
check(example.includes('YOUR_FIREBASE_API_KEY') && example.includes('YOUR_PROJECT_ID'), 'Production placeholders are missing');
for (const error of findForbiddenSourceSecrets(example)) failures.push(`config.example.js: ${error}`);

check(firestore.includes('isConversationParticipant') && firestore.includes('request.auth.uid in conversationDoc(conversationId).data.participantIds'), 'DM participant-only rule is missing');
const conversationRules = firestore.slice(firestore.indexOf('match /conversations/'), firestore.indexOf('match /notifications/'));
check(!/allow read:[^;]*isStaff/s.test(conversationRules), 'Staff must not receive a blanket DM read bypass');
check(firestore.includes("role() in ['admin', 'staff']"), 'Staff role enforcement is missing');

check(Boolean(csp), 'Hosting CSP header is missing');
check(csp.includes('https://apis.google.com'), 'Hosting CSP must allow Firebase Auth to load its Google API iframe helper');
check(index.includes('src="config.js?release='), 'Hosted config must use a release query so stale placeholder configuration cannot survive a deployment');
for (const source of ['**', 'config.js', 'sw.js']) {
  const cacheControl = (firebaseJson.hosting.headers || []).find((entry) => entry.source === source)?.headers
    ?.find((header) => header.key === 'Cache-Control')?.value;
  check(cacheControl === 'no-store', `${source} must use Cache-Control: no-store so OAuth configuration and its loader update together`);
}
check(serviceWorker.includes("const CACHE = 'relay65-shell-v6'"), 'Service worker cache version must advance when replacing the broken configuration cache');
check(serviceWorker.includes("networkFirst(event.request, './index.html', { cache: 'no-store' })"), 'Service worker must fetch app navigations without an HTTP-cache fallback');
check(serviceWorker.includes("networkFirst(event.request, './config.js', { cache: 'no-store' })"), 'Service worker must fetch config.js without an HTTP-cache fallback');
check(app.includes("register('./sw.js', { updateViaCache: 'none' })"), 'Service worker registration must bypass HTTP cache when checking for an updated worker');
check(firebaseJson.storage === undefined && firebaseJson.functions === undefined, 'Spark release must not deploy Storage or Functions');
check(rewrites.length === 1 && rewrites[0].source === '**' && rewrites[0].destination === '/index.html', 'Spark Hosting must use only the SPA rewrite');
check(!csp.includes('firebasestorage.googleapis.com'), 'Spark Hosting CSP must not authorize Firebase Storage');
check(!adapter.includes('firebase-storage.js') && !adapter.includes('getStorage(') && !adapter.includes('uploadBytesResumable') && !adapter.includes('getBlob('), 'Firebase adapter must not initialize or use Storage in Spark release');
check(/data-action="attach-file"[^>]*aria-disabled="true"/.test(index), 'Spark composer must expose a disabled attachment affordance');
check(!index.includes('id="file-input"'), 'Spark composer must not include a file input');
check(!app.includes('.uploadFile('), 'Spark UI must not invoke adapter file uploads');
check(indexes.indexes?.some((index) => index.collectionGroup === 'conversations'), 'Conversation participant index is missing');
check(indexes.indexes?.some((index) => index.collectionGroup === 'notifications'), 'Notification index is missing');
check(indexes.indexes?.some((index) => index.collectionGroup === 'channels' && index.fields?.some((field) => field.fieldPath === 'type') && index.fields?.some((field) => field.fieldPath === 'sort')), 'Public channel listener index is missing');
check(indexes.indexes?.some((index) => index.collectionGroup === 'channels' && index.fields?.some((field) => field.fieldPath === 'memberIds' && field.arrayConfig === 'CONTAINS') && index.fields?.some((field) => field.fieldPath === 'sort')), 'Member channel listener index is missing');
check(manifest.name?.includes('Relay 65') && manifest.display === 'standalone', 'PWA manifest is incomplete');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === 'node_modules' || name === 'functions') return [];
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

for (const file of walk(root).filter((path) => /\.(?:js|mjs)$/.test(path))) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) failures.push(`Syntax error in ${relative(root, file)}: ${result.stderr.trim()}`);
}

if (failures.length) {
  console.error(`Relay 65 validation failed (${failures.length}):`);
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log(`Relay 65 validation passed: ${required.length} required files, security/config checks, and JavaScript syntax.`);
