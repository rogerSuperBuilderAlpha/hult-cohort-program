import { NextResponse } from 'next/server';
import {
  FIRST_COMMIT_CHALLENGE,
  createInitialState,
  replayCommands,
  scoreChallenge,
  serializeState,
} from '@/lib/shell/engine';
import { postPlatformEvent, readSession } from '@/lib/ludwitt/session';

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json()) as {
    commands?: string[];
    elapsedSec?: number;
  };
  const commands = body.commands ?? [];
  const elapsedSec = Number(body.elapsedSec ?? 0);

  const initial = FIRST_COMMIT_CHALLENGE.setup(createInitialState());
  const { state } = replayCommands(commands, initial);
  const passed = FIRST_COMMIT_CHALLENGE.assert(state);
  const stars = scoreChallenge(FIRST_COMMIT_CHALLENGE, elapsedSec, commands.length, passed);

  let platform: { accepted?: boolean; counted?: boolean } | null = null;
  if (passed) {
    try {
      await postPlatformEvent('quiz_submitted', session.sub, session.sessionId, {
        challenge: FIRST_COMMIT_CHALLENGE.id,
        stars: String(stars),
      });
      platform = await postPlatformEvent('lesson_completed', session.sub, session.sessionId, {
        challenge: FIRST_COMMIT_CHALLENGE.id,
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
