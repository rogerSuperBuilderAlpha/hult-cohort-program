/** GitHub org for cohort repos — set in Vercel when the org is provisioned. */
export function cohortOrg(): string {
  return process.env.NEXT_PUBLIC_COHORT_ORG?.trim() || 'hult-cohort-fall26-boston';
}

export function cohortOrgUrl(): string {
  return `https://github.com/${cohortOrg()}`;
}
