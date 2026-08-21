import { NextResponse } from 'next/server';
import { readSession } from '@/lib/ludwitt/session';
import { recommendEquipmentUpgrades, type EquipmentInput } from '@/lib/energy/equipment';

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json()) as EquipmentInput;
  return NextResponse.json({ recommendations: recommendEquipmentUpgrades(body) });
}
