import { NextResponse } from 'next/server';
import {
  createInitialState,
  getChallenge,
  replayCommands,
  scoreChallenge,
  serializeState,
} from '@/lib/shell/engine';
import { postPlatformEvent, readSession } from '@/lib/ludwitt/session';

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json()) as {
    challengeId?: string;
    commands?: string[];
    elapsedSec?: number;
  };
  const challengeId = body.challengeId?.trim() || 'first-commit';
  const spec = getChallenge(challengeId);
  if (!spec) return NextResponse.json({ error: 'unknown challenge' }, { status: 400 });

  const commands = body.commands ?? [];
  const elapsedSec = Number(body.elapsedSec ?? 0);

  const initial = spec.setup(createInitialState());
  const { state } = replayCommands(commands, initial);
  const passed = spec.assert(state);
  const stars = scoreChallenge(spec, elapsedSec, commands.length, passed);

  let platform: { accepted?: boolean; counted?: boolean } | null = null;
  if (passed) {
    try {
      await postPlatformEvent('quiz_submitted', session.sub, session.sessionId, {
        challenge: spec.id,
        stars: String(stars),
      });
      platform = await postPlatformEvent('lesson_completed', session.sub, session.sessionId, {
        challenge: spec.id,
      });
    } catch {
      /* grading still returned to client */
    }
  }

  return NextResponse.json({
    passed,
    stars,
    commandCount: commands.length,
    platform,
    finalState: serializeState(state),
  });
}
