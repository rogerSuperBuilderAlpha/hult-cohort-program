import { describe, expect, it } from 'vitest';
import { agentTools, validatePlan, type BoardContext, type RawToolCall } from '@/lib/agent';
import { extractAnswer } from '@/lib/agent-plan';

// A richer board than agent.test.ts uses, so these cases exercise different resolution paths
// without colliding with the pinned fixtures there.
const ctx: BoardContext = {
  uid: 'me',
  tasks: [
    { id: 't_login', title: 'Login screen', status: 'in_progress', mine: true },
    { id: 't_cors', title: 'Fix CORS', status: 'todo', mine: true },
    { id: 't_ship', title: 'Shipped thing', status: 'done', mine: true },
    { id: 't_pad', title: '  Padded Title  ', status: 'todo', mine: true },
  ],
  projects: [
    { id: 'p_web', name: 'Website' },
    { id: 'p_docs', name: '  Docs  ' },
  ],
  canPublish: false,
};

const pub = { ...ctx, canPublish: true };

// A single-call helper to keep the assertions tight.
const run = (call: RawToolCall) => validatePlan([call], ctx);
const runPub = (call: RawToolCall) => validatePlan([call], pub);

describe('cleanDate — dates that could smuggle a query string or path are rejected (via create_task)', () => {
  const dueOf = (due: unknown) =>
    run({ name: 'create_task', input: { title: 'T', project: 'Website', due_date: due } }).actions[0] as
      | { dueDate: string | null }
      | undefined;

  it('accepts a well-formed ISO date', () => {
    expect(dueOf('2026-08-01')?.dueDate).toBe('2026-08-01');
  });

  it('trims surrounding whitespace before validating', () => {
    expect(dueOf('  2026-08-01  ')?.dueDate).toBe('2026-08-01');
  });

  it('rejects a date with a trailing query string (task kept, date nulled)', () => {
    expect(dueOf('2026-08-01?steal=1')?.dueDate).toBeNull();
  });

  it('rejects a date carrying a path segment', () => {
    expect(dueOf('2026-08-01/../etc/passwd')?.dueDate).toBeNull();
  });

  it('rejects a non-zero-padded date (2026-8-1)', () => {
    expect(dueOf('2026-8-1')?.dueDate).toBeNull();
  });

  it('rejects slash-delimited and US-order dates', () => {
    expect(dueOf('2026/08/01')?.dueDate).toBeNull();
    expect(dueOf('08-01-2026')?.dueDate).toBeNull();
  });

  it('rejects an ISO datetime (time component is not allowed)', () => {
    expect(dueOf('2026-08-01T00:00:00Z')?.dueDate).toBeNull();
  });

  it('rejects a non-string due date', () => {
    expect(dueOf(20260801)?.dueDate).toBeNull();
    expect(dueOf(null)?.dueDate).toBeNull();
  });
});

