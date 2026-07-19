/**
 * E2E helper: restore Roger Hunt Firebase Auth (GitHub-linked) and obtain a production id token.
 * Usage: node scripts/e2e-roger-api.mjs [token|apply|consent|survey-w1|survey-w2|survey-w3|state|me|dashboard|progress|review|vote]
 */
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = 'https://site-nine-rouge-68.vercel.app';
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
if (!API_KEY) {
  throw new Error('Set NEXT_PUBLIC_FIREBASE_API_KEY (e.g. from .env.local) before running this script.');
}
const ROGER = {
  uid: 'ZW1mNzhS2tf7Viq93ZFHnQTD86p1',
  handle: 'rogersuperbuilderalpha',
  githubUid: '206113222',
  email: 'ludwitt@ludwitt.com',
  displayName: 'Roger Hunt',
};

function loadServiceAccount() {
  const accountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() ||
    path.join(__dirname, '../secrets/firebase-service-account.json');
  const resolved = path.isAbsolute(accountPath)
    ? accountPath
    : path.join(__dirname, '..', accountPath);
  return JSON.parse(readFileSync(resolved, 'utf8'));
}

function initAuth() {
  if (!getApps().length) initializeApp({ credential: cert(loadServiceAccount()) });
  return getAuth();
}

async function ensureRogerAuth() {
  const auth = initAuth();
  try {
    await auth.getUser(ROGER.uid);
    return;
  } catch (err) {
    if (err?.code !== 'auth/user-not-found') throw err;
  }
  await auth.importUsers([
    {
      uid: ROGER.uid,
      email: ROGER.email,
      displayName: ROGER.displayName,
      emailVerified: true,
      providerData: [
        {
          providerId: 'github.com',
          uid: ROGER.githubUid,
          displayName: ROGER.displayName,
          email: ROGER.email,
        },
      ],
    },
  ]);
}

async function getIdToken() {
  await ensureRogerAuth();
  const auth = initAuth();
  const customToken = await auth.createCustomToken(ROGER.uid);
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.idToken;
}

async function api(method, route, body, token) {
  const res = await fetch(`${SITE}${route}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) throw new Error(`${method} ${route} ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

const WAVE_ANSWERS = {
  w1: {
    acs_ci_1: 4, acs_ci_2: 5, acs_sc_1: 4, ti_1: 5, au_m_1: 4, su_3: 4, be_1: 5, se_1: 4,
    dem_age: '25-34', dem_education: 'masters',
  },
  w2: {
    acs_ci_1: 5, acs_rt_1: 4, sa_1: 4, ti_1: 5, au_m_1: 5, po_1: 4, tms_s_1: 4, su_3: 5, be_1: 5,
  },
  w3: {
    acs_ci_1: 6, sa_1: 5, ti_1: 5, au_m_1: 5, po_1: 5, tms_s_1: 5, su_3: 5, be_1: 6, se_1: 5,
    exp_l_1: 5, exp_open_1: 'E2E test response.',
  },
};

async function main() {
  const cmd = process.argv[2] || 'token';
  const token = await getIdToken();

  if (cmd === 'token') { console.log(token); return; }
  if (cmd === 'apply') {
    console.log(await api('POST', '/api/applications', {
      firstName: 'Roger', lastName: 'Hunt', email: ROGER.email,
      motivation: 'Building production software with agents in a real cohort.',
      project1Idea: 'PM platform for the cohort with deadlines and peer review hooks.',
      timezone: 'America/New_York', campus: 'boston', referralSource: 'Founder network',
      confirmTuition: 'on', confirmPublicWork: 'on', confirmPolicies: 'on',
    }, token));
    return;
  }
  if (cmd === 'consent') { console.log(await api('POST', '/api/research/consent', { consented: true }, token)); return; }
  if (cmd.startsWith('survey-')) {
    const wave = cmd.replace('survey-', '');
    console.log(await api('POST', '/api/research/survey', { wave, answers: WAVE_ANSWERS[wave] }, token));
    return;
  }
  if (cmd === 'state') { console.log(JSON.stringify(await api('GET', '/api/research/survey', null, token), null, 2)); return; }
  if (cmd === 'me') { console.log(JSON.stringify(await api('GET', '/api/me', null, token), null, 2)); return; }
  if (cmd === 'dashboard') { console.log(JSON.stringify(await api('GET', '/api/dashboard', null, token), null, 2)); return; }
  if (cmd === 'progress') {
    const slug = process.argv[3] || 'phase-1-project-1';
    console.log(JSON.stringify(await api('GET', `/api/program/${slug}/progress`, null, token), null, 2));
    return;
  }
  if (cmd === 'review') {
    const slug = process.argv[3] || 'phase-1-project-1';
    const reviewee = process.argv[4] || 'jordanlee-dev';
    const issueUrl = process.argv[5];
    if (!issueUrl) throw new Error('Pass issue URL as 5th arg');
    console.log(await api('POST', `/api/program/${slug}/written-reviews`, { revieweeHandle: reviewee, issueUrl }, token));
    return;
  }
  if (cmd === 'vote') {
    const slug = process.argv[3] || 'phase-1-project-1';
    const reviewee = process.argv[4] || 'jordanlee-dev';
    console.log(await api('POST', `/api/program/${slug}/ratings`, { revieweeHandle: reviewee, rating: 'up' }, token));
    return;
  }
  throw new Error(`Unknown command: ${cmd}`);
}

main().catch((err) => { console.error(err.message || err); process.exit(1); });
