import { describe, expect, it } from 'vitest';
import { parseMessageRef } from '@/lib/source-ref';

describe('parseMessageRef — only well-formed channel message refs', () => {
  it('parses a valid ref', () => {
    expect(parseMessageRef('channels/general/messages/m1')).toEqual({
      channelId: 'general',
      messageId: 'm1',
    });
  });

  it('rejects malformed / foreign shapes', () => {
    for (const bad of [
      '',
      'channels/general/messages',
      'channels/general/messages/m1/extra',
      'dms/general/messages/m1',
      'channels//messages/m1',
      'channels/general/reads/m1',
      42,
      null,
      undefined,
      { channelId: 'x' },
    ]) {
      expect(parseMessageRef(bad as unknown)).toBeNull();
    }
  });
});
