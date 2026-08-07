import { DemoAdapter } from './adapters/demo.js';
import { FirebaseAdapter } from './adapters/firebase.js';
import { hydrateIcons, icon } from './icons.js';
import {
  REACTIONS,
  SIGNAL_META,
  avatarHtml,
  avatarStyle,
  deadlineState,
  debounce,
  escapeHtml,
  fileKind,
  formatBytes,
  formatTime,
  groupByDate,
  initials,
  isOnline,
  normalizeChannelName,
  relativeTime,
  renderRichText,
  safeUrl,
  toDate
} from './utils.js';

const config = window.RELAY_CONFIG || {};
const $ = (id) => document.getElementById(id);
const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  adapter: null,
  profile: null,
  authUser: null,
  channels: [],
  members: [],
  conversations: [],
  notifications: [],
  messages: [],
  currentTarget: null,
  currentView: 'chat',
  pendingTask: null,
  threadRoot: null,
  threadReplies: [],
  commandItems: [],
  commandIndex: 0,
  highlightedMessageId: null,
  bookmarks: new Map(),
  favorites: new Set(),
  subscriptions: [],
  messagesUnsubscribe: null,
  threadUnsubscribe: null,
  presenceTimer: null,
  firebaseReady: false,
  searchToken: 0,
  emojiContext: null,
  lastMessageCount: 0
};

const elements = {
  auth: $('auth-screen'), pending: $('pending-screen'), app: $('app'), demoBanner: $('demo-banner'),
  channelList: $('channel-list'), dmList: $('dm-list'), messageList: $('message-list'), messageScroll: $('message-scroll'),
  collectionView: $('collection-view'), chatView: $('chat-view'), contextPanel: $('context-panel'), threadPanel: $('thread-panel'),
  modal: $('modal'), modalContent: $('modal-content'), modalBackdrop: $('modal-backdrop'),
  commandPalette: $('command-palette'), commandInput: $('command-input'), commandResults: $('command-results'),
  messageInput: $('message-input'), signalType: $('signal-type'), sendMessage: $('send-message'),
  taskPreview: $('task-preview'), toastStack: $('toast-stack'),
  emojiPopover: $('emoji-popover'), profileMenu: $('profile-menu')
};

function isFirebaseConfigured() {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  return required.every((key) => String(config.firebase?.[key] || '').trim());
}

function showScreen(name) {
  elements.auth.classList.toggle('is-hidden', name !== 'auth');
  elements.pending.classList.toggle('is-hidden', name !== 'pending');
  elements.app.classList.toggle('is-hidden', name !== 'app');
}

function applyTheme(theme = localStorage.getItem('relay65-theme') || 'dark') {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('relay65-theme', theme);
  qsa('[data-icon="sun"], [data-icon="moon"]').forEach((node) => {
    node.dataset.icon = theme === 'dark' ? 'sun' : 'moon';
    node.innerHTML = icon(node.dataset.icon);
  });
}

function toggleTheme() {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  toast('Theme switched', `Relay is now in ${document.documentElement.dataset.theme} mode.`, 'check-circle');
}

function toast(title, message = '', iconName = 'check-circle', error = false, duration = 3300) {
  const node = document.createElement('div');
  node.className = `toast${error ? ' is-error' : ''}`;
  node.innerHTML = `<span>${icon(iconName)}</span><span><b>${escapeHtml(title)}</b>${message ? `<small>${escapeHtml(message)}</small>` : ''}</span>`;
  elements.toastStack.append(node);
  setTimeout(() => { node.classList.add('is-leaving'); setTimeout(() => node.remove(), 260); }, duration);
}

function setBusy(button, busy, label = '') {
  if (!button) return;
  button.disabled = busy;
  if (busy) {
    button.dataset.previousHtml = button.innerHTML;
    button.innerHTML = `${icon('loader')} ${label || 'Working…'}`;
    qs('svg', button)?.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 800, iterations: Infinity });
  } else if (button.dataset.previousHtml) {
    button.innerHTML = button.dataset.previousHtml;
    delete button.dataset.previousHtml;
  }
}

function cleanupWorkspace() {
  state.subscriptions.forEach((unsubscribe) => { try { unsubscribe?.(); } catch { /* no-op */ } });
  state.subscriptions = [];
  state.messagesUnsubscribe?.();
  state.threadUnsubscribe?.();
  clearInterval(state.presenceTimer);
  state.messagesUnsubscribe = null;
  state.threadUnsubscribe = null;
}

async function startDemo(remember = true) {
  cleanupWorkspace();
  state.adapter = new DemoAdapter(config);
  await state.adapter.init();
  state.authUser = await state.adapter.signIn();
  state.profile = await state.adapter.checkMembership(state.authUser);
  if (remember) localStorage.setItem('relay65-demo-entered', '1');
  elements.demoBanner.classList.remove('is-hidden');
  await connectWorkspace();
}

async function startFirebase() {
  try {
    state.adapter = new FirebaseAdapter(config);
    await state.adapter.init();
    state.adapter.onAuth(async (user) => {
      state.authUser = user;
      if (!user) {
        cleanupWorkspace();
        elements.demoBanner.classList.add('is-hidden');
        showScreen('auth');
        return;
      }
      try {
        const profile = await state.adapter.checkMembership(user);
        if (!profile) return showPending(user);
        state.profile = profile;
        await connectWorkspace();
      } catch (error) {
        console.error(error);
        toast('Could not open the workspace', error.message || 'Check Firebase rules and configuration.', 'alert-circle', true, 5200);
        showScreen('auth');
      }
    });
  } catch (error) {
    console.error(error);
    toast('Firebase did not initialize', 'The app is staying available in demo mode. Check config.js and your network.', 'alert-circle', true, 6000);
    showScreen('auth');
  }
}

function showPending(user) {
  showScreen('pending');
  const identity = state.adapter.getStoredIdentity?.(user) || {};
  const displayName = identity.displayName || user.displayName || 'GitHub member';
  const handle = identity.githubHandle || displayName.replace(/\s+/g, '').toLowerCase();
  $('pending-name').textContent = displayName;
  $('pending-handle').textContent = `@${handle}`;
  $('pending-uid').textContent = user.uid;
  const avatar = $('pending-avatar');
  avatar.textContent = initials(displayName);
  avatar.style.cssText = avatarStyle(handle);
  if (identity.avatarUrl || user.photoURL) {
    avatar.style.backgroundImage = `url('${safeUrl(identity.avatarUrl || user.photoURL)}')`;
    avatar.textContent = '';
  }
}

async function connectWorkspace() {
  cleanupWorkspace();
  await state.adapter.ensureStarterChannels?.();
  loadUserLocalState();
  showScreen('app');
  elements.demoBanner.classList.toggle('is-hidden', state.adapter.mode !== 'demo');
  updateProfileUI();

  state.subscriptions.push(state.adapter.subscribeMembers((members) => {
    state.members = members;
    renderSidebar();
    renderHeader();
    renderContext();
  }));
  state.subscriptions.push(state.adapter.subscribeChannels((channels) => {
    state.channels = channels;
    renderSidebar();
    if (!state.currentTarget || (state.currentTarget.type === 'channel' && !channels.some((item) => item.id === state.currentTarget.id))) {
      const stored = readStoredTarget();
      const initial = stored?.type === 'channel' && channels.find((item) => item.id === stored.id)
        ? buildChannelTarget(channels.find((item) => item.id === stored.id))
        : buildChannelTarget(channels.find((item) => item.id === 'ship-room') || channels[0]);
      if (initial?.id) selectTarget(initial);
    } else if (state.currentTarget?.type === 'channel') {
      const fresh = channels.find((item) => item.id === state.currentTarget.id);
      if (fresh) { state.currentTarget = buildChannelTarget(fresh); renderHeader(); renderComposerState(); }
    }
  }));
  state.subscriptions.push(state.adapter.subscribeConversations((conversations) => {
    state.conversations = conversations;
    renderSidebar();
    if (state.currentTarget?.type === 'dm') {
      const conversation = conversations.find((item) => item.id === state.currentTarget.id);
      if (conversation) state.currentTarget = buildDmTarget(conversation);
      renderHeader();
    }
  }));
  state.subscriptions.push(state.adapter.subscribeNotifications((notifications) => {
    state.notifications = notifications;
    renderNotificationCounts();
    if (state.currentView === 'activity' || state.currentView === 'threads') renderCollectionView(state.currentView);
  }));

  state.presenceTimer = setInterval(() => state.adapter.updatePresence?.().catch(() => {}), 120000);
  state.adapter.updatePresence?.().catch(() => {});
  renderDeadline();
  renderSidebar();
  renderContext();
}

