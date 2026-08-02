import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { FieldValue } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';
import { cohortId } from '@/lib/cohort-config';
import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import { logApi } from '@/lib/api-log';
import { getMailerConfig, sendEmail } from '@/lib/mailer.mjs';
import type { PartnerIntroInput } from '@/lib/showcase/types';

const PLACEMENT_NOTIFY_EMAIL =
  process.env.PLACEMENT_NOTIFY_EMAIL?.trim() || 'cohort@hult.edu';

export function validatePartnerIntro(body: Record<string, unknown>): PartnerIntroInput {
  const partnerName = String(body.partnerName ?? '').trim();
  const company = String(body.company ?? '').trim();
  const email = String(body.email ?? '').trim();
  const message = String(body.message ?? '').trim();
  const rawStudents = body.studentHandles ?? body.students ?? '';

  let studentHandles: string[] = [];
  if (Array.isArray(rawStudents)) {
    studentHandles = rawStudents.map((s) => String(s).trim()).filter(Boolean);
  } else {
    studentHandles = String(rawStudents)
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (!partnerName) throw new Error('Partner name is required.');
  if (!company) throw new Error('Company is required.');
  if (!email || !email.includes('@')) throw new Error('Valid email is required.');
  if (!message || message.length < 20) throw new Error('Message must be at least 20 characters.');
  if (studentHandles.length === 0) throw new Error('Select at least one student handle.');

  return { partnerName, company, email, studentHandles, message };
}

async function writeLocalIntro(record: PartnerIntroInput & { id: string; createdAt: string }) {
  const dir = path.join(process.cwd(), 'data', 'partner-intros');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${record.id}.json`), JSON.stringify(record, null, 2), 'utf8');
}

async function writeFirestoreIntro(record: PartnerIntroInput & { id: string }) {
  const db = getAdminDb();
  await db
    .collection('partnerIntros')
    .doc(cohortId())
    .collection('requests')
    .doc(record.id)
    .set({
      ...record,
      createdAt: FieldValue.serverTimestamp(),
    });
}

async function notifyPlacementLead(record: PartnerIntroInput & { id: string }) {
  if (!getMailerConfig()) {
    logApi('partner-intro', 'warn', 'Email not configured — intro saved without notify');
    return;
  }

  const students = record.studentHandles.join(', ');
  await sendEmail({
    to: PLACEMENT_NOTIFY_EMAIL,
    subject: `[Partner intro] ${record.company} → ${students}`,
    html: `
      <p><strong>Partner intro request</strong> (${record.id})</p>
      <ul>
        <li>Partner: ${record.partnerName}</li>
        <li>Company: ${record.company}</li>
        <li>Email: ${record.email}</li>
        <li>Students: ${students}</li>
      </ul>
      <p>${record.message.replace(/\n/g, '<br>')}</p>
    `,
  });
}

export async function savePartnerIntro(input: PartnerIntroInput): Promise<{ id: string }> {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const record = { ...input, id, createdAt };

  if (isAdminConfigured()) {
    await writeFirestoreIntro(record);
  } else {
    await writeLocalIntro(record);
  }

  await notifyPlacementLead(record).catch((err) => {
    logApi('partner-intro', 'warn', 'Notify failed', { err: String(err) });
  });

  return { id };
}
