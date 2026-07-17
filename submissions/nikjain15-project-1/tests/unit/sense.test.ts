import { describe, it, expect } from 'vitest';
import {
  branchToTitle,
  normaliseTitle,
  titlesMatch,
  findDuplicate,
  inferStatus,
  formatEvidence,
  relativeTime,
  selectAsk,
  checkNarrative,
  narrationCacheKey,
  shouldNarrate,
  sensedTaskId,
  NARRATIVE_MAX_CHARS,
  type AskContext,
} from '../../lib/sense';

/* ------------------------------------------------------------ branch → title */

describe('branchToTitle', () => {
  it('turns a prefixed branch into a sentence-case task title', () => {
    // NOTE: currently fails — see the module docstring, which promises
    // "Fix oauth redirect". BRANCH_PREFIXES matches `fix-` as well as `fix/`, so the
    // stacked-prefix loop eats the first meaningful word. Bug is in lib/sense.ts.
    expect(branchToTitle('feat/fix-oauth-redirect')).toBe('Fix oauth redirect');
  });

  it('strips a single prefix', () => {
    expect(branchToTitle('chore/update-deps')).toBe('Update deps');
    expect(branchToTitle('hotfix/session-timeout')).toBe('Session timeout');
    expect(branchToTitle('refactor/board-columns')).toBe('Board columns');
  });

  it('strips stacked slash-separated prefixes', () => {
    expect(branchToTitle('feat/refactor/board-columns')).toBe('Board columns');
  });

  it('treats underscores as word boundaries', () => {
    expect(branchToTitle('feat/add_login_page')).toBe('Add login page');
  });

  it('keeps digits inside words', () => {
    expect(branchToTitle('feat/add_2fa_support')).toBe('Add 2fa support');
  });

  it('capitalises a single-word branch with no prefix', () => {
    expect(branchToTitle('dashboard')).toBe('Dashboard');
  });

  it('drops a refs/heads/ remote ref before reading the branch', () => {
    expect(branchToTitle('refs/heads/feat/add_login_page')).toBe('Add login page');
  });

  it('returns an empty title for a branch that is only a prefix', () => {
    expect(branchToTitle('feat/')).toBe('');
    expect(branchToTitle('chore/')).toBe('');
  });

  it('returns an empty title for an empty branch', () => {
    expect(branchToTitle('')).toBe('');
  });

  it('preserves unicode letters and capitalises them', () => {
    expect(branchToTitle('feature/été-support')).toBe('Été support');
    expect(branchToTitle('привет-мир')).toBe('Привет-мир'.charAt(0) + 'ривет мир');
  });

  it('handles a 200-character branch without truncating or throwing', () => {
    const branch = `feat/${'a'.repeat(195)}`;
    expect(branch).toHaveLength(200);

    const title = branchToTitle(branch);
    expect(title).toBe(`A${'a'.repeat(194)}`);
    expect(title).toHaveLength(195);
  });
});

/* ---------------------------------------------------------------- dedupe */

describe('normaliseTitle', () => {
  it('lowercases, strips punctuation and collapses whitespace', () => {
    expect(normaliseTitle('  Fix OAuth, redirect!  ')).toBe('fix oauth redirect');
  });

  it('folds accents so the same words compare equal', () => {
    expect(normaliseTitle('Café Déjà-vu')).toBe('cafe deja vu');
  });

  it('normalises a punctuation-only title to the empty string', () => {
    expect(normaliseTitle('...')).toBe('');
    expect(normaliseTitle('!!!')).toBe('');
  });
});

