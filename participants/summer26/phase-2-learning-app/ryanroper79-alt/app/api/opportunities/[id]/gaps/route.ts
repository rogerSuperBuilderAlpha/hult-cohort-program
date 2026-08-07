import { NextResponse } from 'next/server';
import { readSession } from '@/lib/ludwitt/session';
import { getOpportunity, getGapReportForOpportunity } from '@/lib/db/store';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await params;
  const opp = getOpportunity(id);
  if (!opp) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const report = getGapReportForOpportunity(id);
  return NextResponse.json({ opportunityId: id, ...report });
}
