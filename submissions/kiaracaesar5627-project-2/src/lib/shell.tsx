import { cookies } from "next/headers";
import {
  countUnreadNotifications,
  listChannels,
  listDmConversations,
} from "@/lib/db";
import type { SessionUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { ensureSeeded } from "@/lib/bootstrap";
import { parseTheme, THEME_COOKIE } from "@/lib/theme";

export async function withShell(
  user: SessionUser,
  activeHref: string | undefined,
  children: React.ReactNode,
  rail?: React.ReactNode,
) {
  await ensureSeeded();
  const jar = await cookies();
  const theme = parseTheme(jar.get(THEME_COOKIE)?.value);
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
      rail={rail}
      theme={theme}
    >
      {children}
    </AppShell>
  );
}
