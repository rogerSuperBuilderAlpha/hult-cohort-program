'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { Avatar, RallyNav } from '../../components/rally-nav';
import { Centered } from '../../components/app-shell';
import {
  askRally,
  createOrOpenDm,
  deleteMessage,
  editMessage,
  markChannelRead,
  runDetection,
  sendMessage,
  subscribeChannels,
  subscribeMessages,
  subscribeProfiles,
  subscribeThread,
  toggleReaction,
  trackCommitment,
  type ChannelView,
  type MessageView,
} from '../../lib/data';
import { detectCommitment } from '../../lib/detect-commitment';
import { applyMention, mentionQuery, rankMentions, type MentionQuery } from '../../lib/mention';
import { highlightSegments, matchesQuery } from '../../lib/search';

type Profiles = Record<string, { displayName: string; avatarUrl: string | null }>;

export default function ChannelsPage() {
  const { user, loading, signInWithGithub } = useAuth();
  const [channels, setChannels] = useState<ChannelView[]>([]);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageView[]>([]);
  const [profiles, setProfiles] = useState<Profiles>({});
  const [threadFor, setThreadFor] = useState<MessageView | null>(null);
  const [dmOpen, setDmOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(50);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!user) return;
    const off = subscribeChannels(user.uid, setChannels);
    const offP = subscribeProfiles(setProfiles);
    return () => {
      off();
      offP();
    };
  }, [user]);

  // Honor ?c=<id> from a nav link elsewhere (read client-side to avoid a Suspense boundary).
  // One-time sync from the URL on mount — not a render-driven update.
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('c');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (c) setChosenId(c);
  }, []);

  const activeId = useMemo(() => {
    if (chosenId && channels.some((c) => c.id === chosenId)) return chosenId;
    return channels[0]?.id ?? null;
  }, [chosenId, channels]);

  // A new channel starts at the base page size again.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPageSize(50);
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    return subscribeMessages(activeId, (msgs, more) => { setMessages(msgs); setHasMore(more); }, pageSize);
  }, [activeId, pageSize]);

  useEffect(() => {
    if (user && activeId) markChannelRead(activeId, user.uid).catch(() => {});
  }, [user, activeId, messages.length]);

  if (loading) return <Centered>Loading…</Centered>;
  if (!user) {
    return (
      <Centered>
        <div className="rl-card" style={{ alignItems: 'center', maxWidth: 320, textAlign: 'center' }}>
          <div className="rl-brand" style={{ padding: 0 }}><span className="rl-mk" />Rally</div>
          <p className="rl-tm">Your cohort&apos;s home. Sign in with GitHub to jump in.</p>
          <button className="rl-btn pri" onClick={() => signInWithGithub().catch(() => {})}>Continue with GitHub</button>
        </div>
      </Centered>
    );
  }

  const active = channels.find((c) => c.id === activeId) ?? null;
  const label = (c: ChannelView): string => {
    if (c.kind !== 'dm') return `# ${c.name}`;
    const other = c.memberUids.find((u) => u !== user.uid);
    return other ? profiles[other]?.displayName ?? 'Direct message' : 'Note to self';
  };

  const members: Member[] = active
    ? active.memberUids
        .filter((uid) => uid !== user.uid)
        .map((uid) => ({ uid, displayName: profiles[uid]?.displayName ?? 'member' }))
    : [];

  const rail = threadFor ? (
    <ThreadPanel channelId={active!.id} parent={threadFor} profiles={profiles} authorUid={user.uid} members={members} onClose={() => setThreadFor(null)} />
  ) : (
    active && <ChannelRail channelId={active.id} messageCount={messages.length} memberCount={active.memberUids.length} />
  );

  return (
    <div className="rl-app">
      <RallyNav active="channels" activeChannelId={activeId} onSelectChannel={setChosenId} />

      <main className="rl-main" style={{ padding: 0, gap: 0 }}>
        <header
          style={{
            height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px', borderBottom: '1px solid var(--line)', background: 'var(--paper)',
          }}
        >
          <span className="rl-t3" style={{ fontSize: 17 }}>{active ? label(active) : 'Select a channel'}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {active && (
              <button className="rl-btn sec sm" onClick={() => setSearchOpen((o) => !o)} aria-label="Search messages" aria-pressed={searchOpen}>🔍</button>
            )}
            {active && (
              <button className="rl-btn sec sm rl-narrow-only" onClick={() => setAskOpen(true)} aria-label="Open Ask Rally">Ask Rally</button>
            )}
            <button className="rl-btn sec sm" onClick={() => setDmOpen(true)}>＋ New message</button>
          </div>
        </header>

        {active && searchOpen && (
          <div className="rl-searchbar">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') { setSearch(''); setSearchOpen(false); } }}
              placeholder="Search this channel"
              aria-label="Search messages in channel"
            />
            {search.trim() && (
              <span className="rl-tm">{messages.filter((m) => matchesQuery(m.body, search)).length} match{messages.filter((m) => matchesQuery(m.body, search)).length === 1 ? '' : 'es'}</span>
            )}
            <button className="rl-btn ghost sm" onClick={() => { setSearch(''); setSearchOpen(false); }}>Clear</button>
          </div>
        )}

        <MessageList messages={messages} profiles={profiles} currentUid={user.uid} channelId={active?.id ?? ''} search={searchOpen ? search : ''} hasMore={hasMore} onLoadMore={() => setPageSize((n) => n + 50)} onOpenThread={setThreadFor} />

        {active && <Composer channelId={active.id} authorUid={user.uid} members={members} />}
      </main>

      <aside className="rl-rail">{rail}</aside>

      {askOpen && active && (
        <div onClick={() => setAskOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(10,37,64,.28)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(420px, 92vw)' }}>
            <AskRallyCard channelId={active.id} />
          </div>
        </div>
      )}

      {dmOpen && (
        <DmModal
          me={user.uid}
          profiles={profiles}
          onClose={() => setDmOpen(false)}
          onPick={async (uid) => {
            const id = await createOrOpenDm(user.uid, uid);
            setChosenId(id);
            setDmOpen(false);
          }}
        />
      )}
    </div>
  );
}