describe('create_task — title bounds, project resolution, status default', () => {
  it('accepts a title of exactly 120 characters', () => {
    const { actions, dropped } = run({ name: 'create_task', input: { title: 'x'.repeat(120), project: 'Website' } });
    expect(dropped).toEqual([]);
    expect(actions[0]).toMatchObject({ kind: 'create_task', title: 'x'.repeat(120) });
  });

  it('drops a title of 121 characters', () => {
    expect(run({ name: 'create_task', input: { title: 'x'.repeat(121), project: 'Website' } }).actions).toEqual([]);
  });

  it('drops a whitespace-only title', () => {
    expect(run({ name: 'create_task', input: { title: '   ', project: 'Website' } }).actions).toEqual([]);
  });

  it('drops a non-string title', () => {
    expect(run({ name: 'create_task', input: { title: 42, project: 'Website' } }).actions).toEqual([]);
  });

  it('trims the stored title', () => {
    expect(run({ name: 'create_task', input: { title: '  Wire API  ', project: 'Website' } }).actions[0]).toMatchObject({
      title: 'Wire API',
    });
  });

  it('matches a project name case-insensitively and after trimming', () => {
    expect(run({ name: 'create_task', input: { title: 'T', project: 'wEbSiTe' } }).actions[0]).toMatchObject({
      projectId: 'p_web',
    });
    // ctx project name is stored padded ("  Docs  ") — resolution trims both sides.
    expect(run({ name: 'create_task', input: { title: 'T', project: 'docs' } }).actions[0]).toMatchObject({
      projectId: 'p_docs',
    });
  });

  it('defaults status to todo when absent or invalid', () => {
    expect(run({ name: 'create_task', input: { title: 'T', project: 'Website' } }).actions[0]).toMatchObject({
      status: 'todo',
    });
    expect(
      run({ name: 'create_task', input: { title: 'T', project: 'Website', status: 'shipped' } }).actions[0]
    ).toMatchObject({ status: 'todo' });
  });

  it('honours a valid explicit status', () => {
    expect(
      run({ name: 'create_task', input: { title: 'T', project: 'Website', status: 'in_progress' } }).actions[0]
    ).toMatchObject({ status: 'in_progress' });
  });

  it('drops a task whose project is created LATER in the plan (order matters)', () => {
    const { actions, dropped } = validatePlan(
      [
        { name: 'create_task', input: { title: 'Early', project: 'Later' } },
        { name: 'create_project', input: { name: 'Later' } },
      ],
      ctx
    );
    // Only the project survives; the forward-referencing task is dropped.
    expect(actions).toEqual([{ kind: 'create_project', name: 'Later' }]);
    expect(dropped).toHaveLength(1);
  });

  it('resolves a pending project case-insensitively (create Marketing, file under MARKETING)', () => {
    const { actions, dropped } = validatePlan(
      [
        { name: 'create_project', input: { name: 'Marketing' } },
        { name: 'create_task', input: { title: 'Landing', project: 'MARKETING' } },
      ],
      ctx
    );
    expect(dropped).toEqual([]);
    expect(actions[1]).toMatchObject({ kind: 'create_task', projectId: 'pending:marketing' });
  });
});

describe('create_project — name bounds', () => {
  it('accepts a name of exactly 80 characters', () => {
    expect(run({ name: 'create_project', input: { name: 'p'.repeat(80) } }).actions).toHaveLength(1);
  });

  it('drops a name of 81 characters', () => {
    expect(run({ name: 'create_project', input: { name: 'p'.repeat(81) } }).actions).toEqual([]);
  });

  it('drops an empty or whitespace-only name', () => {
    expect(run({ name: 'create_project', input: { name: '' } }).actions).toEqual([]);
    expect(run({ name: 'create_project', input: { name: '   ' } }).actions).toEqual([]);
  });

  it('drops a non-string name', () => {
    expect(run({ name: 'create_project', input: { name: { toString: () => 'x' } } }).actions).toEqual([]);
  });

  it('trims the stored project name', () => {
    expect(run({ name: 'create_project', input: { name: '  Ops  ' } }).actions[0]).toEqual({
      kind: 'create_project',
      name: 'Ops',
    });
  });
});

describe('set_task_status — status validity and ownership', () => {
  it('drops a move with a missing status', () => {
    expect(run({ name: 'set_task_status', input: { task: 'Login screen' } }).actions).toEqual([]);
  });

  it('resolves the task title case-insensitively and after trimming', () => {
    expect(run({ name: 'set_task_status', input: { task: '  login SCREEN  ', status: 'done' } }).actions[0]).toMatchObject(
      { taskId: 't_login', title: 'Login screen' }
    );
  });

  it('carries the canonical stored title, not the model-supplied one', () => {
    // The padded fixture title resolves, but the action reports the exact stored title.
    expect(run({ name: 'set_task_status', input: { task: 'padded title', status: 'done' } }).actions[0]).toMatchObject({
      taskId: 't_pad',
      title: '  Padded Title  ',
    });
  });

  it('drops a non-string task reference', () => {
    expect(run({ name: 'set_task_status', input: { task: 123, status: 'done' } }).actions).toEqual([]);
  });
});

