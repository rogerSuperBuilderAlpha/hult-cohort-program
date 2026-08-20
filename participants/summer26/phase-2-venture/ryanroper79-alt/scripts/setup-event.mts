/**
 * Print presentation join link and suggested Vercel env for a 12-hour live session.
 * Usage: npm run setup-event
 */
const APP_URL = process.env.APP_PRODUCTION_URL?.trim() || 'https://caribbeanenergyauditor.vercel.app';
const ACCESS_CODE = process.env.EVENT_ACCESS_CODE?.trim() || 'CEAL50-AUG15';
const HOURS = parseInt(process.env.EVENT_SESSION_HOURS || '12', 10);

const endsAt = new Date(Date.now() + HOURS * 60 * 60 * 1000);
const joinUrl = `${APP_URL.replace(/\/$/, '')}/event/join?code=${encodeURIComponent(ACCESS_CODE)}`;

console.log(`
=== CEAL Green — 12-hour live session ===

Share this link with all 50 participants (open ${HOURS} hours):

  ${joinUrl}

Vercel env vars to set (then redeploy):

  EVENT_MODE=true
  EVENT_ACCESS_CODE=${ACCESS_CODE}
  EVENT_ENDS_AT=${endsAt.toISOString()}
  EVENT_SESSION_HOURS=${HOURS}
  NEXT_PUBLIC_EVENT_MODE=true
  CRM_WEBHOOK_URL=<Google Apps Script /exec URL>
  NEXT_PUBLIC_CEAL_BOOKING_URL=https://cealgreen.com/book-now/

Google Sheet (one-time, ~3 min):
  1. Open https://docs.google.com/spreadsheets/d/17F4OcnHXhMEotTYUOlkWw_RiW4WAFewk/edit
  2. Extensions → Apps Script → paste scripts/google-apps-script/energy-auditor-crm.gs
  3. Run ensureHeaders once, then Deploy → Web app → Anyone → copy /exec URL
  4. Set CRM_WEBHOOK_URL on Vercel and run: npm run test-crm-webhook

Session ends: ${endsAt.toLocaleString()}
`);
