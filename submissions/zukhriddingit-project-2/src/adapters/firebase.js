import { deterministicConversationId, parseMentions, safeUrl } from '../utils.js';

export class FirebaseAdapter {
  constructor(config) {
    this.config = config;
    this.mode = 'firebase';
    this.currentUser = null;
    this.currentProfile = null;
    this.cachedMembers = [];
    this.cachedChannels = [];
    this.cachedConversations = [];
  }

  async init() {
    const version = this.config.firebaseSdkVersion || '12.16.0';
    const base = `https://www.gstatic.com/firebasejs/${version}`;
    const [appModule, authModule, firestoreModule] = await Promise.all([
      import(`${base}/firebase-app.js`),
      import(`${base}/firebase-auth.js`),
      import(`${base}/firebase-firestore.js`)
    ]);
    this.fb = { ...appModule, ...authModule, ...firestoreModule };
    this.app = this.fb.initializeApp(this.config.firebase);
    this.auth = this.fb.getAuth(this.app);
    this.db = this.fb.getFirestore(this.app);
    await this.fb.setPersistence(this.auth, this.fb.browserLocalPersistence);
    this.provider = new this.fb.GithubAuthProvider();
    this.provider.addScope('read:user');
    this.provider.addScope('user:email');
    this.provider.setCustomParameters({ allow_signup: 'true' });
    try {
      const redirectResult = await this.fb.getRedirectResult(this.auth);
      if (redirectResult) await this.extractIdentity(redirectResult);
    } catch (error) {
      console.warn('Redirect sign-in result failed:', error);
    }
    return this;
  }

  onAuth(callback) {
    return this.fb.onAuthStateChanged(this.auth, async (user) => {
      this.currentUser = user;
      callback(user);
    });
  }

  async signIn() {
    try {
      const result = await this.fb.signInWithPopup(this.auth, this.provider);
      await this.extractIdentity(result);
      return result.user;
    } catch (error) {
      if (['auth/popup-blocked', 'auth/cancelled-popup-request'].includes(error.code)) {
        await this.fb.signInWithRedirect(this.auth, this.provider);
        return null;
      }
      throw error;
    }
  }

  async signOut() { return this.fb.signOut(this.auth); }

