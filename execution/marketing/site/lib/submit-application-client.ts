import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { buildApplicationRecord, type ApplicationInput } from '@/lib/applications';

export async function submitApplicationClient(input: ApplicationInput, id: string) {
  const record = buildApplicationRecord(input, id);
  await setDoc(doc(getFirebaseDb(), 'applications', id), {
    ...record,
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}
