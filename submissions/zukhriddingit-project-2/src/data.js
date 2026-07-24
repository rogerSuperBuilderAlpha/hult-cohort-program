const now = Date.now();
const ago = (minutes) => new Date(now - minutes * 60000).toISOString();

export const demoCurrentUser = {
  uid: 'demo-zukhriddingit',
  displayName: 'Zukhriddin',
  githubHandle: 'zukhriddingit',
  email: 'zukhriddingit@users.noreply.github.com',
  avatarUrl: '',
  role: 'member',
  active: true,
  status: 'online',
  lastSeenAt: ago(0),
  headline: 'Building the cohort comms layer'
};

export const demoMembers = [
  demoCurrentUser,
  { uid: 'm-maya', displayName: 'Maya Chen', githubHandle: 'mayacodes', email: 'maya@example.dev', role: 'member', active: true, status: 'online', lastSeenAt: ago(1), headline: 'Shipping onboarding' },
  { uid: 'm-theo', displayName: 'Theo Grant', githubHandle: 'theogrant', email: 'theo@example.dev', role: 'member', active: true, status: 'online', lastSeenAt: ago(2), headline: 'Reviewing product flows' },
  { uid: 'm-noor', displayName: 'Noor Rahman', githubHandle: 'noorbuilds', email: 'noor@example.dev', role: 'member', active: true, status: 'online', lastSeenAt: ago(3), headline: 'Making realtime reliable' },
  { uid: 'm-ana', displayName: 'Ana Silva', githubHandle: 'anasilva', email: 'ana@example.dev', role: 'member', active: true, status: 'away', lastSeenAt: ago(12), headline: 'Design systems & delight' },
  { uid: 'm-jules', displayName: 'Jules Martin', githubHandle: 'julesmartin', email: 'jules@example.dev', role: 'member', active: true, status: 'online', lastSeenAt: ago(4), headline: 'PM integration wrangler' },
  { uid: 'm-samira', displayName: 'Samira Okafor', githubHandle: 'samira-o', email: 'samira@example.dev', role: 'staff', active: true, status: 'online', lastSeenAt: ago(1), headline: 'Program operator' },
  { uid: 'm-luca', displayName: 'Luca Bianchi', githubHandle: 'lucab', email: 'luca@example.dev', role: 'member', active: true, status: 'offline', lastSeenAt: ago(80), headline: 'Frontend polish' },
  { uid: 'm-rina', displayName: 'Rina Patel', githubHandle: 'rinap', email: 'rina@example.dev', role: 'member', active: true, status: 'online', lastSeenAt: ago(5), headline: 'Security & rules' },
  { uid: 'm-omar', displayName: 'Omar Haddad', githubHandle: 'omarships', email: 'omar@example.dev', role: 'member', active: true, status: 'away', lastSeenAt: ago(16), headline: 'Testing the happy path' },
  { uid: 'm-lee', displayName: 'Lee Park', githubHandle: 'leeparkdev', email: 'lee@example.dev', role: 'member', active: true, status: 'offline', lastSeenAt: ago(130), headline: 'Mobile PWA' },
  { uid: 'm-ivy', displayName: 'Ivy Brooks', githubHandle: 'ivybrooks', email: 'ivy@example.dev', role: 'admin', active: true, status: 'online', lastSeenAt: ago(2), headline: 'Cohort admin' }
];

export const demoChannels = [
  { id: 'announcements', name: 'announcements', emoji: '📣', description: 'Official cohort updates. Staff posts; everyone stays aligned.', type: 'public', postingRoles: ['admin', 'staff'], createdBy: 'm-ivy', sort: 10, archived: false, unreadCount: 1, pmUrl: '' },
  { id: 'general', name: 'general', emoji: '✦', description: 'Cohort-wide conversation, questions, and useful discoveries.', type: 'public', postingRoles: [], createdBy: 'm-ivy', sort: 20, archived: false, unreadCount: 0, pmUrl: '' },
  { id: 'ship-room', name: 'ship-room', emoji: '🚀', description: 'Make it real. Make it delightful.', type: 'public', postingRoles: [], createdBy: 'demo-zukhriddingit', sort: 30, archived: false, unreadCount: 4, pmUrl: 'https://example.com/projects/week-2' },
  { id: 'reviews', name: 'reviews', emoji: '🔎', description: 'Peer review coordination, deployment links, and sharp feedback.', type: 'public', postingRoles: [], createdBy: 'm-ivy', sort: 40, archived: false, unreadCount: 2, pmUrl: '' },
  { id: 'help-desk', name: 'help-desk', emoji: '🛟', description: 'Blocked? Ask early. Leave breadcrumbs for the next builder.', type: 'public', postingRoles: [], createdBy: 'm-noor', sort: 50, archived: false, unreadCount: 0, pmUrl: '' },
  { id: 'random', name: 'random', emoji: '🪩', description: 'Memes, wins, playlists, and the human side of shipping.', type: 'public', postingRoles: [], createdBy: 'm-maya', sort: 60, archived: false, unreadCount: 0, pmUrl: '' }
];

