import { NextResponse } from 'next/server';
import { readSession } from '@/lib/ludwitt/session';
import { parseBillText } from '@/lib/energy/calculator';
import type { JurisdictionId } from '@/lib/energy/tariffs';

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text, jurisdiction } = (await request.json()) as {
    text?: string;
    jurisdiction?: JurisdictionId;
  };
  const parsed = parseBillText(text || '', jurisdiction);
  return NextResponse.json(parsed);
}
