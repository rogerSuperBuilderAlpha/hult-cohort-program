'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Bell, Hash, LogOut, Menu, MessageCircle, Plus, Search, Send, Trash2, Pencil,
  Check, X, Settings, ShieldCheck, Sun, Moon, Users, Sparkles, Smile, Reply,
  CheckCircle2, Lock, ArrowLeft, AtSign,
} from 'lucide-react';

type Channel = { id: string; name: string; slug: string; description: string | null; is_private: boolean; space_id: string; created_by?: string | null };
type Space = { id: string; name: string; slug: string; icon: string };
type Profile = {
  id: string; display_name: string; username: string | null; avatar_url: string | null; status: string;
  notify_on_mention?: boolean; notify_on_reply?: boolean;
};
type Message = { id: string; channel_id: string; author_id: string; parent_id: string | null; body: string; created_at: string; edited_at: string | null; author?: Profile };
type Reaction = { message_id: string; user_id: string; emoji: string };
type Notification = {
  id: string; user_id: string; actor_id: string | null; message_id: string | null; kind: string; read_at: string | null; created_at: string;
  actor?: Profile | null; message?: { id: string; channel_id: string; body: string } | null;
};

const EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥'];
const MENTION_RE = /@([a-zA-Z0-9_.]{2,32})/g;

const supabase = createClient();

function initials(name: string | null | undefined) {
  return (name || 'N').slice(0, 1).toUpperCase();
}

function notificationText(n: Notification) {
  const who = n.actor?.display_name || 'Someone';
  if (n.kind === 'mention') return `${who} mentioned you`;
  if (n.kind === 'reply') return `${who} replied to your message`;
  if (n.kind === 'announcement') return `${who} posted an announcement`;
  return `${who} sent an update`;
}

