'use client';

import { useEffect, useState } from 'react';
import { subscribeToRecipes } from './recipes';
import type { Recipe } from './types';

/**
 * The recipe bank, live. Separate from useCohort because only these two screens read
 * it — the board and the feed have no business paying for the listener.
 */
export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(
    () =>
      subscribeToRecipes((r) => {
        setRecipes(r);
        setReady(true);
      }),
    []
  );

  return { recipes, ready };
}
