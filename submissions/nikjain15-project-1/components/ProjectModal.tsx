'use client';

import { useState } from 'react';
import { createProject, updateProject } from '@/lib/data';
import type { Project } from '@/lib/types';
import { Button, ErrorNote, Field, Input, Modal, Textarea } from './ui';

const NAME_MAX = 80;
const DESC_MAX = 500;

type Actor = { uid: string; name: string; photoURL: string | null };

/**
 * Create / edit a project.
 *
 * Manual projects exist alongside the repos Pulse turns into projects — that's what keeps
 * B4 honest. Someone who never connects GitHub still has a real project manager.
 */
export function ProjectModal({
  actor,
  project,
  onClose,
}: {
  actor: Actor;
  /** null = create. */
  project: Project | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const trimmed = name.trim();
  const valid = trimmed.length > 0 && trimmed.length <= NAME_MAX;

  async function save() {
    if (!valid || busy) return;
    setBusy(true);
    setError('');

    try {
      if (project) {
        await updateProject(project.id, { name: trimmed, description: description.trim() });
      } else {
        // Only creation logs a pulse event. Renaming a project isn't news.
        await createProject(actor, { name: trimmed, description: description.trim() });
      }
      onClose();
    } catch {
      setError('That didn’t save. Check your connection and try again — nothing was lost.');
      setBusy(false);
    }
  }

  return (
    <Modal title={project ? 'Edit project' : 'New project'} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Name">
          <Input
            value={name}
            maxLength={NAME_MAX}
            onChange={(e) => setName(e.target.value)}
            placeholder="pm-nikjain15"
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

        <ErrorNote>{error}</ErrorNote>

        <div className="flex justify-end gap-2 pt-1">
          <Button onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={!valid || busy}>
            {busy ? 'Saving…' : project ? 'Save' : 'Create project'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
