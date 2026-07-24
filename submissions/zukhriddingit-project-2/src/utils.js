export const SIGNAL_META = {
  message: { label: 'Message', icon: 'message-circle' },
  update: { label: 'Update', icon: 'activity' },
  ask: { label: 'Ask', icon: 'alert-circle' },
  decision: { label: 'Decision', icon: 'check-circle' },
  win: { label: 'Win', icon: 'star' }
};

export const REACTIONS = {
  fire: '🔥', ship: '🚀', spark: '✨', heart: '💜', eyes: '👀', clap: '👏', idea: '💡'
};

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function safeUrl(value = '') {
  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

export function renderRichText(value = '', currentHandle = '') {
  let text = escapeHtml(value);
  text = text.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(^|\s)(https?:\/\/[^\s<]+)/g, (match, lead, raw) => {
    const url = safeUrl(raw);
    return url ? `${lead}<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${raw}</a>` : match;
  });
  text = text.replace(/(^|\s)@([a-zA-Z0-9-]+)/g, (match, lead, handle) => {
    const self = handle.toLowerCase() === currentHandle.toLowerCase() ? ' is-self' : '';
    return `${lead}<span class="mention${self}" data-handle="${escapeHtml(handle)}">@${escapeHtml(handle)}</span>`;
  });
  return text.replace(/\n/g, '<br>');
}

export function initials(name = '') {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'R';
}

export function hashString(value = '') {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

const palette = [
  ['#ff8a66', '#a88bff'], ['#a88bff', '#6dccff'], ['#c3f574', '#68ccff'],
  ['#ffd56d', '#ff8365'], ['#6fe1ad', '#a88bff'], ['#ff7d8d', '#ffd56d']
];

export function avatarStyle(seed = '') {
  const [a, b] = palette[hashString(seed) % palette.length];
  return `--avatar-a:${a};--avatar-b:${b};`;
}

export function avatarHtml(member = {}, sizeClass = '') {
  const image = safeUrl(member.avatarUrl || '');
  const style = image
    ? `background-image:url('${escapeHtml(image)}');background-color:var(--panel-3);color:transparent;`
    : avatarStyle(member.githubHandle || member.displayName || member.uid);
  return `<span class="avatar ${sizeClass}" style="${style}">${image ? '' : initials(member.displayName || member.githubHandle)}</span>`;
}

export function toDate(value) {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') return new Date(value);
  if (value.seconds) return new Date(value.seconds * 1000);
  return new Date();
}

export function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(toDate(value));
}

export function formatDateLabel(value) {
  const date = toDate(value);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((start - target) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).format(date);
}

export function relativeTime(value) {
  const ms = Date.now() - toDate(value).getTime();
  const abs = Math.abs(ms);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  if (abs < 60000) return 'now';
  if (abs < 3600000) return rtf.format(-Math.round(ms / 60000), 'minute');
  if (abs < 86400000) return rtf.format(-Math.round(ms / 3600000), 'hour');
  return rtf.format(-Math.round(ms / 86400000), 'day');
}

export function formatBytes(bytes = 0) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}

export function uuid(prefix = '') {
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}${id}`;
}

export function debounce(fn, delay = 180) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, wait = 1000) {
  let last = 0;
  let pending;
  return (...args) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    clearTimeout(pending);
    if (remaining <= 0) {
      last = now;
      fn(...args);
    } else {
      pending = setTimeout(() => { last = Date.now(); fn(...args); }, remaining);
    }
  };
}

export function parseMentions(content = '') {
  return [...new Set([...String(content).matchAll(/(?:^|\s)@([a-zA-Z0-9-]+)/g)].map((match) => match[1].toLowerCase()))];
}

export function isOnline(member, thresholdMinutes = 6) {
  if (member.status === 'online') return true;
  return Date.now() - toDate(member.lastSeenAt).getTime() < thresholdMinutes * 60000;
}

export function deterministicConversationId(uidA, uidB) {
  return [uidA, uidB].sort().join('__');
}

export function deadlineState(deadlineIso) {
  const deadline = new Date(deadlineIso);
  const now = new Date();
  const totalWindow = 7 * 86400000;
  const remaining = Math.max(0, deadline.getTime() - now.getTime());
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  return {
    label: remaining <= 0 ? 'Closed' : `${days}d ${String(hours).padStart(2, '0')}h`,
    progress: Math.max(3, Math.min(100, ((totalWindow - remaining) / totalWindow) * 100)),
    isPast: remaining <= 0
  };
}

export function groupByDate(messages = []) {
  const groups = [];
  for (const message of messages) {
    const key = toDate(message.createdAt).toDateString();
    const last = groups.at(-1);
    if (!last || last.key !== key) groups.push({ key, label: formatDateLabel(message.createdAt), items: [] });
    groups.at(-1).items.push(message);
  }
  return groups;
}

export function normalizeChannelName(value = '') {
  return value.toLowerCase().trim().replace(/[^a-z0-9-\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 42);
}

export function fileKind(file = {}) {
  const type = file.type || file.contentType || '';
  if (type.startsWith('image/')) return 'image';
  return 'file';
}