function loadUserLocalState() {
  const suffix = state.profile?.uid || 'anonymous';
  try {
    state.bookmarks = new Map(JSON.parse(localStorage.getItem(`relay65-bookmarks-${suffix}`) || '[]'));
    state.favorites = new Set(JSON.parse(localStorage.getItem(`relay65-favorites-${suffix}`) || '[]'));
  } catch {
    state.bookmarks = new Map(); state.favorites = new Set();
  }
}

function persistUserLocalState() {
  const suffix = state.profile?.uid || 'anonymous';
  localStorage.setItem(`relay65-bookmarks-${suffix}`, JSON.stringify([...state.bookmarks.entries()]));
  localStorage.setItem(`relay65-favorites-${suffix}`, JSON.stringify([...state.favorites]));
}

function updateProfileUI() {
  if (!state.profile) return;
  $('rail-avatar-label').textContent = initials(state.profile.displayName || state.profile.githubHandle);
  $('rail-profile').style.cssText = avatarStyle(state.profile.githubHandle || state.profile.uid);
}

function readStoredTarget() {
  try { return JSON.parse(localStorage.getItem('relay65-last-target') || 'null'); } catch { return null; }
}

function storeTarget(target) {
  localStorage.setItem('relay65-last-target', JSON.stringify({ type: target.type, id: target.id }));
}

function getMember(uid) { return state.members.find((member) => member.uid === uid || member.id === uid); }
function getChannel(id) { return state.channels.find((channel) => channel.id === id); }
function getConversation(id) { return state.conversations.find((conversation) => conversation.id === id); }

function buildChannelTarget(channel) {
  if (!channel) return null;
  return { ...channel, channelType: channel.channelType || channel.type || 'public', type: 'channel' };
}

function buildDmTarget(conversation) {
  const otherId = conversation.participantIds?.find((uid) => uid !== state.profile?.uid);
  const member = getMember(otherId) || { uid: otherId, displayName: 'Cohort member', githubHandle: 'member', status: 'offline' };
  return { type: 'dm', id: conversation.id, name: member.displayName, member, conversation };
}

async function selectTarget(target, messageId = null) {
  if (!target?.id) return;
  if (target.type === 'channel') {
    const channel = getChannel(target.id) || target;
    state.currentTarget = buildChannelTarget(channel);
  } else {
    const conversation = getConversation(target.id) || target.conversation || target;
    state.currentTarget = buildDmTarget(conversation);
  }
  storeTarget(state.currentTarget);
  state.currentView = 'chat';
  state.highlightedMessageId = messageId;
  setActiveViewButtons('chat');
  elements.chatView.classList.remove('is-hidden');
  elements.collectionView.classList.add('is-hidden');
  state.messagesUnsubscribe?.();
  state.messages = [];
  state.lastMessageCount = 0;
  renderSidebar();
  renderHeader();
  renderComposerState();
  renderMessages();
  state.messagesUnsubscribe = state.adapter.subscribeMessages(state.currentTarget, (messages) => {
    const wasNearBottom = elements.messageScroll.scrollHeight - elements.messageScroll.scrollTop - elements.messageScroll.clientHeight < 150;
    const oldCount = state.lastMessageCount;
    state.messages = messages;
    state.lastMessageCount = messages.length;
    renderMessages();
    renderContext();
    if (state.highlightedMessageId) {
      requestAnimationFrame(() => scrollToMessage(state.highlightedMessageId));
      state.highlightedMessageId = null;
    } else if (!oldCount || (messages.length > oldCount && wasNearBottom)) {
      requestAnimationFrame(() => scrollMessagesToBottom(!oldCount));
    }
  });
  closeSidebar();
}

function setActiveViewButtons(view) {
  qsa('[data-view]').forEach((button) => {
    const active = button.dataset.view === view;
    if (button.classList.contains('rail-button') || button.closest('.mobile-nav')) button.classList.toggle('is-active', active);
  });
}

function setView(view) {
  state.currentView = view;
  setActiveViewButtons(view);
  if (view === 'chat') {
    elements.chatView.classList.remove('is-hidden');
    elements.collectionView.classList.add('is-hidden');
    renderHeader();
  } else {
    elements.chatView.classList.add('is-hidden');
    elements.collectionView.classList.remove('is-hidden');
    renderCollectionView(view);
  }
  closeSidebar();
}

function renderSidebar() {
  const target = state.currentTarget;
  elements.channelList.innerHTML = state.channels.map((channel) => {
    const active = target?.type === 'channel' && target.id === channel.id;
    const symbol = channel.emoji && channel.emoji !== '#' ? channel.emoji : '#';
    const locked = channel.postingRoles?.length ? `<span class="channel-lock">${icon('lock')}</span>` : '';
    const count = channel.unreadCount ? `<span class="channel-count">${Math.min(99, channel.unreadCount)}</span>` : '';
    return `<button class="channel-item${active ? ' is-active' : ''}" type="button" data-channel-id="${escapeHtml(channel.id)}">
      <span class="channel-symbol">${escapeHtml(symbol)}</span><span class="channel-name">${escapeHtml(channel.name)}</span>${locked}${count}
    </button>`;
  }).join('') || `<p class="field-hint" style="padding:8px 10px">No channels yet.</p>`;

  elements.dmList.innerHTML = state.conversations.map((conversation) => {
    const dm = buildDmTarget(conversation);
    const member = dm.member;
    const active = target?.type === 'dm' && target.id === conversation.id;
    const online = isOnline(member);
    return `<button class="channel-item${active ? ' is-active' : ''}" type="button" data-dm-id="${escapeHtml(conversation.id)}">
      <span class="dm-avatar" style="${avatarStyle(member.githubHandle || member.uid)}">${initials(member.displayName)}<i class="${online ? 'online' : member.status === 'away' ? 'away' : ''}"></i></span>
      <span class="channel-name">${escapeHtml(member.displayName)}</span>${conversation.unreadCount ? `<span class="channel-count">${conversation.unreadCount}</span>` : ''}
    </button>`;
  }).join('') || `<button class="channel-item" type="button" data-action="new-dm"><span class="channel-symbol">+</span><span class="channel-name">Start a conversation</span></button>`;
}

function renderHeader() {
  if (!state.currentTarget) return;
  const isChannel = state.currentTarget.type === 'channel';
  $('conversation-icon').innerHTML = isChannel ? escapeHtml(state.currentTarget.emoji || '#') : avatarHtml(state.currentTarget.member);
  $('conversation-icon').classList.toggle('is-avatar', !isChannel);
  $('conversation-title').textContent = isChannel ? state.currentTarget.name : state.currentTarget.member.displayName;
  $('conversation-description').textContent = isChannel
    ? (state.currentTarget.description || 'Cohort conversation')
    : `${isOnline(state.currentTarget.member) ? 'Active now' : `Last active ${relativeTime(state.currentTarget.member.lastSeenAt)}`} · @${state.currentTarget.member.githubHandle || 'member'}`;
  $('favorite-channel').classList.toggle('is-active', state.favorites.has(`${state.currentTarget.type}:${state.currentTarget.id}`));
  $('favorite-channel').classList.toggle('is-hidden', !isChannel);
  $('header-member-count').querySelector('span:last-child').textContent = config.cohortCapacity || state.members.length || 65;
  const active = state.members.filter((member) => member.uid !== state.profile?.uid && isOnline(member)).slice(0, 4);
  $('header-active-stack').innerHTML = active.map((member) => avatarHtml(member)).join('');
}

function canPostCurrent() {
  if (!state.currentTarget || !state.profile) return false;
  if (state.currentTarget.type === 'dm') return true;
  const roles = state.currentTarget.postingRoles || [];
  return !roles.length || roles.includes(state.profile.role);
}

function renderComposerState() {
  if (!state.currentTarget) return;
  const label = state.currentTarget.type === 'channel' ? `#${state.currentTarget.name}` : state.currentTarget.member.displayName;
  $('composer-destination').textContent = `to ${label}`;
  elements.messageInput.placeholder = `Share ${state.currentTarget.type === 'channel' ? `an update with #${state.currentTarget.name}` : `a message with ${state.currentTarget.member.displayName}`}…`;
  const allowed = canPostCurrent();
  qs('.composer', $('composer-wrap')).classList.toggle('is-hidden', !allowed);
  $('composer-lock').classList.toggle('is-hidden', allowed);
}

