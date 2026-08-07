import { NextResponse } from 'next/server';
import { readSession } from '@/lib/ludwitt/session';
import { createManualOpportunity, listOpportunities } from '@/lib/db/store';

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({ opportunities: listOpportunities() });
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.title || !body.funder) {
    return NextResponse.json({ error: 'title and funder required' }, { status: 400 });
  }

  const opp = createManualOpportunity({
    title: body.title,
    funder: body.funder,
    country: body.country ?? 'Caribbean',
    sector: body.sector ?? 'General',
    stage: body.stage ?? 'rfp',
    estimatedValueUsd: Number(body.estimatedValueUsd) || 0,
    rawText: body.rawText ?? '',
    submissionDeadline: body.submissionDeadline,
    expectedBidDate: body.expectedBidDate,
  });

  return NextResponse.json({ opportunity: opp }, { status: 201 });
}