export const demoConversations = [
  { id: 'demo-zukhriddingit__m-maya', participantIds: ['demo-zukhriddingit', 'm-maya'], lastMessageAt: ago(7), unreadCount: 1 },
  { id: 'demo-zukhriddingit__m-theo', participantIds: ['demo-zukhriddingit', 'm-theo'], lastMessageAt: ago(38), unreadCount: 0 },
  { id: 'demo-zukhriddingit__m-noor', participantIds: ['demo-zukhriddingit', 'm-noor'], lastMessageAt: ago(180), unreadCount: 0 }
];

export const demoMessages = {
  announcements: [
    { id: 'a1', senderId: 'm-samira', senderName: 'Samira Okafor', senderHandle: 'samira-o', senderRole: 'staff', content: 'Week 2 Q&A is Monday at **6:00 PM ET**. Bring one product question and one technical risk. The merge deadline is Sunday at 5:00 PM EDT.', signalType: 'update', createdAt: ago(260), reactions: { ship: ['m-maya', 'm-theo', 'm-noor', 'demo-zukhriddingit'], spark: ['m-ana'] }, threadCount: 1 },
    { id: 'a2', senderId: 'm-ivy', senderName: 'Ivy Brooks', senderHandle: 'ivybrooks', senderRole: 'admin', content: 'Review week opens after the submission window. Keep your production URL stable and make the five-minute reviewer path obvious.', signalType: 'decision', createdAt: ago(45), reactions: { eyes: ['m-maya', 'm-noor'] }, threadCount: 0 }
  ],
  general: [
    { id: 'g1', senderId: 'm-luca', senderName: 'Luca Bianchi', senderHandle: 'lucab', content: 'Tiny discovery: using signal labels for **Ask** and **Decision** makes async catch-up much faster than reading a wall of chat.', signalType: 'update', createdAt: ago(190), reactions: { idea: ['m-rina', 'm-ana', 'demo-zukhriddingit'] }, threadCount: 2 },
    { id: 'g2', senderId: 'm-ana', senderName: 'Ana Silva', senderHandle: 'anasilva', content: 'Agreed. It gives us structure without turning every message into a form. @zukhriddingit the current composer feels really nice.', signalType: 'message', createdAt: ago(182), reactions: { heart: ['demo-zukhriddingit'] }, threadCount: 0 },
    { id: 'g3', senderId: 'm-omar', senderName: 'Omar Haddad', senderHandle: 'omarships', content: 'Does anyone have a clean way to test 15 concurrent sends without creating fifteen accounts?', signalType: 'ask', createdAt: ago(26), reactions: { eyes: ['m-noor', 'm-rina'] }, threadCount: 3 }
  ],
  'ship-room': [
    { id: 's1', senderId: 'm-maya', senderName: 'Maya Chen', senderHandle: 'mayacodes', content: 'The onboarding flow is live. Dropping the task here for a fast pass 👀', signalType: 'update', createdAt: ago(88), task: { title: 'Polish cohort onboarding', status: 'Ready for review', url: 'https://example.com/tasks/relay-onboarding', provider: 'PM platform', subtitle: 'Owner: Maya · due today' }, reactions: { fire: ['m-theo', 'm-noor', 'm-ana', 'm-jules', 'demo-zukhriddingit'], ship: ['m-theo', 'm-jules', 'demo-zukhriddingit'] }, threadCount: 4 },
    { id: 's2', senderId: 'm-theo', senderName: 'Theo Grant', senderHandle: 'theogrant', content: 'Reviewed. One tiny copy note, otherwise this is a ship. @mayacodes', signalType: 'message', createdAt: ago(84), reactions: { fire: ['m-maya', 'm-jules'], ship: ['m-maya'] }, threadCount: 0 },
    { id: 's3', senderId: 'm-noor', senderName: 'Noor Rahman', senderHandle: 'noorbuilds', content: 'Realtime listeners are stable under burst sends. I also added client latency marks so we can prove the sub-2-second experience instead of just saying it.', signalType: 'update', createdAt: ago(54), reactions: { spark: ['m-rina', 'm-maya', 'demo-zukhriddingit'], clap: ['m-omar'] }, threadCount: 2 },
    { id: 's4', senderId: 'demo-zukhriddingit', senderName: 'Zukhriddin', senderHandle: 'zukhriddingit', content: '**Decision:** Relay will be async-first with realtime delivery. Channels hold durable context; DMs stay private to participants; PM links unfurl into actionable cards.', signalType: 'decision', createdAt: ago(41), reactions: { heart: ['m-maya', 'm-theo'], ship: ['m-noor', 'm-jules', 'm-ana'] }, threadCount: 3 },
    { id: 's5', senderId: 'm-jules', senderName: 'Jules Martin', senderHandle: 'julesmartin', content: 'Can we make the winning PM URL configurable rather than hardcoded? That keeps the submission honest until the operator publishes the final integration endpoint.', signalType: 'ask', createdAt: ago(24), reactions: { idea: ['demo-zukhriddingit', 'm-rina'], eyes: ['m-noor'] }, threadCount: 2 },
    { id: 's6', senderId: 'demo-zukhriddingit', senderName: 'Zukhriddin', senderHandle: 'zukhriddingit', content: 'Done. `config.js` owns the board URL, task cards accept any HTTPS deep link, and the optional webhook posts assignments into this channel.', signalType: 'win', createdAt: ago(17), attachment: { name: 'relay-mobile-preview.svg', type: 'image/svg+xml', size: 38420, url: 'assets/demo-wireframe.svg' }, reactions: { fire: ['m-maya', 'm-theo', 'm-noor', 'm-ana'], ship: ['m-jules', 'm-rina'] }, threadCount: 1 }
  ],
  reviews: [
    { id: 'r1', senderId: 'm-samira', senderName: 'Samira Okafor', senderHandle: 'samira-o', senderRole: 'staff', content: 'Reviewer path: open the production deploy → sign in → join a channel → send a DM → verify a notification → search for your message.', signalType: 'update', createdAt: ago(152), reactions: { eyes: ['demo-zukhriddingit', 'm-maya', 'm-theo'] }, threadCount: 0 },
    { id: 'r2', senderId: 'm-rina', senderName: 'Rina Patel', senderHandle: 'rinap', content: 'Security reminder: operator access should **not** bypass DM participant rules. Abuse reports can include a message snapshot; general admin browsing of DMs should remain impossible.', signalType: 'decision', createdAt: ago(62), reactions: { heart: ['m-samira', 'demo-zukhriddingit'], idea: ['m-noor'] }, threadCount: 1 }
  ],
  'help-desk': [
    { id: 'h1', senderId: 'm-noor', senderName: 'Noor Rahman', senderHandle: 'noorbuilds', content: 'Drop a blocker with the smallest reproduction you can. Add browser, expected result, actual result, and a screenshot when useful.', signalType: 'update', createdAt: ago(330), reactions: {}, threadCount: 0 }
  ],
  random: [
    { id: 'x1', senderId: 'm-lee', senderName: 'Lee Park', senderHandle: 'leeparkdev', content: 'Today’s ship soundtrack: synthwave, one absurdly large coffee, and zero mystery state bugs.', signalType: 'message', createdAt: ago(220), reactions: { fire: ['m-ana', 'm-maya'], heart: ['m-theo'] }, threadCount: 0 }
  ],
  'demo-zukhriddingit__m-maya': [
    { id: 'dm1', senderId: 'm-maya', senderName: 'Maya Chen', senderHandle: 'mayacodes', content: 'The task card treatment is excellent. Can you make the whole card clickable, not only the title?', signalType: 'ask', createdAt: ago(12), reactions: {}, threadCount: 0 },
    { id: 'dm2', senderId: 'demo-zukhriddingit', senderName: 'Zukhriddin', senderHandle: 'zukhriddingit', content: 'Yep — patched. Keyboard focus and external-link affordance are in too.', signalType: 'message', createdAt: ago(7), reactions: { ship: ['m-maya'] }, threadCount: 0 }
  ],
  'demo-zukhriddingit__m-theo': [
    { id: 'dt1', senderId: 'm-theo', senderName: 'Theo Grant', senderHandle: 'theogrant', content: 'I left the microcopy pass in the thread. The “signal, not noise” positioning is memorable.', signalType: 'message', createdAt: ago(38), reactions: { heart: ['demo-zukhriddingit'] }, threadCount: 0 }
  ],
  'demo-zukhriddingit__m-noor': [
    { id: 'dn1', senderId: 'm-noor', senderName: 'Noor Rahman', senderHandle: 'noorbuilds', content: 'Firestore rules look good. I especially like that staff can moderate public channels but cannot read private DMs.', signalType: 'message', createdAt: ago(180), reactions: {}, threadCount: 0 }
  ]
};

