'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../lib/auth-context';
import {
  askAssistant,
  checkAssistantInbox,
  dispatchToApp,
  fetchSharedContext,
  forgetMyHistory,
  runDetection,
  sendMessage,
  subscribeAssistantMemory,
  subscribeAssistantThread,
  subscribeChannels,
  trackCommitment,
  type AssistantMessage,
  type AssistantProposal,
  type ChannelView,
  type SharedContext,
} from '../lib/data';

/**
 * Rally on Home — a chat assistant that reads your situation, drafts actions, and remembers what
 * matters to you across sessions. It never acts on its own: every write is a proposal you confirm,
 * and confirming runs it through the same guarded paths as the rest of the app (a recognition
 * still gets peer-confirmed). It is only ever "Rally".
 */
const PROMPTS = ['Catch me up', 'What did I promise?', 'Summarize #general'];

export function RallyAgent() {
  const { user } = useAuth();
  const [thread, setThread] = useState<AssistantMessage[]>([]);
  const [memory, setMemory] = useState<string[]>([]);
  const [channels, setChannels] = useState<ChannelView[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [shared, setShared] = useState<SharedContext | null>(null);
  const [handled, setHandled] = useState<Record<string, 'done' | 'dismissed'>>({});
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const offs = [
      subscribeAssistantThread(user.uid, setThread),
      subscribeAssistantMemory(user.uid, setMemory),
      subscribeChannels(user.uid, setChannels),
    ];
    return () => offs.forEach((o) => o());
  }, [user]);

  useEffect(() => { bottom.current?.scrollIntoView({ block: 'end' }); }, [thread.length, busy]);

  // On open, pull any cross-app requests other apps' agents addressed to Rally and run them; their
  // results land in this conversation via the thread subscription.
  useEffect(() => { if (user) void checkAssistantInbox(); }, [user]);

  // Load the shared cross-app record when the user opens the memory view.
  useEffect(() => { if (showMemory) void fetchSharedContext().then(setShared); }, [showMemory]);

  async function forgetAll() {
    if (!window.confirm('Forget everything Rally has stored — your shared memory, history, and this conversation? This cannot be undone.')) return;
    await forgetMyHistory();
    setShared({ handle: shared?.handle ?? null, memory: [], activity: [] });
  }

  if (!user) return null;

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || busy) return;
    setInput('');
    setBusy(true);
    setUnavailable(false);
    const res = await askAssistant(msg);
    if (!res.available) setUnavailable(true);
    setBusy(false);
  }

  function channelId(name: string): string | null {
    const n = name.replace(/^#/, '').toLowerCase();
    const rooms = channels.filter((c) => c.kind === 'channel');
    return rooms.find((c) => c.name.toLowerCase() === n)?.id ?? rooms[0]?.id ?? null;
  }

  async function confirm(key: string, p: AssistantProposal) {
    if (handled[key]) return;
    setHandled((h) => ({ ...h, [key]: 'done' }));
    try {
      if (p.kind === 'commitment') {
        await trackCommitment('rally-assistant', p.text);
      } else if (p.kind === 'message') {
        const cid = channelId(p.channel);
        if (cid) { const id = await sendMessage(cid, user!.uid, p.body); void runDetection(`channels/${cid}/messages/${id}`, p.body); }
      } else if (p.kind === 'recognition') {
        const cid = channelId('general');
        if (cid) { const body = `Thanks ${p.teammate} — ${p.note}`; const id = await sendMessage(cid, user!.uid, body); void runDetection(`channels/${cid}/messages/${id}`, body); }
      } else if (p.kind === 'dispatch') {
        await dispatchToApp(p.app, p.intent);
      }
    } catch {
      // Leave it marked handled — the reply already explained what was drafted; no retry loop.
    }
  }

  return (
    <div className="rl-card rl-agent">
      <div className="rl-row">
        <span className="rl-k indigo rl-grow"><span className="d" />Rally · your assistant</span>
        <button className="rl-btn ghost sm" onClick={() => setShowMemory((s) => !s)} aria-pressed={showMemory}>
          {showMemory ? 'Hide memory' : 'Memory & privacy'}
        </button>
      </div>

      {showMemory && (
        <div className="rl-agent-memory">
          <div className="rl-tm" style={{ marginBottom: 4 }}>What Rally remembers about you{shared?.handle ? ' — shared across your cohort apps' : ''}:</div>
          {(shared?.memory.length ?? 0) === 0 && memory.length === 0 && <div className="rl-tb">Nothing stored yet.</div>}
          {shared?.memory.map((n, i) => (<div key={`s${i}`} className="rl-tb">• {n.text} <span className="rl-tm">({n.app})</span></div>))}
          {(shared?.memory.length ?? 0) === 0 && memory.map((n, i) => (<div key={`l${i}`} className="rl-tb">• {n}</div>))}

          {(shared?.activity.length ?? 0) > 0 && (
            <>
              <div className="rl-tm" style={{ margin: '8px 0 4px' }}>Recent history across your apps:</div>
              {shared!.activity.slice(-8).reverse().map((a, i) => (
                <div key={`a${i}`} className="rl-tm">· [{a.app}] {a.summary}</div>
              ))}
            </>
          )}

          <div className="rl-btnrow" style={{ marginTop: 8 }}>
            <button className="rl-btn ghost sm" onClick={forgetAll}>Forget everything</button>
          </div>
          <div className="rl-tm" style={{ marginTop: 4 }}>Private to you. Only your own apps read this; no one else can see it.</div>
        </div>
      )}

      {/* aria-live so a screen reader announces new replies, the "thinking" status, and drafted
          proposals as they arrive — the exchange updates asynchronously with no page navigation. */}
      <div className="rl-agent-thread" aria-live="polite" aria-busy={busy}>
        {thread.length === 0 && !busy && (
          <div className="rl-tm">Ask me to catch you up, summarize a channel, thank a teammate, or track a promise.</div>
        )}
        {thread.map((m) => (
          <div key={m.id} className={`rl-agent-msg ${m.role}`}>
            <div className={`rl-agent-bub ${m.role}`}>{m.content}</div>
            {m.role === 'assistant' && m.proposals.map((p, i) => {
              const key = `${m.id}:${i}`;
              const state = handled[key];
              return (
                <div key={key} className="rl-agent-prop">
                  <div className="rl-tb rl-grow">{proposalLabel(p)}</div>
                  {state ? (
                    <span className="rl-pill">{state === 'done' ? 'Confirmed ✓' : 'Dismissed'}</span>
                  ) : (
                    <div className="rl-btnrow">
                      <button className="rl-btn pri sm" onClick={() => confirm(key, p)}>{confirmLabel(p)}</button>
                      <button className="rl-btn ghost sm" onClick={() => setHandled((h) => ({ ...h, [key]: 'dismissed' }))}>Dismiss</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {busy && <div className="rl-agent-msg assistant"><div className="rl-agent-bub assistant rl-tm">Rally is thinking…</div></div>}
        <div ref={bottom} />
      </div>

      {unavailable && <div className="rl-tm" role="alert">Rally can&apos;t answer right now — try again in a moment.</div>}

      {thread.length === 0 && (
        <div className="rl-btnrow">
          {PROMPTS.map((p) => (<button key={p} className="rl-btn sec sm" onClick={() => send(p)} disabled={busy}>{p}</button>))}
        </div>
      )}

      <div className="rl-compose">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Ask Rally to do something…"
          aria-label="Ask Rally"
          disabled={busy}
        />
        <button className="rl-btn pri sm" onClick={() => send(input)} disabled={busy || !input.trim()}>Send</button>
      </div>
    </div>
  );
}

function proposalLabel(p: AssistantProposal): string {
  if (p.kind === 'commitment') return `Track a commitment: “${p.text}”`;
  if (p.kind === 'message') return `Post to #${p.channel}: “${p.body}”`;
  if (p.kind === 'recognition') return `Thank ${p.teammate}: “${p.note}”`;
  return `Ask ${p.app} to: “${p.intent}”`;
}

function confirmLabel(p: AssistantProposal): string {
  if (p.kind === 'commitment') return 'Track it';
  if (p.kind === 'message') return 'Post it';
  if (p.kind === 'recognition') return 'Post thank-you';
  return `Send to ${p.app}`;
}