describe('titlesMatch', () => {
  it('matches titles that differ only by case', () => {
    expect(titlesMatch('Fix oauth redirect', 'FIX OAUTH REDIRECT')).toBe(true);
  });

  it('matches titles that differ only by punctuation', () => {
    expect(titlesMatch('Fix oauth redirect', 'Fix oauth-redirect!')).toBe(true);
  });

  it('matches titles that differ only by trailing whitespace', () => {
    expect(titlesMatch('Fix oauth redirect', 'Fix oauth redirect   ')).toBe(true);
  });

  it('matches titles that differ only by accents', () => {
    expect(titlesMatch('Café menu', 'cafe menu')).toBe(true);
  });

  it('does not match two different titles', () => {
    expect(titlesMatch('Fix oauth redirect', 'Add login page')).toBe(false);
  });

  it('never matches two titles that both normalise to nothing', () => {
    // Merging "..." into "!!!" would silently fuse two unrelated tasks.
    expect(normaliseTitle('...')).toBe('');
    expect(normaliseTitle('!!!')).toBe('');
    expect(titlesMatch('...', '!!!')).toBe(false);
    expect(titlesMatch('...', '...')).toBe(false);
    expect(titlesMatch('', '')).toBe(false);
  });
});

describe('findDuplicate', () => {
  const tasks = [
    { id: 't1', title: 'Add login page' },
    { id: 't2', title: 'Fix OAuth redirect!' },
  ];

  it('finds the existing manual task an inferred title should update', () => {
    expect(findDuplicate(tasks, 'fix oauth redirect')).toEqual(tasks[1]);
  });

  it('finds a match across accents and spacing', () => {
    expect(findDuplicate([{ id: 't3', title: 'Café menu' }], '  cafe   menu ')).toEqual({
      id: 't3',
      title: 'Café menu',
    });
  });

  it('returns null when nothing matches, so the caller creates a new task', () => {
    expect(findDuplicate(tasks, 'Write the README')).toBeNull();
  });

  it('returns null for a title that normalises to nothing rather than grabbing a task', () => {
    expect(findDuplicate([...tasks, { id: 't9', title: '???' }], '...')).toBeNull();
  });

  it('returns null against an empty board', () => {
    expect(findDuplicate([], 'Add login page')).toBeNull();
  });
});

/* ------------------------------------------------------ status inference */

describe('inferStatus', () => {
  it('leaves a pushed branch in todo and logs nothing', () => {
    expect(inferStatus({ type: 'branch_pushed' })).toEqual({
      status: 'todo',
      event: null,
      completed: false,
    });
  });

  it('moves a card to in progress and logs task_started on the first commit', () => {
    expect(inferStatus({ type: 'commit_pushed' })).toEqual({
      status: 'in_progress',
      event: 'task_started',
      completed: false,
    });
  });

  it('keeps an opened PR in progress without logging a second event', () => {
    expect(inferStatus({ type: 'pr_opened' })).toEqual({
      status: 'in_progress',
      event: null,
      completed: false,
    });
  });

  it('marks a merged PR done, completed, and logs task_shipped', () => {
    expect(inferStatus({ type: 'pr_merged' })).toEqual({
      status: 'done',
      event: 'task_shipped',
      completed: true,
    });
  });

  it('moves an abandoned PR back to todo and logs nothing', () => {
    const result = inferStatus({ type: 'pr_closed_unmerged' });

    expect(result.status).toBe('todo');
    // The product promise: abandoning something is never news the cohort needs.
    expect(result.event).toBeNull();
    expect(result.completed).toBe(false);
  });
});

/* ------------------------------------------------------------- evidence */