function renderMessages() {
  if (!state.currentTarget) { elements.messageList.innerHTML = ''; return; }
  const target = state.currentTarget;
  const welcome = target.type === 'channel'
    ? `<section class="channel-welcome"><div class="welcome-icon">${escapeHtml(target.emoji || '#')}</div><h2>Welcome to #${escapeHtml(target.name)}</h2><p>${escapeHtml(target.description || 'This is the start of the channel.')}${target.pmUrl ? ` · <a href="${escapeHtml(safeUrl(target.pmUrl))}" target="_blank" rel="noreferrer">Open linked PM board</a>` : ''}</p></section>`
    : `<section class="channel-welcome"><div class="welcome-icon">${avatarHtml(target.member)}</div><h2>${escapeHtml(target.member.displayName)}</h2><p>This conversation is private to you and @${escapeHtml(target.member.githubHandle || 'member')}. Operators cannot browse participant DMs.</p></section>`;
  elements.messageList.innerHTML = welcome;
  for (const group of groupByDate(state.messages)) {
    const divider = document.createElement('div');
    divider.className = 'date-divider'; divider.textContent = group.label;
    elements.messageList.append(divider);
    let previous = null;
    for (const message of group.items) {
      const compact = previous && previous.senderId === message.senderId && (toDate(message.createdAt) - toDate(previous.createdAt) < 5 * 60000);
      elements.messageList.append(buildMessageElement(message, { compact }));
      previous = message;
    }
  }
}

function buildMessageElement(message, options = {}) {
  const template = $('message-template');
  const node = template.content.firstElementChild.cloneNode(true);
  node.dataset.messageId = message.id;
  if (options.reply) node.dataset.replyId = message.id;
  node.classList.toggle('is-compact', Boolean(options.compact));
  node.classList.toggle('is-own', message.senderId === state.profile?.uid);
  node.classList.toggle('is-system', String(message.senderId || '').startsWith('system:'));
  if (message.id === state.highlightedMessageId) node.classList.add('is-highlighted');
  const member = getMember(message.senderId) || {
    uid: message.senderId, displayName: message.senderName || message.senderHandle || 'Relay',
    githubHandle: message.senderHandle || '', role: message.senderRole || 'member', status: 'offline', avatarUrl: message.senderAvatarUrl || ''
  };
  const avatarButton = qs('.avatar-button', node);
  avatarButton.innerHTML = `${avatarHtml(member)}<i class="${isOnline(member) ? 'online' : member.status === 'away' ? 'away' : ''}"></i>`;
  qs('.message-author', node).textContent = message.senderName || member.displayName;
  const role = message.senderRole || member.role;
  if (['admin', 'staff'].includes(role)) {
    const pill = qs('.role-pill', node); pill.textContent = role; pill.classList.remove('is-hidden');
  }
  qs('time', node).textContent = formatTime(message.createdAt);
  qs('time', node).dateTime = toDate(message.createdAt).toISOString();
  qs('.edited-label', node).classList.toggle('is-hidden', !message.editedAt);
  if (message.signalType && message.signalType !== 'message') {
    const label = qs('.signal-label', node);
    label.textContent = SIGNAL_META[message.signalType]?.label || message.signalType;
    label.dataset.signal = message.signalType;
    label.classList.remove('is-hidden');
  }
  qs('.message-content', node).innerHTML = renderRichText(message.content || '', state.profile?.githubHandle || '');
  renderAttachment(qs('.message-attachment', node), message.attachment);
  renderTask(qs('.message-task', node), message.task);
  renderReactions(qs('.message-reactions', node), message, options.reply);
  const threadLink = qs('.thread-link', node);
  if (!options.reply && message.threadCount) {
    threadLink.classList.remove('is-hidden');
    threadLink.textContent = `${message.threadCount} ${message.threadCount === 1 ? 'reply' : 'replies'} · Last reply ${relativeTime(message.lastReplyAt || message.createdAt)}`;
    threadLink.dataset.openThread = message.id;
  }
  if (options.reply) qs('.message-actions', node)?.remove();
  else {
    const bookmarkButton = qs('[data-message-action="bookmark"]', node);
    bookmarkButton?.classList.toggle('is-active', state.bookmarks.has(bookmarkKey(state.currentTarget, message.id)));
  }
  hydrateIcons(node);
  return node;
}

function safeAttachmentUrl(value = '') {
  const raw = String(value || '');
  if (raw.startsWith('blob:')) return raw;
  if (/^data:(?:image\/(?:png|jpeg|gif|webp)|application\/pdf|text\/plain|text\/markdown);base64,/i.test(raw)) return raw;
  return safeUrl(raw);
}

function renderResolvedAttachment(container, attachment, value) {
  const url = safeAttachmentUrl(value);
  const storagePathUnavailable = !url && Boolean(attachment.storagePath);
  if (fileKind(attachment) === 'image' && url) {
    container.innerHTML = `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer"><img class="attachment-image" src="${escapeHtml(url)}" alt="${escapeHtml(attachment.name || 'Image attachment')}" loading="lazy" /></a>`;
    return;
  }
  const unavailableDetail = storagePathUnavailable ? ' · Unavailable in Spark' : '';
  const unavailableLabel = storagePathUnavailable ? 'Attachment unavailable in the free Firebase release.' : '';
  container.innerHTML = `<a class="attachment-file" ${url ? `href="${escapeHtml(url)}" target="_blank" rel="noreferrer"` : `aria-disabled="true"${unavailableLabel ? ` aria-label="${unavailableLabel}"` : ''}`}>
    <span>${icon('file')}</span><div><b>${escapeHtml(attachment.name || 'Attachment')}</b><small>${escapeHtml(attachment.type || 'File')} · ${formatBytes(attachment.size)}${unavailableDetail}</small></div>${url ? icon('arrow-up-right') : icon('lock')}
  </a>`;
}

function renderAttachment(container, attachment) {
  if (!attachment) return;
  container.classList.remove('is-hidden');
  renderResolvedAttachment(container, attachment, safeAttachmentUrl(attachment.url || ''));
}

function renderTask(container, task) {
  if (!task) return;
  const url = safeUrl(task.url || '');
  container.classList.remove('is-hidden');
  container.innerHTML = `<button class="task-card" type="button" data-open-url="${escapeHtml(url)}">
    <span class="task-icon">${icon('square-kanban')}</span><span><small>${escapeHtml((task.status || 'Linked task').toUpperCase())}</small><b>${escapeHtml(task.title || 'PM task')}</b><em>${escapeHtml(task.subtitle || task.provider || 'Project management platform')}</em></span>${icon('arrow-up-right')}
  </button>`;
}

function reactionEmoji(key) { return REACTIONS[key] || ({ check: '✅' }[key]) || key; }
function renderReactions(container, message, isReply = false) {
  const reactions = message.reactions || {};
  container.innerHTML = Object.entries(reactions).filter(([, users]) => users?.length).map(([key, users]) => {
    const active = users.includes(state.profile?.uid);
    return `<button class="reaction-chip${active ? ' is-active' : ''}" type="button" data-reaction-key="${escapeHtml(key)}" ${isReply ? 'data-reply-reaction="true"' : ''}><span>${reactionEmoji(key)}</span>${users.length}</button>`;
  }).join('');
}

function scrollMessagesToBottom(instant = false) {
  elements.messageScroll.scrollTo({ top: elements.messageScroll.scrollHeight, behavior: instant ? 'auto' : 'smooth' });
}

function scrollToMessage(messageId) {
  const node = qs(`[data-message-id="${CSS.escape(messageId)}"]`, elements.messageList);
  if (!node) return;
  node.scrollIntoView({ block: 'center', behavior: 'smooth' });
  node.classList.add('is-highlighted');
  setTimeout(() => node.classList.remove('is-highlighted'), 2400);
}