export const demoReplies = {
  'channel:ship-room:s1': [
    { id: 's1-r1', senderId: 'm-ana', senderName: 'Ana Silva', senderHandle: 'anasilva', content: 'The welcome card hierarchy is strong. I would keep the secondary copy to one line on mobile.', createdAt: ago(82), reactions: { heart: ['m-maya'] } },
    { id: 's1-r2', senderId: 'demo-zukhriddingit', senderName: 'Zukhriddin', senderHandle: 'zukhriddingit', content: 'Good call. I added a two-line clamp under 420px.', createdAt: ago(79), reactions: { check: ['m-ana'] } },
    { id: 's1-r3', senderId: 'm-theo', senderName: 'Theo Grant', senderHandle: 'theogrant', content: 'Tested on Safari mobile too — no horizontal jump now.', createdAt: ago(76), reactions: { ship: ['m-maya'] } },
    { id: 's1-r4', senderId: 'm-maya', senderName: 'Maya Chen', senderHandle: 'mayacodes', content: 'Perfect. Marking the PM task done.', createdAt: ago(74), reactions: { fire: ['demo-zukhriddingit', 'm-theo'] } }
  ],
  'channel:ship-room:s4': [
    { id: 's4-r1', senderId: 'm-rina', senderName: 'Rina Patel', senderHandle: 'rinap', content: 'This should go into ARCHITECTURE.md verbatim. It explains the privacy boundary clearly.', createdAt: ago(37), reactions: { idea: ['demo-zukhriddingit'] } },
    { id: 's4-r2', senderId: 'm-noor', senderName: 'Noor Rahman', senderHandle: 'noorbuilds', content: 'And it maps cleanly to the rules: public channel membership versus explicit DM participants.', createdAt: ago(34), reactions: {} },
    { id: 's4-r3', senderId: 'demo-zukhriddingit', senderName: 'Zukhriddin', senderHandle: 'zukhriddingit', content: 'Captured in the docs and the PR body notes.', createdAt: ago(30), reactions: { check: ['m-rina', 'm-noor'] } }
  ],
  'channel:ship-room:s5': [
    { id: 's5-r1', senderId: 'demo-zukhriddingit', senderName: 'Zukhriddin', senderHandle: 'zukhriddingit', content: 'Yes. The deploy only needs `pmPlatform.boardUrl` updated after the winner URL is known.', createdAt: ago(20), reactions: { check: ['m-jules'] } },
    { id: 's5-r2', senderId: 'm-jules', senderName: 'Jules Martin', senderHandle: 'julesmartin', content: 'That is the cleanest integration contract for this deadline.', createdAt: ago(18), reactions: {} }
  ]
};

export const demoNotifications = [
  { id: 'n1', type: 'mention', recipientId: 'demo-zukhriddingit', actorId: 'm-ana', actorName: 'Ana Silva', actorHandle: 'anasilva', channelId: 'general', messageId: 'g2', text: 'mentioned you in #general', createdAt: ago(182), read: false },
  { id: 'n2', type: 'dm', recipientId: 'demo-zukhriddingit', actorId: 'm-maya', actorName: 'Maya Chen', actorHandle: 'mayacodes', conversationId: 'demo-zukhriddingit__m-maya', messageId: 'dm1', text: 'sent you a direct message', createdAt: ago(12), read: false },
  { id: 'n3', type: 'thread', recipientId: 'demo-zukhriddingit', actorId: 'm-rina', actorName: 'Rina Patel', actorHandle: 'rinap', channelId: 'ship-room', messageId: 's4', text: 'replied to your decision', createdAt: ago(37), read: false }
];