describe('formatEvidence', () => {
  it('renders commits, PR and span as one receipt line', () => {
    expect(formatEvidence({ commits: 6, prNumbers: [41], files: [], spanHours: 2 })).toBe(
      '6 commits · PR #41 · 2h between first and last'
    );
  });

  it('says "1 commit", not "1 commits"', () => {
    expect(formatEvidence({ commits: 1, prNumbers: [], files: [], spanHours: null })).toBe(
      '1 commit'
    );
  });

  it('omits the commit count entirely when there are no commits', () => {
    expect(formatEvidence({ commits: 0, prNumbers: [41], files: [], spanHours: null })).toBe(
      'PR #41'
    );
  });

  it('renders nothing at all for empty evidence', () => {
    expect(formatEvidence({ commits: 0, prNumbers: [], files: [], spanHours: null })).toBe('');
  });

  it('omits the span when it is unknown', () => {
    expect(formatEvidence({ commits: 3, prNumbers: [], files: [], spanHours: null })).toBe(
      '3 commits'
    );
  });

  it('omits a span shorter than an hour rather than rounding it to 0h', () => {
    expect(formatEvidence({ commits: 3, prNumbers: [], files: [], spanHours: 0.4 })).toBe(
      '3 commits'
    );
    expect(formatEvidence({ commits: 3, prNumbers: [], files: [], spanHours: 0.9 })).toBe(
      '3 commits'
    );
  });

  it('rounds a span of an hour or more to whole hours', () => {
    expect(formatEvidence({ commits: 2, prNumbers: [], files: [], spanHours: 2.6 })).toBe(
      '2 commits · 3h between first and last'
    );
  });

  it('lists every PR when work spans more than one', () => {
    expect(formatEvidence({ commits: 9, prNumbers: [41, 42], files: [], spanHours: null })).toBe(
      '9 commits · PR #41, PR #42'
    );
  });
});

/* ---------------------------------------------------------- relative time */

describe('relativeTime', () => {
  const now = new Date('2026-07-16T12:00:00.000Z');
  const ago = (ms: number) => new Date(now.getTime() - ms);

  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;

  it('says "just now" for anything under a minute', () => {
    expect(relativeTime(now, now)).toBe('just now');
    expect(relativeTime(ago(59 * SECOND), now)).toBe('just now');
  });

  it('counts minutes from one minute up to an hour', () => {
    expect(relativeTime(ago(MINUTE), now)).toBe('1m ago');
    expect(relativeTime(ago(6 * MINUTE), now)).toBe('6m ago');
    expect(relativeTime(ago(59 * MINUTE), now)).toBe('59m ago');
  });

  it('counts hours from one hour up to a day', () => {
    expect(relativeTime(ago(HOUR), now)).toBe('1h ago');
    expect(relativeTime(ago(2 * HOUR), now)).toBe('2h ago');
    expect(relativeTime(ago(23 * HOUR), now)).toBe('23h ago');
  });

  it('counts days from one day up to a week', () => {
    expect(relativeTime(ago(DAY), now)).toBe('1d ago');
    expect(relativeTime(ago(3 * DAY), now)).toBe('3d ago');
    expect(relativeTime(ago(6 * DAY), now)).toBe('6d ago');
  });

  it('counts whole weeks beyond that', () => {
    expect(relativeTime(ago(WEEK), now)).toBe('1w ago');
    expect(relativeTime(ago(3 * WEEK), now)).toBe('3w ago');
  });

  it('says "just now" for a future timestamp rather than predicting', () => {
    expect(relativeTime(new Date(now.getTime() + HOUR), now)).toBe('just now');
  });
});

/* -------------------------------------------------- the standing ask ladder */

