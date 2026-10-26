# Spending Credits

Your app spends Ludwitt credits to power AI features. Cost is computed from
**actual token usage** — there is no fixed price per call, and there is no
flat monthly fee.

## Two balances, only one is spendable in your app

Ludwitt users hold credits from multiple sources:

| Source | Counts toward `spendableCents`? |
|---|---|
| Stripe deposit (paid) | ✅ yes |
| Trial / welcome bonus | ❌ no |
| MOR-staking reward | ❌ no |
| Writing-competition prize | ❌ no |
| Admin grant | ❌ no |
| Debt allowance (Ludwitt-internal -$50 floor) | ❌ no |

**Only paid (Stripe-deposited) credits are spendable in third-party apps.** This
is non-negotiable — users get free credits for trying Ludwitt's own features,
but those don't transfer to your app's bills.

The `/api/v1/credits/balance` endpoint surfaces both:

```json
{
  "spendableCents": 1234,
  "spendableFormatted": "$12.34",
  "balanceCents": 4500,
  "balanceFormatted": "$45.00",
  "lastUsageAt": "2026-05-03T12:34:56.789Z"
}
```

**Gate your UI on `spendableCents`, never `balanceCents`.** A user with $45
total but $0 spendable will see a 402 response if you try to charge them.

## Read the balance

```
GET https://pitchrise.ludwitt.com/api/v1/credits/balance
Authorization: Bearer <access_token>      # scope: credits:read
```

## Charge an AI call

```
POST https://pitchrise.ludwitt.com/api/v1/ai/messages
Authorization: Bearer <access_token>      # scope: credits:spend
Content-Type: application/json

{
  "model": "claude-sonnet-4-6",
  "max_tokens": 1024,
  "messages": [
    { "role": "user", "content": "Explain photosynthesis to a 6th grader." }
  ],
  "system": "You are a patient tutor."
}
```

Response shape mirrors Anthropic's Messages API plus an `x-ludwitt-credits`
block:

```json
{
  "id": "msg_...",
  "role": "assistant",
  "content": [{ "type": "text", "text": "..." }],
  "model": "claude-sonnet-4-6",
  "usage": { "input_tokens": 18, "output_tokens": 142 },
  "x-ludwitt-credits": {
    "chargedCostCents": 4,
    "newBalanceCents": 1230,
    "transactionId": "..."
  }
}
```

`newBalanceCents` is the user's NEW spendable balance after this charge.

## Allowed models

| Model id | Notes |
|---|---|
| `claude-haiku-4-5` (default if omitted) | Fastest, cheapest |
| `claude-haiku-4-5-20251001` | Pinned variant |
| `claude-sonnet-4-6` | Balanced |
| `claude-opus-4-7` | Most capable, most expensive |

Other model strings return `400 invalid_model`.

## Revenue split

| Tier | Engineer earns | Ludwitt keeps |
|---|---|---|
| BYOB (no hosted storage) | 70% | 30% |
| Hosted storage | 35% | 65% |

The split applies to every credit charge, regardless of whether storage was
actually used in that request. The trade is "less revenue per call, no
backend to operate."

Floor on the engineer side is integer cents — Ludwitt is kept whole on
odd-cent transactions. Examples (BYOB): 100¢ → 70/30; 7¢ → 4/3; 1¢ → 0/1.
Examples (hosted): 100¢ → 35/65; 7¢ → 2/5; 1¢ → 0/1.

## 402 — insufficient paid credits

Returned when the user's spendable balance is below the cost of the call:

```json
{
  "error": "insufficient_paid_credits",
  "error_description": "This Ludwitt account does not have enough paid credits to cover the request. Free / trial / promotional credits cannot be spent in third-party apps.",
  "code": "INSUFFICIENT_PAID_CREDITS",
  "details": {
    "paidBalanceCents": 0,
    "paidBalanceFormatted": "$0.00",
    "requiredCents": 1,
    "requiredFormatted": "$0.01",
    "topUpUrl": "/account/credits"
  }
}
```

Surface a friendly message and link the user to
`https://pitchrise.ludwitt.com/account/credits` to top up. Don't retry the
call — there's no point until they deposit.

## Race conditions you don't have to think about

- **Concurrent calls** are settled in arrival order; each gets its own
  transaction. There's no "negative paid balance" state to worry about.
- **Mid-call balance change** (e.g., user deposits during a long Anthropic
  call) is fine — settlement uses the value at deduction time.
- **Token rotation mid-call** is fine — your call has a token reference, not
  a session.

## Idempotency

Each charge writes a `transactionId` you can store. We don't currently support
client-supplied idempotency keys; if a network glitch makes you uncertain
whether a call landed, GET `/api/v1/credits/balance` and compare to your last
known value before retrying.
