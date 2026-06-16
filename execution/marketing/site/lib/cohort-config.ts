/** Single source of truth for cohort identity across server, API, and scripts. */

export type CohortContext = {
  cohortId: string;
  org: string;
  orgUrl: string;
};

/** Active cohort document id in Firestore (e.g. fall26). */
export function cohortId(): string {
  return process.env.COHORT_ID?.trim() || 'fall26';
}

/** GitHub org for cohort repos — set in Vercel when the org is provisioned. */
export function cohortOrg(): string {
  return process.env.NEXT_PUBLIC_COHORT_ORG?.trim() || 'hult-cohort-fall26-boston';
}

export function cohortOrgUrl(): string {
  return `https://github.com/${cohortOrg()}`;
}

export function getCohortContext(): CohortContext {
  const id = cohortId();
  const org = cohortOrg();
  return { cohortId: id, org, orgUrl: `https://github.com/${org}` };
}