function MessageList({
  messages, profiles, currentUid, channelId, search, hasMore, onLoadMore, onOpenThread,
}: {
  messages: MessageView[]; profiles: Profiles; currentUid: string; channelId: string; search: string; hasMore: boolean; onLoadMore: () => void; onOpenThread: (m: MessageView) => void;
}) {
  const bottom = useRef<HTMLDivElement>(null);
  const [tracked, setTracked] = useState<Record<string, string | 'pending'>>({});
  const searching = search.trim().length > 0;
  const shown = searching ? messages.filter((m) => matchesQuery(m.body, search)) : messages;
  // Scroll to the newest message when the LAST id changes (a new post or a channel switch) — but
  // NOT when older messages are prepended via "Load earlier", so the reader keeps their place.
  const lastId = shown.length ? shown[shown.length - 1].id : null;
  useEffect(() => { if (!searching) bottom.current?.scrollIntoView({ block: 'end' }); }, [lastId, searching]);

  async function track(m: MessageView) {
    if (tracked[m.id]) return;
    setTracked((t) => ({ ...t, [m.id]: 'pending' }));
    const res = await trackCommitment(`channels/${channelId}/messages/${m.id}`, m.body);
    setTracked((t) => ({ ...t, [m.id]: res.ok ? (res.pmTaskUrl ?? 'done') : '' }));
  }

  if (!messages.length) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)', fontSize: 14 }}>
        Nothing here yet. Say hello — the cohort&apos;s listening.
      </div>
    );
  }

  if (searching && !shown.length) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)', fontSize: 14 }}>
        No messages match &ldquo;{search.trim()}&rdquo;.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!searching && hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="rl-btn ghost sm" onClick={onLoadMore}>Load earlier messages</button>
        </div>
      )}
      {shown.map((m) => {
        const commitment = m.authorUid === currentUid && detectCommitment(m.body);
        const p = profiles[m.authorUid];
        return (
          <div key={m.id} className="rl-msgrow">
            <div className="rl-msg">
              <Avatar name={p?.displayName ?? m.authorUid} url={p?.avatarUrl ?? null} size={34} />
              <div className="rl-bub rl-grow">
                <div className="hd"><b>{p?.displayName ?? 'member'}</b><span>{fmt(m.createdAtMs)}</span></div>
                <MessageBody channelId={channelId} message={m} isMine={m.authorUid === currentUid} search={search} />
                <ReactionBar
                  reactions={m.reactions}
                  currentUid={currentUid}
                  onToggle={(emoji) => toggleReaction(channelId, m.id, currentUid, emoji, m.reactions[currentUid])}
                  onReply={() => onOpenThread(m)}
                  replyCount={m.replyCount ?? 0}
                />
              </div>
            </div>
            {commitment && (
              <div className="rl-card" style={{ marginLeft: 45, marginTop: 8, maxWidth: 560, padding: 15 }}>
                <span className="rl-k indigo"><span className="d" />Rally spotted a commitment</span>
                <div className="rl-tb">Track this promise? It creates a task and awards points when you keep it on time.</div>
                {tracked[m.id] ? (
                  <span className="rl-tm">{tracked[m.id] === 'pending' ? 'Tracking…' : 'Tracked ✓'}</span>
                ) : (
                  <div className="rl-btnrow">
                    <button className="rl-btn pri sm" onClick={() => track(m)}>Track it · create task</button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottom} />
    </div>
  );
}

function MessageBody({ channelId, message, isMine, search = '' }: { channelId: string; message: MessageView; isMine: boolean; search?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.body);
  const [busy, setBusy] = useState(false);

  async function save() {
    const text = draft.trim();
    if (!text || busy) return;
    if (text === message.body) { setEditing(false); return; }
    setBusy(true);
    try {
      await editMessage(channelId, message.id, text);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (busy || !window.confirm('Delete this message? This cannot be undone.')) return;
    setBusy(true);
    try {
      await deleteMessage(channelId, message.id);
    } catch {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div className="rl-compose" style={{ marginTop: 2 }}>
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save(); }
            if (e.key === 'Escape') { setDraft(message.body); setEditing(false); }
          }}
          rows={1}
          maxLength={4000}
          aria-label="Edit message"
        />
        <button className="rl-btn pri sm" onClick={save} disabled={busy || !draft.trim()}>Save</button>
        <button className="rl-btn ghost sm" onClick={() => { setDraft(message.body); setEditing(false); }}>Cancel</button>
      </div>
    );
  }

  const bodyContent = search.trim()
    ? highlightSegments(message.body, search).map((s, i) => (s.hit ? <mark key={i} className="rl-hit">{s.text}</mark> : <span key={i}>{s.text}</span>))
    : message.body;

  return (
    <div className="rl-msgbody">
      <div className="tx">{bodyContent}{message.editedAtMs ? <span className="rl-tm rl-edited"> (edited)</span> : null}</div>
      {isMine && (
        <span className="rl-msgactions">
          <button className="rl-btn ghost sm" onClick={() => { setDraft(message.body); setEditing(true); }} aria-label="Edit message">Edit</button>
          <button className="rl-btn ghost sm" onClick={remove} aria-label="Delete message">Delete</button>
        </span>
      )}
    </div>
  );
}

function ReactionBar({
  reactions, currentUid, onToggle, onReply, replyCount,
}: {
  reactions: Record<string, string>; currentUid: string; onToggle: (e: string) => void; onReply?: () => void; replyCount?: number;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const counts = new Map<string, number>();
  for (const e of Object.values(reactions)) counts.set(e, (counts.get(e) ?? 0) + 1);
  const mine = reactions[currentUid];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
      {[...counts.entries()].map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={() => onToggle(emoji)}
          aria-label={`${emoji} ${count}`}
          className="rl-pill"
          style={mine === emoji ? { background: 'var(--coral-50)', borderColor: 'var(--coral-200)', color: 'var(--coral-600)' } : undefined}
        >
          {emoji} {count}
        </button>
      ))}
      <div style={{ position: 'relative' }}>
        <button className="rl-btn ghost sm" style={{ padding: '2px 8px' }} onClick={() => setPickerOpen((o) => !o)} aria-label="Add reaction">＋</button>
        {pickerOpen && (
          <div style={{ position: 'absolute', bottom: 30, left: 0, zIndex: 20, display: 'flex', gap: 2, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, padding: 4, boxShadow: 'var(--shadow-md)' }}>
            {['👍', '🎉', '🙌', '❤️', '👀', '✅'].map((e) => (
              <button key={e} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontSize: 16, padding: '2px 4px', borderRadius: 6 }} onClick={() => { onToggle(e); setPickerOpen(false); }}>{e}</button>
            ))}
          </div>
        )}
      </div>
      {onReply && (
        <button className="rl-btn ghost sm" style={{ padding: '2px 8px' }} onClick={onReply}>
          {replyCount ? `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}` : 'Reply'}
        </button>
      )}
    </div>
  );
}

