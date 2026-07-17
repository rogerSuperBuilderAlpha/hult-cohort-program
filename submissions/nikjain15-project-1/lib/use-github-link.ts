'use client';

import { useEffect, useState } from 'react';
import { subscribeToLink } from './github-link';
import type { GitHubLink } from './types';

/**
 * Your connection + consent state, live.
 *
 * `ready` matters and `link === null` alone doesn't tell you enough: null is both "still
 * loading" and "never connected", and treating the first as the second would run a sync
 * gate against a link that simply hasn't arrived yet.
 */
/**
 * `uid` is required rather than nullable: every caller lives inside AppShell, which
 * renders nothing until auth resolves, so a null here would be a state that can't happen.
 */
export function useGitHubLink(uid: string): { link: GitHubLink | null; ready: boolean } {
  const [link, setLink] = useState<GitHubLink | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(
    () =>
      subscribeToLink(uid, (next) => {
        setLink(next);
        setReady(true);
      }),
    [uid]
  );

  return { link, ready };
}
