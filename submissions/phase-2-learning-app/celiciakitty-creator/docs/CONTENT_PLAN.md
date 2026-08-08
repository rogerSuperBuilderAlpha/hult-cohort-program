# LexLearn Content Plan

This document outlines the current content roadmap for the beginner UK law platform (England and Wales unless stated otherwise).

## Subject categories

1. **Civil Law** — disputes between people and organisations (contracts, negligence)
2. **Criminal Law** — offences, intent, force, self-defence
3. **Everyday Law** — practical rights in daily life (consumer, housing, work basics)

## Module roadmap

| # | Title | Category | Status |
|---|-------|----------|--------|
| 1 | Contracts in Everyday Life | Civil Law | **Live** |
| 2 | Negligence and Duty of Care | Civil Law | **Live** |
| 3 | Crime: Acts, Intent and Responsibility | Criminal Law | **Live** |
| 4 | Assault, Self-Defence and Weapons | Criminal Law | **Live** |
| 5 | Your Everyday Legal Rights | Everyday Law | **Live** |

## Unlock order

1. Module 1 — always available
2. Module 2 — Module 1 quiz passed
3. Module 3 — Module 2 quiz passed
4. Module 4 — Module 3 quiz passed
5. Module 5 — Module 4 quiz passed

## Reusable content types

### Legal Bites (`lib/legal-facts.ts`)

**Current facts:** 10 across all categories

### Case Spotlight (`lib/case-spotlights.ts`)

| Module | Spotlight |
|--------|-----------|
| 1 | The £500 laptop listing |
| 2 | Donoghue v Stevenson [1932] AC 562 |
| 3 | R v Cunningham [1957] 2 QB 396 |
| 4 | R v Williams (Gladstone) [1984] 78 Cr App R 276 |

### Statute Spotlight (`lib/statute-spotlights.ts`)

| Module | Statute |
|--------|---------|
| 5 | Consumer Rights Act 2015 |

## Module summaries

### Module 4 — Assault, Self-Defence and Weapons
- **Location:** `lib/course/content/module-4.ts`
- **Scenario:** Late-night shop argument, push in self-defence, unlawfully carried knife
- **Case Spotlight:** R v Williams (Gladstone)
- **Quiz:** 5 questions, pass 3/5

### Module 5 — Your Everyday Legal Rights
- **Location:** `lib/course/content/module-5.ts`
- **Scenario:** Faulty online phone purchase, delayed refund
- **Statute Spotlight:** Consumer Rights Act 2015
- **Quiz:** 5 questions, pass 3/5

## Editorial checklist

- [ ] Complete legal review for Modules 2–5 (`docs/LEGAL_REVIEW.md`)
- [ ] Mark Legal Bites `sourceReviewNeeded: false` after review
- [ ] Disclaimer present on all factual content

## Integration (future)

- Ludwitt JWT launch and learning events — **not started**
