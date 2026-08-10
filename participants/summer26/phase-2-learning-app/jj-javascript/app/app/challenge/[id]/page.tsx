import { redirect } from 'next/navigation';
import { TerminalChallenge } from '@/components/TerminalChallenge';
import { getChallenge } from '@/lib/shell/engine';
import { readSession } from '@/lib/ludwitt/session';

export default async function ChallengeByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await readSession();
  if (!session) redirect('/?error=session_required');

  const { id } = await params;
  const spec = getChallenge(id);
  if (!spec) redirect('/?error=unknown_challenge');

  return <TerminalChallenge challengeId={id} />;
}
