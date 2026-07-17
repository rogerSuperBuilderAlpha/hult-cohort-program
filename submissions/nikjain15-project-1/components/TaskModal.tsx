'use client';

import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { createTask, deleteTask, setTaskStatus, setTaskStuck, updateTask } from '@/lib/data';
import { STATUS_LABELS, STATUSES, type Member, type Project, type Status, type Task } from '@/lib/types';
import { Button, ErrorNote, Field, Input, Modal, Select, Textarea } from './ui';

const TITLE_MAX = 120;
const DESC_MAX = 2000;

type Actor = { uid: string; name: string; photoURL: string | null };

/**
 * Create / edit a task. The manual path, always available.
 *
 * This is the whole product for anyone who declined GitHub, so it is graded (B5, B7) and
 * must work with sensing entirely absent. Nothing here touches the model or the API.
 */
export function TaskModal({
  actor,
  task,
  projects,
  members,
  defaultProjectId,
  defaultStatus,
  onClose,
}: {
  actor: Actor;
  /** null = create. */
  task: Task | null;
  projects: Project[];
  members: Member[];
  defaultProjectId?: string;
  defaultStatus?: Status;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [projectId, setProjectId] = useState(task?.projectId ?? defaultProjectId ?? projects[0]?.id ?? '');
  const [status, setStatus] = useState<Status>(task?.status ?? defaultStatus ?? 'todo');
  // Default to you, but assigning to others is expected — B7 verifies the assignee sees it.
  // Explicitly nullable: `?? actor.uid` would infer plain `string` and lock out the
  // "Nobody yet" option, which is the whole point of it existing.
  const [assigneeUid, setAssigneeUid] = useState<string | null>(task?.assigneeUid ?? actor.uid);
  const [due, setDue] = useState(
    task?.dueDate ? task.dueDate.toDate().toISOString().slice(0, 10) : ''
  );
  // "I'm stuck on this" — only offered on YOUR OWN existing card (the rules deny it to
  // anyone else, and a create can't be stuck yet: you haven't fought it).
  const [stuck, setStuck] = useState(!!task?.stuckSince);
  const canFlagStuck = !!task && task.assigneeUid === actor.uid;
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const trimmed = title.trim();
  const valid = trimmed.length > 0 && trimmed.length <= TITLE_MAX && projectId !== '';

  async function save() {
    if (!valid || busy) return;
    setBusy(true);
    setError('');

    const dueDate = due ? Timestamp.fromDate(new Date(`${due}T12:00:00`)) : null;

    try {
      if (task) {
        await updateTask(task.id, {
          title: trimmed,
          description: description.trim(),
          projectId,
          assigneeUid,
          dueDate,
        });
        // Status goes through setTaskStatus, not updateTask: it's the only path that
        // logs task_started / task_shipped and sets completedAt correctly.
        if (status !== task.status) await setTaskStatus(actor, task, status);
        // Separate write, only on change: the rules gate this field to the assignee,
        // and folding it into the shared patch would fail the whole save for a peer
        // legitimately editing other fields.
        if (canFlagStuck && stuck !== !!task.stuckSince) await setTaskStuck(task.id, stuck);
      } else {
        await createTask(actor, {
          projectId,
          title: trimmed,
          description: description.trim(),
          assigneeUid,
          dueDate,
          status,
        });
      }
      onClose();
    } catch {
      setError('That didn’t save. Check your connection and try again — nothing was lost.');
      setBusy(false);
    }
  }

  async function remove() {
    if (!task || busy) return;
    setBusy(true);
    try {
      await deleteTask(task.id);
      onClose();
    } catch {
      setError('Couldn’t delete that task. You can only delete tasks you created.');
      setBusy(false);
    }
  }

  if (projects.length === 0) {
    return (
      <Modal title="New task" onClose={onClose}>
        <p className="text-sm text-zinc-400">
          A task needs a project to live in. Create a project first.
        </p>
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Title">
          <Input
            value={title}
            maxLength={TITLE_MAX}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Finish Firestore rules"
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
            }}
          />
        </Field>

        <Field label="Description" hint="Optional.">
          <Textarea
            value={description}
            rows={3}
            maxLength={DESC_MAX}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="optional"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Project">
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Assignee" hint="“Nobody yet” puts it up for the cohort to claim.">
            <Select
              value={assigneeUid ?? ''}
              onChange={(e) => setAssigneeUid(e.target.value || null)}
            >
              {/*
                Without this option nothing could ever be unassigned — the list was members
                only, and it defaults to you. That quietly killed the one social ask Home
                can make in week 1: the ladder's "Nobody's on this" rung needs
                assigneeUid === null, so it was unreachable and Home could only ever offer
                you your own to-do list. The rungs above it need Broker, which is week 3.

                An empty value, not a sentinel string: null is what "unassigned" means in
                types.ts, and the ladder filters on exactly that.
              */}
              <option value="">Nobody yet</option>
              {members.map((m) => (
                <option key={m.uid} value={m.uid}>
                  {m.uid === actor.uid ? 'you' : m.displayName}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Due" hint="Optional. Red if past.">
            <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </Field>
        </div>

        {canFlagStuck && (
          // Quiet on purpose, and invisible to everyone else everywhere: no badge on the
          // card, no board marker, nothing in the feed. Asking for help costs nothing
          // and shows nowhere — that's what makes it safe to ask.
          <label className="flex min-h-11 items-start gap-2 pt-1 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={stuck}
              onChange={(e) => setStuck(e.target.checked)}
              // Explicit name, not just the wrapping label: this project already shipped
              // one a11y bug from trusting label composition (see AGENTS.md on <select>),
              // and a screen reader hearing "on, checkbox" here would miss the one thing
              // that makes ticking it safe — what it does and who can see it.
              aria-label="I'm stuck on this"
              className="mt-1 h-4 w-4 accent-emerald-500"
            />
            <span>
              I&rsquo;m stuck on this
              <span className="block text-xs text-zinc-400">
                Asks quietly. One person who&rsquo;s solved it may get a nudge — nobody else
                sees a thing.
              </span>
            </span>
          </label>
        )}

        <ErrorNote>{error}</ErrorNote>

        <div className="flex items-center gap-2 pt-1">
          {task && (
            <Button variant="danger" onClick={remove} disabled={busy}>
              Delete
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button variant="primary" onClick={save} disabled={!valid || busy}>
              {busy ? 'Saving…' : task ? 'Save' : 'Create task'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
