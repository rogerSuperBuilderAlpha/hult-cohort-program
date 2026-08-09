import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { ludwittConfig } from '@/lib/ludwitt/session';

export async function POST(request: Request) {
  try {
    const { appId, devKey, baseUrl } = ludwittConfig();
    const userId = `external-${randomUUID()}`;
    const email = `player.${Date.now()}@example.com`;

    const tokenRes = await fetch(`${baseUrl}/auth/launch-token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${devKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ app_id: appId, user_id: userId, email }),
    });
    const body = (await tokenRes.json()) as { launch_url?: string; error?: string };
    if (!tokenRes.ok || !body.launch_url) {
      return NextResponse.json({ error: body.error || 'launch token failed' }, { status: 502 });
    }

    return NextResponse.redirect(new URL(body.launch_url, request.url));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'demo launch failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
