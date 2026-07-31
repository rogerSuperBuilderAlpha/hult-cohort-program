"use client";

import { useActionState, useState } from "react";
import {
  createProjectUpdateAction,
  type UpdateActionState,
} from "@/app/dashboard/projects/[id]/updates/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RepeatableListInput } from "@/components/ui/RepeatableListInput";
import { Textarea } from "@/components/ui/Textarea";

type Props = {
  projectId: string;
};

function compactList(items: string[]): string[] {
  return items.map((s) => s.trim()).filter(Boolean);
}

export function ProjectUpdateForm({ projectId }: Props) {
  const boundAction = createProjectUpdateAction.bind(null, projectId);
  const [state, action, pending] = useActionState<UpdateActionState, FormData>(
    boundAction,
    null,
  );

  const [achievements, setAchievements] = useState<string[]>([""]);
  const [challenges, setChallenges] = useState<string[]>([""]);
  const [lessons, setLessons] = useState<string[]>([""]);
  const [nextSteps, setNextSteps] = useState<string[]>([""]);
  const [evidence, setEvidence] = useState<string[]>([""]);

  return (
    <form action={action} className="space-y-6">
      <Input
        label="Title"
        name="title"
        required
        placeholder="What moved forward this week?"
        disabled={pending}
      />
      <Textarea
        label="Description"
        name="description"
        rows={5}
        placeholder="Context for peers and partners — what changed, and why it matters."
        disabled={pending}
      />

      <RepeatableListInput
        label="Achievements"
        value={achievements}
        onChange={setAchievements}
        placeholder="Shipped X / closed Y"
        addLabel="Add achievement"
        disabled={pending}
      />
      <input
        type="hidden"
        name="achievements"
        value={JSON.stringify(compactList(achievements))}
      />

      <RepeatableListInput
        label="Challenges"
        value={challenges}
        onChange={setChallenges}
        placeholder="What got in the way?"
        addLabel="Add challenge"
        disabled={pending}
      />
      <input
        type="hidden"
        name="challenges"
        value={JSON.stringify(compactList(challenges))}
      />

      <RepeatableListInput
        label="Lessons"
        value={lessons}
        onChange={setLessons}
        placeholder="What did you learn?"
        addLabel="Add lesson"
        disabled={pending}
      />
      <input
        type="hidden"
        name="lessons"
        value={JSON.stringify(compactList(lessons))}
      />

      <RepeatableListInput
        label="Next steps"
        value={nextSteps}
        onChange={setNextSteps}
        placeholder="What’s next?"
        addLabel="Add next step"
        disabled={pending}
      />
      <input
        type="hidden"
        name="next_steps"
        value={JSON.stringify(compactList(nextSteps))}
      />

      <RepeatableListInput
        label="Evidence links"
        value={evidence}
        onChange={setEvidence}
        type="url"
        placeholder="https://"
        hint="Optional URLs that back up claims in this update."
        addLabel="Add link"
        disabled={pending}
      />
      <input
        type="hidden"
        name="evidence_links"
        value={JSON.stringify(compactList(evidence))}
      />

      {state?.error ? (
        <p
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <Button type="submit" accent="projects" disabled={pending}>
        {pending ? "Publishing update…" : "Submit update"}
      </Button>
    </form>
  );
}