function renderContext() {
  const active = state.members.filter((member) => member.uid !== state.profile?.uid && isOnline(member)).slice(0, 6);
  $('active-members').innerHTML = active.map((member) => `<div class="active-member">${avatarHtml(member)}<span><b>${escapeHtml(member.displayName)}</b><small>${escapeHtml(member.headline || `@${member.githubHandle || 'member'}`)}</small></span><i class="presence-dot"></i></div>`).join('') || `<p class="field-hint">No one else is active yet.</p>`;
  const signalItems = state.messages.filter((message) => ['ask', 'decision'].includes(message.signalType)).slice(-3).reverse();
  $('signal-summary').innerHTML = signalItems.map((message) => `<button class="signal-summary-item" type="button" data-jump-message="${escapeHtml(message.id)}" data-signal="${escapeHtml(message.signalType)}"><span>${icon(SIGNAL_META[message.signalType]?.icon || 'activity')}</span><span><b>${escapeHtml((message.content || '').replace(/[*`]/g, '').slice(0, 54))}</b><small>${message.signalType === 'ask' ? 'Open question' : 'Captured decision'} · ${escapeHtml(message.senderName || '')}</small></span><time>${relativeTime(message.createdAt)}</time></button>`).join('') || `<p class="field-hint">No unresolved asks or new decisions in this view.</p>`;
  const pmName = config.pmPlatform?.name || 'Winning PM platform';
  qs('#pm-board-card b').textContent = state.currentTarget?.pmUrl ? `${state.currentTarget.name} board` : 'Week 2 delivery board';
  qs('#pm-board-card small').textContent = pmName.toUpperCase();
}

function renderNotificationCounts() {
  const unread = state.notifications.filter((item) => !item.read).length;
  const mentions = state.notifications.filter((item) => !item.read && item.type === 'mention').length;
  const threads = state.notifications.filter((item) => item.type === 'thread').length;
  $('rail-notification-count').textContent = Math.min(99, unread);
  $('rail-notification-count').classList.toggle('is-hidden', unread === 0);
  $('mention-count').textContent = mentions;
  $('thread-count').textContent = threads;
}

function renderCollectionView(view) {
  const titleMap = { activity: ['Activity', 'Mentions, direct messages, and thread replies that need your attention.'], bookmarks: ['Saved messages', 'Your durable shortlist of decisions, references, and follow-ups.'], threads: ['Your threads', 'Replies and conversations you are participating in.'] };
  const [title, subtitle] = titleMap[view] || titleMap.activity;
  let items = [];
  if (view === 'bookmarks') items = [...state.bookmarks.values()].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  else if (view === 'threads') items = state.notifications.filter((item) => item.type === 'thread');
  else items = state.notifications;
  elements.collectionView.innerHTML = `<div class="collection-heading"><div><h2>${title}</h2><p>${subtitle}</p></div>${view === 'activity' && state.notifications.some((item) => !item.read) ? `<button class="button button-ghost" type="button" data-action="mark-all-read">Mark all read</button>` : ''}</div><div class="collection-list"></div>`;
  const list = qs('.collection-list', elements.collectionView);
  if (!items.length) {
    list.innerHTML = `<div class="empty-state"><span>${icon(view === 'bookmarks' ? 'bookmark' : 'check-circle')}</span><h3>${view === 'bookmarks' ? 'Nothing saved yet' : 'You’re all caught up'}</h3><p>${view === 'bookmarks' ? 'Use the bookmark action on any message to keep it here.' : 'New mentions, DMs, and thread replies will land here.'}</p></div>`;
  } else if (view === 'bookmarks') {
    list.innerHTML = items.map((item) => `<button class="collection-card" type="button" data-open-bookmark="${escapeHtml(item.key)}"><span class="collection-icon">${icon('bookmark')}</span><span><b>${escapeHtml(item.message.senderName || item.message.senderHandle || 'Cohort member')}</b><p>${escapeHtml((item.message.content || '').replace(/[*`]/g, '').slice(0, 170))}</p></span><time>${relativeTime(item.savedAt)}</time></button>`).join('');
  } else {
    list.innerHTML = items.map((item) => {
      const actor = getMember(item.actorId) || { displayName: item.actorName || 'Cohort member', githubHandle: item.actorHandle || '', uid: item.actorId };
      return `<button class="collection-card${item.read ? '' : ' is-unread'}" type="button" data-notification-id="${escapeHtml(item.id)}"><span class="collection-icon">${icon(item.type === 'dm' ? 'message-circle' : item.type === 'thread' ? 'messages-square' : 'at-sign')}</span><span><b>${escapeHtml(actor.displayName)}</b><p>${escapeHtml(item.text || 'sent an update')}</p></span><time>${relativeTime(item.createdAt)}</time></button>`;
    }).join('');
  }
  hydrateIcons(elements.collectionView);
  updateCollectionHeader(title, subtitle);
}

function updateCollectionHeader(title, subtitle) {
  $('conversation-icon').innerHTML = icon(state.currentView === 'bookmarks' ? 'bookmark' : state.currentView === 'threads' ? 'messages-square' : 'bell');
  $('conversation-title').textContent = title;
  $('conversation-description').textContent = subtitle;
  $('favorite-channel').classList.add('is-hidden');
}

function bookmarkKey(target, messageId) { return `${target.type}:${target.id}:${messageId}`; }
function toggleBookmark(message) {
  const key = bookmarkKey(state.currentTarget, message.id);
  if (state.bookmarks.has(key)) {
    state.bookmarks.delete(key);
    toast('Removed from saved', 'The message is no longer in your saved view.', 'bookmark');
  } else {
    state.bookmarks.set(key, { key, target: { type: state.currentTarget.type, id: state.currentTarget.id, name: state.currentTarget.name }, message: structuredClone(message), savedAt: new Date().toISOString() });
    toast('Saved for later', 'You can find this message in Saved.', 'bookmark');
  }
  persistUserLocalState();
  renderMessages();
  if (state.currentView === 'bookmarks') renderCollectionView('bookmarks');
}

async function sendCurrentMessage() {
  const content = elements.messageInput.value.trim();
  if (!content && !state.pendingTask) return;
  if (!canPostCurrent()) return toast('Posting is restricted', 'Only staff and operators can post here.', 'lock', true);
  const payload = { content, signalType: elements.signalType.value, task: state.pendingTask };
  const started = performance.now();
  setBusy(elements.sendMessage, true);
  try {
    await state.adapter.sendMessage(state.currentTarget, payload);
    elements.messageInput.value = '';
    autoGrow(elements.messageInput);
    state.pendingTask = null;
    elements.signalType.value = 'message';
    renderTaskPreview();
    const latency = Math.round(performance.now() - started);
    toast('Signal sent', latency < 2000 ? `Delivered in ${latency} ms.` : 'Delivered to the conversation.', 'send');
  } catch (error) {
    console.error(error);
    toast('Message did not send', error.message || 'Check your connection and permissions.', 'alert-circle', true, 5000);
  } finally { setBusy(elements.sendMessage, false); }
}

function autoGrow(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
}

function insertAtCursor(textarea, before, after = before) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end);
  textarea.setRangeText(`${before}${selected}${after}`, start, end, 'end');
  textarea.focus(); autoGrow(textarea);
}

function insertStandup() {
  elements.signalType.value = 'update';
  elements.messageInput.value = `☀️ **Async standup**\n\n**Yesterday:** \n**Today:** \n**Blocked:** `;
  elements.messageInput.focus();
  elements.messageInput.setSelectionRange(elements.messageInput.value.length, elements.messageInput.value.length);
  autoGrow(elements.messageInput);
}

function newDecision() {
  elements.signalType.value = 'decision';
  elements.messageInput.value = '**Decision:** ';
  elements.messageInput.focus(); autoGrow(elements.messageInput);
}

function renderTaskPreview() {
  const task = state.pendingTask;
  elements.taskPreview.classList.toggle('is-hidden', !task);
  if (!task) { elements.taskPreview.innerHTML = ''; return; }
  elements.taskPreview.innerHTML = `<div class="task-chip"><span>${icon('square-kanban')}</span><span><b>${escapeHtml(task.title || 'PM task')}</b><small>${escapeHtml(task.status || 'Linked PM task')}</small></span><button type="button" data-action="remove-task" aria-label="Remove PM task">${icon('x')}</button></div>`;
}

function openThread(message) {
  state.threadRoot = message;
  $('thread-title').textContent = message.signalType === 'decision' ? 'Decision thread' : 'Replies';
  $('thread-root').innerHTML = '';
  $('thread-root').append(buildMessageElement(message, { reply: true }));
  state.threadReplies = [];
  renderThreadReplies();
  elements.threadPanel.classList.add('is-open');
  elements.threadPanel.setAttribute('aria-hidden', 'false');
  state.threadUnsubscribe?.();
  state.threadUnsubscribe = state.adapter.subscribeThread(state.currentTarget, message.id, (replies) => {
    state.threadReplies = replies;
    renderThreadReplies();
    requestAnimationFrame(() => { $('thread-replies').scrollTop = $('thread-replies').scrollHeight; });
  });
}

function renderThreadReplies() {
  $('thread-reply-count').textContent = `${state.threadReplies.length} ${state.threadReplies.length === 1 ? 'reply' : 'replies'}`;
  const root = $('thread-replies'); root.innerHTML = '';
  state.threadReplies.forEach((reply) => root.append(buildMessageElement(reply, { reply: true })));
}

function closeThread() {
  elements.threadPanel.classList.remove('is-open');
  elements.threadPanel.setAttribute('aria-hidden', 'true');
  state.threadUnsubscribe?.(); state.threadUnsubscribe = null; state.threadRoot = null; state.threadReplies = [];
}

async function sendThreadReply() {
  const textarea = $('thread-input');
  const content = textarea.value.trim();
  if (!content || !state.threadRoot) return;
  const button = $('send-thread-reply'); setBusy(button, true);
  try {
    await state.adapter.sendThreadReply(state.currentTarget, state.threadRoot, content);
    textarea.value = '';
  } catch (error) { toast('Reply did not send', error.message || 'Please try again.', 'alert-circle', true); }
  finally { setBusy(button, false); }
}

