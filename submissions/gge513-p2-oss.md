# [P2-OSS] Tracking — gge513

- **Upstream repo:** https://github.com/rogerSuperBuilderAlpha/cursor-boston
- **Upstream PR:** https://github.com/rogerSuperBuilderAlpha/cursor-boston/pull/1712
- **Upstream issue claimed:** https://github.com/rogerSuperBuilderAlpha/cursor-boston/issues/1420 (claim comment posted before code, per CONTRIBUTING.md)
- **Merge status:** Open — awaiting maintainer review (filed 2026-08-22). This file and the tracking PR will be updated when the upstream merge confirms.

## Contribution summary

Property-based test coverage (fast-check) for cursor-boston's security parsing surfaces, against maintainer issue #1420: 22 property tests across three suites asserting real invariants on `verifyWebhookSignature` (malformed/corrupted/wrong-length signatures return `false` without throwing; only the exact HMAC digest passes), all five `lib/sanitize.ts` exports (character-class/length bounds, trim guarantees, idempotence), and `lib/client-ip.ts` (totality over arbitrary headers, `x-vercel-forwarded-for` precedence, trusted-hop selection, IPv6 unbracketing). No runtime code changed.

Secondary artifact: upstream issue https://github.com/rogerSuperBuilderAlpha/cursor-boston/issues/1713 — a pre-existing flaky test found while running the full suite locally (660/661 suites pass), reported with repro, diagnosis (assertion outside `waitFor` racing the debounced search), and a one-line fix.

## Verification evidence

- Full jest suite locally: 7735/7736 tests pass (the one failure is the pre-existing flake reported as #1713, reproduced pass/fail on an unchanged tree)
- `tsc --noEmit` clean; `eslint --max-warnings=0` clean (repo pre-commit hooks)
- Mutation check: a seeded one-character bug in the digest construction is caught by the soundness property
