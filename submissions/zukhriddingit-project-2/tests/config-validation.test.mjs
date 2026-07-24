import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRelayConfig, validateRelayConfigSource } from '../scripts/config-validation.mjs';

const productionFirebase = {
  apiKey: 'AIzaSyD3m0BrowserKey_Only-1234567890',
  authDomain: 'relay65-prod.firebaseapp.com',
  projectId: 'relay65-prod',
  storageBucket: 'relay65-prod.firebasestorage.app',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abcdef1234567890'
};

function configSource({ demoMode, firebase = productionFirebase, extra = '' }) {
  return `
    window.RELAY_CONFIG = {
      demoMode: ${demoMode},
      attachmentsEnabled: false,
      firebase: ${JSON.stringify(firebase)},
      ${extra}
    };
  `;
}

test('evaluates the value assigned to window.RELAY_CONFIG in an isolated VM', () => {
  const result = evaluateRelayConfig(configSource({ demoMode: true, firebase: {} }));
  assert.deepEqual(result.errors, []);
  assert.equal(result.config.demoMode, true);
  assert.deepEqual({ ...result.config.firebase }, {});
});

test('demo configuration permits blank Firebase fields', () => {
  const result = validateRelayConfigSource(configSource({
    demoMode: true,
    firebase: Object.fromEntries(Object.keys(productionFirebase).map((key) => [key, '']))
  }));
  assert.equal(result.ok, true, result.errors.join('\n'));
});

test('complete production configuration accepts a normal Firebase browser API key', () => {
  const result = validateRelayConfigSource(configSource({ demoMode: false }));
  assert.equal(result.ok, true, result.errors.join('\n'));
});

test('production configuration rejects missing and placeholder Firebase values', () => {
  const missing = validateRelayConfigSource(configSource({
    demoMode: false,
    firebase: { ...productionFirebase, appId: '' }
  }));
  assert.equal(missing.ok, false);
  assert.ok(missing.errors.some((error) => error.includes('firebase.appId')));

  const placeholder = validateRelayConfigSource(configSource({
    demoMode: false,
    firebase: { ...productionFirebase, projectId: 'YOUR_PROJECT_ID' }
  }));
  assert.equal(placeholder.ok, false);
  assert.ok(placeholder.errors.some((error) => error.includes('firebase.projectId')));
});

test('Spark configuration explicitly disables attachments', () => {
  const enabled = validateRelayConfigSource(configSource({
    demoMode: false,
    extra: 'attachmentsEnabled: true'
  }));
  const missing = validateRelayConfigSource(`window.RELAY_CONFIG = {
    demoMode: false,
    firebase: ${JSON.stringify(productionFirebase)}
  };`);

  assert.equal(enabled.ok, false);
  assert.equal(missing.ok, false);
  assert.ok(enabled.errors.some((error) => error.includes('attachmentsEnabled')));
  assert.ok(missing.errors.some((error) => error.includes('attachmentsEnabled')));
});

test('public configuration rejects credential and secret material', () => {
  const fixtures = [
    ['GitHub PAT', "githubToken: 'ghp_abcdefghijklmnopqrstuvwxyz1234567890'"],
    ['OAuth client secret', "githubClientSecret: 'not-for-the-browser'"],
    ['private key', "privateKey: '-----BEGIN PRIVATE KEY-----\\nabc'"],
    ['Admin SDK credential', "serviceAccount: { type: 'service_account', client_email: 'admin@example.test' }"],
    ['webhook secret', "PM_WEBHOOK_SECRET: 'not-for-the-browser'"],
  ];

  for (const [name, extra] of fixtures) {
    const result = validateRelayConfigSource(configSource({ demoMode: false, extra }));
    assert.equal(result.ok, false, `${name} should be rejected`);
  }
});

test('source scanning rejects secrets even when they are not part of RELAY_CONFIG', () => {
  const source = `const githubClientSecret = 'not-for-the-browser';\n${configSource({ demoMode: false })}`;
  const result = validateRelayConfigSource(source);

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('OAuth client secrets')));
});
