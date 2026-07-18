/**
 * Email blast core — audience resolution, suppression list, unsubscribe tokens,
 * and per-recipient rendering. Pure/DB-parameterized so both the staff CLI
 * (scripts/blast.mjs) and the unsubscribe API route reuse the same logic.
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { readFileSync } from 'fs';
import { buildBlastHtml, renderMergeFields } from './email-templates.mjs';
import { siteUrl } from './mailgun.mjs';

/** Shared secret for unsubscribe HMAC — MUST match between the sender and the site. */
function unsubSecret() {
  const secret = process.env.UNSUBSCRIBE_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('UNSUBSCRIBE_SECRET is required in production.');
  }
  return process.env.EMAIL_API_KEY?.trim() || 'hult-cohort-unsubscribe-dev-only';
}

function tokensForEmail(email) {
  const digest = createHmac('sha256', unsubSecret()).update(normalizeEmail(email)).digest('hex');
  return { full: digest, legacy: digest.slice(0, 20) };
}

function timingSafeTokenMatch(given, expected) {
  if (!given || !expected || given.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

/** Firestore-safe doc id for an email (no slashes, bounded length). */
export function suppressionDocId(email) {
  return normalizeEmail(email).replace(/[^a-z0-9@._+-]/g, '_').slice(0, 400);
}

export function unsubscribeToken(email) {
  return tokensForEmail(email).full;
}

export function verifyUnsubscribeToken(email, token) {
  if (!token) return false;
  const { full, legacy } = tokensForEmail(email);
  return timingSafeTokenMatch(token, full) || timingSafeTokenMatch(token, legacy);
}

export function unsubscribeUrl(email) {
  const e = encodeURIComponent(normalizeEmail(email));
  return `${siteUrl()}/api/unsubscribe?e=${e}&t=${unsubscribeToken(email)}`;
}

/* ------------------------------- suppression ------------------------------ */

const SUPPRESSION_COLLECTION = 'emailSuppressions';

export async function isSuppressed(db, email) {
  const snap = await db.collection(SUPPRESSION_COLLECTION).doc(suppressionDocId(email)).get();
  return snap.exists;
}

/** Load the whole suppression set once (cheaper than N reads for a blast). */
export async function loadSuppressionSet(db) {
  const snap = await db.collection(SUPPRESSION_COLLECTION).get();
  const set = new Set();
  snap.forEach((doc) => set.add(normalizeEmail(doc.data().email || doc.id)));
  return set;
}

export async function addSuppression(db, email, reason, extra = {}) {
  const normalized = normalizeEmail(email);
  await db
    .collection(SUPPRESSION_COLLECTION)
    .doc(suppressionDocId(normalized))
    .set(
      { email: normalized, reason: reason || 'manual', createdAt: new Date().toISOString(), ...extra },
      { merge: true }
    );
}

/* -------------------------------- audiences ------------------------------- */

/** @typedef {{ email: string; firstName?: string; lastName?: string; handle?: string; vars: Record<string,string> }} Recipient */

/** Normalize any raw record into a Recipient, folding all fields into merge vars. */
function toRecipient(raw) {
  const email = normalizeEmail(raw.email);
  if (!email) return null;
  const firstName = raw.firstName || raw.first_name || '';
  const lastName = raw.lastName || raw.last_name || '';
  const handle = raw.githubHandle || raw.handle || '';
  return {
    email,
    firstName,
    lastName,
    handle,
    vars: {
      ...raw,
      email,
      firstName,
      lastName,
      handle,
      name: `${firstName} ${lastName}`.trim(),
    },
  };
}

/** Firestore applications, optionally filtered by status. Hard cap protects quota. */
export async function audienceFromFirestore(db, { cohort, status, limit = 2000 } = {}) {
  let q = db.collection('applications');
  if (cohort) q = q.where('cohort', '==', cohort);
  if (status) q = q.where('status', '==', status);
  q = q.limit(limit);
  const snap = await q.get();
  const out = [];
  snap.forEach((doc) => {
    const r = toRecipient(doc.data());
    if (r) out.push(r);
  });
  return out;
}

/** Minimal CSV parser (RFC-4180-ish: quoted fields, escaped quotes). Header row required. */
export function parseCsv(text) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); if (row.some((v) => v !== '')) rows.push(row); }
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const obj = {};
    header.forEach((h, idx) => { obj[h] = (cells[idx] ?? '').trim(); });
    return obj;
  });
}

export function audienceFromCsv(filePath) {
  const records = parseCsv(readFileSync(filePath, 'utf8'));
  return records.map(toRecipient).filter(Boolean);
}

/**
 * Apollo.io contacts via REST. Requires APOLLO_API_KEY.
 * @param {{ perPage?: number; pages?: number; query?: string }} opts
 */
export async function audienceFromApollo({ perPage = 100, pages = 1, query } = {}) {
  const apiKey = process.env.APOLLO_API_KEY?.trim();
  if (!apiKey) throw new Error('APOLLO_API_KEY is not set — cannot pull Apollo contacts.');

  const out = [];
  for (let page = 1; page <= pages; page++) {
    const res = await fetch('https://api.apollo.io/v1/contacts/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'X-Api-Key': apiKey },
      body: JSON.stringify({ page, per_page: perPage, ...(query ? { q_keywords: query } : {}) }),
    });
    if (!res.ok) throw new Error(`Apollo search failed (${res.status}): ${await res.text()}`);
    const data = await res.json();
    const contacts = data.contacts || data.people || [];
    for (const c of contacts) {
      const r = toRecipient({
        email: c.email,
        first_name: c.first_name,
        last_name: c.last_name,
        org: c.organization_name || c.organization?.name || '',
        title: c.title || '',
      });
      if (r) out.push(r);
    }
    if (contacts.length < perPage) break;
  }
  return out;
}

/** De-dupe a recipient list by email, first occurrence wins. */
export function dedupeRecipients(recipients) {
  const seen = new Set();
  const out = [];
  for (const r of recipients) {
    if (seen.has(r.email)) continue;
    seen.add(r.email);
    out.push(r);
  }
  return out;
}

/* -------------------------------- rendering ------------------------------- */

/**
 * Render subject + full HTML for one recipient.
 * @param {{ subjectTemplate: string; bodyTemplate: string; recipient: Recipient; fromName: string }} p
 */
export function renderForRecipient({ subjectTemplate, bodyTemplate, recipient, fromName }) {
  const subject = renderMergeFields(subjectTemplate, recipient.vars);
  const bodyHtml = renderMergeFields(bodyTemplate, recipient.vars);
  const html = buildBlastHtml({
    bodyHtml,
    unsubscribeUrl: unsubscribeUrl(recipient.email),
    fromName,
  });
  return {
    to: recipient.email,
    subject,
    html,
    // RFC 8058 one-click + mailto unsubscribe → materially better inbox placement.
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl(recipient.email)}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}
