import { SURVEY_WAVES } from '@/lib/research/survey-instrument';
import { participantId } from '@/lib/research/survey-server';

export type ResearchDeletionTarget = {
  kind: 'consent' | 'survey-response' | 'acknowledgment';
  path: string;
};

/**
 * Firestore document paths removed with an account. Survey docs are keyed by the
 * coded participant id, never the GitHub handle. Acknowledgment docs use the handle.
 */
export function researchDeletionTargets(
  cohortId: string,
  githubHandle: string
): ResearchDeletionTarget[] {
  const pid = participantId(githubHandle);
  return [
    {
      kind: 'consent',
      path: `researchConsent/${cohortId}/participants/${pid}`,
    },
    ...SURVEY_WAVES.map(
      (wave): ResearchDeletionTarget => ({
        kind: 'survey-response',
        path: `researchSurveys/${cohortId}/waves/${wave.id}/responses/${pid}`,
      })
    ),
    {
      kind: 'acknowledgment',
      path: `acknowledgments/${cohortId}/members/${githubHandle}`,
    },
  ];
}
