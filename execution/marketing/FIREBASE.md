# Firebase — participant platform backend

**Decision:** The cohort platform uses **Firebase** for auth, database, and server-side writes. No Typeform, no admin dashboard (cohort 1). Staff review applications and export data via Firebase Console, CLI, or scripts.

Credentials are supplied by the founder and stored only in environment variables — never committed.

---

## Services used

| Firebase product | Purpose |
|------------------|---------|
| **Firestore** | Applications, roster, survey/ack, published `projectOutcomes` (identity + announcements) |
| **Authentication** | GitHub sign-in for enrolled participants (gated pages) |
| **Admin SDK** | Next.js API routes write applications server-side (bypass client rules) |
| **Cloud Functions** *(optional, later)* | Auto-reply email on apply |

Hosting stays on **Vercel** (Next.js). Firebase is data + auth only.

---

## Environment variables

Set in Vercel project settings and local `.env.local` (see [site/.env.example](site/.env.example)).

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client + server | Web app config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client + server | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client + server | Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Client + server | Optional (avatars later) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client + server | FCM (optional) |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Client | Analytics (optional) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client + server | App ID |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | **Server only (Vercel)** | Admin SDK — full JSON string |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | **Server only (local)** | Path to gitignored key file, e.g. `secrets/firebase-service-account.json` |
| `NEXT_PUBLIC_TAKE_HOME_REPO_URL` | Server | GitHub repo for admissions task |
| `GITHUB_TOKEN` | **Server only** | Contest state (PR list + issue Search) |
| `GITHUB_WEBHOOK_SECRET` | **Server only** | Verify org webhooks (HMAC) |
| `CRON_SECRET` | **Server only** | Bearer for `/api/cron/warm-contest` (required in prod) |
| `UNSUBSCRIBE_SECRET` | **Server only** | HMAC for blast unsubscribe links |
| `RESEARCH_HASH_SALT` | **Server only** | One-way participant ids for research surveys |

Full template: [site/.env.example](site/.env.example). ⚠️ `FIREBASE_SERVICE_ACCOUNT_JSON` must **never** use the `NEXT_PUBLIC_` prefix.

---

## Firestore schema

### `applications/{applicationId}`

Written by `POST /api/applications` via Admin SDK.

```typescript
{
  id: string;                    // UUID
  firstName: string;
  lastName: string;
  email: string;
  githubUrl: string;
  githubHandle: string;          // parsed from URL
  motivation: string;
  project1Idea: string;
  timezone: string;
  campus: 'boston' | 'london' | 'san-francisco' | 'dubai' | 'online';
  hultStudentId?: string;
  referralSource: string;
  confirmations: {
    toolingAcknowledged: boolean;
    publicWork: boolean;
    toolingAssistance?: boolean;
  };
  status: 'submitted' | 'take-home-sent' | 'take-home-submitted' | 'admitted' | 'waitlisted' | 'rejected';
  takeHomePrUrl?: string;
  firebaseUid?: string;          // Firebase Auth uid (GitHub sign-in)
  githubOAuthUid?: string;       // GitHub numeric user id from OAuth
  submittedAt: Timestamp;
  updatedAt: Timestamp;
  cohort: 'fall26';              // partition key
}
```

Staff update `status` and `takeHomePrUrl` manually or via script — no admin UI in cohort 1.

### `cohortInterest/{cohortId}/interested/{githubHandle}`

Lightweight next-cohort interest (not a full application).

```typescript
{
  githubHandle: string;
  firebaseUid?: string | null;
  githubOAuthUid?: string | null;
  indicatedAt: Timestamp;
  updatedAt: Timestamp;
}
```

Written by `POST /api/cohort-interest`. Shown on `/apply` and home apply section when `NEXT_PUBLIC_NEXT_COHORT_ID` is set.

### `roster/{cohortId}/members/{githubHandle}`

Enrolled participants after week 1 roster lock.

```typescript
{
  githubHandle: string;
  email: string;
  displayName: string;
  campus: string;
  roles: ('participant' | 'operator-pm' | 'operator-comms' | 'operator-showcase')[];
  enrolledAt: Timestamp;
  active: boolean;
}
```

Used to gate participant APIs (`/api/program/*`, `/api/dashboard`).

### `submissions/...` (legacy — do not read or write)

Retired from the request path. Merged submissions are discovered from GitHub only (`lib/github-cohort-server.ts` / `lib/contest-state-server.ts`). Old entry docs may still exist; webhook no longer upserts them.

