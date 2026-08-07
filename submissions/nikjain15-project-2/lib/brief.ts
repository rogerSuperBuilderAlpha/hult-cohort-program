/**
 * "Catch me up" — the Brief intelligence, pure core.
 *
 * The model's job (when present) is to classify free-text unread into {blocked-on-you,
 * decision-you-own, ...}; but the Brief must work with the model off, so this deterministic
 * ranking IS the baseline and the fallback. It never invents urgency — it surfaces only things
 * with a real claim on you (a recognition awaiting your confirm, a commitment coming due) and
 * says plainly when the rest is quiet. At most three items, because a brief that lists
 * everything is just the feed again.
 */

export type BriefInput = {
  pendingRecognitions: number;
  dueCommitments: { text: string; dueAtMs: number | null }[];
  unreadChannels: { name: string; unread: number }[];
  nowMs: number;
};

export type BriefItem = {
  kind: 'confirm-recognition' | 'due-commitment' | 'unread';
  text: string;
};

export type Brief = {
  items: BriefItem[];
  quiet: string;
};

const SOON_MS = 24 * 3_600_000;
const MAX_ITEMS = 3;

export function buildBrief(input: BriefInput): Brief {
  const items: BriefItem[] = [];

  // 1. Recognitions awaiting your confirm — someone's XP is waiting on you. Highest.
  if (input.pendingRecognitions > 0) {
    items.push({
      kind: 'confirm-recognition',
      text:
        input.pendingRecognitions === 1
          ? 'A teammate is waiting on you to confirm they helped.'
          : `${input.pendingRecognitions} teammates are waiting on you to confirm they helped.`,
    });
  }

  // 2. Your own commitments coming due (or overdue) — due soonest first.
  const due = [...input.dueCommitments]
    .filter((c) => c.dueAtMs != null)
    .sort((a, b) => (a.dueAtMs! - b.dueAtMs!));
  for (const c of due) {
    if (items.length >= MAX_ITEMS) break;
    const overdue = c.dueAtMs! < input.nowMs;
    const soon = c.dueAtMs! - input.nowMs <= SOON_MS;
    if (overdue || soon) {
      items.push({
        kind: 'due-commitment',
        text: overdue ? `Past due: "${c.text}".` : `Due soon: "${c.text}".`,
      });
    }
  }

  // 3. Busiest unread channel, if there's still room.
  const busiest = [...input.unreadChannels].filter((c) => c.unread > 0).sort((a, b) => b.unread - a.unread)[0];
  if (busiest && items.length < MAX_ITEMS) {
    items.push({ kind: 'unread', text: `${busiest.unread} new in #${busiest.name}.` });
  }

  const quiet = quietLine(input, items.length);
  return { items: items.slice(0, MAX_ITEMS), quiet };
}

function quietLine(input: BriefInput, shown: number): string {
  const totalUnread = input.unreadChannels.reduce((s, c) => s + c.unread, 0);
  if (shown === 0 && totalUnread === 0) return "You're all caught up. Nothing needs you.";
  if (shown === 0) return `Nothing needs you right now — ${totalUnread} unread, all quiet.`;
  return 'Everything else is quiet.';
}
