/**
 * POST a sample lead to CRM_WEBHOOK_URL (Google Apps Script web app).
 * Usage: npm run test-crm-webhook
 */
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env.local');

function loadEnv() {
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim().replace(/^\uFEFF/, '');
    const m = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2];
  }
}

async function main() {
  loadEnv();
  const url = process.env.CRM_WEBHOOK_URL?.trim();
  if (!url) throw new Error('CRM_WEBHOOK_URL not set in .env.local');

  const sample = {
    id: 'test-lead-' + Date.now(),
    recordedAt: new Date().toISOString(),
    platformUserId: 'external-webhook-test-01',
    sessionId: 'test-session',
    contact: {
      companyName: 'Webhook Test Co',
      address: 'Kingston, Jamaica',
      email: 'webhook.test@example.com',
      phone: '+1 876 555 0100',
    },
    calculator: {
      jurisdiction: 'jamaica',
      propertyType: 'commercial',
      monthlyExpenditureUsd: 250,
      monthlyExpenditureLocal: 38750,
      currencyCode: 'JMD',
      monthlyKwh: 850,
      floorAreaSqm: 200,
      weeklyOperatingHours: 60,
      majorLoads: ['air_conditioning', 'refrigeration'],
      auditReadinessScore: 90,
      annualKwh: 10200,
      monthlySavingsLocal25Pct: 9688,
      bookNowUrl: 'https://cealgreen.com/book-now/',
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sample),
  });
  const text = await res.text();
  console.log(JSON.stringify({ status: res.status, body: text }, null, 2));
  if (!res.ok) process.exit(1);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