describe('selectAsk', () => {
  const empty: AskContext = {
    brokerMatch: null,
    weakMatch: null,
    unclaimedTask: null,
    oldestInProgress: null,
  };

  const broker = { helperName: 'Marcus', problem: 'Firestore rules' };
  const weak = { problem: 'Deploy pipeline' };
  const unclaimed = { id: 't1', title: 'Add login page' };
  const mine = { id: 't2', title: 'Fix oauth redirect' };

  it('asks the user to go to a named helper when a broker match exists', () => {
    expect(selectAsk({ ...empty, brokerMatch: broker })).toEqual({
      kind: 'broker',
      helperName: 'Marcus',
      problem: 'Firestore rules',
    });
  });

  it('falls back to a weak match when no broker match exists', () => {
    expect(selectAsk({ ...empty, weakMatch: weak })).toEqual({
      kind: 'weak_match',
      problem: 'Deploy pipeline',
    });
  });

  it('falls back to an unclaimed task when no match of either kind exists', () => {
    expect(selectAsk({ ...empty, unclaimedTask: unclaimed })).toEqual({
      kind: 'unclaimed',
      taskId: 't1',
      title: 'Add login page',
    });
  });

  it('falls back to the user’s own oldest in-progress task last', () => {
    expect(selectAsk({ ...empty, oldestInProgress: mine })).toEqual({
      kind: 'your_task',
      taskId: 't2',
      title: 'Fix oauth redirect',
    });
  });

  it('carries exactly one ask: a broker match beats every lower rung', () => {
    expect(
      selectAsk({
        brokerMatch: broker,
        weakMatch: weak,
        unclaimedTask: unclaimed,
        oldestInProgress: mine,
      })
    ).toEqual({ kind: 'broker', helperName: 'Marcus', problem: 'Firestore rules' });
  });

  it('carries exactly one ask: a weak match beats the task rungs', () => {
    expect(
      selectAsk({
        brokerMatch: null,
        weakMatch: weak,
        unclaimedTask: unclaimed,
        oldestInProgress: mine,
      })
    ).toEqual({ kind: 'weak_match', problem: 'Deploy pipeline' });
  });

  it('carries exactly one ask: an unclaimed task beats the user’s own task', () => {
    expect(
      selectAsk({
        brokerMatch: null,
        weakMatch: null,
        unclaimedTask: unclaimed,
        oldestInProgress: mine,
      })
    ).toEqual({ kind: 'unclaimed', taskId: 't1', title: 'Add login page' });
  });

  it('says there is nothing rather than manufacturing an ask', () => {
    expect(selectAsk(empty)).toEqual({ kind: 'nothing' });
  });
});

/* --------------------------------------------- narrative safety (injection) */

