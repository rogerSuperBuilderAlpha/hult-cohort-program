import {
  demoChannels,
  demoConversations,
  demoCurrentUser,
  demoMembers,
  demoMessages,
  demoNotifications,
  demoReplies
} from '../data.js';
import { deterministicConversationId, parseMentions, uuid } from '../utils.js';

const STORAGE_KEY = 'relay65-demo-workspace-v2';
const clone = (value) => structuredClone(value);

function starterState() {
  return {
    currentUser: clone(demoCurrentUser),
    channels: clone(demoChannels),
    conversations: clone(demoConversations),
    members: clone(demoMembers),
    messages: clone(demoMessages),
    replies: clone(demoReplies),
    notifications: clone(demoNotifications),
    reports: []
  };
}

export class DemoAdapter {
  constructor(config) {
    this.config = config;
    this.mode = 'demo';
    this.data = this.load();
    this.currentUser = this.data.currentUser;
    this.subscribers = {
      channels: new Set(), members: new Set(), conversations: new Set(), notifications: new Set(),
      messages: new Map(), threads: new Map()
    };
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...starterState(), ...JSON.parse(saved) } : starterState();
    } catch {
      return starterState();
    }
  }

  persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); } catch { /* storage can be unavailable */ }
  }

  reset() {
    this.data = starterState();
    this.currentUser = this.data.currentUser;
    this.persist();
    this.emitAll();
  }

  async init() { return this; }
  onAuth(callback) { queueMicrotask(() => callback(this.currentUser)); return () => {}; }
  async signIn() { return this.currentUser; }
  async signOut() { return true; }
  async checkMembership() { return clone(this.currentUser); }
  async ensureStarterChannels() { return true; }

  subscribeChannels(callback) {
    this.subscribers.channels.add(callback);
    callback(clone(this.data.channels.filter((channel) => !channel.archived).sort((a, b) => a.sort - b.sort)));
    return () => this.subscribers.channels.delete(callback);
  }

  subscribeMembers(callback) {
    this.subscribers.members.add(callback);
    callback(clone(this.data.members.filter((member) => member.active)));
    return () => this.subscribers.members.delete(callback);
  }

  subscribeConversations(callback) {
    this.subscribers.conversations.add(callback);
    callback(clone(this.data.conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))));
    return () => this.subscribers.conversations.delete(callback);
  }

  subscribeNotifications(callback) {
    this.subscribers.notifications.add(callback);
    const items = this.data.notifications
      .filter((item) => item.recipientId === this.currentUser.uid)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    callback(clone(items));
    return () => this.subscribers.notifications.delete(callback);
  }

  subscribeMessages(target, callback) {
    const key = target.id;
    if (!this.subscribers.messages.has(key)) this.subscribers.messages.set(key, new Set());
    this.subscribers.messages.get(key).add(callback);
    callback(clone((this.data.messages[key] || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))));
    return () => this.subscribers.messages.get(key)?.delete(callback);
  }

  subscribeThread(target, messageId, callback) {
    const key = `${target.type}:${target.id}:${messageId}`;
    if (!this.subscribers.threads.has(key)) this.subscribers.threads.set(key, new Set());
    this.subscribers.threads.get(key).add(callback);
    callback(clone((this.data.replies[key] || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))));
    return () => this.subscribers.threads.get(key)?.delete(callback);
  }

  async sendMessage(target, payload) {
    const message = {
      id: uuid('msg-'),
      senderId: this.currentUser.uid,
      senderName: this.currentUser.displayName,
      senderHandle: this.currentUser.githubHandle,
      senderRole: this.currentUser.role,
      content: payload.content.trim(),
      signalType: payload.signalType || 'message',
      task: payload.task || null,
      reactions: {},
      threadCount: 0,
      createdAt: new Date().toISOString(),
      clientCreatedAt: Date.now()
    };
    this.data.messages[target.id] ||= [];
    this.data.messages[target.id].push(message);

    if (target.type === 'dm') {
      const conversation = this.data.conversations.find((item) => item.id === target.id);
      if (conversation) {
        conversation.lastMessageAt = message.createdAt;
        const recipientId = conversation.participantIds.find((uid) => uid !== this.currentUser.uid);
        const recipient = this.data.members.find((member) => member.uid === recipientId);
        this.data.notifications.unshift({
          id: uuid('notification-'), type: 'dm', recipientId, actorId: this.currentUser.uid,
          actorName: this.currentUser.displayName, actorHandle: this.currentUser.githubHandle,
          conversationId: target.id, messageId: message.id, text: 'sent you a direct message',
          createdAt: message.createdAt, read: false
        });
        if (recipient) conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      }
    } else {
      const channel = this.data.channels.find((item) => item.id === target.id);
      if (channel) channel.lastMessageAt = message.createdAt;
    }

    for (const handle of parseMentions(message.content)) {
      const recipient = this.data.members.find((member) => member.githubHandle.toLowerCase() === handle && member.uid !== this.currentUser.uid);
      if (!recipient) continue;
      this.data.notifications.unshift({
        id: uuid('notification-'), type: 'mention', recipientId: recipient.uid, actorId: this.currentUser.uid,
        actorName: this.currentUser.displayName, actorHandle: this.currentUser.githubHandle,
        channelId: target.type === 'channel' ? target.id : null, conversationId: target.type === 'dm' ? target.id : null,
        messageId: message.id, text: target.type === 'channel' ? `mentioned you in #${target.name}` : 'mentioned you in a DM',
        createdAt: message.createdAt, read: false
      });
    }

    this.persist();
    this.emitMessages(target.id);
    this.emit('channels');
    this.emit('conversations');
    this.emit('notifications');
    return clone(message);
  }

  async sendThreadReply(target, rootMessage, content) {
    const key = `${target.type}:${target.id}:${rootMessage.id}`;
    const reply = {
      id: uuid('reply-'), senderId: this.currentUser.uid, senderName: this.currentUser.displayName,
      senderHandle: this.currentUser.githubHandle, senderRole: this.currentUser.role,
      content: content.trim(), reactions: {}, createdAt: new Date().toISOString()
    };
    this.data.replies[key] ||= [];
    this.data.replies[key].push(reply);
    const parent = this.data.messages[target.id]?.find((message) => message.id === rootMessage.id);
    if (parent) parent.threadCount = (parent.threadCount || 0) + 1;
    if (rootMessage.senderId !== this.currentUser.uid) {
      this.data.notifications.unshift({
        id: uuid('notification-'), type: 'thread', recipientId: rootMessage.senderId, actorId: this.currentUser.uid,
        actorName: this.currentUser.displayName, actorHandle: this.currentUser.githubHandle,
        channelId: target.type === 'channel' ? target.id : null, conversationId: target.type === 'dm' ? target.id : null,
        messageId: rootMessage.id, text: 'replied in your thread', createdAt: reply.createdAt, read: false
      });
    }
    this.persist();
    this.emitThread(key);
    this.emitMessages(target.id);
    this.emit('notifications');
    return clone(reply);
  }

  async toggleReaction(target, message, reactionKey) {
    const stored = this.data.messages[target.id]?.find((item) => item.id === message.id);
    if (!stored) return;
    stored.reactions ||= {};
    stored.reactions[reactionKey] ||= [];
    const index = stored.reactions[reactionKey].indexOf(this.currentUser.uid);
    if (index >= 0) stored.reactions[reactionKey].splice(index, 1);
    else stored.reactions[reactionKey].push(this.currentUser.uid);
    if (!stored.reactions[reactionKey].length) delete stored.reactions[reactionKey];
    this.persist();
    this.emitMessages(target.id);
  }

  async toggleReplyReaction(target, rootMessageId, reply, reactionKey) {
    const key = `${target.type}:${target.id}:${rootMessageId}`;
    const stored = this.data.replies[key]?.find((item) => item.id === reply.id);
    if (!stored) return;
    stored.reactions ||= {};
    stored.reactions[reactionKey] ||= [];
    const index = stored.reactions[reactionKey].indexOf(this.currentUser.uid);
    if (index >= 0) stored.reactions[reactionKey].splice(index, 1);
    else stored.reactions[reactionKey].push(this.currentUser.uid);
    this.persist();
    this.emitThread(key);
  }

  async createChannel(input) {
    const channel = {
      id: input.id || uuid('channel-'), name: input.name, emoji: input.emoji || '#',
      description: input.description || '', type: 'public', postingRoles: input.postingRoles || [],
      createdBy: this.currentUser.uid, sort: Math.max(0, ...this.data.channels.map((item) => item.sort || 0)) + 10,
      archived: false, unreadCount: 0, pmUrl: input.pmUrl || '', createdAt: new Date().toISOString()
    };
    this.data.channels.push(channel);
    this.data.messages[channel.id] = [];
    this.persist(); this.emit('channels');
    return clone(channel);
  }

  async updateChannel(channelId, patch) {
    const channel = this.data.channels.find((item) => item.id === channelId);
    if (!channel) throw new Error('Channel not found.');
    Object.assign(channel, patch, { updatedAt: new Date().toISOString() });
    this.persist(); this.emit('channels');
    return clone(channel);
  }

  async archiveChannel(channelId) { return this.updateChannel(channelId, { archived: true, archivedAt: new Date().toISOString() }); }

  async createConversation(memberId) {
    const id = deterministicConversationId(this.currentUser.uid, memberId);
    let conversation = this.data.conversations.find((item) => item.id === id);
    if (!conversation) {
      conversation = { id, participantIds: [this.currentUser.uid, memberId], createdAt: new Date().toISOString(), lastMessageAt: new Date().toISOString(), unreadCount: 0 };
      this.data.conversations.push(conversation);
      this.data.messages[id] = [];
      this.persist(); this.emit('conversations');
    }
    return clone(conversation);
  }

  async markNotificationRead(notificationId) {
    const notification = this.data.notifications.find((item) => item.id === notificationId);
    if (notification) notification.read = true;
    this.persist(); this.emit('notifications');
  }

  async markAllNotificationsRead() {
    this.data.notifications.forEach((item) => { if (item.recipientId === this.currentUser.uid) item.read = true; });
    this.persist(); this.emit('notifications');
  }

  async uploadFile() {
    throw new Error('Attachments are unavailable in the free Firebase release.');
  }

  async search(term) {
    const query = term.trim().toLowerCase();
    if (!query) return [];
    const results = [];
    for (const [targetId, messages] of Object.entries(this.data.messages)) {
      for (const message of messages) {
        const haystack = `${message.content || ''} ${message.task?.title || ''} ${message.senderName || ''}`.toLowerCase();
        if (!haystack.includes(query)) continue;
        const channel = this.data.channels.find((item) => item.id === targetId);
        results.push({ ...clone(message), target: channel ? { type: 'channel', id: targetId, name: channel.name } : { type: 'dm', id: targetId } });
      }
    }
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 60);
  }

  async reportMessage(target, message, reason) {
    this.data.reports.push({ id: uuid('report-'), reporterId: this.currentUser.uid, target, messageSnapshot: message, reason, createdAt: new Date().toISOString(), status: 'open' });
    this.persist();
    return true;
  }

  async deleteMessage(target, messageId) {
    const messages = this.data.messages[target.id] || [];
    const index = messages.findIndex((item) => item.id === messageId);
    if (index >= 0) messages.splice(index, 1);
    this.persist(); this.emitMessages(target.id);
  }

  async updatePresence() {
    const member = this.data.members.find((item) => item.uid === this.currentUser.uid);
    if (member) { member.lastSeenAt = new Date().toISOString(); member.status = 'online'; }
    this.persist(); this.emit('members');
  }

  async listAccessRequests() { return []; }
  async approveMember() { return true; }

  emit(name) {
    const method = {
      channels: () => this.data.channels.filter((channel) => !channel.archived).sort((a, b) => a.sort - b.sort),
      members: () => this.data.members.filter((member) => member.active),
      conversations: () => this.data.conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)),
      notifications: () => this.data.notifications.filter((item) => item.recipientId === this.currentUser.uid).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }[name];
    if (!method) return;
    const value = clone(method());
    this.subscribers[name].forEach((callback) => callback(value));
  }

  emitMessages(key) {
    const value = clone((this.data.messages[key] || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    this.subscribers.messages.get(key)?.forEach((callback) => callback(value));
  }

  emitThread(key) {
    const value = clone((this.data.replies[key] || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    this.subscribers.threads.get(key)?.forEach((callback) => callback(value));
  }

  emitAll() {
    ['channels', 'members', 'conversations', 'notifications'].forEach((name) => this.emit(name));
    for (const key of this.subscribers.messages.keys()) this.emitMessages(key);
    for (const key of this.subscribers.threads.keys()) this.emitThread(key);
  }
}
