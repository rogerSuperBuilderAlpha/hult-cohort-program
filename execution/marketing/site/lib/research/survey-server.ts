import { createHash } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { cohortId } from '@/lib/cohort-config';
import { researchConsentRef, surveyResponseRef } from '@/lib/firestore-paths';
import {
  CONSENT_VERSION,
  SURVEY_WAVES,
  getWaveById,
  openWave,
  waveItemIds,
  waveStatus,
  type SurveyWaveId,
  type WaveStatus,
} from './survey-instrument';

/**
 * One-way participant id. A returning participant always hashes to the same id, so their three waves
 * link, but the GitHub handle is never stored beside the responses. The salt should be set as a server
 * secret (RESEARCH_HASH_SALT); without it, linkage still works within a deployment but is less resistant
 * to a dictionary attack on the small, known handle space — set it in production.
 */
export function participantId(githubHandle: string): string {
  const salt = process.env.RESEARCH_HASH_SALT?.trim();
  if (!salt) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('RESEARCH_HASH_SALT is required in production.');
    }
    return createHash('sha256')
      .update(`hult-cohort-research-dev:${githubHandle.toLowerCase()}`)
      .digest('hex')
      .slice(0, 32);
  }
  return createHash('sha256').update(`${salt}:${githubHandle.toLowerCase()}`).digest('hex').slice(0, 32);
}

export type WaveSummary = {
  id: SurveyWaveId;
  label: string;
  shortLabel: string;
  status: WaveStatus;
  opensAt: string;
  closesAt: string;
  completed: boolean;
};

export type SurveyState = {
  consentVersion: string;
  consented: boolean;
  /** A consent decision was recorded as "do not take part". Satisfies survey gates (opt-out is allowed). */
  declined: boolean;
  waves: WaveSummary[];
  openWaveId: SurveyWaveId | null;
};

async function consentRecord(
  pid: string
): Promise<{ exists: boolean; consented: boolean; completedWaves: string[] }> {
  const doc = await researchConsentRef(cohortId(), pid).get();
  const data = doc.data();
  const completedWaves = Array.isArray(data?.completedWaves)
    ? data.completedWaves.filter((w: unknown): w is string => typeof w === 'string')
    : [];
  return {
    exists: doc.exists,
    consented: doc.exists && data?.consented === true,
    completedWaves,
  };
}

export async function hasConsented(pid: string): Promise<boolean> {
  return (await consentRecord(pid)).consented;
}

export async function saveConsent(
  githubHandle: string,
  consented: boolean
): Promise<void> {
  const pid = participantId(githubHandle);
  await researchConsentRef(cohortId(), pid).set(
    {
      consented,
      consentVersion: CONSENT_VERSION,
      updatedAt: new Date(),
    },
    { merge: true }
  );
}

async function completedWaveIds(
  pid: string,
  fromConsent: string[]
): Promise<Set<string>> {
  if (fromConsent.length > 0) {
    return new Set(fromConsent.filter((id): id is SurveyWaveId => Boolean(getWaveById(id as SurveyWaveId))));
  }
  // Legacy fallback: one doc per wave (then backfill onto consent).
  const id = cohortId();
  const checks = await Promise.all(
    SURVEY_WAVES.map(async (w) => {
      const doc = await surveyResponseRef(id, w.id, pid).get();
      return doc.exists ? w.id : null;
    })
  );
  const completed = checks.filter((x): x is SurveyWaveId => x !== null);
  if (completed.length > 0) {
    await researchConsentRef(id, pid).set(
      { completedWaves: completed, updatedAt: new Date() },
      { merge: true }
    );
  }
  return new Set(completed);
}

export async function getSurveyState(githubHandle: string, now = new Date()): Promise<SurveyState> {
  const pid = participantId(githubHandle);
  const consent = await consentRecord(pid);
  const completed = await completedWaveIds(pid, consent.completedWaves);

  const waves: WaveSummary[] = SURVEY_WAVES.map((w) => ({
    id: w.id,
    label: w.label,
    shortLabel: w.shortLabel,
    status: waveStatus(w, now),
    opensAt: w.opensAt,
    closesAt: w.closesAt,
    completed: completed.has(w.id),
  }));

  const open = openWave(now);

  return {
    consentVersion: CONSENT_VERSION,
    consented: consent.consented,
    declined: consent.exists && !consent.consented,
    waves,
    openWaveId: open?.id ?? null,
  };
}

export type SaveResponseResult =
  | { ok: true }
  | { ok: false; error: string; status: number };

const MAX_TEXT_LENGTH = 4000;

/**
 * Persist a wave's answers. Unknown item ids are rejected; values are stored as given (numbers for
 * Likert, strings for categorical/text) with light validation. Responses are immutable once saved for a
 * closed wave; an open wave may be re-submitted (latest wins) so a participant can finish later.
 */
export async function saveSurveyResponse(
  githubHandle: string,
  waveId: string,
  answers: Record<string, unknown>,
  now = new Date()
): Promise<SaveResponseResult> {
  const wave = getWaveById(waveId as SurveyWaveId);
  if (!wave) return { ok: false, error: 'Unknown survey wave.', status: 400 };

  if (waveStatus(wave, now) !== 'open') {
    return { ok: false, error: 'This survey is not open right now.', status: 403 };
  }

  const pid = participantId(githubHandle);
  if (!(await hasConsented(pid))) {
    return { ok: false, error: 'Research consent is required before submitting.', status: 403 };
  }

  const allowed = new Set(waveItemIds(wave));
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(answers ?? {})) {
    if (!allowed.has(key)) continue;
    if (value === null || value === undefined || value === '') continue;
    if (typeof value === 'number') {
      if (Number.isFinite(value)) cleaned[key] = value;
    } else if (typeof value === 'string') {
      cleaned[key] = value.slice(0, MAX_TEXT_LENGTH);
    }
  }

  if (Object.keys(cleaned).length === 0) {
    return { ok: false, error: 'No valid answers were provided.', status: 400 };
  }

  await surveyResponseRef(cohortId(), wave.id, pid).set({
    wave: wave.id,
    items: cleaned,
    consentVersion: CONSENT_VERSION,
    completedAt: now,
  });

  await researchConsentRef(cohortId(), pid).set(
    {
      completedWaves: FieldValue.arrayUnion(wave.id),
      updatedAt: now,
    },
    { merge: true }
  );

  return { ok: true };
}
