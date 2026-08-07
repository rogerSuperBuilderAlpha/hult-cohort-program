import { describe, expect, it } from 'vitest';
import { boardContext, validatePlan, type BoardContext, type RawToolCall } from '@/lib/agent';
import type { Project, Task } from '@/lib/types';

const ctx: BoardContext = {
  uid: 'me',
  tasks: [
    { id: 't_login', title: 'Login screen', status: 'in_progress', mine: true },
    { id: 't_cors', title: 'Fix CORS', status: 'todo', mine: true },
    { id: 't_ship', title: 'Shipped thing', status: 'done', mine: true },
  ],
  projects: [{ id: 'p_web', name: 'Website' }],
  canPublish: false,
};

describe('validatePlan — the injection backstop', () => {
  it('accepts a create_task under an existing project', () => {
    const raw: RawToolCall[] = [
      { name: 'create_task', input: { title: 'Wire the API', project: 'Website', status: 'todo' } },
    ];
    const { actions, dropped } = validatePlan(raw, ctx);
    expect(dropped).toEqual([]);
    expect(actions).toEqual([
      { kind: 'create_task', title: 'Wire the API', projectId: 'p_web', status: 'todo', dueDate: null },
    ]);
  });

  it('drops a create_task for a project that does not exist', () => {
    const raw: RawToolCall[] = [{ name: 'create_task', input: { title: 'X', project: 'Nope' } }];
    const { actions, dropped } = validatePlan(raw, ctx);
    expect(actions).toEqual([]);
    expect(dropped).toHaveLength(1);
  });

  it('accepts moving the user OWN task', () => {
    const raw: RawToolCall[] = [{ name: 'set_task_status', input: { task: 'Login screen', status: 'done' } }];
    const { actions } = validatePlan(raw, ctx);
    expect(actions).toEqual([{ kind: 'set_task_status', taskId: 't_login', status: 'done', title: 'Login screen' }]);
  });

  it("DROPS a move for a task that isn't the user's own — the injection case", () => {
    // Even if the model, steered by an injected task title, names a real peer card, it is not
    // in ctx (peers are never in ctx), so it resolves to nothing.
    const raw: RawToolCall[] = [{ name: 'set_task_status', input: { task: "Priya's secret card", status: 'done' } }];
    const { actions, dropped } = validatePlan(raw, ctx);
    expect(actions).toEqual([]);
    expect(dropped[0]).toMatch(/isn't yours/);
  });

  it('drops a move with an invalid status', () => {
    const raw: RawToolCall[] = [{ name: 'set_task_status', input: { task: 'Login screen', status: 'shipped' } }];
    expect(validatePlan(raw, ctx).actions).toEqual([]);
  });

  it('lets a task file under a project created earlier in the same plan', () => {
    const raw: RawToolCall[] = [
      { name: 'create_project', input: { name: 'Marketing' } },
      { name: 'create_task', input: { title: 'Landing page', project: 'Marketing' } },
    ];
    const { actions, dropped } = validatePlan(raw, ctx);
    expect(dropped).toEqual([]);
    expect(actions[0]).toEqual({ kind: 'create_project', name: 'Marketing' });
    expect(actions[1]).toMatchObject({ kind: 'create_task', title: 'Landing page', projectId: 'pending:marketing' });
  });

  it('drops an unknown or unsafe action outright', () => {
    const raw: RawToolCall[] = [
      { name: 'delete_everything', input: {} },
      { name: 'send_intro', input: { to: 'priya' } },
    ];
    const { actions, dropped } = validatePlan(raw, ctx);
    expect(actions).toEqual([]);
    expect(dropped).toHaveLength(2);
  });

  it('bounds title length (no unbounded injected payload)', () => {
    const raw: RawToolCall[] = [{ name: 'create_task', input: { title: 'x'.repeat(200), project: 'Website' } }];
    expect(validatePlan(raw, ctx).actions).toEqual([]);
  });
});

describe('validatePlan — the extended own-board actions', () => {
  it('renames the user own task, and clears a due date on "none"', () => {
    const { actions } = validatePlan(
      [{ name: 'edit_task', input: { task: 'Fix CORS', new_title: 'Fix CORS preflight', due_date: 'none' } }],
      ctx
    );
    expect(actions).toEqual([
      { kind: 'edit_task', taskId: 't_cors', title: 'Fix CORS', newTitle: 'Fix CORS preflight', dueDate: null, clearDue: true },
    ]);
  });

  it('drops an edit with nothing to change', () => {
    expect(validatePlan([{ name: 'edit_task', input: { task: 'Fix CORS' } }], ctx).actions).toEqual([]);
  });

  it("drops an edit/delete/stuck for a task that isn't the user's own", () => {
    for (const name of ['edit_task', 'delete_task', 'mark_stuck']) {
      const { actions, dropped } = validatePlan([{ name, input: { task: "Priya's card", new_title: 'x', stuck: true } }], ctx);
      expect(actions, name).toEqual([]);
      expect(dropped, name).toHaveLength(1);
    }
  });

  it('deletes the user own task', () => {
    expect(validatePlan([{ name: 'delete_task', input: { task: 'Login screen' } }], ctx).actions).toEqual([
      { kind: 'delete_task', taskId: 't_login', title: 'Login screen' },
    ]);
  });

  it('renames and archives an existing project, drops a project edit with nothing to change', () => {
    expect(validatePlan([{ name: 'edit_project', input: { project: 'Website', archive: true } }], ctx).actions).toEqual([
      { kind: 'edit_project', projectId: 'p_web', name: 'Website', newName: null, archive: true },
    ]);
    expect(validatePlan([{ name: 'edit_project', input: { project: 'Website' } }], ctx).actions).toEqual([]);
    expect(validatePlan([{ name: 'edit_project', input: { project: 'Ghost', new_name: 'x' } }], ctx).actions).toEqual([]);
  });

  it('marks the user own task stuck (default true) and can clear it', () => {
    expect(validatePlan([{ name: 'mark_stuck', input: { task: 'Fix CORS', stuck: true } }], ctx).actions).toEqual([
      { kind: 'mark_stuck', taskId: 't_cors', title: 'Fix CORS', stuck: true },
    ]);
    expect(validatePlan([{ name: 'mark_stuck', input: { task: 'Fix CORS', stuck: false } }], ctx).actions[0]).toMatchObject({ stuck: false });
  });
});

describe('validatePlan — draft_recipe is gated twice (opt-in + shipped-own-task)', () => {
  it('drops draft_recipe when publishing is off, even for a valid shipped task', () => {
    const { actions, dropped } = validatePlan([{ name: 'draft_recipe', input: { task: 'Shipped thing' } }], ctx);
    expect(actions).toEqual([]);
    expect(dropped[0]).toMatch(/off in Settings/);
  });

  it('allows draft_recipe for a shipped OWN task when publishing is on', () => {
    const { actions } = validatePlan([{ name: 'draft_recipe', input: { task: 'Shipped thing' } }], { ...ctx, canPublish: true });
    expect(actions).toEqual([{ kind: 'draft_recipe', taskId: 't_ship', title: 'Shipped thing' }]);
  });

  it('drops draft_recipe for a task that is not shipped yet', () => {
    const { actions, dropped } = validatePlan([{ name: 'draft_recipe', input: { task: 'Fix CORS' } }], { ...ctx, canPublish: true });
    expect(actions).toEqual([]);
    expect(dropped[0]).toMatch(/isn't shipped/);
  });

  it("drops draft_recipe for a task that isn't the user's own", () => {
    expect(validatePlan([{ name: 'draft_recipe', input: { task: 'Someone elses' } }], { ...ctx, canPublish: true }).actions).toEqual([]);
  });
});

describe('boardContext — only the user own items, no peers, no timestamps', () => {
  const base = { projectId: 'p1', description: '', createdAt: null as never, completedAt: null, source: 'manual' as const, evidence: null, branch: null, stuckSince: null, dueDate: null };
  const tasks: Task[] = [
    { id: 'a', title: 'Mine', status: 'todo', creatorUid: 'me', assigneeUid: 'me', ...base },
    { id: 'b', title: 'Assigned to me', status: 'todo', creatorUid: 'peer', assigneeUid: 'me', ...base },
    { id: 'c', title: 'A peer card', status: 'todo', creatorUid: 'peer', assigneeUid: 'peer', ...base },
  ];
  const projects: Project[] = [
    { id: 'p1', name: 'Live', description: '', ownerUid: 'x', archived: false, createdAt: null as never },
    { id: 'p2', name: 'Archived', description: '', ownerUid: 'x', archived: true, createdAt: null as never },
  ];

  it('includes my own and assigned-to-me tasks, excludes peer-only cards', () => {
    const c = boardContext('me', tasks, projects);
    expect(c.tasks.map((t) => t.id).sort()).toEqual(['a', 'b']);
  });

  it('excludes archived projects', () => {
    expect(boardContext('me', tasks, projects).projects.map((p) => p.id)).toEqual(['p1']);
  });

  it('carries per-task due date, stuck flag, and project name so follow-ups need no re-ask', async () => {
    const { Timestamp } = await import('firebase/firestore');
    const enriched: Task[] = [
      {
        id: 'd',
        title: 'Due and stuck',
        status: 'in_progress',
        creatorUid: 'me',
        assigneeUid: 'me',
        ...base,
        dueDate: Timestamp.fromDate(new Date('2026-08-01T00:00:00Z')),
        stuckSince: Timestamp.fromDate(new Date('2026-07-10T00:00:00Z')),
      },
    ];
    const [t] = boardContext('me', enriched, projects).tasks;
    expect(t.dueDate).toBe('2026-08-01');
    expect(t.stuck).toBe(true);
    expect(t.project).toBe('Live');
  });
});

describe('set_workflow — the private, always-available board switch', () => {
  it('is offered to every user, opted-in or not (self-only, no publish risk)', async () => {
    const { agentTools } = await import('@/lib/agent');
    expect(agentTools(false).map((t) => t.name)).toContain('set_workflow');
    expect(agentTools(true).map((t) => t.name)).toContain('set_workflow');
  });

  it('resolves a spoken workflow name to a known preset id', () => {
    const { actions, dropped } = validatePlan(
      [{ name: 'set_workflow', input: { workflow: 'Software delivery' } }],
      ctx
    );
    expect(dropped).toEqual([]);
    expect(actions).toEqual([{ kind: 'set_workflow', preset: 'software', label: 'Software delivery' }]);
  });

  it('drops a switch to an unknown workflow (an injected "switch to X" picks nothing)', () => {
    const { actions, dropped } = validatePlan(
      [{ name: 'set_workflow', input: { workflow: 'delete everything' } }],
      ctx
    );
    expect(actions).toEqual([]);
    expect(dropped.length).toBe(1);
  });
});

describe('propose_dispatch — the cross-app hand-off (proposal only)', () => {
  it('is offered to every user (self-only request, gated by the confirm step)', async () => {
    const { agentTools } = await import('@/lib/agent');
    expect(agentTools(false).map((t) => t.name)).toContain('propose_dispatch');
    expect(agentTools(true).map((t) => t.name)).toContain('propose_dispatch');
  });

  it('validates a hand-off to another app, lowercasing the target', () => {
    const { actions, dropped } = validatePlan(
      [{ name: 'propose_dispatch', input: { app: 'Rally', intent: 'award a teammate a point' } }],
      ctx
    );
    expect(dropped).toEqual([]);
    expect(actions).toEqual([{ kind: 'dispatch', toApp: 'rally', intent: 'award a teammate a point' }]);
  });

  it('drops a hand-off to Pulse itself, or with an empty target/intent', () => {
    expect(validatePlan([{ name: 'propose_dispatch', input: { app: 'pulse', intent: 'x' } }], ctx).actions).toEqual([]);
    expect(validatePlan([{ name: 'propose_dispatch', input: { app: '', intent: 'x' } }], ctx).actions).toEqual([]);
    expect(validatePlan([{ name: 'propose_dispatch', input: { app: 'rally', intent: '' } }], ctx).actions).toEqual([]);
  });
});

describe('remember — durable shared cross-app memory', () => {
  it('is offered to every user (their own memory about themselves)', async () => {
    const { agentTools } = await import('@/lib/agent');
    expect(agentTools(false).map((t) => t.name)).toContain('remember');
  });

  it('validates and bounds a fact to remember', () => {
    const { actions, dropped } = validatePlan(
      [{ name: 'remember', input: { text: '  working on the auth flow  ' } }],
      ctx
    );
    expect(dropped).toEqual([]);
    expect(actions).toEqual([{ kind: 'remember', text: 'working on the auth flow' }]);
  });

  it('drops an empty memory', () => {
    expect(validatePlan([{ name: 'remember', input: { text: '   ' } }], ctx).actions).toEqual([]);
  });
});

describe('answer mode — Pulse can reply, not only act', () => {
  it('offers the read-only answer tool to everyone, and draft_recipe only to opted-in users', async () => {
    const { agentTools } = await import('@/lib/agent');
    const names = (canPublish: boolean) => agentTools(canPublish).map((t) => t.name);
    expect(names(false)).toContain('answer');
    expect(names(false)).not.toContain('draft_recipe');
    expect(names(true)).toContain('answer');
    expect(names(true)).toContain('draft_recipe');
  });

  it('extracts a plain answer, stripping markup and bounding length', async () => {
    const { extractAnswer } = await import('@/lib/agent-plan');
    expect(extractAnswer([{ name: 'answer', input: { text: '  Focus on **Login screen** next.  ' } }])).toBe(
      'Focus on Login screen next.'
    );
    expect(extractAnswer([{ name: 'create_task', input: { title: 'x', project: 'y' } }])).toBeUndefined();
    expect(extractAnswer([{ name: 'answer', input: { text: '   ' } }])).toBeUndefined();
    expect(extractAnswer([{ name: 'answer', input: { text: 'a'.repeat(700) } }])).toBeUndefined();
  });
})
