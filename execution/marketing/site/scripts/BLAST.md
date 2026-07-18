# Email blast tool

Send one email to many recipients from a list, cheaply, without third-party blast
software. Runs on the same provider abstraction as transactional email
(`lib/mailer.mjs`) — switch backends with one env var.

- Sender: `scripts/blast.mjs` (staff CLI, dry-run by default)
- Core: `lib/blast-server.mjs` (audiences, suppression, unsubscribe tokens, rendering)
- Unsubscribe: `app/api/unsubscribe/route.ts` (link click + RFC 8058 one-click)
- Backends: `lib/ses.mjs` (Amazon SES) · `lib/mailgun.mjs` (existing)

## Why SES (and why not a self-hosted mail server)

Inbox placement is driven by the **sending IP's reputation**. Mailgun/SES send from
their own warm, reputable IP pools — you borrow that reputation. A self-hosted SMTP
box is a brand-new IP with zero reputation: blasts land in spam and can get
`ludwitt.com` blacklisted, which would also break transactional mail. SES gives you
the same deliverability as Mailgun at ~$0.10 / 1,000 emails.

## Provider setup (one time)

Set `EMAIL_PROVIDER=ses` and, in the same environment (Vercel **and** your local
`.env.local` for the CLI):

```
EMAIL_PROVIDER=ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...          # IAM user with ses:SendEmail
EMAIL_FROM=cohort@ludwitt.com      # a verified sender/domain in SES
EMAIL_FROM_NAME=Hult Cohort
EMAIL_PHYSICAL_ADDRESS=...         # REAL mailing address — required by CAN-SPAM
UNSUBSCRIBE_SECRET=...             # any long random string; MUST match site + CLI
# optional: SES_CONFIGURATION_SET=... for open/click/bounce tracking
```

In the AWS SES console, before real sends:

1. **Verify your domain** (`ludwitt.com`) — add the DKIM/SPF DNS records SES gives you.
2. **Request production access.** New SES accounts are in **sandbox**: you can only
   send to verified addresses, max 200/day at 1/sec. Production access lifts this
   (usually approved within a day). Until then, use `--test=<a-verified-address>`.

Transactional email (application confirmation, admission, staff notification) flows
through the same dispatcher, so flipping `EMAIL_PROVIDER=ses` moves everything off
Mailgun at once.

## Sending a blast

Dry-run first (default — never sends):

```bash
node scripts/blast.mjs \
  --subject="Applications are open, {firstName}" \
  --html=./scripts/blasts/announce.html \
  --from=firestore --status=admitted --cohort=fall26
```

Send one test to yourself, then the real blast:

```bash
node scripts/blast.mjs ... --test=you@ludwitt.com --confirm
node scripts/blast.mjs ... --confirm
```

### Audiences (`--from`, comma-combine)

| Source | Flags | Notes |
|--------|-------|-------|
| `firestore` | `--status=<s>` `--cohort=<id>` | `applications` collection. Omit `--status` for all. |
| `csv` | `--file=list.csv` | Header row required; needs an `email` column. Any other columns become merge tags. |
| `apollo` | `--apollo-pages=N` `--apollo-query=...` | Needs `APOLLO_API_KEY`. |

Example: `--from=firestore,csv --file=prospects.csv --status=admitted`

### Body & merge tags

`--html=<file>` or `--body="<inline html>"`. Tags are substituted per recipient from
their fields — `{firstName}`, `{lastName}`, `{name}`, `{handle}`, `{email}`, plus any
CSV/Apollo column (e.g. `{org}`, `{title}`). Unknown tags render blank.

The unsubscribe link + physical-address footer are appended automatically; do not add
your own.

### Other flags

- `--rate=<per-sec>` (default 10; use `--rate=1` while in the SES sandbox)
- `--limit=<N>` — cap recipients (handy for a staged first send)
- `--confirm` — actually send (writes a log to `emailBlasts/{id}` in Firestore)

## Compliance & suppression

- Every marketing email carries a working unsubscribe link and one-click header.
- Unsubscribes and hard bounces live in Firestore `emailSuppressions/{email}` and are
  **always skipped** on future blasts.
- Suppress manually from a node REPL:
  `addSuppression(db, 'x@y.com', 'manual')` (from `lib/blast-server.mjs`).
- Set `EMAIL_PHYSICAL_ADDRESS` to a real address — the footer shows an obvious
  placeholder until you do.

## Send log

Each `--confirm` run writes `emailBlasts/{blast-<ts>}` with counts and a
`recipients/{email}` subcollection (`sent`/`failed` + timestamps).
