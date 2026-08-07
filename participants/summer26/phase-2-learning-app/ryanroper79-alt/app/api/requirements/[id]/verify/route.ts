import { NextResponse } from 'next/server';
import { readSession } from '@/lib/ludwitt/session';
import { verifyRequirement, getOpportunity } from '@/lib/db/store';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const requirement = verifyRequirement(id, session.sub);
    const opportunity = getOpportunity(requirement.opportunityId);
    return NextResponse.json({ requirement, opportunityTitle: opportunity?.title });
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
}