describe('edit_task — due-date coercion and change detection', () => {
  it('accepts a bare due-date change with a valid ISO date', () => {
    expect(run({ name: 'edit_task', input: { task: 'Fix CORS', due_date: '2026-09-09' } }).actions[0]).toEqual({
      kind: 'edit_task',
      taskId: 't_cors',
      title: 'Fix CORS',
      newTitle: null,
      dueDate: '2026-09-09',
      clearDue: false,
    });
  });

  it('clears the due date on "clear" as well as "none", case-insensitively', () => {
    expect(run({ name: 'edit_task', input: { task: 'Fix CORS', due_date: 'CLEAR' } }).actions[0]).toMatchObject({
      clearDue: true,
      dueDate: null,
    });
    expect(run({ name: 'edit_task', input: { task: 'Fix CORS', due_date: 'None' } }).actions[0]).toMatchObject({
      clearDue: true,
    });
  });

  it('drops an edit whose only change is an unparseable due date', () => {
    expect(run({ name: 'edit_task', input: { task: 'Fix CORS', due_date: 'next tuesday' } }).actions).toEqual([]);
    expect(run({ name: 'edit_task', input: { task: 'Fix CORS', due_date: '2026-09-09?x=1' } }).actions).toEqual([]);
  });

  it('accepts a new title of exactly 120 chars but ignores one of 121', () => {
    expect(run({ name: 'edit_task', input: { task: 'Fix CORS', new_title: 'y'.repeat(120) } }).actions[0]).toMatchObject({
      newTitle: 'y'.repeat(120),
    });
    // A too-long title alone leaves nothing to change → dropped.
    expect(run({ name: 'edit_task', input: { task: 'Fix CORS', new_title: 'y'.repeat(121) } }).actions).toEqual([]);
  });

  it('applies both a rename and a new due date together', () => {
    expect(
      run({ name: 'edit_task', input: { task: 'Fix CORS', new_title: 'Fix preflight', due_date: '2026-10-10' } }).actions[0]
    ).toMatchObject({ newTitle: 'Fix preflight', dueDate: '2026-10-10', clearDue: false });
  });

  it('ignores a whitespace-only new title (treated as no rename)', () => {
    expect(run({ name: 'edit_task', input: { task: 'Fix CORS', new_title: '   ' } }).actions).toEqual([]);
  });
});

describe('delete_task — ownership resolution', () => {
  it('drops a non-string task reference', () => {
    expect(run({ name: 'delete_task', input: { task: null } }).actions).toEqual([]);
  });

  it('resolves case-insensitively to the stored task', () => {
    expect(run({ name: 'delete_task', input: { task: 'SHIPPED THING' } }).actions[0]).toEqual({
      kind: 'delete_task',
      taskId: 't_ship',
      title: 'Shipped thing',
    });
  });
});

describe('edit_project — strict archive flag and name bounds', () => {
  it('treats only a literal boolean true as archive (a truthy string is not enough)', () => {
    // archive:"yes" is not === true, and no new_name → nothing to change → dropped.
    expect(run({ name: 'edit_project', input: { project: 'Website', archive: 'yes' } }).actions).toEqual([]);
  });

  it('ignores a new name over 80 chars', () => {
    expect(run({ name: 'edit_project', input: { project: 'Website', new_name: 'q'.repeat(81) } }).actions).toEqual([]);
  });

  it('accepts a new name of exactly 80 chars', () => {
    expect(run({ name: 'edit_project', input: { project: 'Website', new_name: 'q'.repeat(80) } }).actions[0]).toMatchObject(
      { kind: 'edit_project', newName: 'q'.repeat(80) }
    );
  });

  it('resolves the project name after trimming (padded fixture)', () => {
    expect(run({ name: 'edit_project', input: { project: 'docs', archive: true } }).actions[0]).toMatchObject({
      projectId: 'p_docs',
      name: '  Docs  ',
    });
  });
});

describe('mark_stuck — the flag defaults to true', () => {
  it('defaults stuck to true when the flag is omitted', () => {
    expect(run({ name: 'mark_stuck', input: { task: 'Fix CORS' } }).actions[0]).toMatchObject({ stuck: true });
  });

  it('treats any non-false value as true (only literal false clears)', () => {
    expect(run({ name: 'mark_stuck', input: { task: 'Fix CORS', stuck: 'no' } }).actions[0]).toMatchObject({
      stuck: true,
    });
    expect(run({ name: 'mark_stuck', input: { task: 'Fix CORS', stuck: false } }).actions[0]).toMatchObject({
      stuck: false,
    });
  });
});

