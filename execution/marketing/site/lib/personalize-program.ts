import { cohortOrg } from './cohort-config';

export function personalizeProgramText(text: string, handle: string, org = cohortOrg()): string {
  return text
    .replaceAll('{org}', org)
    .replaceAll('{handle}', handle)
    .replaceAll('{your-handle}', handle)
    .replaceAll('{you}', handle)
    .replaceAll('@{you}', `@${handle}`)
    .replaceAll('{team}', handle);
}