export default function HultHubApp() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [threadParentId, setThreadParentId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [error, setError] = useState('');

  const [showMembers, setShowMembers] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  const [settingsForm, setSettingsForm] = useState({ displayName: '', username: '', notifyMention: true, notifyReply: true, status: 'online' });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [newChannel, setNewChannel] = useState({ name: '', description: '', isPrivate: false, spaceId: '' });
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [createChannelError, setCreateChannelError] = useState('');

  const messageIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => { messageIdsRef.current = new Set(messages.map(m => m.id)); }, [messages]);

  useEffect(() => {
    const saved = localStorage.getItem('cohart-theme') as 'light' | 'dark' | null;
    const next = saved || 'light';
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('cohart-theme', next);
    document.documentElement.dataset.theme = next;
  };

  const load = async () => {
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/login'; return; }
    setUser(user);
    const [{ data: p, error: pe }, { data: s, error: se }, { data: c, error: ce }, { data: mr, error: me }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('spaces').select('*').order('created_at'),
      supabase.from('channels').select('*').order('created_at'),
      supabase.from('profiles').select('*').order('display_name').limit(200),
    ]);
    if (pe || se || ce || me) setError((pe || se || ce || me)?.message || 'Could not load Hult Hub.');
    setProfile(p);
    setSpaces(s || []);
    setChannels(c || []);
    setMembers(mr || []);
    if (p) setSettingsForm({
      displayName: p.display_name || '',
      username: p.username || '',
      notifyMention: p.notify_on_mention ?? true,
      notifyReply: p.notify_on_reply ?? true,
      status: p.status || 'online',
    });
    if (s && s[0] && !newChannel.spaceId) setNewChannel(f => ({ ...f, spaceId: (s.find((x: Space) => x.slug === 'cohort-central') || s[0]).id }));
    const initial = (c || []).find((x: Channel) => x.slug === 'general') || (c || [])[0];
    if (initial) setActiveChannel(initial);
    setLoading(false);
  };

  const loadMessages = async (channel: Channel) => {
    const { data, error } = await supabase.from('messages')
      .select('id,channel_id,author_id,parent_id,body,created_at,edited_at,author:profiles!messages_author_id_fkey(id,display_name,username,avatar_url,status)')
      .eq('channel_id', channel.id).order('created_at', { ascending: true }).limit(200);
    if (error) { setError(error.message); setMessages([]); setReactions([]); return; }
    const ids = (data || []).map((x: any) => x.id);
    const { data: rx, error: re } = ids.length
      ? await supabase.from('message_reactions').select('message_id,user_id,emoji').in('message_id', ids)
      : { data: [], error: null };
    if (re) setError(re.message);
    setMessages((data as any) || []);
    setReactions((rx as Reaction[]) || []);
  };

  const loadNotifications = async (userId: string) => {
    const { data, error } = await supabase.from('notifications')
      .select('id,user_id,actor_id,message_id,kind,read_at,created_at,actor:profiles!notifications_actor_id_fkey(id,display_name,username,avatar_url,status),message:messages!notifications_message_id_fkey(id,channel_id,body)')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    if (error) { setError(error.message); return; }
    setNotifications((data as any) || []);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (activeChannel) { loadMessages(activeChannel); setThreadParentId(null); } }, [activeChannel]);
  useEffect(() => { if (user) loadNotifications(user.id); }, [user]);

  // Realtime: messages (insert/update/delete) + reactions, scoped to the active channel.
  useEffect(() => {
    if (!activeChannel) return;
    const rt = supabase.channel(`channel-live:${activeChannel.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannel.id}` }, async payload => {
        const { data } = await supabase.from('messages')
          .select('id,channel_id,author_id,parent_id,body,created_at,edited_at,author:profiles!messages_author_id_fkey(id,display_name,username,avatar_url,status)')
          .eq('id', payload.new.id).single();
        if (data) setMessages(prev => prev.some(m => m.id === (data as any).id) ? prev : [...prev, data as any]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannel.id}` }, payload => {
        setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, body: payload.new.body, edited_at: payload.new.edited_at } : m));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannel.id}` }, payload => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message_reactions' }, payload => {
        const row = payload.new as Reaction;
        if (messageIdsRef.current.has(row.message_id)) setReactions(prev => prev.some(r => r.message_id === row.message_id && r.user_id === row.user_id && r.emoji === row.emoji) ? prev : [...prev, row]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'message_reactions' }, payload => {
        const row = payload.old as Reaction;
        setReactions(prev => prev.filter(r => !(r.message_id === row.message_id && r.user_id === row.user_id && r.emoji === row.emoji)));
      })
      .subscribe();
    return () => { supabase.removeChannel(rt); };
  }, [activeChannel]);

  // Realtime: notifications for the signed-in user.
  useEffect(() => {
    if (!user) return;
    const rt = supabase.channel(`notifications:${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, async payload => {
        const { data } = await supabase.from('notifications')
          .select('id,user_id,actor_id,message_id,kind,read_at,created_at,actor:profiles!notifications_actor_id_fkey(id,display_name,username,avatar_url,status),message:messages!notifications_message_id_fkey(id,channel_id,body)')
          .eq('id', payload.new.id).single();
        if (data) setNotifications(prev => prev.some(n => n.id === (data as any).id) ? prev : [data as any, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(rt); };
  }, [user]);

  // Realtime presence: who is currently connected to Hult Hub.
  useEffect(() => {
    if (!user) return;
    const presence = supabase.channel('presence:cohort-hub', { config: { presence: { key: user.id } } });
    presence
      .on('presence', { event: 'sync' }, () => {
        setOnlineIds(new Set(Object.keys(presence.presenceState())));
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') await presence.track({ online_at: new Date().toISOString() });
      });
    return () => { supabase.removeChannel(presence); };
  }, [user]);

  const deleteMessage = async (messageId: string) => {
    if (!user) return;
    if (!window.confirm('Delete this message?')) return;
    const { error } = await supabase.from('messages').delete().eq('id', messageId).eq('author_id', user.id);
    if (error) { alert(error.message); return; }
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const editMessage = async (messageId: string, body: string) => {
    if (!user || !body.trim()) return;
    const { data, error } = await supabase.from('messages')
      .update({ body: body.trim(), edited_at: new Date().toISOString() })
      .eq('id', messageId).eq('author_id', user.id)
      .select('id, channel_id, author_id, body, created_at, edited_at').single();
    if (error) { alert(error.message); return; }
    if (data) setMessages(prev => prev.map(m => m.id === messageId ? { ...m, ...data } : m));
  };

  const sendMessage = async () => {
    const body = text.trim();
    if (!body || !activeChannel || !user || sending) return;
    setSending(true); setError(''); setText('');
    const { error } = await supabase.from('messages').insert({ channel_id: activeChannel.id, author_id: user.id, parent_id: replyTo?.id ?? null, body });
    if (error) { setText(body); setError(error.message); } else setReplyTo(null);
    setSending(false);
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    const existing = reactions.find(r => r.message_id === messageId && r.user_id === user.id && r.emoji === emoji);
    if (existing) {
      const { error } = await supabase.from('message_reactions').delete().match({ message_id: messageId, user_id: user.id, emoji });
      if (!error) setReactions(prev => prev.filter(r => r !== existing));
    } else {
      const { data, error } = await supabase.from('message_reactions').insert({ message_id: messageId, user_id: user.id, emoji }).select().single();
      if (!error && data) setReactions(prev => [...prev, data as Reaction]);
    }
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: n.read_at || new Date().toISOString() } : n));
    await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
  };

  const markAllRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id);
    if (!unreadIds.length) return;
    setNotifications(prev => prev.map(n => n.read_at ? n : { ...n, read_at: new Date().toISOString() }));
    await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', user.id).is('read_at', null);
  };

  const openNotification = async (n: Notification) => {
    if (!n.read_at) await markNotificationRead(n.id);
    if (n.message?.channel_id) {
      const channel = channels.find(c => c.id === n.message!.channel_id);
      if (channel) setActiveChannel(channel);
    }
    setNotifOpen(false);
  };

  const saveSettings = async () => {
    if (!user) return;
    setSettingsSaving(true); setSettingsError(''); setSettingsSaved(false);
    const { data, error } = await supabase.from('profiles').update({
      display_name: settingsForm.displayName.trim() || 'Cohort member',
      username: settingsForm.username.trim() || null,
      notify_on_mention: settingsForm.notifyMention,
      notify_on_reply: settingsForm.notifyReply,
      status: settingsForm.status,
    }).eq('id', user.id).select().single();
    if (error) setSettingsError(error.message.includes('duplicate') ? 'That username is already taken.' : error.message);
    else { setProfile(data); setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000); }
    setSettingsSaving(false);
  };

  const createChannel = async () => {
    if (!user) return;
    const name = newChannel.name.trim();
    if (!name) { setCreateChannelError('Give the channel a name.'); return; }
    if (!newChannel.spaceId) { setCreateChannelError('Choose a space for this channel.'); return; }
    setCreatingChannel(true); setCreateChannelError('');
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '') || 'channel';
    let slug = baseSlug;
    let { data: created, error } = await supabase.from('channels')
      .insert({ space_id: newChannel.spaceId, name, slug, description: newChannel.description.trim() || null, is_private: newChannel.isPrivate, created_by: user.id })
      .select().single();
    if (error && (error as any).code === '23505') {
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
      ({ data: created, error } = await supabase.from('channels')
        .insert({ space_id: newChannel.spaceId, name, slug, description: newChannel.description.trim() || null, is_private: newChannel.isPrivate, created_by: user.id })
        .select().single());
    }
    if (error || !created) { setCreateChannelError(error?.message || 'Could not create the channel.'); setCreatingChannel(false); return; }
    await supabase.from('channel_members').insert({ channel_id: created.id, user_id: user.id });
    setChannels(prev => [...prev, created as Channel]);
    setActiveChannel(created as Channel);
    setCreateChannelOpen(false);
    setNewChannel(f => ({ ...f, name: '', description: '', isPrivate: false }));
    setCreatingChannel(false);
  };

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = '/login'; };

  const memberByUsername = useMemo(() => {
    const map = new Map<string, Profile>();
    members.forEach(m => { if (m.username) map.set(m.username, m); });
    return map;
  }, [members]);

  const renderBody = (body: string) => {
    const parts: (string | { mention: string })[] = [];
    let lastIndex = 0;
    for (const match of body.matchAll(MENTION_RE)) {
      const idx = match.index ?? 0;
      if (idx > lastIndex) parts.push(body.slice(lastIndex, idx));
      parts.push({ mention: match[1] });
      lastIndex = idx + match[0].length;
    }
    if (lastIndex < body.length) parts.push(body.slice(lastIndex));
    return parts.map((p, i) => {
      if (typeof p === 'string') return <span key={i}>{p}</span>;
      const known = memberByUsername.has(p.mention);
      return known ? <b key={i} className="mention">@{p.mention}</b> : <span key={i}>@{p.mention}</span>;
    });
  };

  const grouped = useMemo(() => spaces.map(space => ({
    ...space,
    channels: channels.filter(c => c.space_id === space.id && c.name.toLowerCase().includes(search.toLowerCase())),
  })).filter(s => s.channels.length), [spaces, channels, search]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read_at).length, [notifications]);

  const repliesOf = (id: string) => messages.filter(m => m.parent_id === id);

  const baseFiltered = useMemo(() => messages.filter(m =>
    !messageSearch || m.body.toLowerCase().includes(messageSearch.toLowerCase()) || m.author?.display_name.toLowerCase().includes(messageSearch.toLowerCase())
  ), [messages, messageSearch]);

  const threadParent = threadParentId ? messages.find(m => m.id === threadParentId) : null;
  const visibleMessages = threadParent ? [threadParent, ...repliesOf(threadParent.id)] : baseFiltered.filter(m => !threadParentId);

  if (loading) return <div className="hub-loading"><Sparkles size={25} />Preparing your cohort workspace…</div>;

  return <div className="hub-shell">
    {mobileOpen && <button className="mobile-overlay" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
    <aside className={`hub-sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="hub-brand"><div className="hub-logo">✦</div><div><strong>Hult Hub</strong><span>Hult Summer Pilot · 2026</span></div><button className="close-mobile" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>
      <div className="search sidebar-search"><Search size={15} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a channel…" /></div>
      <div className="primary-nav">
        <button className="nav-item active"><MessageCircle size={17} />Messages</button>
        <button className={`nav-item ${showMembers ? 'active' : ''}`} onClick={() => setShowMembers(v => !v)}><Users size={17} />People <b>{members.length}</b></button>
        <button className="nav-item" onClick={() => setNotifOpen(v => !v)}><Bell size={17} />Notifications {unreadCount > 0 && <b>{unreadCount}</b>}</button>
      </div>
      <div className="section-label"><span>SPACES</span><button className="icon-plain" onClick={() => setCreateChannelOpen(true)} title="Create a channel"><Plus size={14} /></button></div>
      {grouped.map(space => <div key={space.id}>
        <div className="space-title"><span className="space-icon">{space.icon}</span>{space.name}</div>
        {space.channels.map(channel => <button key={channel.id} className={`channel ${activeChannel?.id === channel.id ? 'selected' : ''}`} onClick={() => { setActiveChannel(channel); setMobileOpen(false); }}>
          {channel.is_private ? <Lock size={13} /> : <Hash size={15} />}<span>{channel.name}</span>
        </button>)}
      </div>)}
      <div className="sidebar-bottom">
        <button className="nav-item" onClick={() => setSettingsOpen(true)}><Settings size={17} />Settings</button>
        <div className="profile-mini">
          <div className="avatar">{initials(profile?.display_name)}</div>
          <div><strong>{profile?.display_name || 'New member'}</strong><span><i className={`status-dot ${user && onlineIds.has(user.id) ? (profile?.status === 'away' ? 'away' : 'online') : 'offline'}`} />{user && onlineIds.has(user.id) ? (profile?.status || 'online') : 'offline'}</span></div>
          <button onClick={signOut} title="Sign out"><LogOut size={15} /></button>
        </div>
      </div>
    </aside>
    <main className="hub-main">
      <header className="topbar">
        <div className="breadcrumb"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><span>Hult Hub</span><span className="crumb-slash">/</span><strong>#{activeChannel?.name || 'general'}</strong></div>
        <div className="top-actions">
          <div className="top-search search"><Search size={15} /><input value={messageSearch} onChange={e => setMessageSearch(e.target.value)} placeholder="Search this channel…" /></div>
          <button className="icon-button" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
          <div className="notif-wrap">
            <button className="icon-button notification-button" onClick={() => setNotifOpen(v => !v)}><Bell size={18} />{unreadCount > 0 && <i />}</button>
            {notifOpen && <div className="dropdown-panel notif-panel">
              <div className="dropdown-head"><strong>Notifications</strong>{unreadCount > 0 && <button className="link-btn" onClick={markAllRead}>Mark all read</button>}</div>
              <div className="dropdown-body">
                {notifications.length === 0 && <div className="dropdown-empty">You're all caught up.</div>}
                {notifications.map(n => <button key={n.id} className={`notif-row ${n.read_at ? '' : 'unread'}`} onClick={() => openNotification(n)}>
                  <div className="avatar small">{initials(n.actor?.display_name)}</div>
                  <div><strong>{notificationText(n)}</strong>{n.message?.body && <span className="notif-preview">{n.message.body.slice(0, 80)}</span>}<time>{new Date(n.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></div>
                </button>)}
              </div>
            </div>}
          </div>
          <div className="avatar large">{initials(profile?.display_name)}</div>
        </div>
      </header>
      {error && <div className="error-banner"><span>{error}</span><button onClick={() => setError('')}><X size={15} /></button></div>}
      <div className="content-grid">
        <section className="conversation">
          <div className="channel-head">
            <div>
              <div className="channel-kicker"><span>{activeChannel?.is_private ? 'PRIVATE CHANNEL' : 'COHORT CENTRAL'}</span><CheckCircle2 size={13} /></div>
              <div className="channel-title">{activeChannel?.is_private ? <Lock size={20} /> : <Hash size={23} />}<h1>{threadParent ? `Thread` : (activeChannel?.name || 'Welcome')}</h1></div>
              <p>{threadParent ? `Replies to ${threadParent.author?.display_name || 'a message'}` : (activeChannel?.description || 'Welcome to Hult Hub.')}</p>
            </div>
            <div className="head-actions">
              {threadParent
                ? <button className="secondary" onClick={() => setThreadParentId(null)}><ArrowLeft size={16} />Back to channel</button>
                : <>
                  <button className="secondary" onClick={() => setShowMembers(v => !v)}><Users size={17} />{members.length}</button>
                  <button className="primary" onClick={() => setCreateChannelOpen(true)}><Plus size={16} />Channel</button>
                </>}
            </div>
          </div>
          <div className="message-list">
            {visibleMessages.length === 0
              ? <div className="empty-state"><div className="empty-icon"><Sparkles /></div><h2>{messageSearch ? 'No messages found' : 'Welcome to #' + (activeChannel?.name || 'general')}</h2><p>{messageSearch ? 'Try a different search term.' : 'This is the beginning of the conversation. Be the first to say hello.'}</p></div>
              : visibleMessages.map(message => {
                const parent = message.parent_id ? messages.find(x => x.id === message.parent_id) : null;
                const replyCount = threadParentId ? 0 : repliesOf(message.id).length;
                return <article className="message" key={message.id}>
                  <div className="avatar message-avatar">{initials(message.author?.display_name)}</div>
                  <div className="message-body">
                    {parent && !threadParentId && <div className="reply-context"><Reply size={11} />Replying to <strong>{parent.author?.display_name || 'a member'}</strong>: {parent.body.slice(0, 60)}</div>}
                    <div className="message-meta"><strong>{message.author?.display_name || 'Cohort member'}</strong>{message.author?.id === user?.id && <span className="you-badge">you</span>}<time>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>{message.edited_at && <span className="edited-tag">(edited)</span>}</div>
                    <p>{renderBody(message.body)}</p>
                    <div className="message-actions">
                      {message.author_id === user?.id && <>
                        <button type="button" onClick={() => { const next = window.prompt('Edit message', message.body); if (next !== null && next.trim() && next.trim() !== message.body) editMessage(message.id, next); }}><Pencil size={13} /> Edit</button>
                        <button type="button" onClick={() => deleteMessage(message.id)}><Trash2 size={13} /> Delete</button>
                      </>}
                      {!threadParentId && <button onClick={() => setReplyTo(message)}><Reply size={13} />Reply</button>}
                      {EMOJIS.map(emoji => {
                        const count = reactions.filter(r => r.message_id === message.id && r.emoji === emoji).length;
                        const mine = reactions.some(r => r.message_id === message.id && r.user_id === user?.id && r.emoji === emoji);
                        return <button key={emoji} className={mine ? 'reaction-active' : ''} onClick={() => toggleReaction(message.id, emoji)}>{emoji}{count > 0 && <span>{count}</span>}</button>;
                      })}
                    </div>
                    {replyCount > 0 && <button className="thread-link" onClick={() => setThreadParentId(message.id)}>View {replyCount} {replyCount === 1 ? 'reply' : 'replies'}</button>}
                  </div>
                </article>;
              })}
          </div>
          <div className="composer-wrap">
            {replyTo && <div className="reply-banner"><span>Replying to <strong>{replyTo.author?.display_name || 'member'}</strong>: {replyTo.body.slice(0, 90)}</span><button onClick={() => setReplyTo(null)}><X size={14} /></button></div>}
            <div className="composer">
              <button className="composer-icon" title="Mention someone" onClick={() => setText(t => t + '@')}><AtSign size={18} /></button>
              <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder={`Message #${activeChannel?.name || 'general'}`} disabled={!activeChannel || sending} />
              <button className="composer-icon" title="Emoji"><Smile size={19} /></button>
              <button className="send-button" onClick={sendMessage} disabled={!text.trim() || sending}><Send size={17} /></button>
            </div>
            <small>Press Enter to send · Live with Supabase Realtime · Protected by Row Level Security</small>
          </div>
        </section>
        {showMembers && <aside className="member-panel">
          <div className="member-panel-head"><div><strong>People</strong><span>Active cohort members</span></div><b>{members.length}</b></div>
          <div className="member-list">{members.slice(0, 40).map(m => {
            const online = onlineIds.has(m.id);
            return <div className="member-row" key={m.id}>
              <div className="avatar">{initials(m.display_name)}</div>
              <div><strong>{m.display_name}</strong><span><i className={`status-dot ${online ? (m.status === 'away' ? 'away' : 'online') : 'offline'}`} />{online ? (m.status || 'online') : 'offline'}</span></div>
              {m.id === user?.id && <ShieldCheck size={15} />}
            </div>;
          })}</div>
        </aside>}
      </div>
    </main>

    {settingsOpen && <div className="modal-overlay" onClick={() => setSettingsOpen(false)}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><strong>Settings</strong><button onClick={() => setSettingsOpen(false)}><X size={16} /></button></div>
        <div className="modal-body">
          <label>Display name<input value={settingsForm.displayName} onChange={e => setSettingsForm(f => ({ ...f, displayName: e.target.value }))} /></label>
          <label>Username<input value={settingsForm.username} onChange={e => setSettingsForm(f => ({ ...f, username: e.target.value.replace(/[^a-zA-Z0-9_.]/g, '') }))} placeholder="used for @mentions" /></label>
          <label>Status
            <select value={settingsForm.status} onChange={e => setSettingsForm(f => ({ ...f, status: e.target.value }))}>
              <option value="online">Online</option>
              <option value="away">Away</option>
              <option value="offline">Appear offline</option>
            </select>
          </label>
          <label className="checkbox-row"><input type="checkbox" checked={settingsForm.notifyMention} onChange={e => setSettingsForm(f => ({ ...f, notifyMention: e.target.checked }))} /> Notify me when someone @mentions me</label>
          <label className="checkbox-row"><input type="checkbox" checked={settingsForm.notifyReply} onChange={e => setSettingsForm(f => ({ ...f, notifyReply: e.target.checked }))} /> Notify me when someone replies to my message</label>
          <label className="checkbox-row"><input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} /> Dark mode</label>
          {settingsError && <div className="modal-error">{settingsError}</div>}
        </div>
        <div className="modal-foot">
          {settingsSaved && <span className="saved-tag"><Check size={14} />Saved</span>}
          <button className="primary" onClick={saveSettings} disabled={settingsSaving}>{settingsSaving ? 'Saving…' : 'Save settings'}</button>
        </div>
      </div>
    </div>}

    {createChannelOpen && <div className="modal-overlay" onClick={() => setCreateChannelOpen(false)}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><strong>Create a channel</strong><button onClick={() => setCreateChannelOpen(false)}><X size={16} /></button></div>
        <div className="modal-body">
          <label>Space
            <select value={newChannel.spaceId} onChange={e => setNewChannel(f => ({ ...f, spaceId: e.target.value }))}>
              {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label>Channel name<input value={newChannel.name} onChange={e => setNewChannel(f => ({ ...f, name: e.target.value }))} placeholder="e.g. product-updates" /></label>
          <label>Description<input value={newChannel.description} onChange={e => setNewChannel(f => ({ ...f, description: e.target.value }))} placeholder="What's this channel for?" /></label>
          <label className="checkbox-row"><input type="checkbox" checked={newChannel.isPrivate} onChange={e => setNewChannel(f => ({ ...f, isPrivate: e.target.checked }))} /> Make this a private channel (only you can see it for now)</label>
          {createChannelError && <div className="modal-error">{createChannelError}</div>}
        </div>
        <div className="modal-foot"><button className="primary" onClick={createChannel} disabled={creatingChannel}>{creatingChannel ? 'Creating…' : 'Create channel'}</button></div>
      </div>
    </div>}
  </div>;
}