  async extractIdentity(result) {
    const additional = this.fb.getAdditionalUserInfo(result);
    const credential = this.fb.GithubAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    const identity = {
      githubHandle: additional?.username || '',
      email: result.user.email || '',
      displayName: result.user.displayName || '',
      avatarUrl: result.user.photoURL || ''
    };
    if (token && (!identity.githubHandle || !identity.email)) {
      try {
        const profileResponse = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } });
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          identity.githubHandle ||= profile.login || '';
          identity.displayName ||= profile.name || profile.login || '';
          identity.avatarUrl ||= profile.avatar_url || '';
          identity.email ||= profile.email || '';
        }
        if (!identity.email) {
          const emailResponse = await fetch('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } });
          if (emailResponse.ok) {
            const emails = await emailResponse.json();
            identity.email = emails.find((item) => item.primary && item.verified)?.email || emails.find((item) => item.verified)?.email || '';
          }
        }
      } catch (error) {
        console.warn('GitHub profile enrichment failed:', error);
      }
    }
    sessionStorage.setItem('relay65-oauth-identity', JSON.stringify(identity));
    return identity;
  }

  getStoredIdentity(user) {
    try {
      return JSON.parse(sessionStorage.getItem('relay65-oauth-identity') || '{}');
    } catch {
      return { displayName: user?.displayName || '', email: user?.email || '', avatarUrl: user?.photoURL || '' };
    }
  }

  async checkMembership(user) {
    const { doc, getDoc, setDoc, serverTimestamp } = this.fb;
    const memberRef = doc(this.db, 'members', user.uid);
    const memberSnapshot = await getDoc(memberRef);
    if (memberSnapshot.exists() && memberSnapshot.data().active) {
      const profile = { id: memberSnapshot.id, ...memberSnapshot.data() };
      this.currentProfile = profile;
      await setDoc(memberRef, { lastSeenAt: serverTimestamp(), status: 'online' }, { merge: true });
      return profile;
    }

    const identity = this.getStoredIdentity(user);
    const workspaceSnapshot = await getDoc(doc(this.db, 'settings', 'workspace'));
    const accessMode = workspaceSnapshot.exists() ? workspaceSnapshot.data().accessMode : 'request';
    const baseProfile = {
      uid: user.uid,
      githubHandle: identity.githubHandle || user.displayName?.replace(/\s+/g, '').toLowerCase() || `github-${user.uid.slice(0, 6)}`,
      displayName: identity.displayName || user.displayName || 'GitHub member',
      email: identity.email || user.email || '',
      avatarUrl: identity.avatarUrl || user.photoURL || '',
      role: 'member', active: true, status: 'online', lastSeenAt: serverTimestamp(), createdAt: serverTimestamp()
    };

    if (accessMode === 'open') {
      await setDoc(memberRef, baseProfile, { merge: true });
      this.currentProfile = { ...baseProfile, lastSeenAt: new Date(), createdAt: new Date() };
      return this.currentProfile;
    }

    // Keep the legacy request path only for an intentionally configured
    // request-mode workspace. A missing/invalid workspace setting must not
    // leave a stale approval record in the active no-admin release.
    if (workspaceSnapshot.exists() && accessMode === 'request') {
      await setDoc(doc(this.db, 'access_requests', user.uid), {
        ...baseProfile, active: false, status: 'pending', requestedAt: serverTimestamp()
      }, { merge: true });
    }
    return null;
  }

  async ensureStarterChannels() {
    if (!['admin', 'staff'].includes(this.currentProfile?.role)) return;
    const { collection, getDocs, query, limit, where, doc, writeBatch, serverTimestamp } = this.fb;
    const existing = await getDocs(query(
      collection(this.db, 'channels'),
      where('type', '==', 'public'),
      limit(1)
    ));
    if (!existing.empty) return;
    const starter = [
      { id: 'announcements', name: 'announcements', emoji: '📣', description: 'Official cohort updates. Staff posts; everyone stays aligned.', postingRoles: ['admin', 'staff'], sort: 10 },
      { id: 'general', name: 'general', emoji: '✦', description: 'Cohort-wide conversation, questions, and useful discoveries.', postingRoles: [], sort: 20 },
      { id: 'ship-room', name: 'ship-room', emoji: '🚀', description: 'Make it real. Make it delightful.', postingRoles: [], sort: 30 },
      { id: 'reviews', name: 'reviews', emoji: '🔎', description: 'Peer review coordination, deployment links, and sharp feedback.', postingRoles: [], sort: 40 },
      { id: 'help-desk', name: 'help-desk', emoji: '🛟', description: 'Blocked? Ask early. Leave breadcrumbs for the next builder.', postingRoles: [], sort: 50 },
      { id: 'random', name: 'random', emoji: '🪩', description: 'Memes, wins, playlists, and the human side of shipping.', postingRoles: [], sort: 60 }
    ];
    const batch = writeBatch(this.db);
    starter.forEach((channel) => batch.set(doc(this.db, 'channels', channel.id), {
      ...channel, type: 'public', archived: false, createdBy: this.currentProfile.uid,
      createdAt: serverTimestamp(), pmUrl: channel.id === 'ship-room' ? (this.config.pmPlatform?.boardUrl || '') : ''
    }));
    batch.set(doc(this.db, 'settings', 'workspace'), {
      accessMode: this.config.accessMode || 'open', cohortCapacity: this.config.cohortCapacity || 65,
      workspaceName: this.config.workspaceName || 'Hult Cohort', updatedAt: serverTimestamp()
    }, { merge: true });
    await batch.commit();
  }

  subscribeChannels(callback) {
    const { collection, onSnapshot, orderBy, query, where } = this.fb;
    const channels = collection(this.db, 'channels');
    let publicChannels = [];
    let memberChannels = [];

    const toChannels = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    const publish = () => {
      const merged = new Map();
      [...publicChannels, ...memberChannels].forEach((channel) => merged.set(channel.id, channel));
      this.cachedChannels = [...merged.values()]
        .filter((channel) => !channel.archived)
        .sort((left, right) => left.sort - right.sort || left.id.localeCompare(right.id));
      callback(this.cachedChannels);
    };

    const unsubscribePublic = onSnapshot(query(
      channels,
      where('type', '==', 'public'),
      orderBy('sort', 'asc')
    ), (snapshot) => {
      publicChannels = toChannels(snapshot);
      publish();
    }, (error) => console.error('Public channels listener:', error));

    const unsubscribeMember = onSnapshot(query(
      channels,
      where('memberIds', 'array-contains', this.currentUser.uid),
      orderBy('sort', 'asc')
    ), (snapshot) => {
      memberChannels = toChannels(snapshot);
      publish();
    }, (error) => console.error('Member channels listener:', error));

    return () => {
      unsubscribePublic();
      unsubscribeMember();
    };
  }

  subscribeMembers(callback) {
    const { collection, onSnapshot } = this.fb;
    return onSnapshot(collection(this.db, 'members'), (snapshot) => {
      this.cachedMembers = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.active);
      callback(this.cachedMembers);
    }, (error) => console.error('Members listener:', error));
  }

  subscribeConversations(callback) {
    const { collection, limit, onSnapshot, orderBy, query, where } = this.fb;
    const q = query(collection(this.db, 'conversations'), where('participantIds', 'array-contains', this.currentUser.uid), orderBy('lastMessageAt', 'desc'), limit(100));
    return onSnapshot(q, (snapshot) => {
      this.cachedConversations = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      callback(this.cachedConversations);
    }, (error) => console.error('DM listener:', error));
  }

  subscribeNotifications(callback) {
    const { collection, limit, onSnapshot, orderBy, query, where } = this.fb;
    const q = query(collection(this.db, 'notifications'), where('recipientId', '==', this.currentUser.uid), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(q, (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))), (error) => console.error('Notification listener:', error));
  }

  messageCollection(target) {
    const { collection } = this.fb;
    return target.type === 'channel'
      ? collection(this.db, 'channels', target.id, 'messages')
      : collection(this.db, 'conversations', target.id, 'messages');
  }

  messageDoc(target, messageId) {
    const { doc } = this.fb;
    return target.type === 'channel'
      ? doc(this.db, 'channels', target.id, 'messages', messageId)
      : doc(this.db, 'conversations', target.id, 'messages', messageId);
  }

  replyDoc(target, messageId, replyId) {
    const { doc } = this.fb;
    return target.type === 'channel'
      ? doc(this.db, 'channels', target.id, 'messages', messageId, 'replies', replyId)
      : doc(this.db, 'conversations', target.id, 'messages', messageId, 'replies', replyId);
  }

  subscribeMessages(target, callback) {
    const { limit, onSnapshot, orderBy, query } = this.fb;
    const q = query(this.messageCollection(target), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).reverse();
      callback(messages);
    }, (error) => console.error('Message listener:', error));
  }

  subscribeThread(target, messageId, callback) {
    const { collection, onSnapshot, orderBy, query } = this.fb;
    const replies = collection(this.messageDoc(target, messageId), 'replies');
    return onSnapshot(query(replies, orderBy('createdAt', 'asc')), (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))), (error) => console.error('Thread listener:', error));
  }

  async sendMessage(target, payload) {
    const { addDoc, doc, serverTimestamp, updateDoc } = this.fb;
    const data = {
      senderId: this.currentUser.uid,
      senderName: this.currentProfile.displayName,
      senderHandle: this.currentProfile.githubHandle,
      senderRole: this.currentProfile.role,
      content: payload.content.trim(),
      signalType: payload.signalType || 'message',
      task: payload.task || null,
      reactions: {}, threadCount: 0,
      clientCreatedAt: Date.now(), createdAt: serverTimestamp()
    };
    const messageRef = await addDoc(this.messageCollection(target), data);
    const parentRef = target.type === 'channel' ? doc(this.db, 'channels', target.id) : doc(this.db, 'conversations', target.id);
    await updateDoc(parentRef, { lastMessageAt: serverTimestamp(), lastMessagePreview: data.content.slice(0, 140) });
    await this.createMessageNotifications(target, { id: messageRef.id, ...data });
    return { id: messageRef.id, ...data, createdAt: new Date() };
  }

  async createMessageNotifications(target, message) {
    const { addDoc, collection, serverTimestamp } = this.fb;
    const recipients = new Map();
    if (target.type === 'dm') {
      const conversation = this.cachedConversations.find((item) => item.id === target.id) || target.conversation;
      conversation?.participantIds.filter((uid) => uid !== this.currentUser.uid).forEach((uid) => recipients.set(uid, { type: 'dm', text: 'sent you a direct message' }));
    }
    for (const handle of parseMentions(message.content)) {
      const member = this.cachedMembers.find((item) => item.githubHandle?.toLowerCase() === handle && item.uid !== this.currentUser.uid);
      if (member) recipients.set(member.uid, { type: 'mention', text: target.type === 'channel' ? `mentioned you in #${target.name}` : 'mentioned you in a DM' });
    }
    await Promise.all([...recipients.entries()].map(([recipientId, meta]) => addDoc(collection(this.db, 'notifications'), {
      ...meta, recipientId, actorId: this.currentUser.uid, actorName: this.currentProfile.displayName,
      actorHandle: this.currentProfile.githubHandle, channelId: target.type === 'channel' ? target.id : null,
      conversationId: target.type === 'dm' ? target.id : null, messageId: message.id,
      read: false, createdAt: serverTimestamp()
    })));
  }

  async sendThreadReply(target, rootMessage, content) {
    const { addDoc, collection, increment, serverTimestamp, updateDoc } = this.fb;
    const rootRef = this.messageDoc(target, rootMessage.id);
    const replyRef = await addDoc(collection(rootRef, 'replies'), {
      senderId: this.currentUser.uid, senderName: this.currentProfile.displayName,
      senderHandle: this.currentProfile.githubHandle, senderRole: this.currentProfile.role,
      content: content.trim(), reactions: {}, createdAt: serverTimestamp()
    });
    await updateDoc(rootRef, { threadCount: increment(1), lastReplyAt: serverTimestamp() });
    if (rootMessage.senderId !== this.currentUser.uid) {
      await addDoc(collection(this.db, 'notifications'), {
        type: 'thread', recipientId: rootMessage.senderId, actorId: this.currentUser.uid,
        actorName: this.currentProfile.displayName, actorHandle: this.currentProfile.githubHandle,
        channelId: target.type === 'channel' ? target.id : null, conversationId: target.type === 'dm' ? target.id : null,
        messageId: rootMessage.id, text: 'replied in your thread', read: false, createdAt: serverTimestamp()
      });
    }
    return { id: replyRef.id, content, createdAt: new Date() };
  }

  async toggleReaction(target, message, reactionKey) {
    const { arrayRemove, arrayUnion, updateDoc } = this.fb;
    const active = message.reactions?.[reactionKey]?.includes(this.currentUser.uid);
    await updateDoc(this.messageDoc(target, message.id), { [`reactions.${reactionKey}`]: active ? arrayRemove(this.currentUser.uid) : arrayUnion(this.currentUser.uid) });
  }

  async toggleReplyReaction(target, rootMessageId, reply, reactionKey) {
    const { arrayRemove, arrayUnion, updateDoc } = this.fb;
    const active = reply.reactions?.[reactionKey]?.includes(this.currentUser.uid);
    const replyRef = this.replyDoc(target, rootMessageId, reply.id);
    await updateDoc(replyRef, { [`reactions.${reactionKey}`]: active ? arrayRemove(this.currentUser.uid) : arrayUnion(this.currentUser.uid) });
  }

  async createChannel(input) {
    const { addDoc, collection, serverTimestamp } = this.fb;
    const ref = await addDoc(collection(this.db, 'channels'), {
      name: input.name, emoji: input.emoji || '#', description: input.description || '', type: 'public',
      postingRoles: input.postingRoles || [], pmUrl: safeUrl(input.pmUrl || ''), archived: false,
      createdBy: this.currentUser.uid, sort: Math.max(0, ...this.cachedChannels.map((item) => item.sort || 0)) + 10,
      createdAt: serverTimestamp()
    });
    return { id: ref.id, ...input };
  }

  async updateChannel(channelId, patch) {
    const { doc, serverTimestamp, updateDoc } = this.fb;
    await updateDoc(doc(this.db, 'channels', channelId), { ...patch, updatedAt: serverTimestamp() });
  }

  async archiveChannel(channelId) {
    return this.updateChannel(channelId, { archived: true, archivedAt: this.fb.serverTimestamp() });
  }

  async createConversation(memberId) {
    const { doc, serverTimestamp, setDoc } = this.fb;
    const id = deterministicConversationId(this.currentUser.uid, memberId);
    const existing = this.cachedConversations.find((item) => item.id === id);
    if (existing) return existing;
    const conversation = { id, participantIds: [this.currentUser.uid, memberId], lastMessageAt: new Date(), lastMessagePreview: '' };
    await setDoc(doc(this.db, 'conversations', id), {
      participantIds: conversation.participantIds, lastMessageAt: serverTimestamp(), lastMessagePreview: ''
    }, { merge: true });
    this.cachedConversations = [conversation, ...this.cachedConversations.filter((item) => item.id !== id)];
    return conversation;
  }

  async markNotificationRead(notificationId) {
    const { doc, updateDoc } = this.fb;
    await updateDoc(doc(this.db, 'notifications', notificationId), { read: true });
  }

  async markAllNotificationsRead() {
    const { collection, getDocs, query, where, writeBatch } = this.fb;
    const snapshot = await getDocs(query(collection(this.db, 'notifications'), where('recipientId', '==', this.currentUser.uid), where('read', '==', false)));
    const batch = writeBatch(this.db);
    snapshot.docs.forEach((item) => batch.update(item.ref, { read: true }));
    await batch.commit();
  }

  async uploadFile() {
    throw new Error('Attachments are unavailable in the free Firebase release.');
  }

  async search(term) {
    const { getDocs, limit, orderBy, query } = this.fb;
    const needle = term.trim().toLowerCase();
    if (!needle) return [];
    const targets = [
      ...this.cachedChannels.map((channel) => ({ type: 'channel', id: channel.id, name: channel.name })),
      ...this.cachedConversations.map((conversation) => ({ type: 'dm', id: conversation.id }))
    ];
    const batches = await Promise.all(targets.map(async (target) => {
      try {
        const snapshot = await getDocs(query(this.messageCollection(target), orderBy('createdAt', 'desc'), limit(120)));
        return snapshot.docs.map((item) => ({ id: item.id, ...item.data(), target }));
      } catch { return []; }
    }));
    return batches.flat().filter((message) => `${message.content || ''} ${message.task?.title || ''} ${message.senderName || ''}`.toLowerCase().includes(needle))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 60);
  }

  async reportMessage(target, message, reason) {
    const { addDoc, collection, serverTimestamp } = this.fb;
    await addDoc(collection(this.db, 'reports'), {
      reporterId: this.currentUser.uid, reporterHandle: this.currentProfile.githubHandle,
      target, messageId: message.id, messageSnapshot: { senderId: message.senderId, senderHandle: message.senderHandle, content: message.content, createdAt: message.createdAt },
      reason, status: 'open', createdAt: serverTimestamp()
    });
  }

  async deleteMessage(target, messageId) {
    const { deleteDoc } = this.fb;
    await deleteDoc(this.messageDoc(target, messageId));
  }

  async updatePresence() {
    if (!this.currentUser) return;
    const { doc, serverTimestamp, updateDoc } = this.fb;
    await updateDoc(doc(this.db, 'members', this.currentUser.uid), { status: document.hidden ? 'away' : 'online', lastSeenAt: serverTimestamp() });
  }

  async listAccessRequests() {
    const { collection, getDocs, orderBy, query } = this.fb;
    const snapshot = await getDocs(query(collection(this.db, 'access_requests'), orderBy('requestedAt', 'desc')));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.status === 'pending');
  }

  async approveMember(request) {
    const { deleteDoc, doc, serverTimestamp, setDoc, writeBatch } = this.fb;
    const batch = writeBatch(this.db);
    batch.set(doc(this.db, 'members', request.uid || request.id), {
      uid: request.uid || request.id, githubHandle: request.githubHandle || '', displayName: request.displayName || 'Cohort member',
      email: request.email || '', avatarUrl: request.avatarUrl || '', role: 'member', active: true,
      status: 'offline', lastSeenAt: serverTimestamp(), createdAt: request.requestedAt || serverTimestamp()
    }, { merge: true });
    batch.delete(doc(this.db, 'access_requests', request.uid || request.id));
    await batch.commit();
  }
}