function showModal(html) {
  elements.modalContent.innerHTML = html;
  hydrateIcons(elements.modalContent);
  elements.modalBackdrop.classList.remove('is-hidden');
  elements.modal.classList.remove('is-hidden');
  requestAnimationFrame(() => qs('input,textarea,select,button', elements.modalContent)?.focus());
}

function closeModal() {
  elements.modalBackdrop.classList.add('is-hidden');
  elements.modal.classList.add('is-hidden');
  elements.modalContent.innerHTML = '';
}

function modalShell(title, subtitle, body, footer = '') {
  return `<div class="modal-head"><div><h2 id="modal-title">${escapeHtml(title)}</h2>${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}</div><button class="icon-button" type="button" data-action="close-modal">${icon('x')}</button></div><div class="modal-body">${body}</div>${footer ? `<div class="modal-footer">${footer}</div>` : ''}`;
}

function openNewChannelModal() {
  const staffPostingOption = ['admin', 'staff'].includes(state.profile?.role) ? '<option value="staff">Staff and operators only</option>' : '';
  showModal(modalShell('Create a channel', 'Give the cohort a clear place for durable context.', `
    <form id="new-channel-form">
      <div class="field-row"><div class="field"><label for="channel-emoji">Icon</label><input id="channel-emoji" name="emoji" value="✦" maxlength="2" /></div><div class="field"><label for="channel-name-input">Channel name</label><input id="channel-name-input" name="name" required maxlength="42" placeholder="design-lab" /></div></div>
      <div class="field"><label for="channel-description-input">Purpose</label><textarea id="channel-description-input" name="description" maxlength="240" placeholder="What belongs here—and what does not?"></textarea></div>
      <div class="field"><label for="channel-pm-url">PM board or project URL <span class="field-hint">optional</span></label><input id="channel-pm-url" name="pmUrl" type="url" placeholder="https://…" /></div>
      <div class="field"><label for="channel-posting">Posting permissions</label><select id="channel-posting" name="posting"><option value="everyone">Everyone can post</option>${staffPostingOption}</select></div>
    </form>`, `<button class="button button-ghost" type="button" data-action="close-modal">Cancel</button><button class="button button-primary" type="submit" form="new-channel-form">Create channel</button>`));
  $('new-channel-form').addEventListener('submit', submitNewChannel);
  $('channel-name-input').addEventListener('input', (event) => { event.target.value = normalizeChannelName(event.target.value); });
}

async function submitNewChannel(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = normalizeChannelName(form.get('name'));
  if (!name) return toast('Add a channel name', 'Use letters, numbers, spaces, or hyphens.', 'alert-circle', true);
  const submit = qs('[type="submit"][form="new-channel-form"]', elements.modalContent); setBusy(submit, true, 'Creating…');
  try {
    const channel = await state.adapter.createChannel({ name, emoji: String(form.get('emoji') || '✦').slice(0, 2), description: String(form.get('description') || ''), pmUrl: String(form.get('pmUrl') || ''), postingRoles: form.get('posting') === 'staff' ? ['admin', 'staff'] : [] });
    closeModal(); toast('Channel created', `#${name} is ready for the cohort.`, 'hash');
    if (channel?.id) setTimeout(() => selectTarget(buildChannelTarget(channel)), 150);
  } catch (error) { toast('Could not create channel', error.message || 'Check your permissions.', 'alert-circle', true); }
  finally { setBusy(submit, false); }
}

function openNewDmModal() {
  const available = state.members.filter((member) => member.uid !== state.profile?.uid);
  showModal(modalShell('Start a conversation', 'Direct messages are visible only to their participants.', `<div class="field"><label for="dm-filter">Find a cohort member</label><input id="dm-filter" type="search" placeholder="Name or GitHub handle" /></div><div id="dm-member-picker" class="member-picker">${renderMemberOptions(available)}</div>`));
  $('dm-filter').addEventListener('input', (event) => {
    const needle = event.target.value.toLowerCase();
    $('dm-member-picker').innerHTML = renderMemberOptions(available.filter((member) => `${member.displayName} ${member.githubHandle}`.toLowerCase().includes(needle)));
  });
}

function renderMemberOptions(members) {
  return members.map((member) => `<button class="member-option" type="button" data-start-dm="${escapeHtml(member.uid)}">${avatarHtml(member)}<span><b>${escapeHtml(member.displayName)}</b><small>@${escapeHtml(member.githubHandle || 'member')} · ${isOnline(member) ? 'active now' : `active ${relativeTime(member.lastSeenAt)}`}</small></span>${icon('arrow-right')}</button>`).join('') || `<p class="field-hint">No matching members.</p>`;
}

async function startDm(memberId) {
  try {
    const conversation = await state.adapter.createConversation(memberId);
    closeModal();
    const target = buildDmTarget(conversation);
    await selectTarget(target);
  } catch (error) { toast('Could not start the DM', error.message || 'Check your permissions.', 'alert-circle', true); }
}

function openTaskModal() {
  showModal(modalShell('Attach a PM task', 'Paste a task or project deep link. Relay will unfurl it into an actionable card.', `
    <form id="task-form"><div class="field"><label for="task-title">Task title</label><input id="task-title" name="title" required maxlength="120" placeholder="Polish onboarding flow" /></div><div class="field-row"><div class="field"><label for="task-status">Status</label><input id="task-status" name="status" maxlength="40" value="Ready for review" /></div><div class="field"><label for="task-subtitle">Context</label><input id="task-subtitle" name="subtitle" maxlength="100" placeholder="Owner · due date" /></div></div><div class="field"><label for="task-url">HTTPS task URL</label><input id="task-url" name="url" required type="url" placeholder="https://pm.example/tasks/123" /></div></form>`, `<button class="button button-ghost" type="button" data-action="close-modal">Cancel</button><button class="button button-primary" type="submit" form="task-form">Attach task</button>`));
  $('task-form').addEventListener('submit', (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const url = safeUrl(form.get('url'));
    if (!url) return toast('Use a valid HTTPS URL', 'Task links must use http or https.', 'alert-circle', true);
    state.pendingTask = { title: String(form.get('title')), status: String(form.get('status') || 'Linked task'), subtitle: String(form.get('subtitle') || config.pmPlatform?.name || 'PM platform'), url, provider: config.pmPlatform?.name || 'PM platform' };
    renderTaskPreview(); closeModal(); elements.messageInput.focus();
  });
}

function openChannelMenu() {
  if (state.currentTarget?.type !== 'channel') return;
  const channel = state.currentTarget;
  const canManage = ['admin', 'staff'].includes(state.profile?.role) || channel.createdBy === state.profile?.uid;
  const body = `<div class="field"><label>Channel</label><div class="uid-box"><span>#</span><code>${escapeHtml(channel.name)}</code></div></div><button class="member-option" type="button" data-action="copy-channel-link"><span class="collection-icon">${icon('link')}</span><span><b>Copy channel link</b><small>Share a deep link to this conversation</small></span></button>${channel.pmUrl ? `<button class="member-option" type="button" data-open-url="${escapeHtml(safeUrl(channel.pmUrl))}"><span class="collection-icon">${icon('square-kanban')}</span><span><b>Open linked PM board</b><small>${escapeHtml(channel.pmUrl)}</small></span></button>` : ''}${canManage ? `<div class="danger-zone"><button class="member-option" type="button" data-action="edit-channel"><span class="collection-icon">${icon('edit')}</span><span><b>Rename or edit channel</b><small>Update its purpose, icon, and PM link</small></span></button>${!['announcements', 'general'].includes(channel.id) ? `<button class="member-option" type="button" data-action="archive-channel"><span class="collection-icon">${icon('archive')}</span><span><b>Archive channel</b><small>Hide it while preserving message history</small></span></button>` : ''}</div>` : ''}`;
  showModal(modalShell('Channel details', channel.description, body));
}

