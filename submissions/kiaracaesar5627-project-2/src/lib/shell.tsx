import {
  countUnreadNotifications,
  listChannels,
  listDmConversations,
} from "@/lib/db";
import type { SessionUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { ensureSeeded } from "@/lib/bootstrap";

export async function withShell(
  user: SessionUser,
  activeHref: string | undefined,
  children: React.ReactNode,
) {
  await ensureSeeded();
  const [channels, dmRows, unread] = await Promise.all([
    listChannels(),
    listDmConversations(user.id),
    countUnreadNotifications(user.id),
  ]);
  return (
    <AppShell
      user={user}
      channels={channels}
      dms={dmRows.map((row) => ({
        conversationId: row.conversation.id,
        peer: row.peer,
      }))}
      unread={unread}
      activeHref={activeHref}
    >
      {children}
    </AppShell>
  );
}