### `roster/{cohortId}` (meta doc)

Denormalized enrolled count + active handles for cheap stats (refreshed by `admissions.mjs` admit/deactivate and on first cold read).

```typescript
{
  enrolledCount: number;
  activeHandles: string[];
  updatedAt: Timestamp;
}
```

Members still live at `roster/{cohortId}/members/{githubHandle}`.

### `peerWrittenReviews/...` and `peerRatings/...` (legacy — do not read or write)

Retired. Reviews and optional upvotes live on GitHub issues (`Review by @{voter}: @{reviewee}` with optional `Vote: up`). Discovery: `lib/contest-state-server.ts`. Staff tally: `npx tsx scripts/tally-votes.ts --project=<slug>`.

### Legacy (retired — do not write)

`ballots/`, `votes/`, `submissions/`, `peerWrittenReviews/`, `peerRatings/` are **not used** by the live request path. Firestore rules deny all client access.

---

## Security rules (summary)

All listed collections are **deny-all for clients**; every read/write goes through the Admin SDK in Next.js API routes / staff scripts.

| Collection | Client access |
|------------|---------------|
| `applications` | Deny all |
| `roster` (+ members) | Deny all |
| `acknowledgments` | Deny all |
| `projectOutcomes` | Deny all |
| `submissions` (legacy) | Deny all — do not write |
| `peerWrittenReviews` (legacy) | Deny all — do not write |
| `peerRatings` (legacy) | Deny all — do not write |

Full rules file: [firebase/firestore.rules](firebase/firestore.rules).

---

## Auth flow

### Applicants (pre-admission)

1. Sign in with **GitHub** on `/apply` via Firebase Auth.
2. Complete the form — GitHub handle comes from sign-in (not a free-text field).
3. `POST /api/applications` verifies the Firebase ID token server-side, then writes to `applications` with Admin SDK.
4. Auto-reply email (Cloud Function or transactional email API) with take-home repo link.

### Participants (post week-1 roster lock)

1. Sign in with **GitHub** via Firebase Auth.
2. API verifies `githubHandle` exists in `roster/{cohortId}/members` with `active: true`.
3. Access `/dashboard` and `/program/[slug]` for progress and personal peer-review status (GitHub discovery) during review weeks.

---

## Staff workflows (no admin dashboard)

| Task | How |
|------|-----|
| Review applications | Firebase Console → `applications` filter by `status` |
| Export roster | Firestore export or `firebase firestore:export` |
| Mark admitted | Update doc `status: 'admitted'`; add to `roster` collection (`scripts/admissions.mjs admit`) |
| Tally Phase 1 winners | `node scripts/tally-votes.mjs --project=<slug>` or `--all` |
| Backfill deploy URLs | `node scripts/backfill-deploy-urls.mjs --from-github` |
| Admissions CSV | Script: query `applications` where `cohort == 'fall26'` |

---

## Setup checklist

- [x] Create Firebase project **`hult-cohorts`**
- [ ] Enable Firestore (production mode) + deploy [firestore.rules](firebase/firestore.rules)
- [ ] Enable Authentication → GitHub provider
- [x] Web app config → Vercel env (`NEXT_PUBLIC_FIREBASE_*`)
- [x] Service account key at `site/secrets/firebase-service-account.json` (gitignored; local only)
- [ ] Vercel: paste JSON into `FIREBASE_SERVICE_ACCOUNT_JSON` env var
- [ ] Test apply → doc appears in Firestore Console
- [ ] Add enrolled test user to `roster` → test GitHub sign-in + vote

### GitHub OAuth (Firebase Auth)

| Setting | Value |
|---------|-------|
| **Homepage URL** (GitHub OAuth app) | `https://hult-cohort.vercel.app` |
| **Authorization callback URL** | `https://hult-cohorts.firebaseapp.com/__/auth/handler` |
| **Firebase authorized domain** | `hult-cohort.vercel.app` (+ legacy `site-nine-rouge-68.vercel.app` if needed) |

---

## Related docs

- [DEPLOY.md](DEPLOY.md) — Vercel + Firebase env vars
- [admissions/application-form.md](../admissions/application-form.md) — form fields
- [PLATFORM.md](../../PLATFORM.md) — full platform architecture
- [site/.env.example](site/.env.example) — local env template

## Supersedes

- [admissions/typeform-setup.md](../admissions/typeform-setup.md) — deprecated; kept for reference only
