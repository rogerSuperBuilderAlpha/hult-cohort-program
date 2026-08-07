'use client';

import { useEffect, useState } from 'react';
import { requiredWaveForProject, type SurveyWaveId } from './survey-instrument';

export type SurveyWaveSummary = {
  id: SurveyWaveId;
  shortLabel: string;
  status: 'not-yet' | 'open' | 'closed';
  opensAt: string;
  closesAt: string;
  completed: boolean;
};

export type SurveyStateClient = {
  consented: boolean;
  declined: boolean;
  openWaveId: SurveyWaveId | null;
  waves: SurveyWaveSummary[];
};

/**
 * Fetches the participant's research-survey state. Non-blocking by design: a network/permission failure
 * resolves to null so survey gating fails open rather than locking a participant out of coursework.
 */
export function useSurveyState(
  getIdToken: () => Promise<string | null>,
  enabled: boolean
): { survey: SurveyStateClient | null; loading: boolean } {
  const [survey, setSurvey] = useState<SurveyStateClient | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const idToken = await getIdToken();
        if (!idToken) return;
        const res = await fetch('/api/research/survey', {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) return;
        const json = (await res.json()) as SurveyStateClient;
        if (!cancelled) setSurvey(json);
      } catch {
        // Fail open — leave survey null.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getIdToken, enabled]);

  return { survey, loading };
}

export type ProjectGate = {
  /** Whether the project should be locked until the required wave is addressed. */
  locked: boolean;
  requiredWave: SurveyWaveId | null;
  wave: SurveyWaveSummary | null;
};

/**
 * A gated project locks until the required survey wave is *addressed*: either completed, or the study was
 * declined (opting out is allowed and must still unlock, per the IRB voluntariness guarantee). If the
 * required wave has already closed without a response, the gate opens (no retroactive lock-out).
 */
export function projectSurveyGate(
  slug: string,
  survey: SurveyStateClient | null
): ProjectGate {
  const requiredWave = requiredWaveForProject(slug);
  if (!requiredWave || !survey) {
    return { locked: false, requiredWave, wave: null };
  }
  if (survey.declined) {
    return { locked: false, requiredWave, wave: null };
  }
  const wave = survey.waves.find((w) => w.id === requiredWave) ?? null;
  const locked = Boolean(wave && !wave.completed && wave.status !== 'closed');
  return { locked, requiredWave, wave };
}
