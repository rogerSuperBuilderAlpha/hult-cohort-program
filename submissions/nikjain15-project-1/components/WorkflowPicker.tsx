'use client';

import { setWorkflowPreset } from '@/lib/board-view';
import { WORKFLOW_PRESETS, type BoardView } from '@/lib/workflows';

/**
 * The workflow picker — pick a ready-made journey for YOUR board. Everything here is private
 * (lib/board-view.ts): switching your workflow changes nothing anyone else can see, and no
 * preset ever adds a new canonical status. You can also just ask Pulse ("switch to the
 * software workflow"); this is the same action, surfaced as a control.
 *
 * Plain and small on purpose (VOICE): a label and a select, not a settings page.
 */
export function WorkflowPicker({ uid, view }: { uid: string; view: BoardView | null }) {
  // No doc, or a doc whose preset we don't recognise, reads as classic.
  const current = view?.preset && WORKFLOW_PRESETS.some((p) => p.id === view.preset) ? view.preset : 'classic';
  return (
    <label className="flex items-center gap-2 text-xs text-zinc-400">
      <span>Workflow</span>
      <select
        value={current}
        onChange={(e) => void setWorkflowPreset(uid, e.target.value)}
        data-testid="workflow-picker"
        className="min-h-[44px] rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-xs text-zinc-200"
      >
        {WORKFLOW_PRESETS.map((p) => (
          <option key={p.id} value={p.id} title={p.blurb}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  );
}
