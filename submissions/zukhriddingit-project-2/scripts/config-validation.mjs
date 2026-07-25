import vm from 'node:vm';

export const REQUIRED_FIREBASE_FIELDS = Object.freeze([
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
]);

const PLACEHOLDER_TOKEN = /(?:^|[^a-z0-9])(?:your|replace(?:_with)?|change(?:_me)?|todo|tbd|placeholder)(?:[^a-z0-9]|$)/i;
const GITHUB_PAT = /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/i;
const PRIVATE_KEY = /-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----/i;
const SERVICE_ACCOUNT_JSON = /["'](?:type|credential_type)["']\s*:\s*["']service_account["']/i;
const OAUTH_CLIENT_SECRET_ASSIGNMENT = /\b(?:github|oauth)?[_-]?client[_-]?secret\b\s*[:=]/i;
const WEBHOOK_SECRET_ASSIGNMENT = /\b(?:(?:pm|github)[_-]?)?webhook[_-]?secret\b\s*[:=]/i;
const ADMIN_CREDENTIAL_ASSIGNMENT = /\b(?:service[_-]?account|admin[_-]?(?:sdk|credential))\b\s*[:=]/i;
const NAMED_SECRET_ASSIGNMENT = /(?:\b|["'])(?:[A-Za-z_$][\w$]*?(?:client[_-]?secret|oauth[_-]?secret|webhook[_-]?(?:secret|token|key)|private[_-]?key|service[_-]?account|admin[_-]?(?:sdk|credential))|(?:client[_-]?secret|oauth[_-]?secret|webhook[_-]?(?:secret|token|key)|private[_-]?key|service[_-]?account|admin[_-]?(?:sdk|credential)))["']?\s*(?::|=)/i;

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizedKey(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function isPlaceholder(value) {
  const trimmed = value.trim();
  return !trimmed
    || PLACEHOLDER_TOKEN.test(trimmed)
    || /^<[^>]+>$/.test(trimmed)
    || /{{[^}]+}}/.test(trimmed);
}

function secretFieldReason(key) {
  const normalized = normalizedKey(key);

  if (normalized.includes('private_key')) {
    return 'Private keys must not be present in public runtime configuration';
  }
  if (normalized.includes('service_account') || normalized.includes('admin_sdk') || normalized.includes('admin_credential')) {
    return 'Firebase Admin SDK or service-account credentials must not be present in public runtime configuration';
  }
  if (normalized === 'client_email' || normalized.endsWith('_client_email')) {
    return 'Firebase service-account credentials must not be present in public runtime configuration';
  }
  if (normalized.includes('webhook') && (normalized.includes('secret') || normalized.includes('token') || normalized.endsWith('_key'))) {
    return 'Webhook secrets must not be present in public runtime configuration';
  }
  if (normalized.includes('client_secret') || normalized.includes('oauth_secret')) {
    return 'OAuth client secrets must not be present in public runtime configuration';
  }
  if (normalized.includes('secret')) {
    return 'Secret-bearing fields must not be present in public runtime configuration';
  }
  if (normalized === 'credential' || normalized === 'credentials' || normalized.endsWith('_credential') || normalized.endsWith('_credentials')) {
    return 'Credentials must not be present in public runtime configuration';
  }

  return null;
}

function secretValueReason(value) {
  if (GITHUB_PAT.test(value)) return 'GitHub personal access tokens must not be present in public runtime configuration';
  if (PRIVATE_KEY.test(value)) return 'Private keys must not be present in public runtime configuration';
  if (SERVICE_ACCOUNT_JSON.test(value) || value.trim() === 'service_account') {
    return 'Firebase Admin SDK or service-account credentials must not be present in public runtime configuration';
  }
  if (WEBHOOK_SECRET_ASSIGNMENT.test(value)) return 'Webhook secrets must not be present in public runtime configuration';
  return null;
}

function inspectForSecrets(value, path, errors, seen = new WeakSet()) {
  if (typeof value === 'string') {
    const reason = secretValueReason(value);
    if (reason) errors.push(`${path}: ${reason}`);
    return;
  }

  if (!value || typeof value !== 'object') return;
  if (seen.has(value)) return;
  seen.add(value);

  for (const key of Object.keys(value)) {
    const childPath = `${path}.${key}`;
    const reason = secretFieldReason(key);
    if (reason) errors.push(`${childPath}: ${reason}`);
    inspectForSecrets(value[key], childPath, errors, seen);
  }
}

/**
 * Scan source for credential signatures that could be hidden outside the
 * exported config object. Configuration validity itself is still determined by
 * evaluating `window.RELAY_CONFIG` below.
 */
export function findForbiddenSourceSecrets(source) {
  if (typeof source !== 'string') return ['Configuration source must be text'];

  const errors = [];
  if (GITHUB_PAT.test(source)) errors.push('GitHub personal access tokens must not be committed to configuration source');
  if (PRIVATE_KEY.test(source)) errors.push('Private keys must not be committed to configuration source');
  if (SERVICE_ACCOUNT_JSON.test(source)) errors.push('Firebase Admin SDK or service-account credentials must not be committed to configuration source');
  if (OAUTH_CLIENT_SECRET_ASSIGNMENT.test(source)) errors.push('OAuth client secrets must not be committed to configuration source');
  if (ADMIN_CREDENTIAL_ASSIGNMENT.test(source)) errors.push('Firebase Admin SDK or service-account credentials must not be committed to configuration source');
  if (WEBHOOK_SECRET_ASSIGNMENT.test(source)) errors.push('Webhook secrets must not be committed to configuration source');
  if (NAMED_SECRET_ASSIGNMENT.test(source)) errors.push('Secret-bearing configuration assignments must not be committed to configuration source');
  return errors;
}

/**
 * Evaluate the browser configuration in an isolated VM. This intentionally
 * checks the value assigned to `window.RELAY_CONFIG`, rather than inferring
 * mode or field values from source text.
 */
export function evaluateRelayConfig(source, { filename = 'config.js' } = {}) {
  if (typeof source !== 'string') {
    return { config: null, errors: ['Configuration source must be text'] };
  }

  const sandbox = Object.create(null);
  sandbox.window = Object.create(null);

  try {
    const context = vm.createContext(sandbox, {
      codeGeneration: { strings: false, wasm: false }
    });
    vm.runInContext(source, context, { filename, timeout: 1_000 });
  } catch (error) {
    return {
      config: null,
      errors: [`Unable to evaluate window.RELAY_CONFIG: ${String(error?.message || 'unknown error')}`]
    };
  }

  if (!isRecord(sandbox.window.RELAY_CONFIG)) {
    return { config: null, errors: ['Configuration must assign an object to window.RELAY_CONFIG'] };
  }

  return { config: sandbox.window.RELAY_CONFIG, errors: [] };
}

export function validateRelayConfig(config) {
  const errors = [];

  if (!isRecord(config)) return ['window.RELAY_CONFIG must be an object'];
  if (typeof config.demoMode !== 'boolean') {
    errors.push('demoMode must be explicitly set to true or false');
  }
  if (config.attachmentsEnabled !== false) {
    errors.push('attachmentsEnabled must be explicitly false in the Firebase Spark release');
  }
  if (!isRecord(config.firebase)) {
    errors.push('firebase must be an object');
  } else if (config.demoMode === false) {
    for (const field of REQUIRED_FIREBASE_FIELDS) {
      const value = config.firebase[field];
      if (typeof value !== 'string' || isPlaceholder(value)) {
        errors.push(`firebase.${field} must be a non-placeholder string when demoMode is false`);
      }
    }
  } else if (config.demoMode === true) {
    for (const field of REQUIRED_FIREBASE_FIELDS) {
      const value = config.firebase[field];
      if (value !== undefined && typeof value !== 'string') {
        errors.push(`firebase.${field} must be a string when provided`);
      }
    }
  }

  inspectForSecrets(config, 'window.RELAY_CONFIG', errors);
  return [...new Set(errors)];
}

export function validateRelayConfigSource(source, options = {}) {
  const sourceErrors = findForbiddenSourceSecrets(source);
  const evaluation = evaluateRelayConfig(source, options);
  const errors = [...sourceErrors, ...evaluation.errors];

  if (!evaluation.errors.length) errors.push(...validateRelayConfig(evaluation.config));

  return {
    ok: errors.length === 0,
    config: evaluation.config,
    errors: [...new Set(errors)]
  };
}