type Member = { uid: string; displayName: string };

function Composer({
  channelId, authorUid, parentId = null, compact = false, members = [],
}: { channelId: string; authorUid: string; parentId?: string | null; compact?: boolean; members?: Member[] }) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [mention, setMention] = useState<MentionQuery | null>(null);
  const [sel, setSel] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const pendingCaret = useRef<number | null>(null);

  const suggestions = mention ? rankMentions(members, mention.query) : [];
  const open = suggestions.length > 0;

  // Apply a caret move after a mention insertion (once the new value has rendered).
  useEffect(() => {
    if (pendingCaret.current != null && taRef.current) {
      taRef.current.setSelectionRange(pendingCaret.current, pendingCaret.current);
      pendingCaret.current = null;
    }
  }, [body]);

  function refreshMention(value: string, caret: number) {
    setMention(mentionQuery(value, caret));
    setSel(0);
  }

  function pick(name: string) {
    if (!mention) return;
    const caret = taRef.current?.selectionStart ?? body.length;
    const r = applyMention(body, mention.start, caret, name);
    setBody(r.text);
    pendingCaret.current = r.caret;
    setMention(null);
    taRef.current?.focus();
  }

  async function submit() {
    const el = taRef.current;
    // Read the LIVE textarea value, not the `body` closure — a fill()+Enter (or fast typing) can
    // fire this handler before React has re-rendered with the latest state.
    const text = (el?.value ?? body).trim().slice(0, 4000);
    if (!text) return;
    // Clear the field imperatively AND via state. The imperative clear is what makes a rapid
    // duplicate Enter safe: the second read sees an empty value and bails on `!text`. We don't gate
    // on a `sending` flag, so a genuinely new message still posts even while a prior send is still
    // awaiting its server ack (Firestore echoes the local write to onSnapshot before that ack).
    if (el) el.value = '';
    setBody('');
    setMention(null);
    setSending(true);
    try {
      const id = await sendMessage(channelId, authorUid, text, parentId);
      void runDetection(`channels/${channelId}/messages/${id}`, text);
    } catch {
      setBody(text);
      if (el && !el.value) el.value = text;
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (open) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => (s + 1) % suggestions.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => (s - 1 + suggestions.length) % suggestions.length); return; }
      if (e.key === 'Escape') { e.preventDefault(); setMention(null); return; }
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); pick(suggestions[sel].displayName); return; }
      if (e.key === 'Tab') { e.preventDefault(); pick(suggestions[sel].displayName); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  return (
    <div style={{ padding: compact ? 12 : '14px 24px', borderTop: '1px solid var(--line)', background: 'var(--bg)', position: 'relative' }}>
      {open && (
        <div className="rl-mentions" role="listbox" aria-label="Mention a teammate">
          {suggestions.map((m, i) => (
            <button
              key={m.uid}
              role="option"
              aria-selected={i === sel}
              className={`rl-navlink ${i === sel ? 'on' : ''}`}
              style={{ width: '100%' }}
              onMouseDown={(e) => { e.preventDefault(); pick(m.displayName); }}
            >
              <Avatar name={m.displayName} size={22} />
              <span className="rl-grow">{m.displayName}</span>
            </button>
          ))}
        </div>
      )}
      <div className="rl-compose">
        {!parentId && <span className="rl-rally">Ask Rally</span>}
        <textarea
          ref={taRef}
          value={body}
          onChange={(e) => { setBody(e.target.value); refreshMention(e.target.value, e.target.selectionStart ?? e.target.value.length); }}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={4000}
          placeholder={parentId ? 'Reply…' : 'Message the channel'}
          aria-label={parentId ? 'Reply to thread' : 'Message the channel'}
        />
        <button className="rl-btn pri sm" onClick={submit} disabled={!body.trim() || sending}>Send</button>
      </div>
    </div>
  );
}

