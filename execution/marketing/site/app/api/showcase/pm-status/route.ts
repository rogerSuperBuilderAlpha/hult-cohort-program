import { getPmSnapshot } from '@/lib/showcase/pm-snapshot-server';

export const runtime = 'nodejs';
export const revalidate = 60;

export async function GET() {
  const snapshot = await getPmSnapshot();
  return Response.json(snapshot);
}
