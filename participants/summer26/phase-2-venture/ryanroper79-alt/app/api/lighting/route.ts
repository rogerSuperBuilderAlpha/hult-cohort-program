import { NextResponse } from 'next/server';
import { readSession } from '@/lib/ludwitt/session';
import { estimateLightingRetrofit, type LightingInput } from '@/lib/energy/lighting';

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json()) as LightingInput;
  return NextResponse.json({ result: estimateLightingRetrofit(body) });
}
