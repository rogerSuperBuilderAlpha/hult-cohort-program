'use client';

import { useEffect, useState } from 'react';
import { subscribeToRecipes } from './recipes';
import type { Recipe } from './types';

/**
 * The recipe bank, live. Separate from useCohort so only the screens that render
 * recipes pay for the listener: the two recipes pages, and Home — which reads it for
 * the feed's recipe chip and to keep the Layer-2 offer honest (never offer to bank
 * work that's already banked). The board still has no business with it.
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
