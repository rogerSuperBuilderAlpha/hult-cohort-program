/**
 * Static roster fallback when Firebase Admin is not configured (local dev / CI build).
 * Handles sourced from merged Project 1 submission artifacts in the cohort repo.
 */
export const FALLBACK_ROSTER_HANDLES: string[] = [
  'arjun-singh2127',
  'artira',
  'CodingWCal',
  'divyaprakash04',
  'gge513',
  'godwinkamau',
  'jiaxinaspenlin-dotcom',
  'joes9987',
  'kperpignant',
  'kureen-cyber',
  'lvcasmadeit',
  'mitchelldante99-create',
  'paramjeet-singh-neu',
  'priyanshshahh',
  'r3s0lv343vr',
  'ramyatolety',
  'raven-dubgub',
  'ryanroper79-alt',
  'studmuffin01',
  'supercuda',
  'zukhriddingit',
];

export function displayNameFromHandle(handle: string): string {
  return handle
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