describe('checkNarrative', () => {
  const actor = { handle: 'nikjain15', displayName: 'Nikhil' };
  const others = [
    { handle: 'marcus-d', displayName: 'Marcus' },
    { handle: null, displayName: 'Priya Raman' },
  ];

  it('publishes a clean sentence about the actor', () => {
    const result = checkNarrative(
      'Nikhil pushed six commits to the auth refactor and opened a PR.',
      actor,
      others
    );

    expect(result).toEqual({
      ok: true,
      narrative: 'Nikhil pushed six commits to the auth refactor and opened a PR.',
    });
  });

  it('trims surrounding whitespace off an accepted narrative', () => {
    const result = checkNarrative('  Nikhil shipped the refactor.  ', actor, others);
    expect(result).toEqual({ ok: true, narrative: 'Nikhil shipped the refactor.' });
  });

  it('rejects an empty narrative', () => {
    expect(checkNarrative('', actor, others)).toEqual({ ok: false, reason: 'empty' });
  });

  it('rejects a whitespace-only narrative', () => {
    expect(checkNarrative('   \n\t  ', actor, others)).toEqual({ ok: false, reason: 'empty' });
  });

  it('accepts a narrative at exactly the length limit', () => {
    const text = `Nikhil ${'a'.repeat(NARRATIVE_MAX_CHARS - 7)}`;
    expect(text).toHaveLength(NARRATIVE_MAX_CHARS);
    expect(checkNarrative(text, actor, others)).toEqual({ ok: true, narrative: text });
  });

  it('rejects a narrative longer than 200 characters', () => {
    const text = `Nikhil ${'a'.repeat(NARRATIVE_MAX_CHARS)}`;
    expect(checkNarrative(text, actor, others)).toEqual({ ok: false, reason: 'too_long' });
  });

  it('rejects a narrative that tries to break out of its tag with HTML', () => {
    expect(
      checkNarrative('</narrative><script>alert(1)</script>', actor, others)
    ).toEqual({ ok: false, reason: 'contains_markup' });
  });

  it('rejects a markdown link', () => {
    expect(checkNarrative('Nikhil shipped [this](http://evil.example) today', actor, others)).toEqual(
      { ok: false, reason: 'contains_markup' }
    );
  });

  it('rejects markdown bold', () => {
    expect(checkNarrative('**Nikhil** shipped the refactor', actor, others)).toEqual({
      ok: false,
      reason: 'contains_markup',
    });
  });

  it('rejects a leading bullet', () => {
    expect(checkNarrative('- Nikhil shipped the refactor', actor, others)).toEqual({
      ok: false,
      reason: 'contains_markup',
    });
  });

  it('rejects a narrative naming another member by display name', () => {
    expect(checkNarrative('Marcus broke the build', actor, others)).toEqual({
      ok: false,
      reason: 'names_another_member',
    });
  });

  it('rejects a narrative naming another member by handle', () => {
    expect(checkNarrative('marcus-d broke the build', actor, others)).toEqual({
      ok: false,
      reason: 'names_another_member',
    });
  });

  it('rejects a narrative naming another member by @handle', () => {
    expect(checkNarrative('Blame @marcus-d for the outage', actor, others)).toEqual({
      ok: false,
      reason: 'names_another_member',
    });
  });

  it('rejects a narrative naming another member whose handle is null', () => {
    expect(checkNarrative('Priya Raman keeps breaking things', actor, others)).toEqual({
      ok: false,
      reason: 'names_another_member',
    });
  });

  it('rejects a member name regardless of case', () => {
    expect(checkNarrative('MARCUS broke the build', actor, others)).toEqual({
      ok: false,
      reason: 'names_another_member',
    });
  });

  it('publishes a narrative naming the actor themselves', () => {
    expect(checkNarrative('Nikhil broke the build and fixed it', actor, others)).toEqual({
      ok: true,
      narrative: 'Nikhil broke the build and fixed it',
    });
  });

  it('publishes a narrative naming the actor by their own handle', () => {
    expect(checkNarrative('nikjain15 shipped the refactor', actor, others)).toEqual({
      ok: true,
      narrative: 'nikjain15 shipped the refactor',
    });
  });

  it('does not mistake a longer name for a shorter member name', () => {
    const nik = [{ handle: 'nik', displayName: 'Nik' }];
    expect(checkNarrative('Nikhil shipped the refactor', actor, nik)).toEqual({
      ok: true,
      narrative: 'Nikhil shipped the refactor',
    });
  });

  it('still catches that short member name when it stands alone', () => {
    const nik = [{ handle: 'nik', displayName: 'Nik' }];
    expect(checkNarrative('Nik shipped it', actor, nik)).toEqual({
      ok: false,
      reason: 'names_another_member',
    });
  });

  it('does not name-check a member whose name is the actor’s own', () => {
    const namesake = [{ handle: 'nikhil-other', displayName: 'Nikhil' }];
    expect(checkNarrative('Nikhil shipped the refactor', actor, namesake)).toEqual({
      ok: true,
      narrative: 'Nikhil shipped the refactor',
    });
  });

  it('publishes a clean narrative when there are no other members to check', () => {
    expect(checkNarrative('Nikhil shipped the refactor', actor, [])).toEqual({
      ok: true,
      narrative: 'Nikhil shipped the refactor',
    });
  });

  it('checks length before markup so a long injected payload reports too_long', () => {
    const payload = `<script>${'a'.repeat(NARRATIVE_MAX_CHARS)}</script>`;
    expect(checkNarrative(payload, actor, others)).toEqual({ ok: false, reason: 'too_long' });
  });
});

/* ---------------------------------------------------------- narration cache */

describe('narrationCacheKey', () => {
  it('produces the same key for the same commits in a different order', () => {
    const a = narrationCacheKey('nikjain15', ['abc123', 'def456', '0f9a11']);
    const b = narrationCacheKey('nikjain15', ['0f9a11', 'abc123', 'def456']);

    expect(a).toBe(b);
  });

  it('produces the same key regardless of handle case', () => {
    expect(narrationCacheKey('NikJain15', ['abc123'])).toBe(
      narrationCacheKey('nikjain15', ['abc123'])
    );
  });

  it('does not mutate the caller’s commit list', () => {
    const shas = ['def456', 'abc123'];
    narrationCacheKey('nikjain15', shas);
    expect(shas).toEqual(['def456', 'abc123']);
  });

  it('produces different keys for different members and different commits', () => {
    expect(narrationCacheKey('nikjain15', ['abc123'])).not.toBe(
      narrationCacheKey('marcus-d', ['abc123'])
    );
    expect(narrationCacheKey('nikjain15', ['abc123'])).not.toBe(
      narrationCacheKey('nikjain15', ['abc123', 'def456'])
    );
  });
});

