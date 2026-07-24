import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DemoAdapter } from '../src/adapters/demo.js';
import { FirebaseAdapter } from '../src/adapters/firebase.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const ATTACHMENTS_UNAVAILABLE = 'Attachments are unavailable in the free Firebase release.';

class MemoryStorage {
  #data = new Map();
  getItem(key) { return this.#data.has(key) ? this.#data.get(key) : null; }
  setItem(key, value) { this.#data.set(key, String(value)); }
  removeItem(key) { this.#data.delete(key); }
  clear() { this.#data.clear(); }
}

globalThis.localStorage = new MemoryStorage();

async function assertAttachmentGuard(adapter) {
  await assert.rejects(
    adapter.uploadFile({ name: 'proof.txt', type: 'text/plain', size: 5 }),
    (error) => {
      assert.equal(error?.message, ATTACHMENTS_UNAVAILABLE);
      return true;
    }
  );
}

test('Spark release manifest excludes paid Firebase services and webhook routes', async () => {
  const [firebaseSource, index, serviceWorker, app] = await Promise.all([
    read('firebase.json'), read('index.html'), read('sw.js'), read('src/app.js')
  ]);
  const firebase = JSON.parse(firebaseSource);
  const rewrites = firebase.hosting.rewrites || [];
  const headerEntries = firebase.hosting.headers || [];
  const csp = firebase.hosting.headers
    .flatMap((entry) => entry.headers || [])
    .find((header) => header.key === 'Content-Security-Policy')?.value || '';

  assert.equal(firebase.storage, undefined);
  assert.equal(firebase.functions, undefined);
  assert.equal(firebase.firestore?.rules, 'firestore.rules');
  assert.equal(firebase.firestore?.indexes, 'firestore.indexes.json');
  assert.deepEqual(rewrites, [{ source: '**', destination: '/index.html' }]);
  assert.doesNotMatch(JSON.stringify(rewrites), /(?:pm|github)-webhook|pmWebhook|githubWebhook/i);
  assert.ok(!csp.includes('firebasestorage.googleapis.com'));
  assert.match(csp, /https:\/\/apis\.google\.com/, 'Firebase Auth needs the Google API iframe helper in script-src');
  assert.match(index, /<script src="config\.js\?release=\d+"><\/script>/, 'A release query must bypass an already-cached placeholder config.js');
  for (const source of ['**', 'config.js', 'sw.js']) {
    const cacheControl = headerEntries.find((entry) => entry.source === source)?.headers
      ?.find((header) => header.key === 'Cache-Control')?.value;
    assert.equal(cacheControl, 'no-store', `${source} must not retain an earlier deployment in the browser cache`);
  }
  assert.match(serviceWorker, /const CACHE = 'relay65-shell-v6'/);
  assert.match(serviceWorker, /networkFirst\(event\.request, '\.\/index\.html', \{ cache: 'no-store' \}\)/);
  assert.match(serviceWorker, /networkFirst\(event\.request, '\.\/config\.js', \{ cache: 'no-store' \}\)/);
  assert.match(app, /register\('\.\/sw\.js', \{ updateViaCache: 'none' \}\)/);
});

test('Spark release keeps a disabled paperclip without file upload plumbing', async () => {
  const [html, app, adapter] = await Promise.all([
    read('index.html'), read('src/app.js'), read('src/adapters/firebase.js')
  ]);

  assert.match(html, /data-action="attach-file"[^>]*aria-disabled="true"/);
  assert.ok(!html.includes('id="file-input"'));
  assert.ok(app.includes(ATTACHMENTS_UNAVAILABLE));
  assert.ok(!app.includes('.uploadFile('));
  assert.ok(app.includes('Unavailable in Spark'), 'Legacy Storage-path records should render as unavailable');
  assert.ok(app.includes('attachment.storagePath'), 'Legacy Storage paths must not trigger Storage resolution');
  for (const forbidden of ['firebase-storage.js', 'getStorage(', 'uploadBytesResumable', 'getBlob(']) {
    assert.ok(!adapter.includes(forbidden), `Firebase adapter must not use ${forbidden}`);
  }
});

test('both adapters reject attachment uploads before any Firebase initialization or local file work', async () => {
  globalThis.localStorage.clear();
  await assertAttachmentGuard(new DemoAdapter({ attachmentsEnabled: false }));
  await assertAttachmentGuard(new FirebaseAdapter({ attachmentsEnabled: false }));
});
