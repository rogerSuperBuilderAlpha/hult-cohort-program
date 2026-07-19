/**
 * The cohort repo's identity, and nothing else.
 *
 * Split out of `github.ts` because that module reads `GITHUB_TOKEN` and is server-only —
 * a client component importing a constant from it would pull the token-reading module
 * into the browser bundle. This file has no imports and no secrets, so both sides can
 * have it.
 */
/** owner/repo, as GitHub's API wants it. */
export declare const COHORT_REPO_SLUG = "rogerSuperBuilderAlpha/hult-cohort-program";
/** What a human calls it — the project name a sensed card lands in. */
export declare const COHORT_REPO_NAME: string;
