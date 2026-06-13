'use client';

import { useEffect, useState } from 'react';
import type { CohortStats } from '@/lib/cohort-stats-types';

export function useCohortStats() {
  const [stats, setStats] = useState<CohortStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/cohort/stats');
        const json = (await res.json()) as CohortStats;
        if (!cancelled) setStats(json);
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading };
}
