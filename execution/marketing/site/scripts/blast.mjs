/**
 * Staff email blast CLI. Dry-run by default — writes/sends require --confirm.
 *
 * Usage:
 *   node scripts/blast.mjs \
 *     --subject="We're opening applications, {firstName}" \
 *     --html=./scripts/blasts/announce.html \
 *     --from=firestore --status=admitted
 *
 * Audience sources (combine with --from=firestore,csv,apollo):
 *   firestore   applications collection   [--status=<s>] [--cohort=<id>]
 *   csv         --file=list.csv           (header row; needs an `email` column)
 *   apollo      Apollo.io contacts        [--apollo-pages=N] [--apollo-query=...]  (needs APOLLO_API_KEY)
 *
 * Body:  --html=<file>   or   --body="<inline html>"   (supports {firstName} etc. merge tags)
 * Flags: --rate=<per-sec, default 10>  --limit=<N>  --test=<email>  --confirm
 *
 * Provider comes from EMAIL_PROVIDER (mailgun|ses) — see lib/mailer.mjs.
 * Suppressed (unsubscribed/bounced) addresses are always skipped.
 */

import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMailerConfig, mailerProvider, sendEmail } from '../lib/mailer.mjs';
import {
  audienceFromApollo,
  audienceFromCsv,
  audienceFromFirestore,
  dedupeRecipients,
  loadSuppressionSet,
  renderForRecipient,
} from '../lib/blast-server.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COHORT = process.env.COHORT_ID?.trim() || 'summer26';

// Minimal .env.local loader so EMAIL_ and AWS_ vars are present without extra deps.
function loadDotEnv() {
  const file = path.join(__dirname, '..', '.env.local');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const key = m[1];
    if (process.env[key] !== undefined) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    process.env[key] = val;
  }
}
loadDotEnv();

function arg(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
}
function has(name) {
  return process.argv.includes(`--${name}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) return JSON.parse(json);
  const accountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() ||
    path.join(__dirname, '../secrets/firebase-service-account.json');
  return JSON.parse(readFileSync(accountPath, 'utf8'));
}
function initDb() {
  if (!getApps().length) initializeApp({ credential: cert(loadServiceAccount()) });
  return getFirestore();
}

async function resolveAudience(db) {
  const sources = (arg('from', 'firestore') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const all = [];
  for (const src of sources) {
    if (src === 'firestore') {
      all.push(...(await audienceFromFirestore(db, { cohort: arg('cohort', COHORT), status: arg('status') })));
    } else if (src === 'csv') {
      const file = arg('file');
      if (!file) throw new Error('--from=csv requires --file=<path>');
      all.push(...audienceFromCsv(path.resolve(file)));
    } else if (src === 'apollo') {
      all.push(
        ...(await audienceFromApollo({
          pages: Number(arg('apollo-pages', '1')),
          query: arg('apollo-query'),
        }))
      );
    } else {
      throw new Error(`Unknown --from source: ${src}`);
    }
  }
  return dedupeRecipients(all);
}

function loadBody() {
  const file = arg('html');
  if (file) return readFileSync(path.resolve(file), 'utf8');
  const inline = arg('body');
  if (inline) return inline;
  throw new Error('Provide the body with --html=<file> or --body="<html>"');
}

async function main() {
  const subjectTemplate = arg('subject');
  if (!subjectTemplate) throw new Error('Missing --subject');
  const bodyTemplate = loadBody();

  // Preview works without creds; sending (--confirm / --test) requires them.
  const config = getMailerConfig();
  const willSend = has('confirm') || Boolean(arg('test'));
  if (!config && willSend) {
    throw new Error(
      `Email provider "${mailerProvider()}" is not configured. Set its env (EMAIL_FROM + provider creds).`
    );
  }
  const fromName = config?.fromName || process.env.EMAIL_FROM_NAME?.trim() || 'Hult Cohort';

  const db = initDb();
  const [rawAudience, suppressed] = await Promise.all([resolveAudience(db), loadSuppressionSet(db)]);

  let recipients = rawAudience.filter((r) => !suppressed.has(r.email));
  const skipped = rawAudience.length - recipients.length;
  const limit = Number(arg('limit', '0'));
  if (limit > 0) recipients = recipients.slice(0, limit);

  const provider = mailerProvider();
  const confirm = has('confirm');
  const testTo = arg('test');
  const rate = Math.max(0.2, Number(arg('rate', '10')));

  console.log(`\nBlast preview`);
  console.log(`  provider:    ${provider}${config ? ` (from: ${fromName} <${config.fromEmail}>)` : ' — NOT configured (preview only)'}`);
  console.log(`  audience:    ${rawAudience.length} resolved, ${skipped} suppressed, ${recipients.length} to send`);
  console.log(`  subject:     ${subjectTemplate}`);

  const sample = recipients[0] || { email: 'sample@example.com', vars: { firstName: 'there' } };
  const rendered = renderForRecipient({ subjectTemplate, bodyTemplate, recipient: sample, fromName });
  console.log(`\n  --- rendered for ${sample.email} ---`);
  console.log(`  subject: ${rendered.subject}`);
  console.log(`  html (${rendered.html.length} chars, unsubscribe + footer included)\n`);

  // Test send: one email to --test address, using the first recipient's merge vars.
  if (testTo) {
    if (!confirm) {
      console.log(`(dry-run) Would send ONE test email to ${testTo}. Re-run with --confirm to send.`);
      return;
    }
    const r = { ...sample, email: testTo, vars: { ...sample.vars, email: testTo } };
    const msg = renderForRecipient({ subjectTemplate, bodyTemplate, recipient: r, fromName });
    await sendEmail(msg);
    console.log(`Sent test email to ${testTo}.`);
    return;
  }

  if (!recipients.length) {
    console.log('No recipients after suppression. Nothing to do.');
    return;
  }

  if (!confirm) {
    console.log(`(dry-run) Would send to ${recipients.length} recipients at ~${rate}/sec.`);
    console.log(`Re-run with --confirm to send, or --test=you@example.com to send one test first.`);
    return;
  }

  const blastId = `blast-${Date.now()}`;
  const blastRef = db.collection('emailBlasts').doc(blastId);
  await blastRef.set({
    id: blastId,
    subject: subjectTemplate,
    provider,
    audienceSize: recipients.length,
    from: arg('from', 'firestore'),
    createdAt: new Date().toISOString(),
  });

  let sent = 0;
  let failed = 0;
  const delayMs = 1000 / rate;
  for (const r of recipients) {
    const msg = renderForRecipient({ subjectTemplate, bodyTemplate, recipient: r, fromName });
    try {
      await sendEmail(msg);
      sent++;
      await blastRef.collection('recipients').doc(r.email).set({
        email: r.email,
        status: 'sent',
        sentAt: new Date().toISOString(),
      });
    } catch (err) {
      failed++;
      console.error(`  FAILED ${r.email}: ${err.message}`);
      await blastRef.collection('recipients').doc(r.email).set({
        email: r.email,
        status: 'failed',
        error: err.message,
        at: new Date().toISOString(),
      });
    }
    if ((sent + failed) % 25 === 0) console.log(`  ...${sent + failed}/${recipients.length}`);
    await sleep(delayMs);
  }

  await blastRef.set({ sent, failed, finishedAt: new Date().toISOString() }, { merge: true });
  console.log(`\nDone. Sent ${sent}, failed ${failed}. Log: emailBlasts/${blastId}\n`);
}

main().catch((err) => {
  console.error(`\nError: ${err.message}\n`);
  process.exit(1);
});
