import { describe, expect, it } from 'vitest';
import { SURVEY_WAVES } from '@/lib/research/survey-instrument';
import { participantId } from '@/lib/research/survey-server';
import { researchDeletionTargets } from './research-deletion-targets';

describe('researchDeletionTargets', () => {
  it('targets consent, every survey wave, and the expectations acknowledgment', () => {
    const handle = 'ada';
    const pid = participantId(handle);
    const targets = researchDeletionTargets('fall26', handle);

    expect(targets.map((target) => target.kind)).toEqual([
      'consent',
      ...SURVEY_WAVES.map(() => 'survey-response' as const),
      'acknowledgment',
    ]);
    expect(targets[0]?.path).toBe(`researchConsent/fall26/participants/${pid}`);
    for (const wave of SURVEY_WAVES) {
      expect(targets.some((target) => target.path.endsWith(`/waves/${wave.id}/responses/${pid}`))).toBe(
        true
      );
    }
    expect(targets.at(-1)?.path).toBe(`acknowledgments/fall26/members/${handle}`);
  });
});
