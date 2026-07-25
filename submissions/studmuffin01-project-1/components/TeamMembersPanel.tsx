"use client";

import { memo } from "react";
import type { TeamMember } from "@/lib/teamMembers";

const inputClassName =
  "rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-surface-border dark:bg-surface-bg dark:text-surface-primary";

const addButtonClassName =
  "rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-50";

const chipClassName =
  "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-surface-bg dark:text-surface-secondary";

const removeButtonClassName =
  "rounded-full p-0.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:text-surface-secondary dark:hover:bg-surface-border dark:hover:text-surface-primary";

interface TeamMembersPanelProps {
  members: TeamMember[];
  onAddMember: (name: string) => unknown;
  onRemoveMember: (memberId: string) => void;
}

function TeamMembersPanel({ members, onAddMember, onRemoveMember }: TeamMembersPanelProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("memberName") ?? "");
    if (onAddMember(name)) {
      event.currentTarget.reset();
    }
  };

  return (
    <section aria-label="Team members" className="space-y-3">
      <h2 className="section-heading">Team Members</h2>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
        <label htmlFor="team-member-name" className="sr-only">
          Team member name
        </label>
        <input
          id="team-member-name"
          name="memberName"
          type="text"
          placeholder="Add team member"
          maxLength={60}
          className={`${inputClassName} min-w-[12rem] flex-1`}
        />
        <button type="submit" className={addButtonClassName}>
          Add
        </button>
      </form>

      {members.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {members.map((member) => (
            <li key={member.id}>
              <span className={chipClassName}>
                {member.name}
                <button
                  type="button"
                  onClick={() => onRemoveMember(member.id)}
                  className={removeButtonClassName}
                  aria-label={`Remove ${member.name}`}
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500 dark:text-surface-secondary">
          Add names here to pick assignees from a dropdown on tasks.
        </p>
      )}
    </section>
  );
}

export default memo(TeamMembersPanel);