function openEditChannelModal() {
  const channel = state.currentTarget;
  showModal(modalShell('Edit channel', 'Keep its purpose clear and searchable.', `<form id="edit-channel-form"><div class="field-row"><div class="field"><label>Icon</label><input name="emoji" value="${escapeHtml(channel.emoji || '#')}" maxlength="2" /></div><div class="field"><label>Channel name</label><input name="name" value="${escapeHtml(channel.name)}" required maxlength="42" /></div></div><div class="field"><label>Purpose</label><textarea name="description" maxlength="240">${escapeHtml(channel.description || '')}</textarea></div><div class="field"><label>PM board URL</label><input name="pmUrl" type="url" value="${escapeHtml(channel.pmUrl || '')}" /></div></form>`, `<button class="button button-ghost" type="button" data-action="close-modal">Cancel</button><button class="button button-primary" type="submit" form="edit-channel-form">Save changes</button>`));
  $('edit-channel-form').addEventListener('submit', async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const name = normalizeChannelName(form.get('name'));
    try { await state.adapter.updateChannel(channel.id, { name, emoji: String(form.get('emoji') || '#'), description: String(form.get('description') || ''), pmUrl: safeUrl(form.get('pmUrl')) }); closeModal(); toast('Channel updated', `#${name} now reflects the latest purpose.`, 'check-circle'); }
    catch (error) { toast('Update failed', error.message || 'Check permissions.', 'alert-circle', true); }
  });
}

async function archiveCurrentChannel() {
  const channel = state.currentTarget;
  if (!confirm(`Archive #${channel.name}? Message history will be preserved.`)) return;
  try { await state.adapter.archiveChannel(channel.id); closeModal(); toast('Channel archived', `#${channel.name} was removed from the sidebar.`, 'archive'); }
  catch (error) { toast('Could not archive channel', error.message || 'Check permissions.', 'alert-circle', true); }
}

function openMessageMenu(message) {
  const own = message.senderId === state.profile?.uid;
  const canDelete = own || (state.currentTarget.type === 'channel' && ['admin', 'staff'].includes(state.profile?.role));
  showModal(modalShell('Message actions', `${message.senderName || message.senderHandle} · ${formatTime(message.createdAt)}`, `<button class="member-option" type="button" data-action="bookmark-modal" data-message-id="${escapeHtml(message.id)}"><span class="collection-icon">${icon('bookmark')}</span><span><b>${state.bookmarks.has(bookmarkKey(state.currentTarget, message.id)) ? 'Remove from saved' : 'Save message'}</b><small>Keep it in your personal shortlist</small></span></button><button class="member-option" type="button" data-action="report-message" data-message-id="${escapeHtml(message.id)}"><span class="collection-icon">${icon('shield')}</span><span><b>Report message</b><small>Send a bounded report to the project owner</small></span></button>${canDelete ? `<div class="danger-zone"><button class="member-option" type="button" data-action="delete-message" data-message-id="${escapeHtml(message.id)}"><span class="collection-icon">${icon('trash')}</span><span><b>Delete message</b><small>This cannot be undone</small></span></button></div>` : ''}`));
}

function openReportModal(message) {
  showModal(modalShell('Report this message', 'The report saves this message snapshot for the Firebase project owner; it does not expose unrelated DMs.', `<form id="report-form"><div class="field"><label for="report-reason">What happened?</label><textarea id="report-reason" name="reason" required maxlength="800" placeholder="Describe the issue and any context the project owner needs."></textarea></div></form>`, `<button class="button button-ghost" type="button" data-action="close-modal">Cancel</button><button class="button button-danger" type="submit" form="report-form">Submit report</button>`));
  $('report-form').addEventListener('submit', async (event) => {
    event.preventDefault(); const reason = new FormData(event.currentTarget).get('reason');
    try { await state.adapter.reportMessage(state.currentTarget, message, String(reason)); closeModal(); toast('Report submitted', 'The project owner can review this specific report.', 'shield'); }
    catch (error) { toast('Report failed', error.message || 'Please try again.', 'alert-circle', true); }
  });
}

async function deleteMessage(message) {
  if (!confirm('Delete this message permanently?')) return;
  try { await state.adapter.deleteMessage(state.currentTarget, message.id); closeModal(); toast('Message deleted', '', 'trash'); }
  catch (error) { toast('Delete failed', error.message || 'Check your permissions.', 'alert-circle', true); }
}

function openMembersModal() {
  const list = state.members.sort((a, b) => Number(isOnline(b)) - Number(isOnline(a)) || a.displayName.localeCompare(b.displayName));
  const body = `<div class="member-picker">${list.map((member) => `<div class="member-option">${avatarHtml(member)}<span><b>${escapeHtml(member.displayName)}</b><small>@${escapeHtml(member.githubHandle || 'member')} · ${escapeHtml(member.role || 'member')} · ${isOnline(member) ? 'active now' : `active ${relativeTime(member.lastSeenAt)}`}</small></span><i class="presence-dot" style="opacity:${isOnline(member) ? 1 : .2}"></i></div>`).join('')}</div>${['admin','staff'].includes(state.profile?.role) ? `<div class="danger-zone"><button class="button button-ghost" type="button" data-action="review-access-requests">Review access requests</button></div>` : ''}`;
  showModal(modalShell(`${config.cohortCapacity || 65} cohort members`, 'GitHub identities are matched to the PM-platform email model.', body));
}

async function openAccessRequests() {
  try {
    const requests = await state.adapter.listAccessRequests();
    showModal(modalShell('Access requests', 'Approve verified GitHub identities into the cohort workspace.', `<div class="member-picker">${requests.map((request) => `<div class="member-option">${avatarHtml(request)}<span><b>${escapeHtml(request.displayName || 'GitHub member')}</b><small>@${escapeHtml(request.githubHandle || 'member')} · ${escapeHtml(request.email || 'no email returned')}</small></span><button class="button button-primary" type="button" data-approve-request="${escapeHtml(request.uid || request.id)}">Approve</button></div>`).join('') || '<p class="field-hint">No pending access requests.</p>'}</div>`));
    qsa('[data-approve-request]', elements.modalContent).forEach((button) => button.addEventListener('click', async () => {
      const request = requests.find((item) => (item.uid || item.id) === button.dataset.approveRequest);
      setBusy(button, true, 'Approving…');
      try { await state.adapter.approveMember(request); toast('Member approved', `${request.displayName || request.githubHandle} can now enter Relay.`, 'user-plus'); openAccessRequests(); }
      catch (error) { setBusy(button, false); toast('Approval failed', error.message || 'Check admin permissions.', 'alert-circle', true); }
    }));
  } catch (error) { toast('Could not load requests', error.message || 'Admin access is required.', 'alert-circle', true); }
}

function openWorkspaceMenu() {
  const demoTools = state.adapter?.mode === 'demo' ? `<button class="member-option" type="button" data-action="reset-demo"><span class="collection-icon">${icon('activity')}</span><span><b>Reset demo workspace</b><small>Restore the original sample channels and messages</small></span></button>` : '';
  showModal(modalShell('Relay 65', 'The signal, not the noise.', `<div class="uid-box"><span>Signed in as</span><code>@${escapeHtml(state.profile?.githubHandle || 'member')}</code></div><div style="height:12px"></div><button class="member-option" type="button" data-open-url="${escapeHtml(safeUrl(config.cohortProjectUrl || ''))}"><span class="collection-icon">${icon('external-link')}</span><span><b>Open project brief</b><small>Requirements, deadline, and submission instructions</small></span></button>${demoTools}<button class="member-option" type="button" data-action="toggle-theme"><span class="collection-icon">${icon('sun')}</span><span><b>Switch appearance</b><small>Toggle dark and light mode</small></span></button>`));
}

function openProfileMenu() {
  const menu = elements.profileMenu;
  menu.innerHTML = `<div class="profile-card">${avatarHtml(state.profile)}<span><b>${escapeHtml(state.profile.displayName || 'Cohort member')}</b><small>@${escapeHtml(state.profile.githubHandle || 'member')} · ${escapeHtml(state.profile.email || '')}</small></span><i class="presence-dot"></i></div><hr><button type="button" data-profile-action="status">${icon('circle-dot')} Active</button><button type="button" data-profile-action="theme">${icon('sun')} Switch theme</button>${state.adapter.mode === 'demo' ? `<button type="button" data-profile-action="reset">${icon('activity')} Reset demo</button>` : ''}<hr><button class="danger" type="button" data-profile-action="signout">${icon('log-out')} Sign out</button>`;
  hydrateIcons(menu); menu.classList.toggle('is-hidden');
}

function openEmoji(anchor, context) {
  state.emojiContext = context;
  const emojis = Object.entries(REACTIONS);
  elements.emojiPopover.innerHTML = emojis.map(([key, emoji]) => `<button type="button" data-emoji-key="${key}" aria-label="${key}">${emoji}</button>`).join('');
  elements.emojiPopover.classList.remove('is-hidden');
  const rect = anchor.getBoundingClientRect();
  const width = 270;
  elements.emojiPopover.style.left = `${Math.max(10, Math.min(window.innerWidth - width - 10, rect.left - width / 2 + rect.width / 2))}px`;
  elements.emojiPopover.style.top = `${Math.max(10, rect.top - 250)}px`;
}

function closeEmoji() { elements.emojiPopover.classList.add('is-hidden'); state.emojiContext = null; }