function ThreadPanel({ channelId, parent, profiles, authorUid, members, onClose }: { channelId: string; parent: MessageView; profiles: Profiles; authorUid: string; members: Member[]; onClose: () => void }) {
  const [replies, setReplies] = useState<MessageView[]>([]);
  useEffect(() => subscribeThread(channelId, parent.id, setReplies), [channelId, parent.id]);
  return (
    <>
      <div className="rl-row"><span className="rl-t3 rl-grow">Thread</span><button className="rl-btn ghost sm" onClick={onClose}>Close</button></div>
      <div className="rl-card" style={{ padding: 14 }}>
        <div className="hd" style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}><b className="rl-name">{profiles[parent.authorUid]?.displayName ?? 'member'}</b></div>
        <div className="rl-tb">{parent.body}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
        {replies.map((r) => (
          <div className="rl-msg" key={r.id}>
            <Avatar name={profiles[r.authorUid]?.displayName ?? r.authorUid} size={28} />
            <div className="rl-bub rl-grow">
              <div className="hd"><b>{profiles[r.authorUid]?.displayName ?? 'member'}</b></div>
              <div className="tx">{r.body}</div>
              <ReactionBar
                reactions={r.reactions}
                currentUid={authorUid}
                onToggle={(emoji) => toggleReaction(channelId, r.id, authorUid, emoji, r.reactions[authorUid])}
              />
            </div>
          </div>
        ))}
      </div>
      <Composer channelId={channelId} authorUid={authorUid} parentId={parent.id} members={members} compact />
    </>
  );
}

