import { describe, expect, it } from 'vitest';
import { applicationDocId } from './applications';

describe('applicationDocId', () => {
  it('is deterministic and lowercases the handle', () => {
    expect(applicationDocId('summer26', 'Alice')).toBe('summer26_alice');
    expect(applicationDocId('summer26', 'alice')).toBe('summer26_alice');
  });
});