describe('draft_recipe — gating precedence', () => {
  it('checks the publish gate before existence (unknown task with publishing off → the off message)', () => {
    const { dropped } = run({ name: 'draft_recipe', input: { task: 'Nonexistent' } });
    expect(dropped[0]).toMatch(/off in Settings/);
  });

  it('drops an unshipped own task even with publishing on, naming the task', () => {
    const { actions, dropped } = runPub({ name: 'draft_recipe', input: { task: 'Login screen' } });
    expect(actions).toEqual([]);
    expect(dropped[0]).toMatch(/isn't shipped/);
  });

  it('accepts a shipped own task when publishing is on, resolving case-insensitively', () => {
    expect(runPub({ name: 'draft_recipe', input: { task: 'shipped THING' } }).actions[0]).toEqual({
      kind: 'draft_recipe',
      taskId: 't_ship',
      title: 'Shipped thing',
    });
  });
});

describe('set_workflow — preset resolution', () => {
  it('resolves by preset id as well as by spoken name', () => {
    expect(run({ name: 'set_workflow', input: { workflow: 'software' } }).actions[0]).toEqual({
      kind: 'set_workflow',
      preset: 'software',
      label: 'Software delivery',
    });
  });

  it('resolves case-insensitively and after trimming', () => {
    expect(run({ name: 'set_workflow', input: { workflow: '  CONTENT PIPELINE  ' } }).actions[0]).toMatchObject({
      preset: 'content',
    });
  });

  it('drops a partial name that is not an exact preset match', () => {
    // "Software" alone is a prefix, not the full "Software delivery" name nor the "software" id.
    expect(run({ name: 'set_workflow', input: { workflow: 'Software del' } }).actions).toEqual([]);
  });

  it('drops a non-string workflow', () => {
    expect(run({ name: 'set_workflow', input: { workflow: 123 } }).actions).toEqual([]);
  });

  it('can switch back to the classic preset', () => {
    expect(run({ name: 'set_workflow', input: { workflow: 'Classic' } }).actions[0]).toMatchObject({ preset: 'classic' });
  });
});

describe('propose_dispatch — target and intent guards', () => {
  it('drops a hand-off to Pulse even when spelled with capitals (lowercased first)', () => {
    expect(run({ name: 'propose_dispatch', input: { app: 'PULSE', intent: 'x' } }).actions).toEqual([]);
  });

  it('drops a whitespace-only target or intent', () => {
    expect(run({ name: 'propose_dispatch', input: { app: '   ', intent: 'x' } }).actions).toEqual([]);
    expect(run({ name: 'propose_dispatch', input: { app: 'rally', intent: '   ' } }).actions).toEqual([]);
  });

  it('trims and lowercases the target app', () => {
    expect(run({ name: 'propose_dispatch', input: { app: '  Rally  ', intent: 'thank Priya' } }).actions[0]).toMatchObject(
      { toApp: 'rally' }
    );
  });

  it('bounds the intent to 500 characters', () => {
    const action = run({ name: 'propose_dispatch', input: { app: 'rally', intent: 'z'.repeat(600) } }).actions[0] as {
      intent: string;
    };
    expect(action.intent).toHaveLength(500);
  });

  it('drops a non-string app', () => {
    expect(run({ name: 'propose_dispatch', input: { app: 7, intent: 'x' } }).actions).toEqual([]);
  });
});

describe('remember — fact bounds', () => {
  it('trims and bounds the fact to 280 characters', () => {
    const action = run({ name: 'remember', input: { text: `  ${'w'.repeat(300)}  ` } }).actions[0] as { text: string };
    expect(action.text).toHaveLength(280);
  });

  it('accepts a fact of exactly 280 characters unchanged', () => {
    expect((run({ name: 'remember', input: { text: 'w'.repeat(280) } }).actions[0] as { text: string }).text).toHaveLength(
      280
    );
  });

  it('drops a non-string fact', () => {
    expect(run({ name: 'remember', input: { text: 999 } }).actions).toEqual([]);
  });
});

describe('validatePlan — mixed plans preserve order and drop only the bad calls', () => {
  it('keeps the good actions and drops the bad ones in a single plan', () => {
    const raw: RawToolCall[] = [
      { name: 'set_task_status', input: { task: 'Fix CORS', status: 'in_progress' } },
      { name: 'set_task_status', input: { task: "Priya's card", status: 'done' } },
      { name: 'nuke_everything', input: {} },
      { name: 'remember', input: { text: 'shipping the docs' } },
    ];
    const { actions, dropped } = validatePlan(raw, ctx);
    expect(actions.map((a) => a.kind)).toEqual(['set_task_status', 'remember']);
    expect(dropped).toHaveLength(2);
  });

  it('drops every kind of unknown action and reports each by name', () => {
    const { actions, dropped } = validatePlan(
      [
        { name: 'answer', input: { text: 'hi' } }, // not an action here; validatePlan does not know it
        { name: 'reassign_task', input: {} },
      ],
      ctx
    );
    expect(actions).toEqual([]);
    expect(dropped).toHaveLength(2);
    expect(dropped[1]).toMatch(/reassign_task/);
  });

  it('tolerates a call with a missing input object', () => {
    const { actions, dropped } = validatePlan([{ name: 'create_project' } as unknown as RawToolCall], ctx);
    expect(actions).toEqual([]);
    expect(dropped).toHaveLength(1);
  });

  it('returns empty arrays for an empty plan', () => {
    expect(validatePlan([], ctx)).toEqual({ actions: [], dropped: [] });
  });
});

describe('agentTools — the tool allowlist shape', () => {
  it('adds draft_recipe only for an opted-in user and never otherwise', () => {
    expect(agentTools(false).map((t) => t.name)).not.toContain('draft_recipe');
    expect(agentTools(true).map((t) => t.name)).toContain('draft_recipe');
  });

  it('always offers the always-available tools regardless of publish opt-in', () => {
    for (const canPublish of [false, true]) {
      const names = agentTools(canPublish).map((t) => t.name);
      for (const t of ['create_task', 'set_task_status', 'answer', 'set_workflow', 'propose_dispatch', 'remember']) {
        expect(names, `${t} @ ${canPublish}`).toContain(t);
      }
    }
  });

  it('offers exactly one more tool when publishing is on', () => {
    expect(agentTools(true)).toHaveLength(agentTools(false).length + 1);
  });
});

describe('extractAnswer — plain-text extraction with bounds', () => {
  it('strips every markdown metacharacter it targets', () => {
    expect(extractAnswer([{ name: 'answer', input: { text: '*_`#>| Focus here' } }])).toBe('Focus here');
  });

  it('collapses runs of whitespace into single spaces and trims', () => {
    expect(extractAnswer([{ name: 'answer', input: { text: '  a\n\n\tb   c  ' } }])).toBe('a b c');
  });

  it('accepts a cleaned answer of exactly 600 characters', () => {
    expect(extractAnswer([{ name: 'answer', input: { text: 'a'.repeat(600) } }])).toHaveLength(600);
  });

  it('rejects a cleaned answer of 601 characters', () => {
    expect(extractAnswer([{ name: 'answer', input: { text: 'a'.repeat(601) } }])).toBeUndefined();
  });

  it('measures the bound AFTER stripping (markup padding does not push it over)', () => {
    // 600 real chars + 40 markup chars that get removed → cleaned length 600 → accepted.
    const text = '#'.repeat(40) + 'a'.repeat(600);
    expect(extractAnswer([{ name: 'answer', input: { text } }])).toHaveLength(600);
  });

  it('returns undefined when there is no answer call', () => {
    expect(extractAnswer([{ name: 'create_task', input: { title: 'x', project: 'y' } }])).toBeUndefined();
  });

  it('returns undefined for an empty or whitespace/markup-only answer', () => {
    expect(extractAnswer([{ name: 'answer', input: { text: '   ' } }])).toBeUndefined();
    expect(extractAnswer([{ name: 'answer', input: { text: '**__``' } }])).toBeUndefined();
  });

  it('returns undefined for a non-string answer payload', () => {
    expect(extractAnswer([{ name: 'answer', input: { text: 42 } as unknown as Record<string, unknown> }])).toBeUndefined();
  });

  it('picks the first answer call out of a mixed set of calls', () => {
    const raw: RawToolCall[] = [
      { name: 'create_task', input: { title: 'x', project: 'y' } },
      { name: 'answer', input: { text: 'Here is your **plan**' } },
    ];
    expect(extractAnswer(raw)).toBe('Here is your plan');
  });
});
