'use client';

import { useCallback, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { boardContext, type AgentAction } from './agent';
import { auth } from './firebase';
import { setWorkflowPreset } from './board-view';
import { createProject, createTask, deleteTask, setTaskStatus, setTaskStuck, updateProject, updateTask } from './data';
import type { Project, Task } from './types';

/**
 * "Ask Pulse" — the client executor. The route only PLANS; this runs each action under the
 * user's own Firebase session by calling the same `lib/data` functions a button calls, so
 * `firestore.rules` binds it identically (design-agent.md §0).
 *
 * Slice 1 is own-surface and reversible, so it runs seamlessly — no per-action confirm wall
 * — and every step carries an undo, which is Pulse's own "publish by default, correct by
 * exception" (DESIGN-SPEC §3) applied to the agent. The one thing that would PUBLISH to the
 * cohort (banking a recipe) is deliberately not in this slice; when it lands it pauses first.
 */

type Actor = { uid: string; name: string; photoURL: string | null };

export type StepState = 'running' | 'done' | 'undone';
export type Step = {
  id: number;
  label: string;
  detail: string | null;
  state: StepState;
  undo: (() => Promise<void>) | null;
};

export type Phase = 'idle' | 'planning' | 'running' | 'done' | 'degraded' | 'answered';

const dueFrom = (iso: string | null): Timestamp | null =>
  iso ? Timestamp.fromDate(new Date(`${iso}T00:00:00`)) : null;

export function useAskPulse({
  actor,
  tasks,
  projects,
  canPublish = false,
  onDraftRecipe,
  onProposeDispatch,
}: {
  actor: Actor;
  tasks: Task[];
  projects: Project[];
  /** Whether the user opted the agent into publishing — gates the draft_recipe tool. */
  canPublish?: boolean;
  /** Called when the agent proposes drafting a recipe; the caller opens the recipe modal. */
  onDraftRecipe?: (taskId: string, title: string) => void;
  /** Called when the agent proposes handing a task to another app's agent. It NEVER sends on its
   *  own — the caller surfaces a confirm affordance and only then calls sendDispatch. */
  onProposeDispatch?: (toApp: string, intent: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [steps, setSteps] = useState<Step[]>([]);
  const [note, setNote] = useState<string | null>(null);
  // Pulse's reply when you ASKED rather than commanded — a conversational answer, not a plan.
  const [answer, setAnswer] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPhase('idle');
    setSteps([]);
    setNote(null);
    setAnswer(null);
  }, []);

  const run = useCallback(
    async (utterance: string, history: { role: 'you' | 'pulse'; text: string }[] = []): Promise<string> => {
      setPhase('planning');
      setSteps([]);
      setNote(null);
      setAnswer(null);

      let actions: AgentAction[] = [];
      try {
        // Attach the user's ID token so the route can read/write their shared cross-app memory
        // under a VERIFIED identity. Best-effort — a missing token just skips the shared layer,
        // and the planner behaves exactly as before.
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        try {
          const token = await auth.currentUser?.getIdToken();
          if (token) headers.Authorization = `Bearer ${token}`;
        } catch {
          /* no token → shared memory just stays inert this turn */
        }
        const res = await fetch('/api/ask-pulse', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            utterance,
            context: boardContext(actor.uid, tasks, projects, canPublish),
            history,
          }),
        });
        if (!res.ok) {
          setPhase('degraded');
          const note = "Pulse can't plan right now. The board still works by hand.";
          setNote(note);
          return note;
        }
        const data = (await res.json()) as {
          actions: AgentAction[];
          reason?: string;
          dropped?: string[];
          answer?: string;
        };
        actions = data.actions ?? [];
        const answerText = typeof data.answer === 'string' && data.answer.trim() ? data.answer.trim() : null;
        if (actions.length === 0) {
          // You asked a question — Pulse answers, rather than reporting it "couldn't plan".
          if (answerText) {
            setAnswer(answerText);
            setPhase('answered');
            return answerText;
          }
          setPhase('degraded');
          let note: string;
          if (data.reason) {
            note = "I can't think that through right now — but your board still works by hand, and I'll be back in a moment.";
          } else if (data.dropped && data.dropped.length > 0) {
            // Say what it couldn't do warmly, then a concrete way forward.
            note = `I couldn't quite do that — ${data.dropped[0]}. Want to try it like “add a task to fix the login bug”?`;
          } else {
            // Warm, capability-oriented help — never a cold "say it in plain words".
            note =
              'Happy to help — I can add, move, and edit tasks and projects, tell you what to focus on, or hand work to Rally. What would you like to do?';
          }
          setNote(note);
          return note;
        }
      } catch {
        setPhase('degraded');
        const note = "I couldn't reach my thinking just now — give it another try in a moment. Your board still works by hand meanwhile.";
        setNote(note);
        return note;
      }

      setPhase('running');
      const createdProjects = new Map<string, string>(); // lower-name -> new id
      // Labels of what actually landed, joined into the one-line summary the panel persists
      // to the thread — so history reads "Created X · Moved Y → done", not raw tool calls.
      const doneLabels: string[] = [];
      let next = 0;
      const add = (s: Omit<Step, 'id'>) => {
        const id = next++;
        if (s.state === 'done') doneLabels.push(s.label);
        setSteps((prev) => [...prev, { ...s, id }]);
        return id;
      };
      const settle = (id: number, patch: Partial<Step>) => {
        if (patch.state === 'done' && typeof patch.label === 'string') doneLabels.push(patch.label);
        setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
      };

      for (const action of actions) {
        try {
          if (action.kind === 'create_project') {
            const id = add({ label: `Creating project ${action.name}`, detail: null, state: 'running', undo: null });
            const projectId = await createProject(actor, { name: action.name, description: '' });
            createdProjects.set(action.name.toLowerCase(), projectId);
            settle(id, {
              label: `Created project ${action.name}`,
              state: 'done',
              undo: async () => void (await updateProject(projectId, { archived: true })),
            });
          } else if (action.kind === 'create_task') {
            const id = add({ label: `Creating ${action.title}`, detail: null, state: 'running', undo: null });
            const projectId = action.projectId.startsWith('pending:')
              ? createdProjects.get(action.projectId.slice('pending:'.length))
              : action.projectId;
            if (!projectId) {
              settle(id, { label: `Skipped ${action.title}`, detail: 'its project was not created', state: 'done', undo: null });
              continue;
            }
            const taskId = await createTask(actor, {
              projectId,
              title: action.title,
              description: '',
              assigneeUid: actor.uid,
              dueDate: dueFrom(action.dueDate),
              status: action.status,
            });
            settle(id, {
              label: `Created ${action.title}`,
              detail: action.dueDate ? `due ${action.dueDate}` : null,
              state: 'done',
              undo: async () => void (await deleteTask(taskId)),
            });
          } else if (action.kind === 'set_task_status') {
            const task = tasks.find((t) => t.id === action.taskId);
            if (!task) continue;
            const prior = task.status;
            const id = add({ label: `Moving ${action.title} → ${action.status}`, detail: null, state: 'running', undo: null });
            await setTaskStatus(actor, task, action.status);
            settle(id, {
              label: `Moved ${action.title} → ${action.status}`,
              state: 'done',
              undo: async () => void (await setTaskStatus(actor, { ...task, status: action.status }, prior)),
            });
          } else if (action.kind === 'edit_task') {
            const task = tasks.find((t) => t.id === action.taskId);
            if (!task) continue;
            const priorTitle = task.title;
            const priorDue = task.dueDate;
            const patch: { title?: string; dueDate?: Timestamp | null } = {};
            if (action.newTitle) patch.title = action.newTitle;
            if (action.clearDue) patch.dueDate = null;
            else if (action.dueDate) patch.dueDate = dueFrom(action.dueDate);
            const id = add({ label: `Editing ${action.title}`, detail: null, state: 'running', undo: null });
            await updateTask(action.taskId, patch);
            settle(id, {
              label: action.newTitle ? `Renamed ${priorTitle} → ${action.newTitle}` : `Updated ${action.title}`,
              state: 'done',
              undo: async () => void (await updateTask(action.taskId, { title: priorTitle, dueDate: priorDue })),
            });
          } else if (action.kind === 'delete_task') {
            const task = tasks.find((t) => t.id === action.taskId);
            if (!task) continue;
            const snapshot = task; // kept so undo can rebuild it (a new id, same content)
            const id = add({ label: `Deleting ${action.title}`, detail: null, state: 'running', undo: null });
            await deleteTask(action.taskId);
            settle(id, {
              label: `Deleted ${action.title}`,
              state: 'done',
              undo: async () =>
                void (await createTask(actor, {
                  projectId: snapshot.projectId,
                  title: snapshot.title,
                  description: snapshot.description,
                  assigneeUid: snapshot.assigneeUid,
                  dueDate: snapshot.dueDate,
                  status: snapshot.status,
                })),
            });
          } else if (action.kind === 'edit_project') {
            const priorName = action.name;
            const patch: { name?: string; archived?: boolean } = {};
            if (action.newName) patch.name = action.newName;
            if (action.archive) patch.archived = true;
            const id = add({ label: `Updating ${action.name}`, detail: null, state: 'running', undo: null });
            await updateProject(action.projectId, patch);
            settle(id, {
              label: action.archive
                ? `Archived ${priorName}`
                : `Renamed ${priorName} → ${action.newName ?? priorName}`,
              state: 'done',
              // The project came from the board unarchived, so undo restores that and the name.
              undo: async () => void (await updateProject(action.projectId, { name: priorName, archived: false })),
            });
          } else if (action.kind === 'mark_stuck') {
            const task = tasks.find((t) => t.id === action.taskId);
            if (!task) continue;
            const prior = !!task.stuckSince;
            const id = add({
              label: action.stuck ? `Asking for help on ${action.title}` : `Clearing the stuck flag on ${action.title}`,
              detail: null,
              state: 'running',
              undo: null,
            });
            await setTaskStuck(action.taskId, action.stuck);
            settle(id, {
              label: action.stuck ? `Asked for help on ${action.title}` : `Cleared the stuck flag on ${action.title}`,
              state: 'done',
              undo: async () => void (await setTaskStuck(action.taskId, prior)),
            });
          } else if (action.kind === 'remember') {
            // Shared-memory writes happen server-side under the verified handle and are normally
            // stripped from the plan before it reaches here. If one slips through (e.g. the server
            // had no identity), surface it honestly rather than acting with authority we don't have.
            add({ label: 'Noted for your shared memory', detail: null, state: 'done', undo: null });
          } else if (action.kind === 'dispatch') {
            // A cross-app hand-off is outward — it NEVER sends on its own. Surface it as a
            // proposal the user confirms; the panel calls sendDispatch only on confirm.
            add({
              label: `Ready to ask ${action.toApp}: ${action.intent}`,
              detail: 'confirm to send',
              state: 'done',
              undo: null,
            });
            onProposeDispatch?.(action.toApp, action.intent);
          } else if (action.kind === 'set_workflow') {
            // Switch the user's own private board workflow. Self-only, adds no status. Undo is
            // one tap away in the picker, so the step carries none here.
            const id = add({ label: `Switching your board to ${action.label}`, detail: null, state: 'running', undo: null });
            const name = await setWorkflowPreset(actor.uid, action.preset);
            settle(id, {
              label: name ? `Switched your board to ${name}` : `Couldn't switch to ${action.label}`,
              state: 'done',
              undo: null,
            });
          } else {
            // draft_recipe — the one action that does NOT write. It hands off to the recipe
            // modal, where the user edits the draft and confirms behind the peer-name gate.
            add({ label: `Drafting a recipe from ${action.title}`, detail: 'edit it, then bank it', state: 'done', undo: null });
            onDraftRecipe?.(action.taskId, action.title);
          }
        } catch {
          add({ label: 'One step could not be applied', detail: 'nothing changed for it', state: 'done', undo: null });
        }
      }

      setPhase('done');
      return doneLabels.join(' · ') || 'Done.';
    },
    [actor, tasks, projects, canPublish, onDraftRecipe, onProposeDispatch]
  );

  const undoStep = useCallback(
    async (id: number) => {
      const step = steps.find((s) => s.id === id);
      if (!step?.undo) return;
      try {
        await step.undo();
        setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, state: 'undone', undo: null } : s)));
      } catch {
        /* a failed undo is not worth an alarm — the row stays as it was */
      }
    },
    [steps]
  );

  return { phase, steps, note, answer, run, undoStep, reset };
}
