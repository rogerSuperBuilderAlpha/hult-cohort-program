"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import {
  sidebarHintClassName,
  sidebarLabelClassName,
} from "@/components/sidebar/SidebarPageFrame";
import { dashboardPrimaryButtonClassName } from "@/lib/dashboardStyles";
import {
  sidebarTableClass,
  sidebarTdClass,
  sidebarTdPrimaryClass,
  sidebarThClass,
} from "@/lib/tableStyles";
import type { NewTeamMemberInput, TeamMember } from "@/lib/teamMembers";

const inputClassName =
  "mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-surface-border dark:bg-surface-bg dark:text-surface-primary";

const removeMemberButtonClassName =
  "rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20";

interface TeamMembersPanelProps {
  members: TeamMember[];
  onAddMember: (input: NewTeamMemberInput) => unknown;
  onRemoveMember: (memberId: string) => void;
}

function TeamMembersPanel({ members, onAddMember, onRemoveMember }: TeamMembersPanelProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  useEffect(() => {
    if (!selectedMemberId) {
      return;
    }

    if (!members.some((member) => member.id === selectedMemberId)) {
      setSelectedMemberId("");
    }
  }, [members, selectedMemberId]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const input: NewTeamMemberInput = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      department: String(formData.get("department") ?? ""),
      email: String(formData.get("email") ?? ""),
    };

    if (!input.firstName.trim()) {
      setFormError("First Name is required.");
      return;
    }

    const added = onAddMember(input);
    if (!added) {
      setFormError("Could not add member. Check for duplicates or missing First Name.");
      return;
    }

    event.currentTarget.reset();
  };

  const handleRemoveMember = () => {
    setFormError(null);

    if (!selectedMemberId) {
      setFormError("Select a team member from the table to remove.");
      return;
    }

    const member = members.find((entry) => entry.id === selectedMemberId);
    if (!member) {
      setSelectedMemberId("");
      return;
    }

    const confirmed = window.confirm(
      `Remove ${member.name} from the team roster? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    onRemoveMember(member.id);
    setSelectedMemberId("");
  };

  return (
    <div className="space-y-3">
      <p className={sidebarHintClassName}>
        Add teammates here to assign tasks from the Initiative Summary tables and to track individual
        progress on{" "}
        <Link
          href="/member-status"
          className="font-medium text-amber-900 hover:text-amber-950 dark:text-amber-400 dark:hover:text-amber-300"
        >
          Member Status
        </Link>
        . Select a row below to remove a member.
      </p>

      <form onSubmit={handleSubmit} className="space-y-2">
        <p className={sidebarLabelClassName}>Add Team Member</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="team-member-first-name" className={sidebarHintClassName}>
              First Name
            </label>
            <input
              id="team-member-first-name"
              name="firstName"
              type="text"
              required
              maxLength={40}
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="team-member-last-name" className={sidebarHintClassName}>
              Last Name
            </label>
            <input
              id="team-member-last-name"
              name="lastName"
              type="text"
              maxLength={40}
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="team-member-department" className={sidebarHintClassName}>
              Department
            </label>
            <input
              id="team-member-department"
              name="department"
              type="text"
              maxLength={60}
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="team-member-email" className={sidebarHintClassName}>
              Email
            </label>
            <input
              id="team-member-email"
              name="email"
              type="email"
              maxLength={120}
              className={inputClassName}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className={`${dashboardPrimaryButtonClassName} px-3 py-1.5 text-xs`}
          >
            Add Member
          </button>
          <button
            type="button"
            onClick={handleRemoveMember}
            disabled={members.length === 0}
            className={removeMemberButtonClassName}
          >
            Remove Member
          </button>
          {formError && (
            <p role="alert" className="text-[11px] text-red-700 dark:text-red-400">
              {formError}
            </p>
          )}
        </div>
      </form>

      {members.length > 0 ? (
        <table className={sidebarTableClass}>
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[22%]" />
            <col className="w-[28%]" />
            <col className="w-[28%]" />
          </colgroup>
          <thead>
            <tr>
              <th className={sidebarThClass}>First Name</th>
              <th className={sidebarThClass}>Last Name</th>
              <th className={sidebarThClass}>Department</th>
              <th className={sidebarThClass}>Email</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const isSelected = member.id === selectedMemberId;

              return (
                <tr
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedMemberId(member.id);
                    }
                  }}
                  tabIndex={0}
                  aria-selected={isSelected}
                  aria-label={`Select ${member.name}`}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-brand-50 ring-1 ring-inset ring-brand-300 dark:bg-brand-500/10 dark:ring-brand-500/40"
                      : "hover:bg-slate-50 dark:hover:bg-surface-bg"
                  }`}
                >
                  <td className={sidebarTdPrimaryClass}>{member.firstName}</td>
                  <td className={sidebarTdClass}>{member.lastName || "—"}</td>
                  <td className={`${sidebarTdClass} break-words`}>{member.department || "—"}</td>
                  <td className={`${sidebarTdClass} break-all`}>{member.email || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className={sidebarHintClassName}>
          No team members yet. Add a member above to get started.
        </p>
      )}
    </div>
  );
}

export default memo(TeamMembersPanel);