function openSearch() {
  elements.commandPalette.classList.remove('is-hidden');
  elements.commandInput.value = '';
  state.commandIndex = 0;
  renderCommandResults('');
  setTimeout(() => elements.commandInput.focus(), 20);
}

function closeSearch() { elements.commandPalette.classList.add('is-hidden'); elements.commandInput.blur(); }

const runSearch = debounce(async (query) => {
  const token = ++state.searchToken;
  if (query.trim().length < 2) return renderCommandResults(query, []);
  const results = await state.adapter.search(query);
  if (token === state.searchToken) renderCommandResults(query, results);
}, 220);

function renderCommandResults(query, messageResults = []) {
  const needle = query.trim().toLowerCase();
  const channels = state.channels.filter((item) => !needle || `${item.name} ${item.description}`.toLowerCase().includes(needle)).slice(0, 6);
  const members = state.members.filter((item) => item.uid !== state.profile?.uid && (!needle || `${item.displayName} ${item.githubHandle}`.toLowerCase().includes(needle))).slice(0, 6);
  const items = [
    ...channels.map((channel) => ({ type: 'channel', id: channel.id, title: `# ${channel.name}`, subtitle: channel.description, icon: 'hash', target: buildChannelTarget(channel) })),
    ...members.map((member) => ({ type: 'member', id: member.uid, title: member.displayName, subtitle: `@${member.githubHandle || 'member'} · ${isOnline(member) ? 'active now' : 'offline'}`, icon: 'users', member })),
    ...messageResults.slice(0, 12).map((message) => ({ type: 'message', id: message.id, title: `${message.senderName || message.senderHandle} · ${message.target.type === 'channel' ? `#${message.target.name}` : 'DM'}`, subtitle: (message.content || '').replace(/[*`]/g, '').slice(0, 110), icon: message.signalType === 'decision' ? 'check-circle' : message.signalType === 'ask' ? 'alert-circle' : 'message-circle', target: message.target, messageId: message.id }))
  ];
  if (!needle) items.push(
    { type: 'action', id: 'new-channel', title: 'Create a channel', subtitle: 'Add a durable home for a topic or project', icon: 'plus' },
    { type: 'action', id: 'new-dm', title: 'Start a direct message', subtitle: 'Private participant-only conversation', icon: 'user-plus' },
    { type: 'action', id: 'theme', title: 'Switch appearance', subtitle: 'Toggle dark and light mode', icon: 'sun' }
  );
  state.commandItems = items;
  state.commandIndex = Math.min(state.commandIndex, Math.max(0, items.length - 1));
  elements.commandResults.innerHTML = items.length ? `${channels.length ? '<div class="command-group-label">Jump or search</div>' : ''}${items.map((item, index) => `<button class="command-result${index === state.commandIndex ? ' is-selected' : ''}" type="button" data-command-index="${index}"><span>${icon(item.icon)}</span><span><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.subtitle || '')}</small></span>${item.type === 'action' ? '<kbd>Action</kbd>' : ''}</button>`).join('')}` : `<div class="empty-state" style="padding:40px"><span>${icon('search')}</span><h3>No signals found</h3><p>Try a channel name, GitHub handle, or phrase from a recent message.</p></div>`;
}

async function executeCommand(item) {
  if (!item) return;
  closeSearch();
  if (item.type === 'channel') return selectTarget(item.target);
  if (item.type === 'member') return startDm(item.member.uid);
  if (item.type === 'message') return selectTarget(item.target, item.messageId);
  if (item.id === 'new-channel') return openNewChannelModal();
  if (item.id === 'new-dm') return openNewDmModal();
  if (item.id === 'theme') return toggleTheme();
}

function toggleContext() {
  if (window.innerWidth <= 1260) elements.contextPanel.classList.toggle('is-open');
  else elements.app.classList.toggle('context-collapsed');
}
function openSidebar() { $('workspace-sidebar').classList.add('is-open'); }
function closeSidebar() { $('workspace-sidebar').classList.remove('is-open'); }

function renderDeadline() {
  const deadline = deadlineState(config.deadlineIso || '2026-07-26T17:00:00-04:00');
  $('deadline-label').textContent = deadline.label;
  $('deadline-progress').style.width = `${deadline.progress}%`;
}

function copyText(text, success = 'Copied') {
  navigator.clipboard?.writeText(text).then(() => toast(success, '', 'copy')).catch(() => {
    const input = document.createElement('textarea'); input.value = text; document.body.append(input); input.select(); document.execCommand('copy'); input.remove(); toast(success, '', 'copy');
  });
}

function targetLink(target = state.currentTarget, messageId = '') {
  const url = new URL(location.href);
  url.searchParams.set('target', `${target.type}:${target.id}`);
  if (messageId) url.searchParams.set('message', messageId); else url.searchParams.delete('message');
  return url.href;
}

async function openNotification(notification) {
  await state.adapter.markNotificationRead(notification.id).catch(() => {});
  const target = notification.channelId
    ? buildChannelTarget(getChannel(notification.channelId) || { id: notification.channelId, name: notification.channelId })
    : buildDmTarget(getConversation(notification.conversationId) || { id: notification.conversationId, participantIds: [state.profile.uid, notification.actorId] });
  await selectTarget(target, notification.messageId);
}

function findMessage(messageId) { return state.messages.find((message) => message.id === messageId); }

async function handleAction(action, source) {
  const messageId = source?.dataset?.messageId || source?.closest?.('[data-message-id]')?.dataset.messageId;
  const message = messageId ? findMessage(messageId) : null;
  switch (action) {
    case 'view-chat': return setView('chat');
    case 'open-search': return openSearch();
    case 'new-channel': return openNewChannelModal();
    case 'new-dm': return openNewDmModal();
    case 'attach-file': return toast('Attachments unavailable', 'Attachments are unavailable in the free Firebase release.', 'paperclip', true);
    case 'attach-task': return openTaskModal();
    case 'insert-standup': return insertStandup();
    case 'new-decision': return newDecision();
    case 'format-bold': return insertAtCursor(elements.messageInput, '**');
    case 'format-code': return insertAtCursor(elements.messageInput, '`');
    case 'insert-emoji': return openEmoji(source, { type: 'composer' });
    case 'remove-task': state.pendingTask = null; return renderTaskPreview();
    case 'toggle-context': return toggleContext();
    case 'open-sidebar': return openSidebar();
    case 'close-sidebar': return closeSidebar();
    case 'close-thread': return closeThread();
    case 'close-modal': return closeModal();
    case 'channel-menu': return openChannelMenu();
    case 'edit-channel': return openEditChannelModal();
    case 'archive-channel': return archiveCurrentChannel();
    case 'copy-channel-link': copyText(targetLink(), 'Channel link copied'); return closeModal();
    case 'open-members': return openMembersModal();
    case 'workspace-menu': return openWorkspaceMenu();
    case 'toggle-theme': toggleTheme(); return closeModal();
    case 'review-access-requests': return openAccessRequests();
    case 'mark-all-read': await state.adapter.markAllNotificationsRead(); return toast('Activity cleared', 'Everything is marked read.', 'check-circle');
    case 'bookmark-modal': if (message) { toggleBookmark(message); closeModal(); } return;
    case 'report-message': if (message) openReportModal(message); return;
    case 'delete-message': if (message) deleteMessage(message); return;
    case 'reset-demo': state.adapter.reset?.(); closeModal(); return toast('Demo reset', 'Sample channels and messages were restored.', 'activity');
    default: return;
  }
}

function bindEvents() {
  $('github-signin').addEventListener('click', async () => {
    if (!state.firebaseReady) return toast('Firebase setup required', 'Add your Firebase web config and GitHub provider, or explore the demo now.', 'github', true, 5200);
    setBusy($('github-signin'), true, 'Connecting…');
    try { await state.adapter.signIn(); }
    catch (error) { toast('GitHub sign-in failed', error.message || 'Check the OAuth callback and authorized domains.', 'alert-circle', true, 5200); }
    finally { setBusy($('github-signin'), false); }
  });
  $('demo-signin').addEventListener('click', () => startDemo(true));
  $('close-demo-banner').addEventListener('click', () => elements.demoBanner.classList.add('is-hidden'));
  $('copy-uid').addEventListener('click', () => copyText($('pending-uid').textContent, 'UID copied'));
  $('recheck-access').addEventListener('click', async () => {
    setBusy($('recheck-access'), true, 'Checking…');
    try { const profile = await state.adapter.checkMembership(state.authUser); if (profile) { state.profile = profile; await connectWorkspace(); } else toast('Workspace not ready', 'Ask the project owner to verify settings/workspace has accessMode set to open.', 'clock-3'); }
    catch (error) { toast('Access check failed', error.message || 'Try again.', 'alert-circle', true); }
    finally { setBusy($('recheck-access'), false); }
  });
  $('pending-signout').addEventListener('click', () => state.adapter.signOut());
  $('theme-toggle').addEventListener('click', toggleTheme);
  $('rail-profile').addEventListener('click', (event) => { event.stopPropagation(); openProfileMenu(); });
  $('favorite-channel').addEventListener('click', () => {
    if (!state.currentTarget) return; const key = `${state.currentTarget.type}:${state.currentTarget.id}`;
    state.favorites.has(key) ? state.favorites.delete(key) : state.favorites.add(key);
    persistUserLocalState(); renderHeader();
  });
  $('send-message').addEventListener('click', sendCurrentMessage);
  elements.messageInput.addEventListener('input', () => autoGrow(elements.messageInput));
  elements.messageInput.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); sendCurrentMessage(); }
  });
  $('send-thread-reply').addEventListener('click', sendThreadReply);
  $('thread-input').addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); sendThreadReply(); } });
  $('pm-board-card').addEventListener('click', () => {
    const url = safeUrl(state.currentTarget?.pmUrl || config.pmPlatform?.boardUrl || config.pmPlatform?.baseUrl || '');
    if (url) window.open(url, '_blank', 'noopener'); else toast('Add the PM platform URL', 'Update pmPlatform.boardUrl in config.js after the winning platform is announced.', 'square-kanban', true, 5200);
  });
  $('open-cohort-project').addEventListener('click', () => window.open(safeUrl(config.cohortProjectUrl), '_blank', 'noopener'));
  elements.commandInput.addEventListener('input', (event) => { state.commandIndex = 0; renderCommandResults(event.target.value); runSearch(event.target.value); });
  elements.commandInput.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); state.commandIndex = Math.min(state.commandItems.length - 1, state.commandIndex + 1); renderCommandResults(elements.commandInput.value); }
    if (event.key === 'ArrowUp') { event.preventDefault(); state.commandIndex = Math.max(0, state.commandIndex - 1); renderCommandResults(elements.commandInput.value); }
    if (event.key === 'Enter') { event.preventDefault(); executeCommand(state.commandItems[state.commandIndex]); }
  });
  elements.commandPalette.addEventListener('click', (event) => { if (event.target === elements.commandPalette) closeSearch(); });

  document.addEventListener('click', async (event) => {
    const actionNode = event.target.closest('[data-action]');
    if (actionNode) { event.preventDefault(); await handleAction(actionNode.dataset.action, actionNode); }
    const viewNode = event.target.closest('[data-view]');
    if (viewNode) { event.preventDefault(); setView(viewNode.dataset.view); }
    const channelNode = event.target.closest('[data-channel-id]');
    if (channelNode) { const channel = getChannel(channelNode.dataset.channelId); if (channel) selectTarget(buildChannelTarget(channel)); }
    const dmNode = event.target.closest('[data-dm-id]');
    if (dmNode) { const conversation = getConversation(dmNode.dataset.dmId); if (conversation) selectTarget(buildDmTarget(conversation)); }
    const startDmNode = event.target.closest('[data-start-dm]');
    if (startDmNode) startDm(startDmNode.dataset.startDm);
    const urlNode = event.target.closest('[data-open-url]');
    if (urlNode) { const url = safeUrl(urlNode.dataset.openUrl); if (url) window.open(url, '_blank', 'noopener'); else toast('Link not configured', 'Add a valid HTTPS URL first.', 'link', true); }
    const taskNode = event.target.closest('.task-card');
    if (taskNode && !urlNode) { const url = safeUrl(taskNode.dataset.openUrl); if (url) window.open(url, '_blank', 'noopener'); }
    const commandNode = event.target.closest('[data-command-index]');
    if (commandNode) executeCommand(state.commandItems[Number(commandNode.dataset.commandIndex)]);
    const messageAction = event.target.closest('[data-message-action]');
    if (messageAction) {
      const article = messageAction.closest('[data-message-id]'); const message = findMessage(article.dataset.messageId); if (!message) return;
      if (messageAction.dataset.messageAction === 'react') openEmoji(messageAction, { type: 'message', message });
      if (messageAction.dataset.messageAction === 'reply') openThread(message);
      if (messageAction.dataset.messageAction === 'bookmark') toggleBookmark(message);
      if (messageAction.dataset.messageAction === 'more') openMessageMenu(message);
    }
    const threadNode = event.target.closest('[data-open-thread]');
    if (threadNode) { const message = findMessage(threadNode.dataset.openThread); if (message) openThread(message); }
    const reactionNode = event.target.closest('[data-reaction-key]');
    if (reactionNode) {
      const article = reactionNode.closest('[data-message-id]');
      if (article?.dataset.replyId && state.threadRoot) {
        const reply = state.threadReplies.find((item) => item.id === article.dataset.replyId);
        if (reply) state.adapter.toggleReplyReaction(state.currentTarget, state.threadRoot.id, reply, reactionNode.dataset.reactionKey);
      } else {
        const message = findMessage(article?.dataset.messageId);
        if (message) state.adapter.toggleReaction(state.currentTarget, message, reactionNode.dataset.reactionKey);
      }
    }
    const emojiNode = event.target.closest('[data-emoji-key]');
    if (emojiNode && state.emojiContext) {
      const key = emojiNode.dataset.emojiKey;
      if (state.emojiContext.type === 'composer') { insertAtCursor(elements.messageInput, REACTIONS[key], ''); }
      if (state.emojiContext.type === 'message') await state.adapter.toggleReaction(state.currentTarget, state.emojiContext.message, key);
      closeEmoji();
    }
    const notificationNode = event.target.closest('[data-notification-id]');
    if (notificationNode) { const notification = state.notifications.find((item) => item.id === notificationNode.dataset.notificationId); if (notification) openNotification(notification); }
    const bookmarkNode = event.target.closest('[data-open-bookmark]');
    if (bookmarkNode) { const item = state.bookmarks.get(bookmarkNode.dataset.openBookmark); if (item) selectTarget(item.target, item.message.id); }
    const jumpNode = event.target.closest('[data-jump-message]');
    if (jumpNode) scrollToMessage(jumpNode.dataset.jumpMessage);
    const profileAction = event.target.closest('[data-profile-action]');
    if (profileAction) {
      if (profileAction.dataset.profileAction === 'theme') toggleTheme();
      if (profileAction.dataset.profileAction === 'reset') { state.adapter.reset?.(); toast('Demo reset', 'Sample content was restored.', 'activity'); }
      if (profileAction.dataset.profileAction === 'signout') {
        if (state.adapter.mode === 'demo') { localStorage.removeItem('relay65-demo-entered'); location.reload(); }
        else state.adapter.signOut();
      }
      elements.profileMenu.classList.add('is-hidden');
    }
    if (!event.target.closest('#emoji-popover') && !event.target.closest('[data-message-action="react"]') && !event.target.closest('[data-action="insert-emoji"]')) closeEmoji();
    if (!event.target.closest('#profile-menu') && !event.target.closest('#rail-profile')) elements.profileMenu.classList.add('is-hidden');
  });

  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); elements.commandPalette.classList.contains('is-hidden') ? openSearch() : closeSearch(); }
    if (event.key === 'Escape') { closeSearch(); closeModal(); closeEmoji(); elements.profileMenu.classList.add('is-hidden'); }
  });
  document.addEventListener('visibilitychange', () => state.adapter?.updatePresence?.().catch(() => {}));
  window.addEventListener('resize', () => { if (window.innerWidth > 760) closeSidebar(); });
}

async function openInitialDeepLink() {
  const params = new URLSearchParams(location.search);
  const raw = params.get('target');
  if (!raw) return;
  const [type, id] = raw.split(':');
  const messageId = params.get('message');
  if (type === 'channel') {
    const channel = getChannel(id); if (channel) selectTarget(buildChannelTarget(channel), messageId);
  } else if (type === 'dm') {
    const conversation = getConversation(id); if (conversation) selectTarget(buildDmTarget(conversation), messageId);
  }
}

async function bootstrap() {
  hydrateIcons();
  applyTheme();
  bindEvents();
  renderDeadline();
  setInterval(renderDeadline, 60000);
  state.firebaseReady = !config.demoMode && isFirebaseConfigured();
  const params = new URLSearchParams(location.search);
  if (params.get('demo') === '1' || localStorage.getItem('relay65-demo-entered') === '1') {
    await startDemo(params.get('demo') !== '1' ? true : false);
  } else if (state.firebaseReady) {
    showScreen('auth');
    await startFirebase();
  } else {
    showScreen('auth');
  }
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => {});
  setTimeout(openInitialDeepLink, 800);
}

bootstrap();
