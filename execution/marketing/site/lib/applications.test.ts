import { describe, expect, it } from 'vitest';
import { isPastApplicationDeadline } from '@/content/program';
import { applicationDocId, missingFieldMessage, validateApplication } from './applications';

describe('applicationDocId', () => {
  it('is deterministic and lowercases the handle', () => {
    expect(applicationDocId('summer26', 'Alice')).toBe('summer26_alice');
    expect(applicationDocId('summer26', 'alice')).toBe('summer26_alice');
  });
});

describe('missingFieldMessage', () => {
  it('uses the label shown on the apply form', () => {
    expect(missingFieldMessage('motivation')).toBe('Enter Why this program.');
    expect(missingFieldMessage('project1Idea')).toBe('Enter Project 1 PM platform idea.');
  });
});

describe('validateApplication', () => {
  it('rejects a blank required field with that label', () => {
    expect(() =>
      validateApplication(
        { email: 'ada@example.com' },
        { githubUrl: 'https://github.com/ada' }
      )
    ).toThrow(missingFieldMessage('firstName'));
  });
});

describe('isPastApplicationDeadline', () => {
  it('is false on the deadline afternoon and true after that day ends Eastern', () => {
    expect(isPastApplicationDeadline(new Date('2026-10-14T16:00:00.000Z'))).toBe(false);
    expect(isPastApplicationDeadline(new Date('2026-10-15T04:00:00.000Z'))).toBe(true);
  });
});
