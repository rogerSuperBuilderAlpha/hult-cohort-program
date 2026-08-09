import { redirect } from 'next/navigation';
import { TerminalChallenge } from '@/components/TerminalChallenge';
import { readSession } from '@/lib/ludwitt/session';

export default async function ChallengePage() {
  const session = await readSession();
  if (!session) redirect('/?error=session_required');
  return <TerminalChallenge />;
}