describe('shouldNarrate', () => {
  const handle = 'nikjain15';
  const shas = ['abc123', 'def456'];

  it('spends nothing when the commit range is unchanged', () => {
    // The budget guard: a cache miss on an unchanged range is a bug, not an
    // inefficiency — uncached, the pilot costs ~$524 against ~$11 of credit.
    const cached = narrationCacheKey(handle, shas);
    expect(shouldNarrate(cached, handle, shas)).toBe(false);
  });

  it('spends nothing when the same commits arrive in a different order', () => {
    const cached = narrationCacheKey(handle, ['abc123', 'def456']);
    expect(shouldNarrate(cached, handle, ['def456', 'abc123'])).toBe(false);
  });

  it('spends nothing when there are no commits at all', () => {
    expect(shouldNarrate(null, handle, [])).toBe(false);
    expect(shouldNarrate(narrationCacheKey(handle, shas), handle, [])).toBe(false);
  });

  it('narrates when a new commit lands', () => {
    const cached = narrationCacheKey(handle, shas);
    expect(shouldNarrate(cached, handle, [...shas, 'f00ba7'])).toBe(true);
  });

  it('narrates when nothing has been cached yet', () => {
    expect(shouldNarrate(null, handle, shas)).toBe(true);
  });
});

/**
 * The twin bug, pinned.
 *
 * Two identical PR #40 cards reached the production board. Root cause was a read-then-write:
 * "is there a card for this branch?" then "create one" — which two runs both lose. The id is
 * now derived from the work, so the second writer addresses the first writer's document
 * instead of minting a new one.
 */
describe('sensedTaskId — the same work has one address', () => {
  const UID = 'uid_nik';
  const BRANCH = 'participants/summer26/phase-1-project-1/nikjain15';

  it('is stable across calls — this is the whole property', () => {
    expect(sensedTaskId(UID, BRANCH)).toBe(sensedTaskId(UID, BRANCH));
  });

  it('contains no slash, so a branch name can be a document id', () => {
    // Firestore rejects '/' in a document id, and every cohort branch has three.
    expect(sensedTaskId(UID, BRANCH)).not.toContain('/');
  });

  it('separates two branches', () => {
    expect(sensedTaskId(UID, 'feat/a')).not.toBe(sensedTaskId(UID, 'feat/b'));
  });

  it('separates two members on the SAME branch name', () => {
    // Everyone's tasks live in one collection. Without the uid, two people working a
    // branch called `main` would fight over one card.
    expect(sensedTaskId('uid_a', 'main')).not.toBe(sensedTaskId('uid_b', 'main'));
  });

  it('separates branches that differ only in punctuation', () => {
    // The reason this hashes rather than escaping: `feat/a` and `feat_a` must not collide
    // just because escaping would map them to the same string.
    expect(sensedTaskId(UID, 'feat/a')).not.toBe(sensedTaskId(UID, 'feat_a'));
  });

  it('handles a branch with no ascii at all', () => {
    expect(sensedTaskId(UID, '機能/追加')).toMatch(/^s_uid_nik_[0-9a-f]{8}$/);
  });

  it('is always 8 hex chars, even when the hash has leading zeros', () => {
    // padStart is load-bearing: an unpadded id would be a different length per branch,
    // which is harmless until something parses it.
    for (const b of ['a', 'bb', 'ccc', 'feat/x', 'main', 'x'.repeat(200)]) {
      expect(sensedTaskId(UID, b)).toMatch(/^s_uid_nik_[0-9a-f]{8}$/);
    }
  });
});
