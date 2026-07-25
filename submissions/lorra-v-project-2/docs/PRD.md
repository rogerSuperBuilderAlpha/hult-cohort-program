# Conexus — Product Requirements Document (PRD) — v2

**Tagline:** From Conversation to Coordination
**Context:** Hult Summer Cohort project — a production communications platform for the cohort.
**Hard requirements (from the brief):** channels, direct messages, notifications, asynchronous threads; must support every enrolled participant (67); must integrate with **Forth** (the selected project-management platform) via deep links, shared authentication, and task notifications.

**Key facts locked in v2:**
- PM platform: **Forth** ("Project work with a pulse", https://forth-bice.vercel.app) — a cohort-built app, not a commercial API. Integration therefore requires a small agreed contract with the Forth team (§7.0).
- Cohort size: **67 users**. Sized for ~67 concurrent on demo day.
- Shared authentication: **SSO** — both apps authenticate against the same identity provider (§2).
- AI Assistant: **deferred to stretch**.
- Longevity: if Conexus is selected as the cohort's tool, it must run beyond the summer → production hosting posture from day one (§6).

---

## 1. Product overview

Conexus is a team communications workspace that turns conversations into coordinated action. Unlike pure chat (context with no follow-through) or pure PM tools (tasks with no context), Conexus links every discussion to the work it produces: messages can be promoted to Forth tickets, ticket activity surfaces back into the channels where it was discussed, and deep links connect both directions.

**Primary users:** the 67 enrolled cohort participants. **Secondary users:** cohort admins/facilitators.

**Success criteria (what graders will test):**
1. Any enrolled participant can sign in with their existing school Google account and immediately see their channels.
2. Real-time messaging works reliably across channels, DMs, and threads.
3. Notifications fire for the right events and are visible in-app.
4. A Forth ticket can be reached in one click from Conexus, and Forth ticket events appear as notifications in Conexus.
5. One identity works across both apps (SSO) — no second signup.

---

## 2. Users, roles, and shared authentication (SSO)

### SSO design
Both Conexus and Forth are cohort-built apps, so "SSO" practically means **both apps delegate authentication to external identity providers**, with **email as the shared identity key**:

- **Open self-serve signup:** any authenticated user becomes a Conexus **member** on first login. There is **no roster allowlist gate** and no “ask your facilitator” access screen — peers sign up themselves on the live deploy (including during review week).
- **Providers (Conexus):** Supabase Auth with **Google** and **GitHub** OAuth on the login page, plus **email magic link** as a fallback when OAuth fails.
- **Default role:** `member` on first login. **Admin is separate from access** — granted manually (seed admin, hardcoded admin emails, or admin tooling), never by self-serve signup alone.
- **Cross-app identity:** a user's email is the join key between Conexus users and Forth users. `User.forth_user_ref` stores the Forth-side identifier once resolved (§7.2).
- **Coordination needed:** confirm the Forth team also uses (or will add) Google and/or GitHub OAuth. Shared providers + email as join key give one-identity SSO. *(This is item 1 of the integration contract, §7.0.)*
- **Optional directory:** admins may still upload a CSV (`name, email`) for a facilitator-maintained directory; it does **not** control who can sign in.

### Roles
| Role | Capabilities |
|---|---|
| **Admin** | Everything below, plus: create/archive channels, manage optional directory, deactivate users, manage integration settings, pin messages |
| **Member** | Join public channels, create private channels & group DMs, send messages, create threads, react, upload files, link/create Forth tickets |

- **Deactivation:** messages remain (attributed, greyed avatar); sign-in blocked.
- **Self-serve applies to signup, not admin privileges.**

---

## 3. Data model (core entities)

```
User        { id, email, display_name, avatar_url, role, status(active|pending|deactivated), forth_user_ref?, created_at }
Workspace   { id, name }                              // single workspace
Channel     { id, workspace_id, name, description, type(public|private), created_by, is_archived, created_at }
ChannelMember { channel_id, user_id, last_read_at, notification_level(all|mentions|mute) }
Conversation  { id, type(dm|group_dm), created_at }
ConversationMember { conversation_id, user_id, last_read_at }
Message     { id, parent_type(channel|conversation), parent_id, thread_root_id?, author_id,
              body_richtext, created_at, edited_at?, deleted_at? }
Reaction    { message_id, user_id, emoji }
Attachment  { id, message_id, file_url, file_name, mime_type, size_bytes }
Mention     { message_id, mentioned_user_id }
TicketLink  { id, message_id?, channel_id, forth_ticket_id, forth_url, title_snapshot, status_snapshot,
              assignee_email_snapshot?, created_by, created_at, last_synced_at }
Notification{ id, user_id, type, actor_id?, entity_ref, is_read, created_at }
IntegrationConfig { id, forth_base_url, shared_api_key(encrypted), webhook_secret }
```

**Key modeling decisions:**
- **Threads are messages with a `thread_root_id`** (the Slack model) — no separate thread entity. Thread replies don't appear in the main channel flow, just a "N replies" indicator on the root.
- **DMs ≠ channels.** Separate `Conversation` entity keeps permissions simple (DM membership fixed at creation).
- **`last_read_at` per member** drives unread badges. No per-message read receipts in v1.
- **`TicketLink` snapshots title/status/assignee** so cards render instantly; snapshots refresh on webhook or poll (§7.3), with `last_synced_at` shown as "updated Xm ago" when data may be stale.

---

## 4. Feature specifications

### 4.1 Channels
- Public: visible to all, anyone joins/leaves. Private: invite-only, hidden from non-members.
- Defaults on provisioning: `#announcements` (admin-post-only), `#general`, `#random`.
- Channel view: message list (newest at bottom, infinite scroll up), composer, member sidebar, pinned messages.
- Composer: rich text (bold/italic/code/links/lists), @mentions with typeahead, emoji picker, file attach (10 MB cap; images/PDF/docx/zip), `Cmd/Ctrl+Enter` to send.
- Message actions (hover): react, reply in thread, edit (own, 15-min window, shows "edited"), delete (own or admin), copy link, **"Create Forth ticket"** (§7.4), pin (admin).

### 4.2 Direct messages
- 1:1 and group DMs (up to 9). Started from the DM sidebar "+" or any profile popover.
- Same composer/message features as channels, minus pinning.
- Group DM naming: auto ("Asha, Daniel, Maria") with optional custom name.

### 4.3 Asynchronous threads
- Any channel or DM message can start a thread; panel opens right (desktop) / full screen (mobile).
- Root shows reply count + participant facepile + last-reply time.
- Replying subscribes you; thread activity notifies subscribers (root author + repliers + @mentioned), **not** the whole channel.
- "Also send to channel" checkbox mirrors a reply into the main flow.
- **Threads** sidebar view lists subscribed threads by latest activity with unread state.

### 4.4 Notifications
| Event | Who is notified | Badge | Feed entry |
|---|---|---|---|
| @mention (channel/thread) | Mentioned user | ✅ | ✅ |
| New DM message | DM members | ✅ | ✅ |
| Thread reply | Thread subscribers | ✅ | ✅ |
| Forth ticket assigned to you | Assignee (email-mapped user) | ✅ | ✅ |
| Linked Forth ticket changes status | Link creator + thread subscribers | — | ✅ |
| New channel message | Members per `notification_level` | ✅ (dot only) | — |
| Added to private channel / group DM | Added user | ✅ | ✅ |

- **Delivery:** in-app for v1 — bell icon with count, dropdown feed, mark-as-read; realtime over the same websocket as messages.
- **Per-channel levels:** All / Mentions only / Mute.
- **Stretch:** browser push, email digest for >24h-unread mentions.

### 4.5 Search (v1-lite)
- Keyword search within a channel + global across visible channels. Postgres full-text search — no Elasticsearch at 67 users.

### 4.6 Presence (v1-lite)
- Online/offline dot (websocket connect + 60s heartbeat). Typing indicators are stretch.

---

## 5. Information architecture / navigation

Left sidebar (matches the brand kit mockup):
1. **Home** — activity digest: unread channels, recent mentions, your Forth tickets (from TicketLinks)
2. **Messages** — DM list
3. **Threads** — subscribed threads
4. **Teams** *(stretch)*
5. **Tasks** — all visible TicketLinks, filterable by status/assignee, each deep-linking to Forth
6. **Calendar** *(stretch)*
7. **Files** — attachments the user can see, filterable by channel
8. **AI Assistant** *(stretch — confirmed deferred)*
9. Channel list + DM list below

---

## 6. Architecture & hosting (built to outlive the summer)

- **Stack:** Next.js (App Router) on **Vercel** + **Supabase** (Postgres, Auth with Google provider, Realtime, Storage). Same hosting family as Forth, which simplifies any future co-deployment.
- **Realtime:** Supabase Realtime subscriptions on `messages` and `notifications`, filtered by membership. Optimistic UI on send.
- **Row-level security is mandatory** — private channel and DM access enforced at the DB layer, not just the UI. Graders may check.
- **Scale posture:** 67 users is trivially within Supabase/Vercel free tiers, but because Conexus may become the cohort's long-term tool: enable Supabase daily backups, keep secrets in Vercel env vars (never in repo), write a `README` with a 15-minute handover/redeploy guide, and add a simple `/api/health` endpoint. Budget note: free tiers suffice through the summer; Supabase Pro (~$25/mo) only if selected and usage grows.

---

## 7. Forth integration (the grading-weight section)

Forth is a cohort-built app with no public API docs, so this section has two parts: **(0) the contract to agree with the Forth team**, then the Conexus-side implementation against it. Keep the adapter interface from v1 so the implementation stays swappable if the contract shifts.

### 7.0 Integration contract to propose to the Forth team (do this FIRST — it's your critical path)
A one-page agreement covering five items:

1. **Shared SSO:** both apps use Google OAuth against the same school accounts; email is the cross-app identity key.
2. **Stable ticket permalinks:** Forth confirms its ticket URL pattern (e.g. `https://forth-bice.vercel.app/t/{ticketId}`) and that URLs are stable and auth-gated-but-resolvable after login.
3. **Read endpoint:** `GET {forth}/api/integrations/tickets/{id}` → `{ id, title, status, assignee_email, url, updated_at }`, authenticated by a shared bearer key.
4. **Create endpoint:** `POST {forth}/api/integrations/tickets` accepting `{ title, description, assignee_email?, source_url }` — where `source_url` is the Conexus message permalink, which Forth displays on the ticket ("View discussion in Conexus"). This gives you Forth→Conexus deep links.
5. **Event webhook:** Forth POSTs `{ event: ticket.created|ticket.assigned|ticket.status_changed, ticket: {...} }` to `POST {conexus}/api/webhooks/forth`, signed with a shared HMAC secret.

**Negotiation reality:** items 1–2 are near-free for the Forth team; 3–4 are a few hours; 5 is the most work for them. Agree on 1–4 as the baseline and treat 5 as best-effort — your polling fallback (§7.3) covers you if the webhook never lands. Offer reciprocity: Conexus message permalinks + a matching webhook from your side make their product better too, and both projects demo stronger together.

### 7.1 Adapter interface (Conexus side)
```ts
interface PMAdapter {
  createTicket(input: { title, description, assigneeEmail?, sourceUrl }): Ticket
  getTicket(ticketId): Ticket            // { id, title, status, assigneeEmail, url, updatedAt }
  getTicketUrl(ticketId): string
  verifyWebhook(headers, body): boolean  // HMAC check
  parseWebhookEvent(body): PMEvent
}
```
Implement `ForthAdapter` against the §7.0 contract. If the contract slips, a `LinkOnlyAdapter` (deep links + manual unfurl, no live sync) keeps the demo alive.

### 7.2 Identity mapping
- On first login, store the user's email; when the first TicketLink involving them syncs, populate `forth_user_ref` from Forth's `assignee_email` match.
- "Ticket assigned **to you**" notifications match on email — no per-user OAuth handshake needed because SSO already unifies identity.

### 7.3 Ticket notifications
- **Primary:** Forth webhook → verify HMAC → translate event → create `Notification` rows → push over realtime → refresh TicketLink snapshots.
- **Fallback (build regardless):** poll `getTicket` every 2 minutes for all TicketLinks updated in the last 14 days. Webhooks between two student Vercel apps *will* fail at some point — the poller is your demo-day insurance.

### 7.4 "Create Forth ticket from message" (the signature feature)
1. Hover a message → "Create Forth ticket" → modal pre-filled with message text as title, Conexus permalink as `source_url`, assignee picker (roster emails).
2. `createTicket` fires; on success a TicketLink card posts as a thread reply on that message.
3. Status changes in Forth update the card and notify the thread.
**This single flow demonstrates all three graded requirements — deep link (card → Forth), shared auth (assignee resolved by SSO email), and task notifications (status → thread). Make it the demo centerpiece.**

### 7.5 URL unfurling
Pasting a Forth ticket URL into any message auto-converts it to a TicketLink card via `getTicket`.

---

## 8. Design system (from the brand kit)

```css
--color-primary:   #3CBBB1;  /* Conexus Teal — CTAs, active nav, toggles, links */
--color-dark:      #16324F;  /* Deep Navy — sidebar bg, headings, primary text */
--color-secondary: #5B6B7A;  /* Slate — secondary text, icons, borders */
--color-bg:        #F3F5F7;  /* Soft Gray — app background */
--color-surface:   #FFFFFF;  /* cards, message area */
--color-accent:    #F4B942;  /* Warm Gold — sparingly: highlights, stars */
--color-danger:    #E5484D;  /* High-priority badge */
--font-family:     'Manrope', sans-serif;  /* 400/500/600/700 */
--radius-card: 12px; --radius-button: 8px; --radius-input: 24px;
```

**Component notes (match the mockup):**
- Sidebar: navy bg, white icons/labels, active item = teal-tinted pill.
- Chat message: avatar left, semibold name + small slate timestamp, body, reaction chips below.
- Ticket card: white, checkbox circle, title, colored priority badge, due date, assignee avatar right.
- File card: type icon (red PDF square etc.), name + size, download icon.
- Composer: pill input, attach/emoji/@ icons left, circular teal send button right.
- Badges: soft pastel fills, darker text (lavender Design, blue Development, teal Marketing, red High Priority).
- Buttons: primary = teal fill, white text, arrow; secondary = teal outline; links teal.
- Tone: generous whitespace, minimal shadows — "minimalist, not busy."

---

## 9. Scope: MVP vs. stretch

### MVP (build in this order)
1. SSO auth (Google + GitHub via Supabase) + open self-serve signup + roles
2. Channels + realtime messaging + unread state
3. DMs (1:1 + group)
4. Threads + Threads view
5. Notifications (in-app: mentions, DMs, thread replies)
6. Forth integration per contract: deep links both ways, webhook + polling notifications, create-ticket-from-message, unfurling
7. Home digest + Tasks view + Files view
8. Search (Postgres FTS) + presence dots

### Stretch (only if MVP is demo-solid)
- **AI Assistant (confirmed stretch):** first feature should be a "Summarize thread" button (Anthropic API) — highest value, lowest effort.
- Teams grouping, Calendar, typing indicators, browser push, email digests, dark mode.

### Explicitly out of scope
Native mobile apps (responsive web only), voice/video, multi-workspace, per-message read receipts.

---

## 10. Suggested Cursor build sequence

One prompt per step; verify each before proceeding; keep this file at `docs/PRD.md` and reference sections in prompts.

1. **Scaffold:** Next.js + Supabase, §8 design tokens, app shell with §5 sidebar, Manrope.
2. **Schema + RLS:** §3 tables with row-level security; seed script with fake users.
3. **Auth:** Google + GitHub SSO via Supabase, open self-serve member signup, magic-link fallback, first-login profile (admin role separate).
4. **Channel messaging:** channel CRUD, realtime message list, composer with mentions/reactions/attachments.
5. **DMs:** conversation entity, DM UI reusing message components.
6. **Threads:** panel, subscription logic, Threads view.
7. **Notifications:** §4.4 event matrix, bell UI, realtime delivery, per-channel levels.
8. **Forth adapter:** §7.1 interface → `ForthAdapter` per the agreed contract → webhook endpoint + polling fallback. *(Blocked until §7.0 is agreed — start that conversation in week 1.)*
9. **Create-ticket-from-message + TicketLink cards + unfurling.**
10. **Home digest, Tasks view, Files view, search, presence.**
11. **Polish:** empty states, loading skeletons, error toasts, responsive pass, README handover guide.

**Cursor tips:** ask for a Playwright smoke test after each step; commit after every verified step; when a step touches Forth, stub the adapter with fixture data so you're never blocked on the other team.

---

## Remaining coordination items (not Cursor work — human work)
1. Get the §7.0 contract agreed with the Forth team **in week 1** — it's your only external dependency and your critical path.
2. Confirm with the facilitator that Google/GitHub OAuth (open self-serve) satisfies the "shared authentication" requirement.
3. Confirm Forth's actual ticket URL pattern and whether their auth is (or can become) Google SSO.
