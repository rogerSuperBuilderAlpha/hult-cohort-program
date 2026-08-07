import { NextResponse } from 'next/server';
import type { Firestore } from 'firebase-admin/firestore';
import { adminDb, busDb } from '@/lib/broker-admin';
import { verifyUid, getHandle } from '@/lib/auth-server';
import { claimTasks, completeTask } from '@/lib/shared-context';
import { planActions } from '@/lib/agent-plan';
import type { BoardContext } from '@/lib/agent';
import type { Status } from '@/lib/types';

export const runtime = 'nodejs';

/**
 * Pulse's inbox for cross-app requests: claims tasks another app addressed to "pulse" for THIS
 * user, runs each through Pulse's own planner (so the answer is Pulse's, about the user's own
 * board), and reports the outcome back on the bus. The agent panel polls this so a request from
 * Rally's agent shows up in Pulse automatically. Safe to call with nothing pending.
 *
 * Pulse deliberately does NOT execute board mutations here: every write in Pulse happens in the
 * user's own session under their own Firebase rules (that's the whole security model). So the inbox
 * ANSWERS the intent — a summary, a plan, a focus recommendation — and leaves any actual board
 * change to the user's next Pulse visit. Honest by construction.
 */
export async function POST(req: Request) {
  const uid = await verifyUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const db = adminDb();
  if (!db) return NextResponse.json({ error: 'server_unavailable' }, { status: 503 });

  const handle = await getHandle(db, uid);
  if (!handle) return NextResponse.json({ handled: 0 });

  const bus = busDb();
  if (!bus) return NextResponse.json({ handled: 0 });

  const tasks = await claimTasks(bus, 'pulse', handle, 3);
  if (!tasks.length) return NextResponse.json({ handled: 0 });

  // Build the user's board once — every claimed task answers against the same context.
  const ctx = await serverBoardContext(db, uid);

  let handled = 0;
  for (const t of tasks) {
    const prompt = `A request came in from the ${t.fromApp} app: "${t.intent}". Answer it for the user, using only their own board.`;
    const plan = await planActions(prompt, ctx, []);
    if (plan.reason) {
      await completeTask(bus, t.id!, false, 'Pulse is unavailable right now.');
      continue;
    }
    const summary =
      plan.answer ??
      (plan.actions.length
        ? `Pulse can do this on your board: ${plan.actions.map(describe).join('; ')}. Open Pulse to confirm.`
        : 'Pulse looked but had nothing to add for that.');
    await completeTask(bus, t.id!, true, summary.slice(0, 500));
    handled += 1;
  }
  return NextResponse.json({ handled });
}

/** A one-line, human-readable description of a planned action (no execution — this is a report). */
function describe(a: { kind: string; title?: string; name?: string; status?: string }): string {
  if (a.kind === 'create_task') return `add "${a.title}"`;
  if (a.kind === 'set_task_status') return `move "${a.title}" → ${a.status}`;
  if (a.kind === 'create_project') return `start project ${a.name}`;
  return a.kind.replace(/_/g, ' ');
}

/**
 * Build the planner's view of the user's OWN board from Admin reads. The bus (cohort-context) does
 * NOT hold Pulse's tasks, so this always reads Pulse's own database (adminDb). Mirrors
 * lib/agent's boardContext but built from Admin docs; degrades to an empty board if reads fail, so
 * the inbox never crashes on a request.
 */
async function serverBoardContext(db: Firestore, uid: string): Promise<BoardContext> {
  try {
    const [tasksSnap, projectsSnap] = await Promise.all([
      db.collection('tasks').get(),
      db.collection('projects').get(),
    ]);
    const projectName = new Map<string, string>();
    const projects: { id: string; name: string }[] = [];
    for (const d of projectsSnap.docs) {
      const p = d.data() as { name?: string; archived?: boolean };
      projectName.set(d.id, p.name ?? '');
      if (!p.archived) projects.push({ id: d.id, name: p.name ?? '' });
    }
    type TaskRow = {
      title?: string;
      status?: Status;
      creatorUid?: string;
      assigneeUid?: string | null;
      projectId?: string;
    };
    const tasks = tasksSnap.docs
      .map((d) => ({ id: d.id, data: d.data() as TaskRow }))
      .filter(({ data }) => data.creatorUid === uid || data.assigneeUid === uid)
      .map(({ id, data }) => ({
        id,
        title: data.title ?? '',
        status: (data.status as Status) ?? 'todo',
        mine: true,
        project: projectName.get(data.projectId ?? '') ?? '',
      }));
    return { uid, tasks, projects, canPublish: false };
  } catch {
    return { uid, tasks: [], projects: [], canPublish: false };
  }
}
