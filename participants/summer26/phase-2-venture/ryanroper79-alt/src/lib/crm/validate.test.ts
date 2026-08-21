import { describe, expect, it } from 'vitest';
import { hasAnyContactField, normalizeCrmContact } from '@/lib/crm/validate';

describe('normalizeCrmContact', () => {
  it('returns all null for empty input', () => {
    expect(normalizeCrmContact({})).toEqual({
      companyName: null,
      address: null,
      email: null,
      phone: null,
    });
  });

  it('trims provided fields', () => {
    expect(
      normalizeCrmContact({
        companyName: '  Island Hotel Ltd  ',
        email: ' ops@hotel.bb ',
        phone: '246-555-0100',
      })
    ).toEqual({
      companyName: 'Island Hotel Ltd',
      address: null,
      email: 'ops@hotel.bb',
      phone: '246-555-0100',
    });
  });

  it('rejects invalid email', () => {
    expect(() => normalizeCrmContact({ email: 'not-an-email' })).toThrow(/Invalid email/);
  });

  it('detects when any field is present', () => {
    const empty = normalizeCrmContact({});
    expect(hasAnyContactField(empty)).toBe(false);
    expect(hasAnyContactField(normalizeCrmContact({ companyName: 'Acme' }))).toBe(true);
  });
});
