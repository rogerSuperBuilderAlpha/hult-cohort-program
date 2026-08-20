import { appendFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { CrmLead } from '@/lib/crm/types';

function crmFilePath(): string {
  const configured = process.env.CRM_DATA_PATH?.trim();
  if (configured) {
    return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
  }
  if (process.env.VERCEL) {
    return path.join('/tmp', 'crm', 'leads.jsonl');
  }
  return path.join(process.cwd(), 'data', 'crm', 'leads.jsonl');
}

function ensureDir(filePath: string) {
  mkdirSync(path.dirname(filePath), { recursive: true });
}

async function forwardToWebhook(lead: CrmLead): Promise<void> {
  const url = process.env.CRM_WEBHOOK_URL?.trim();
  if (!url) return;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  });
  if (!res.ok) {
    throw new Error(`CRM webhook failed (${res.status})`);
  }
}

export async function appendCrmLead(lead: Omit<CrmLead, 'id' | 'recordedAt'>): Promise<CrmLead> {
  const record: CrmLead = {
    id: randomUUID(),
    recordedAt: new Date().toISOString(),
    ...lead,
  };

  const filePath = crmFilePath();
  try {
    ensureDir(filePath);
    appendFileSync(filePath, JSON.stringify(record) + '\n', 'utf8');
  } catch (err) {
    console.error('CRM file store error:', err instanceof Error ? err.message : err);
    if (!process.env.CRM_WEBHOOK_URL?.trim()) {
      throw err;
    }
  }

  try {
    await forwardToWebhook(record);
  } catch (err) {
    console.error('CRM webhook error:', err instanceof Error ? err.message : err);
  }

  return record;
}

export function readCrmLeads(): CrmLead[] {
  const filePath = crmFilePath();
  if (!existsSync(filePath)) return [];
  return readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as CrmLead);
}
