import { NextResponse } from 'next/server';
import { getArtifactCheck } from '@/lib/artifact-check';

export const revalidate = 3600;

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get('key')?.trim();
  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter.' }, { status: 400 });
  }
  return NextResponse.json(getArtifactCheck(key));
}
