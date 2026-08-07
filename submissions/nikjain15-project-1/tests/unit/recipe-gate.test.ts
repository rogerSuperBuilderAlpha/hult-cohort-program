import { describe, expect, it } from 'vitest';
import { checkRecipeBody } from '@/lib/sense';

const me = { handle: 'nikjain15', displayName: 'Nik Jain' };
const peers = [
  { handle: 'marcus', displayName: 'Marcus Lee' },
  { handle: 'priya-dev', displayName: 'Priya' },
];

describe('checkRecipeBody — the peer-name gate for agent-drafted recipes', () => {
  it('passes a recipe that names no peer, code and all', () => {
    const r = checkRecipeBody(
      'CORS preflight failed',
      'Set `Access-Control-Allow-Credentials: true` and echo the exact Origin. Steps:\n1. read the header\n2. reflect it',
      me,
      peers
    );
    expect(r.ok).toBe(true);
  });

  it('blocks a draft that names a peer by display name', () => {
    const r = checkRecipeBody('The retry bug', 'Marcus told me the wrong fix, so I ignored it.', me, peers);
    expect(r).toMatchObject({ ok: false, reason: 'names_another_member', member: 'Marcus Lee' });
  });

  it('blocks a draft that @-mentions a peer handle', () => {
    expect(checkRecipeBody('x', 'ask @priya-dev, she broke it', me, peers).ok).toBe(false);
  });

  it("allows the author's OWN name", () => {
    expect(checkRecipeBody('x', 'Nik Jain figured this out after two days', me, peers).ok).toBe(true);
  });

  it('catches a zero-width evasion of a peer name', () => {
    // "Mar<ZWSP>cus" renders as "Marcus" but slips a naive word match.
    expect(checkRecipeBody('x', 'blame Mar​cus for this', me, peers).ok).toBe(false);
  });

  it('catches a combining-mark evasion of a peer name', () => {
    expect(checkRecipeBody('x', 'it was Márcus, honestly', me, peers).ok).toBe(false);
  });

  it('blocks empty and over-long bodies', () => {
    expect(checkRecipeBody('', '', me, peers)).toMatchObject({ ok: false, reason: 'empty' });
    expect(checkRecipeBody('x', 'a'.repeat(4001), me, peers)).toMatchObject({ ok: false, reason: 'too_long' });
  });

  it('does not false-positive on a peer name embedded in a larger word', () => {
    // "Priya" must not match inside "Priyanka-less" style tokens — mention() is word-bounded.
    expect(checkRecipeBody('x', 'the priyamvada library helped', me, [{ handle: null, displayName: 'Priya' }]).ok).toBe(true);
  });
});