function ChannelRail({ channelId, messageCount, memberCount }: { channelId: string; messageCount: number; memberCount: number }) {
  return (
    <>
      <AskRallyCard channelId={channelId} />
      <div className="rl-card" style={{ padding: 15 }}>
        <span className="rl-k gold"><span className="d" />Live in this channel</span>
        <div className="rl-row"><span className="rl-tm rl-grow">Messages</span><span className="rl-pill">{messageCount}</span></div>
        <div className="rl-row"><span className="rl-tm rl-grow">Members</span><span className="rl-pill">{memberCount}</span></div>
      </div>
    </>
  );
}

function AskRallyCard({ channelId }: { channelId: string }) {
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function ask() {
    const question = q.trim();
    if (!question || busy) return;
    setBusy(true);
    setAnswer(null);
    const res = await askRally(channelId, question);
    setAnswer(res.available ? res.answer : "Rally can't answer right now — try again later.");
    setBusy(false);
  }
  return (
    <div className="rl-card" style={{ padding: 15 }}>
      <span className="rl-k indigo"><span className="d" />Ask Rally about this channel</span>
      <div className="rl-compose" style={{ padding: '6px 6px 6px 12px' }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask()} placeholder="What did we decide about…?" aria-label="Ask Rally about this channel" />
        <button className="rl-btn pri sm" onClick={ask} disabled={busy || !q.trim()}>{busy ? '…' : 'Ask'}</button>
      </div>
      {answer && <div className="rl-tm" style={{ whiteSpace: 'pre-wrap' }}>{answer}</div>}
      {!answer && (
        <>
          <div className="rl-tm" style={{ paddingTop: 4 }}>&ldquo;Summarize this thread&rdquo;</div>
          <div className="rl-tm" style={{ paddingTop: 4, borderTop: '1px solid var(--slate-100)' }}>&ldquo;Who owns the deploy?&rdquo;</div>
        </>
      )}
    </div>
  );
}

function DmModal({ me, profiles, onClose, onPick }: { me: string; profiles: Profiles; onClose: () => void; onPick: (uid: string) => void }) {
  const [q, setQ] = useState('');
  const people = Object.entries(profiles).filter(([uid]) => uid !== me).filter(([, p]) => p.displayName.toLowerCase().includes(q.toLowerCase()));
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(10,37,64,.28)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh' }}>
      <div onClick={(e) => e.stopPropagation()} className="rl-card" style={{ width: 360, maxHeight: '60vh', gap: 8 }}>
        <span className="rl-k"><span className="d" />New message</span>
        <div className="rl-compose" style={{ padding: '6px 6px 6px 12px' }}>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Message someone…" aria-label="Search people to message" />
        </div>
        <div style={{ overflowY: 'auto' }}>
          {people.length === 0 && <div className="rl-tm" style={{ padding: '6px 2px' }}>No one found.</div>}
          {people.map(([uid, p]) => (
            <button key={uid} onClick={() => onPick(uid)} className="rl-navlink" style={{ width: '100%' }}>
              <Avatar name={p.displayName} url={p.avatarUrl} size={26} />
              <span className="rl-grow">{p.displayName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function fmt(ms: number | null): string {
  if (!ms) return '';
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
