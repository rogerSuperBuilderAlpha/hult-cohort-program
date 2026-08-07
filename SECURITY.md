# Security policy

## Supported versions

| Component | Path | Notes |
|-----------|------|-------|
| Cohort platform site | `execution/marketing/site/` | Deployed via Vercel; patch security issues on `main` |
| Ludwitt/Hult API | `execution/ludwitt-hult-api/` | Reference implementation |
| Admissions take-home | `execution/admissions-take-home/` | Public starter repo for applicants |

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Please report security issues privately:

1. Use [GitHub private vulnerability reporting](https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/security/advisories/new) if enabled, **or**
2. Contact the repository owner via GitHub (see repo profile).

Include:

- Description of the issue and potential impact
- Steps to reproduce
- Affected paths or deployment (site, API, docs only, etc.)

We aim to acknowledge reports within **72 hours** and provide a remediation timeline when possible.

## Secrets and credentials

This repository must **never** contain:

- Firebase service account JSON or private keys
- `GITHUB_TOKEN` / webhook secrets with write access
- Production `.env` or `.env.local` files
- Student PII or live cohort roster exports

All secrets belong in Vercel environment variables or local gitignored files (`execution/marketing/site/secrets/`, `.env.local`). See [execution/marketing/FIREBASE.md](execution/marketing/FIREBASE.md).

If you accidentally commit a secret, rotate it immediately and notify maintainers — do not rely on git history rewrite alone.
