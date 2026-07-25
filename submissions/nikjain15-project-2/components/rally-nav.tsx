'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth-context';
import {
  hasUnread,
  subscribeChannels,
  subscribeLatestMessage,
  subscribeProfiles,
  subscribeReads,
  type ChannelView,
} from '../lib/data';

export type NavPage = 'home' | 'channels' | 'quests' | 'leaderboard' | 'profile';

type Profiles = Record<string, { displayName: string; avatarUrl: string | null }>;

/**
 * The left nav from the visual contract (rally-app-light.html): brand mark, primary sections,
 * the channel list with unread dots, and the "me" footer. Shared across all screens. On the
 * channels screen it selects in place (onSelectChannel); elsewhere its channel links route to
 * /channels?c=<id>.
 */
export function RallyNav({
  active,
  activeChannelId,
  onSelectChannel,
}: {
  active: NavPage;
  activeChannelId?: string | null;
  onSelectChannel?: (id: string) => void;
}) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [channels, setChannels] = useState<ChannelView[]>([]);
  const [profiles, setProfiles] = useState<Profiles>({});

  useEffect(() => {
    if (!user) return;
    const off = subscribeChannels(user.uid, setChannels);
    const offP = subscribeProfiles(setProfiles);
    return () => {
      off();
      offP();
    };
  }, [user]);

  if (!user) return null;
  const rooms = channels.filter((c) => c.kind === 'channel');
  const dms = channels.filter((c) => c.kind === 'dm');
  const me = profiles[user.uid];

  const openChannel = (id: string) => {
    if (onSelectChannel) onSelectChannel(id);
    else router.push(`/channels?c=${encodeURIComponent(id)}`);
  };
  const dmLabel = (c: ChannelView) => {
    const other = c.memberUids.find((u) => u !== user.uid);
    return other ? profiles[other]?.displayName ?? 'Direct message' : 'Note to self';
  };

  return (
    <nav className="rl-nav">
      <div className="rl-brand"><span className="rl-mk" />Rally</div>

      <Link href="/home" className={`rl-navlink ${active === 'home' ? 'on' : ''}`}>
        <span className="ic" />Home
      </Link>
      <Link href="/channels" className={`rl-navlink ${active === 'channels' ? 'on' : ''}`}>
        <span className="ic" />Channels
        {rooms.length > 0 && <span className="ct">{rooms.length}</span>}
      </Link>
      <Link href="/quests" className={`rl-navlink ${active === 'quests' ? 'on' : ''}`}>
        <span className="ic" />My quests
      </Link>
      <Link href="/leaderboard" className={`rl-navlink ${active === 'leaderboard' ? 'on' : ''}`}>
        <span className="ic" />Leaderboard
      </Link>

      <div className="rl-lbl">Channels</div>
      {rooms.map((c) => (
        <button
          key={c.id}
          onClick={() => openChannel(c.id)}
          className={`rl-navlink ${active === 'channels' && c.id === activeChannelId ? 'on' : ''}`}
        >
          <span style={{ color: 'var(--slate-400)' }}>#</span>
          <span className="rl-grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {c.name}
          </span>
          <UnreadDot channelId={c.id} uid={user.uid} active={active === 'channels' && c.id === activeChannelId} />
        </button>
      ))}

      {dms.length > 0 && <div className="rl-lbl">Direct messages</div>}
      {dms.map((c) => (
        <button
          key={c.id}
          onClick={() => openChannel(c.id)}
          className={`rl-navlink ${active === 'channels' && c.id === activeChannelId ? 'on' : ''}`}
        >
          <Avatar name={dmLabel(c)} size={17} />
          <span className="rl-grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {dmLabel(c)}
          </span>
          <UnreadDot channelId={c.id} uid={user.uid} active={active === 'channels' && c.id === activeChannelId} />
        </button>
      ))}

      <div className={`rl-me ${active === 'profile' ? 'on' : ''}`}>
        <Link href="/profile" className="rl-grow" style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0, color: 'inherit', textDecoration: 'none' }} aria-label="Profile and settings">
          <Avatar name={me?.displayName ?? 'You'} url={me?.avatarUrl ?? null} size={30} />
          <span className="rl-grow" style={{ minWidth: 0 }}>
            <b>{me?.displayName ?? 'You'}</b>
            <br />
            <span>@{me?.displayName?.toLowerCase().replace(/\s+/g, '') ?? 'you'}</span>
          </span>
        </Link>
        <button onClick={() => signOut()} className="rl-btn ghost sm" aria-label="Sign out">
          ⏻
        </button>
      </div>
    </nav>
  );
}

function UnreadDot({ channelId, uid, active }: { channelId: string; uid: string; active: boolean }) {
  const [latest, setLatest] = useState<{ authorUid: string; createdAtMs: number | null } | null>(null);
  const [lastReadMs, setLastReadMs] = useState<number | null>(null);
  useEffect(() => {
    const off = subscribeLatestMessage(channelId, setLatest);
    const offR = subscribeReads(channelId, uid, setLastReadMs);
    return () => {
      off();
      offR();
    };
  }, [channelId, uid]);
  if (active || !hasUnread(latest, lastReadMs, uid)) return null;
  return <span className="dot" aria-label="unread" />;
}

export function Avatar({ name, url, size = 34 }: { name: string; url?: string | null; size?: number }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.42) };
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="rl-av" style={style} />;
  }
  return (
    <span className="rl-av" style={style}>
      {(name || '?').slice(0, 1).toUpperCase()}
    </span>
  );
}
