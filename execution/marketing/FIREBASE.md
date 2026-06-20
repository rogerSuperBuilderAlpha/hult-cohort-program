# Firebase — participant platform backend

**Decision:** The cohort platform uses **Firebase** for auth, database, and server-side writes. No Typeform, no admin dashboard (cohort 1). Staff review applications and export data via Firebase Console, CLI, or scripts.

Credentials are supplied by the founder and stored only in environment variables — never committed.

---

## Services used

| Firebase product | Purpose |
|------------------|---------|
| **Firestore** | Applications, roster, submissions, peerWrittenReviews, peerRatings |
| **Authentication** | GitHub sign-in for enrolled participants (voting, gated pages) |
| **Admin SDK** | Next.js API routes write applications server-side (bypass client rules) |
| **Cloud Functions** *(optional, later)* | Auto-reply email on apply, GitHub webhook → ballot feed |

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
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client + server | App ID |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | **Server only (Vercel)** | Admin SDK — full JSON string |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | **Server only (local)** | Path to gitignored key file, e.g. `secrets/firebase-service-account.json` |
| `NEXT_PUBLIC_APPLY_URL` | Client | Default `/apply` (on-site form) |
| `NEXT_PUBLIC_TAKE_HOME_REPO_URL` | Server | GitHub repo for admissions task |
| `GITHUB_WEBHOOK_SECRET` | Server | Verify org webhooks (ballot feed) |

⚠️ `FIREBASE_SERVICE_ACCOUNT_JSON` must **never** use the `NEXT_PUBLIC_` prefix.

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
    tuitionAffordable: boolean;
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

### `submissions/{cohortId}/projects/{projectSlug}/entries/{githubHandle}`

Tracks participant submission PRs (GitHub projection).

```typescript
{
  githubHandle: string;
  repo: string;
  prNumber: number;
  prUrl: string;
  prTitle: string;
  merged: boolean;
  mergedAt?: Timestamp;
  deployUrl?: string | null;
  source?: 'webhook' | 'reconcile';
}
```

Populated by `POST /api/github/webhook` on merged PRs matching `content/program.ts` title patterns. `deployUrl` parsed from PR body (`Production URL` label). Backstop: `scripts/reconcile-submissions.mjs` or `scripts/backfill-deploy-urls.mjs`.

### `peerWrittenReviews/{cohortId}/projects/{projectSlug}/voters/{voterHandle}/entries/{revieweeHandle}`

Written GitHub review URLs filed by voter on each peer.

```typescript
{
  issueUrl: string;
  voterHandle: string;
  revieweeHandle: string;
  updatedAt: Timestamp;
}
```

### `peerRatings/{cohortId}/projects/{projectSlug}/voters/{voterHandle}`

Private 👍/👎 votes (one doc per voter).

```typescript
{
  ratings: Record<string, 'up' | 'down'>;  // revieweeHandle → rating
  updatedAt: Timestamp;
}
```

Vote requires prior written review for that peer. Staff tally: `tallyThumbsUp(projectSlug)` in [site/lib/tally-server.ts](site/lib/tally-server.ts) or `node scripts/tally-votes.mjs --project=<slug>`.

### Legacy (retired — do not write)

`ballots/` and `votes/` collections were designed for ranked-choice voting and are **not used** by the platform. Firestore rules deny all client access.

---

## Security rules (summary)

| Collection | Read | Write |
|------------|------|-------|
| `applications` | Deny all client | Admin SDK only |
| `roster` | Deny all client | Admin SDK only |
| `submissions` | Deny all client | Admin SDK / webhook |
| `peerWrittenReviews` | Deny all client | Admin SDK only |
| `peerRatings` | Deny all client | Admin SDK only |

Full rules file: [firebase/firestore.rules](firebase/firestore.rules) *(add when credentials wired)*.

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
3. Access `/dashboard` and `/program/[slug]` for progress, written reviews, and private 👍/👎 during review weeks.

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
