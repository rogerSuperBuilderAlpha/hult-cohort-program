import { NextResponse } from 'next/server';
import { readSession, ludwittTransport } from '@/lib/ludwitt/session';
import { getOpportunity, saveQualification, appendEvent } from '@/lib/db/store';
import { emitPlatformEvent } from '@/lib/ludwitt/events';
import type { QualDimension } from '@/lib/bidmanager/types';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const opp = getOpportunity(id);
  if (!opp) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ opportunity: opp });
}

export async function POST(request: Request, { params }: Params) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await request.json();

  const dimensionScores = body.dimensionScores as Record<QualDimension, number>;
  if (!dimensionScores) {
    return NextResponse.json({ error: 'dimensionScores required' }, { status: 400 });
  }

  const { opportunity, result } = saveQualification(id, {
    dimensionScores,
    memberCountryEligible: body.memberCountryEligible !== false,
    decision: body.decision,
    overrideReason: body.overrideReason,
  });

  const ctx = { orgId: session.orgId, userId: session.sub, sessionId: session.sessionId };
  const log = async (e: Parameters<typeof appendEvent>[0]) => appendEvent(e);

  try {
    await emitPlatformEvent(
      'qualification.scored',
      ctx,
      {
        opportunity_id: id,
        total_score: result.weightedTotal,
        recommendation: result.recommendation,
        funder: opportunity.funder,
        value_usd: opportunity.estimatedValueUsd,
      },
      ludwittTransport,
      async (e) => log({ orgId: e.orgId, userId: e.userId, eventName: e.eventName, payload: e.payload, sessionId: e.sessionId })
    );

    if (body.decision || result.recommendation) {
      await emitPlatformEvent(
        'bid.decided',
        ctx,
        {
          opportunity_id: id,
          decision: body.decision ?? result.recommendation,
          value_usd: opportunity.estimatedValueUsd,
          funder: opportunity.funder,
          score: result.weightedTotal,
        },
        ludwittTransport,
        async (e) => log({ orgId: e.orgId, userId: e.userId, eventName: e.eventName, payload: e.payload, sessionId: e.sessionId })
      );
    }
  } catch {
    /* scored locally even if forward fails */
  }

  return NextResponse.json({ opportunity, result });
}
