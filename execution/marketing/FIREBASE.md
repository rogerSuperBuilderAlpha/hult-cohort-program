# Firebase — participant platform backend

**Decision:** The cohort platform uses **Firebase** for auth, database, and server-side writes. No Typeform, no admin dashboard (cohort 1). Staff review applications and export data via Firebase Console, CLI, or scripts.

Credentials are supplied by the founder and stored only in environment variables — never committed.

---

## Services used

| Firebase product | Purpose |
|------------------|---------|
| **Firestore** | Applications, roster, ballots, votes, submission PR registry |
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

Used to gate `/vote/*` and future participant-only routes.

### `ballots/{cohortId}/projects/{projectSlug}`

One doc per Phase 1 contest (3 vote weeks).

```typescript
{
  projectSlug: string;           // e.g. phase-1-project-1
  voteOpensAt: Timestamp;
  voteClosesAt: Timestamp;
  eligiblePrs: {
    githubHandle: string;
    repo: string;
    prNumber: number;
    prUrl: string;
    mergedAt: Timestamp;
    deployUrl: string;
  }[];
  status: 'draft' | 'open' | 'closed' | 'tallied';
  winnerHandle?: string;
}
```

Populated from GitHub (merged `[Project N] Submission` PRs) via webhook or `github-metrics-export.js`.

### `votes/{cohortId}/projects/{projectSlug}/ballots/{voterHandle}`

Private ranked-choice ballot.

```typescript
{
  voterHandle: string;
  rank1PrUrl: string;
  rank2PrUrl: string;
  rank3PrUrl: string;
  submittedAt: Timestamp;
  // voterHandle must exist in roster; cannot rank own submission PR
}
```

Tallied by [cohort-scripts/vote-tally.js](../cohort-scripts/vote-tally.js) reading Firestore export or Admin script.

### `submissions/{cohortId}/projects/{projectSlug}/entries/{githubHandle}`

Tracks participant submission PRs (proof-of-work registry).

```typescript
{
  githubHandle: string;
  repo: string;
  prNumber: number;
  prUrl: string;
  merged: boolean;
  mergedAt?: Timestamp;
  deployUrl?: string;
  eligibleForBallot: boolean;
}
```

---

## Security rules (summary)

| Collection | Read | Write |
|------------|------|-------|
| `applications` | Staff service account only | Create via API route only (Admin SDK) |
| `roster` | Authenticated roster members | Staff service account only |
| `ballots` | Authenticated roster members when `status == 'open'` | Staff / webhook service account |
| `votes` | Staff service account only | Authenticated voter creates own doc once |
| `submissions` | Authenticated roster members | Webhook + staff |

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
2. API verifies `githubHandle` exists in `roster/{cohortId}/members`.
3. Access `/vote/{project}` during open ballot windows.

---

## Staff workflows (no admin dashboard)

| Task | How |
|------|-----|
| Review applications | Firebase Console → `applications` filter by `status` |
| Export roster | Firestore export or `firebase firestore:export` |
| Mark admitted | Update doc `status: 'admitted'`; add to `roster` collection |
| Open ballot | Set `ballots/.../status: 'open'` after populating `eligiblePrs` |
| Tally votes | Run `vote-tally.js` against Firestore export |
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
