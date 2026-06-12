import { randomUUID } from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { buildApplicationRecord, validateApplication } from '@/lib/applications';
import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import { isFirebaseConfigured } from '@/lib/firebase/config';

export async function POST(request: Request) {
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const input = validateApplication(body);
    const id = randomUUID();
    const record = buildApplicationRecord(input, id);

    if (isAdminConfigured()) {
      await getAdminDb().collection('applications').doc(id).set({
        ...record,
        submittedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return Response.json({ ok: true, id, storage: 'firestore-admin' });
    }

    if (!isFirebaseConfigured()) {
      return Response.json(
        { error: 'Firebase is not configured on the server.' },
        { status: 503 }
      );
    }

    // Client SDK path — browser writes directly when no service account on Vercel
    return Response.json({ ok: true, id, record, storage: 'firestore-client' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Submission failed';
    return Response.json({ error: message }, { status: 400 });
  }
}
